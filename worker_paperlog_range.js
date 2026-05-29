const NOTION_VERSION = "2022-06-28";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    try {
      const url = new URL(request.url);
      const clientKey = request.headers.get("x-paper-log-key");

      if (!env.SECRET_KEY || clientKey !== env.SECRET_KEY) {
        return json(request, env, { ok: false, error: "Unauthorized" }, 401);
      }

      if (url.pathname === "/api/test" && request.method === "GET") {
        return json(request, env, {
          ok: true,
          message: "Worker connected",
          hasNotionToken: Boolean(env.NOTION_TOKEN),
          hasTodoDb: Boolean(env.NOTION_TODO_DB_ID),
          hasScheduleDb: Boolean(env.NOTION_SCHEDULE_DB_ID),
          todoDbId: env.NOTION_TODO_DB_ID || "",
          scheduleDbId: env.NOTION_SCHEDULE_DB_ID || "",
        });
      }

      if (url.pathname === "/api/calendar" && request.method === "GET") {
        const schedules = await getSchedules(request, env);
        const todos = await getTodos(request, env);
        return json(request, env, { ok: true, schedules, todos });
      }

      if (url.pathname === "/api/todo" && request.method === "GET") {
        const todos = await getTodos(request, env);
        return json(request, env, { ok: true, todos });
      }

      if (url.pathname === "/api/todo" && request.method === "POST") {
        const page = await createTodo(request, env);
        return json(request, env, { ok: true, page });
      }

      if (url.pathname === "/api/todo/check" && request.method === "PATCH") {
        const page = await updateTodoCheck(request, env);
        return json(request, env, { ok: true, page });
      }

      if (url.pathname === "/api/schedule" && request.method === "GET") {
        const schedules = await getSchedules(request, env);
        return json(request, env, { ok: true, schedules });
      }

      if ((url.pathname === "/api/schedule" || url.pathname === "/api/calendar/schedule") && request.method === "POST") {
        const page = await createSchedule(request, env);
        return json(request, env, { ok: true, page });
      }

      return json(request, env, { ok: false, error: "Not found", path: url.pathname }, 404);
    } catch (err) {
      return json(
        request,
        env,
        {
          ok: false,
          error: "Worker crashed",
          message: err?.message || String(err),
          detail: err?.detail || null,
        },
        err?.status || 500
      );
    }
  },
};

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = env.CORS_ORIGIN || "*";
  let allowOrigin = "*";

  if (allowed !== "*") {
    const list = allowed.split(",").map(v => v.trim()).filter(Boolean);
    allowOrigin = list.includes(origin) ? origin : (list[0] || origin || "*");
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,x-paper-log-key",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
  };
}

function json(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(request, env),
  });
}

async function notionFetch(env, path, options = {}) {
  if (!env.NOTION_TOKEN) {
    throw new Error("NOTION_TOKEN is missing");
  }

  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const error = new Error(`Notion API Error ${res.status}`);
    error.status = res.status;
    error.detail = data;
    throw error;
  }

  return data;
}

async function notionQueryAll(env, databaseId, body = {}) {
  if (!databaseId) throw new Error("Database ID is missing");

  let results = [];
  let start_cursor;

  do {
    const data = await notionFetch(env, `/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({
        page_size: 100,
        ...body,
        ...(start_cursor ? { start_cursor } : {}),
      }),
    });
    results = results.concat(data.results || []);
    start_cursor = data.has_more ? data.next_cursor : null;
  } while (start_cursor);

  return results;
}

async function notionCreatePage(env, databaseId, properties) {
  if (!databaseId) throw new Error("Database ID is missing");
  return notionFetch(env, "/pages", {
    method: "POST",
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });
}

async function notionUpdatePage(env, pageId, properties) {
  if (!pageId) throw new Error("page id is required");
  return notionFetch(env, `/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

function getTitle(props, preferredName) {
  const prop = props?.[preferredName];
  if (prop?.type === "title") {
    return (prop.title || []).map(t => t.plain_text).join("").trim();
  }

  for (const value of Object.values(props || {})) {
    if (value?.type === "title") {
      return (value.title || []).map(t => t.plain_text).join("").trim();
    }
  }

  return "";
}

function getRichText(props, name) {
  const prop = props?.[name];
  if (!prop || prop.type !== "rich_text") return "";
  return (prop.rich_text || []).map(t => t.plain_text).join("").trim();
}

function getCheckbox(props, name) {
  const prop = props?.[name];
  if (!prop || prop.type !== "checkbox") return false;
  return Boolean(prop.checkbox);
}

function getSelectName(props, name) {
  const prop = props?.[name];
  if (!prop || prop.type !== "select") return "";
  return prop.select?.name || "";
}

function getMultiSelectNames(props, name) {
  const prop = props?.[name];
  if (!prop || prop.type !== "multi_select") return [];
  return (prop.multi_select || []).map(x => x.name);
}

function getRelationIds(props, name) {
  const prop = props?.[name];
  if (!prop || prop.type !== "relation") return [];
  return (prop.relation || []).map(x => x.id);
}

function dateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function timeOnly(value) {
  if (!value || !String(value).includes("T")) return "";
  return String(value).slice(11, 16);
}

function dateInfoFromProp(prop) {
  if (!prop || prop.type !== "date" || !prop.date?.start) {
    return { raw: "", date: "", time: "", endRaw: "", endDate: "", endTime: "" };
  }

  const start = prop.date.start;
  const end = prop.date.end || start;

  return {
    raw: start,
    date: dateOnly(start),
    time: timeOnly(start),
    endRaw: end,
    endDate: dateOnly(end),
    endTime: timeOnly(end),
  };
}

function getDateInfo(props, preferredName, fallbackNames = []) {
  const names = [preferredName, ...fallbackNames].filter(Boolean);

  for (const name of names) {
    const info = dateInfoFromProp(props?.[name]);
    if (info.date) return info;
  }

  for (const value of Object.values(props || {})) {
    const info = dateInfoFromProp(value);
    if (info.date) return info;
  }

  return { raw: "", date: "", time: "", endRaw: "", endDate: "", endTime: "" };
}

function relationValue(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(id => ({ id }));
  return [{ id: value }];
}

function inRange(date, from, to) {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function addDays(dateString, days) {
  const d = new Date(`${dateString}T00:00:00+09:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function expandItemDates(item, dateInfo, from, to) {
  const start = dateInfo.date;
  const end = dateInfo.endDate || dateInfo.date;
  if (!start) return [];

  let current = from && from > start ? from : start;
  const last = to && to < end ? to : end;
  if (current > last) return [];

  const out = [];
  let guard = 0;
  while (current <= last && guard < 370) {
    out.push({
      ...item,
      date: current,
      dateStart: start,
      dateEnd: end,
      isRange: start !== end,
      rangeLabel: start !== end ? `${start}~${end}` : "",
    });
    current = addDays(current, 1);
    guard++;
  }
  return out;
}

function scheduleColor(category) {
  if (category === "취소") return "canceled";
  if (category === "약속") return "meeting";
  if (category === "개인일정") return "personal";
  if (category === "개인") return "personal";
  if (category === "업무일정") return "work";
  if (category === "업무") return "work";
  return "work";
}

async function getTodos(request, env) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";

  const titleProp = env.TODO_TITLE_PROP || "할 일 목록";
  const dateProp = env.TODO_DATE_PROP || "등록요일";
  const checkProp = env.TODO_CHECK_PROP || "체크리스트";
  const memoProp = env.TODO_MEMO_PROP || "메모";
  const projectProp = env.TODO_PROJECT_PROP || "관련 프로젝트";

  const pages = await notionQueryAll(env, env.NOTION_TODO_DB_ID, {});

  return pages
    .flatMap(page => {
      const props = page.properties || {};
      const dateInfo = getDateInfo(props, dateProp, ["등록일", "날짜", "일자"]);
      const base = {
        id: page.id,
        type: "todo",
        title: getTitle(props, titleProp) || "제목 없음",
        date: dateInfo.date,
        time: dateInfo.time,
        done: getCheckbox(props, checkProp),
        memo: getRichText(props, memoProp),
        projectIds: getRelationIds(props, projectProp),
        color: "task",
      };
      return expandItemDates(base, dateInfo, from, to);
    });
}

async function createTodo(request, env) {
  const body = await request.json();
  if (!body.title) throw new Error("title is required");

  const titleProp = env.TODO_TITLE_PROP || "할 일 목록";
  const dateProp = env.TODO_DATE_PROP || "등록요일";
  const checkProp = env.TODO_CHECK_PROP || "체크리스트";
  const memoProp = env.TODO_MEMO_PROP || "메모";
  const projectProp = env.TODO_PROJECT_PROP || "관련 프로젝트";

  const properties = {
    [titleProp]: { title: [{ text: { content: body.title } }] },
    [checkProp]: { checkbox: Boolean(body.done) },
  };

  if (body.date) properties[dateProp] = { date: { start: body.date } };
  if (body.memo) properties[memoProp] = { rich_text: [{ text: { content: body.memo } }] };

  const projectIds = relationValue(body.projectPageIds || body.projectPageId);
  if (projectIds.length) properties[projectProp] = { relation: projectIds };

  return notionCreatePage(env, env.NOTION_TODO_DB_ID, properties);
}

async function updateTodoCheck(request, env) {
  const body = await request.json();
  if (!body.id) throw new Error("todo page id is required");

  const checkProp = env.TODO_CHECK_PROP || "체크리스트";
  return notionUpdatePage(env, body.id, {
    [checkProp]: { checkbox: Boolean(body.done) },
  });
}

async function getSchedules(request, env) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const includeCanceled = url.searchParams.get("includeCanceled") === "true";

  const titleProp = env.SCHEDULE_TITLE_PROP || "제목";
  const dateProp = env.SCHEDULE_DATE_PROP || "날짜";
  const categoryProp = env.SCHEDULE_CATEGORY_PROP || "카테고리";
  const projectProp = env.SCHEDULE_PROJECT_PROP || "프로젝트";
  const memoProp = env.SCHEDULE_MEMO_PROP || "개인 메모";
  const cancelCategory = env.SCHEDULE_CANCEL_CATEGORY || "취소";

  const pages = await notionQueryAll(env, env.NOTION_SCHEDULE_DB_ID, {});

  return pages
    .flatMap(page => {
      const props = page.properties || {};
      const dateInfo = getDateInfo(props, dateProp, ["일정", "일자"]);
      const category = getSelectName(props, categoryProp);
      const canceled = category === cancelCategory;
      const base = {
        id: page.id,
        type: "schedule",
        title: getTitle(props, titleProp) || "제목 없음",
        date: dateInfo.date,
        time: dateInfo.time,
        category,
        subject: category || "일정",
        canceled,
        memoTags: getMultiSelectNames(props, memoProp),
        projectIds: getRelationIds(props, projectProp),
        color: scheduleColor(category),
      };
      return expandItemDates(base, dateInfo, from, to);
    })
    .filter(item => includeCanceled || !item.canceled);
}

async function createSchedule(request, env) {
  const body = await request.json();
  if (!body.title) throw new Error("title is required");
  if (!body.date) throw new Error("date is required");

  const titleProp = env.SCHEDULE_TITLE_PROP || "제목";
  const dateProp = env.SCHEDULE_DATE_PROP || "날짜";
  const categoryProp = env.SCHEDULE_CATEGORY_PROP || "카테고리";
  const projectProp = env.SCHEDULE_PROJECT_PROP || "프로젝트";
  const memoProp = env.SCHEDULE_MEMO_PROP || "개인 메모";

  const properties = {
    [titleProp]: { title: [{ text: { content: body.title } }] },
    [dateProp]: { date: { start: body.time ? `${body.date}T${body.time}:00+09:00` : body.date } },
  };

  if (body.category) properties[categoryProp] = { select: { name: body.category } };

  const projectIds = relationValue(body.projectPageIds || body.projectPageId);
  if (projectIds.length) properties[projectProp] = { relation: projectIds };

  if (Array.isArray(body.memoTags) && body.memoTags.length) {
    properties[memoProp] = { multi_select: body.memoTags.map(name => ({ name })) };
  }

  return notionCreatePage(env, env.NOTION_SCHEDULE_DB_ID, properties);
}
