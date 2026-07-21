export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,x-paper-log-key",
      "Content-Type": "application/json; charset=utf-8",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      const url = new URL(request.url);
      const clientKey = request.headers.get("x-paper-log-key");

      if (clientKey !== env.SECRET_KEY) {
        return json({
          ok: false,
          error: "Unauthorized",
          hasSecretKey: Boolean(env.SECRET_KEY),
        }, 401, cors);
      }

      if (url.pathname === "/api/test") {
        return json({
          ok: true,
          message: "Paper Log Worker connected (Data Source API)",
          hasNotionToken: Boolean(env.NOTION_TOKEN),
          hasTodoDb: Boolean(env.NOTION_TODO_DB_ID),
          hasScheduleDb: Boolean(env.NOTION_SCHEDULE_DB_ID),
          hasProjectDb: Boolean(env.NOTION_PROJECT_DB_ID),
          hasIncomeDb: Boolean(env.NOTION_INCOME_DB_ID),
          hasExpenseDb: Boolean(env.NOTION_EXPENSE_DB_ID),
          hasDailyLogDb: Boolean(env.NOTION_DAILY_LOG_DB_ID),
          hasBossRecordDb: Boolean(env.NOTION_BOSS_RECORD_DB_ID),
          hasBossThisWeekDb: Boolean(env.NOTION_BOSS_THIS_WEEK_DB_ID),
          hasBossCharacterDb: Boolean(env.NOTION_BOSS_CHARACTER_DB_ID),
          hasBossCrystalDb: Boolean(env.NOTION_BOSS_CRYSTAL_DB_ID),
          hasBossWeekDb: Boolean(env.NOTION_BOSS_WEEK_DB_ID),
          routes: [
            "/api/projects",
            "/api/calendar",
            "/api/todo",
            "/api/todo/check",
            "/api/schedule",
            "/api/daily",
            "/api/anniversary",
            "/api/boss",
            "POST /api/boss/setup",
            "/api/money",
            "/api/money/income",
            "/api/money/expense",
            "DELETE /api/money/income",
            "DELETE /api/money/expense"
          ],
        }, 200, cors);
      }

      if (url.pathname === "/api/projects" && request.method === "GET") {
        const projects = await getProjects(env);
        return json({ ok: true, projects }, 200, cors);
      }

      if (url.pathname === "/api/calendar" && request.method === "GET") {
        const schedules = await getSchedules(request, env);
        const todos = await getTodos(request, env);
        const dailyLogs = await getDailyLogs(request, env);
        return json({ ok: true, schedules, todos, dailyLogs }, 200, cors);
      }

      if (url.pathname === "/api/todo" && request.method === "GET") {
        const todos = await getTodos(request, env);
        return json({ ok: true, todos }, 200, cors);
      }

      if (url.pathname === "/api/todo" && request.method === "POST") {
        const result = await createTodo(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/todo" && request.method === "PATCH") {
        const result = await updateTodo(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/todo" && request.method === "DELETE") {
        const result = await deleteCalendarPage(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/todo/check" && request.method === "PATCH") {
        const result = await updateTodoCheck(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/schedule" && request.method === "GET") {
        const schedules = await getSchedules(request, env);
        return json({ ok: true, schedules }, 200, cors);
      }

      if (url.pathname === "/api/schedule" && request.method === "POST") {
        const result = await createSchedule(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/schedule" && request.method === "PATCH") {
        const result = await updateSchedule(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/schedule" && request.method === "DELETE") {
        const result = await deleteCalendarPage(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }


      if (url.pathname === "/api/anniversary" && request.method === "GET") {
        const anniversaries = await getHomeAnniversaries(request, env);
        return json({ ok: true, anniversaries }, 200, cors);
      }

      if (url.pathname === "/api/anniversary" && request.method === "POST") {
        const result = await createHomeAnniversary(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/anniversary" && request.method === "PATCH") {
        const result = await updateHomeAnniversary(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/anniversary" && request.method === "DELETE") {
        const result = await deleteCalendarPage(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }


      if (url.pathname === "/api/daily" && request.method === "GET") {
        const dailyLogs = await getDailyLogs(request, env);
        return json({ ok: true, dailyLogs }, 200, cors);
      }

      if (url.pathname === "/api/daily" && request.method === "POST") {
        const result = await createDailyLog(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/daily" && request.method === "PATCH") {
        const result = await updateDailyLog(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/daily" && request.method === "DELETE") {
        const result = await deleteCalendarPage(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }


      if (url.pathname === "/api/boss" && request.method === "GET") {
        const boss = await getBossData(request, env);
        return json({ ok: true, ...boss }, 200, cors);
      }

      if (url.pathname === "/api/boss/setup" && request.method === "POST") {
        const result = await saveBossSetup(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/boss/weekly-record" && request.method === "POST") {
        const result = await saveBossWeeklyRecord(request, env);
        return json({ ok: true, ...result }, 200, cors);
      }

      if (url.pathname === "/api/money" && request.method === "GET") {
        const money = await getMoney(request, env);
        return json({ ok: true, ...money }, 200, cors);
      }

      if (url.pathname === "/api/money/income" && request.method === "POST") {
        const result = await createIncome(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/money/income" && request.method === "PATCH") {
        const result = await updateIncome(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/money/income" && request.method === "DELETE") {
        const result = await deleteMoneyPage(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/money/expense" && request.method === "POST") {
        const result = await createExpense(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/money/expense" && request.method === "PATCH") {
        const result = await updateExpense(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      if (url.pathname === "/api/money/expense" && request.method === "DELETE") {
        const result = await deleteMoneyPage(request, env);
        return json({ ok: true, page: result }, 200, cors);
      }

      return json({
        ok: false,
        error: "Not found",
        path: url.pathname,
      }, 404, cors);

    } catch (err) {
      return json({
        ok: false,
        error: "Worker crashed",
        message: err.message,
        stack: err.stack,
      }, 500, cors);
    }
  }
};

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: cors,
  });
}

/* =========================
   속성명 설정
========================= */

function todoProps(env) {
  return {
    title: env.TODO_TITLE_PROP || "할 일 목록",
    date: env.TODO_DATE_PROP || "등록일",
    check: env.TODO_CHECK_PROP || "체크리스트",
    cancel: env.TODO_CANCEL_PROP || "취소",
    memo: env.TODO_MEMO_PROP || "메모",
    project: env.TODO_PROJECT_PROP || "관련 프로젝트",
  };
}

function scheduleProps(env) {
  return {
    title: env.SCHEDULE_TITLE_PROP || "제목",
    date: env.SCHEDULE_DATE_PROP || "날짜",
    category: env.SCHEDULE_CATEGORY_PROP || "카테고리",
    cancel: env.SCHEDULE_CANCEL_PROP || "취소",
    project: env.SCHEDULE_PROJECT_PROP || "프로젝트",
    memo: env.SCHEDULE_MEMO_PROP || "개인 메모",
  };
}

function projectProps(env) {
  return {
    title: env.PROJECT_TITLE_PROP || "프로젝트 이름",
  };
}

function incomeProps(env) {
  return {
    title: env.INCOME_TITLE_PROP || "Information",
    date: env.INCOME_DATE_PROP || "날짜",
    amount: env.INCOME_AMOUNT_PROP || "amount",
    subject: env.INCOME_SUBJECT_PROP || "Subject",
    card: env.INCOME_CARD_PROP || "Card",
    memo: env.INCOME_MEMO_PROP || "기타",
  };
}

function expenseProps(env) {
  return {
    title: env.EXPENSE_TITLE_PROP || "Information",
    date: env.EXPENSE_DATE_PROP || "날짜",
    amount: env.EXPENSE_AMOUNT_PROP || "amount",
    subject: env.EXPENSE_SUBJECT_PROP || "Subject",
    card: env.EXPENSE_CARD_PROP || "Card",
    done: env.EXPENSE_DONE_PROP || "입력완료",
    waste: env.EXPENSE_WASTE_PROP || "Waste",
  };
}

function dailyProps(env) {
  return {
    title: env.DAILY_TITLE_PROP || "제목",
    date: env.DAILY_DATE_PROP || "날짜",
    mood: env.DAILY_MOOD_PROP || "mood",
    text: env.DAILY_TEXT_PROP || "한줄 일기",
  };
}

function bossRecordProps(env) {
  return {
    title: env.BOSS_RECORD_TITLE_PROP || "이름",
    character: env.BOSS_RECORD_CHARACTER_PROP || "Maple",
    boss: env.BOSS_RECORD_BOSS_PROP || "보스",
    bossDuo: env.BOSS_RECORD_BOSS_DUO_PROP || "보스_2인",
    bossOther: env.BOSS_RECORD_BOSS_OTHER_PROP || "보스_기타인원",
    party: env.BOSS_RECORD_PARTY_PROP || "인격",
    total: env.BOSS_RECORD_TOTAL_PROP || "결정석+득템",
    memo: env.BOSS_RECORD_MEMO_PROP || "물욕템 or 메모",
    count: env.BOSS_RECORD_COUNT_PROP || "결정석 갯수",
    week: env.BOSS_RECORD_WEEK_PROP || "Maple Week",
  };
}

function bossSetupProps(env) {
  return {
    title: env.BOSS_SETUP_TITLE_PROP || "설정명",
    character: env.BOSS_SETUP_CHARACTER_PROP || "캐릭터",
    crystal: env.BOSS_SETUP_CRYSTAL_PROP || "Boss결정석 251023 Ver2",
    active: env.BOSS_SETUP_ACTIVE_PROP || "활성",
    memo: env.BOSS_SETUP_MEMO_PROP || "메모",
  };
}

function bossCharacterProps(env) {
  return {
    title: env.BOSS_CHARACTER_TITLE_PROP || "제목",
    level: env.BOSS_CHARACTER_LEVEL_PROP || "레벨",
  };
}

function bossCrystalProps(env) {
  return {
    title: env.BOSS_CRYSTAL_TITLE_PROP || "이름",
    name: env.BOSS_CRYSTAL_NAME_PROP || "제목",
    price: env.BOSS_CRYSTAL_PRICE_PROP || "결정가격",
    clear: env.BOSS_CRYSTAL_CLEAR_PROP || "보스 클리어",
    active: env.BOSS_CRYSTAL_ACTIVE_PROP || "활성",
    applyDate: env.BOSS_CRYSTAL_APPLY_DATE_PROP || "적용일자",
  };
}

function bossWeekProps(env) {
  return {
    title: env.BOSS_WEEK_TITLE_PROP || "이름",
    date: env.BOSS_WEEK_DATE_PROP || "날짜",
    amount: env.BOSS_WEEK_AMOUNT_PROP || "금액",
  };
}

/* =========================
   Notion 공통
========================= */

const NOTION_VERSION = "2025-09-03";

async function notionQuery(env, dataSourceId, body = {}) {
  if (!dataSourceId) {
    throw new Error("Notion data source ID is missing");
  }

  const results = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const queryBody = {
      page_size: 100,
      ...body,
    };

    if (startCursor) {
      queryBody.start_cursor = startCursor;
    }

    const res = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryBody),
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(`Notion data source query failed ${res.status}: ${text}`);
    }

    const data = JSON.parse(text);
    results.push(...(data.results || []));

    hasMore = Boolean(data.has_more);
    startCursor = data.next_cursor;
  }

  return { results };
}

async function notionCreatePage(env, dataSourceId, properties, template) {
  const payload = {
    parent: { type: "data_source_id", data_source_id: dataSourceId },
    properties,
  };

  if (template) {
    payload.template = template;
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Notion page create failed ${res.status}: ${text}`);
  }

  return JSON.parse(text);
}

async function notionUpdatePage(env, pageId, properties) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Notion page update failed ${res.status}: ${text}`);
  }

  return JSON.parse(text);
}

async function notionArchivePage(env, pageId) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ archived: true }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Notion page archive failed ${res.status}: ${text}`);
  }

  return JSON.parse(text);
}

/* =========================
   날짜 처리
========================= */

// Notion 날짜 범위 속성(시작~종료)은 on_or_after 필터가 시작일만 기준으로 판단하기 때문에,
// 이전 달에 시작해 이번 달로 넘어오는 일정/할 일이 조회에서 누락된다.
// 조회 하한을 넉넉히 앞당겨 가져온 뒤 expandDateRange에서 실제 from~to로 다시 잘라낸다.
const RANGE_QUERY_LOOKBACK_DAYS = 60;

function subtractDays(dateText, days) {
  const d = toDate(dateText);
  if (!d) return dateText;
  d.setDate(d.getDate() - days);
  return dateKey(d);
}

function makeDateRangeFilter(propertyName, from, to) {
  const filters = [];

  if (from) {
    filters.push({
      property: propertyName,
      date: { on_or_after: from },
    });
  }

  if (to) {
    filters.push({
      property: propertyName,
      date: { on_or_before: to },
    });
  }

  if (!filters.length) return null;
  if (filters.length === 1) return filters[0];
  return { and: filters };
}

function monthRange(monthText) {
  const fallback = new Date();
  const raw = monthText || `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, "0")}`;
  const [y, m] = raw.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);

  return {
    month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
    from: dateKey(start),
    to: dateKey(end),
  };
}

function readDateRange(props, propName) {
  const prop = props?.[propName];
  const start = prop?.date?.start || "";
  const end = prop?.date?.end || "";

  const startInfo = splitNotionDate(start);
  const endInfo = splitNotionDate(end || start);

  return {
    rawStart: start,
    rawEnd: end,
    date: startInfo.date,
    time: startInfo.time,
    endDate: endInfo.date,
    endTime: endInfo.time,
  };
}

function splitNotionDate(value) {
  if (!value) return { date: "", time: "" };
  if (!value.includes("T")) return { date: value, time: "" };
  return { date: value.slice(0, 10), time: value.slice(11, 16) };
}

function toDate(dateText) {
  if (!dateText) return null;
  const d = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function expandDateRange(item, from, to) {
  if (!item.date) return [];

  const start = toDate(item.date);
  const end = toDate(item.endDate || item.date);

  if (!start || !end) return [];

  const fromDate = from ? toDate(from) : null;
  const toDateObj = to ? toDate(to) : null;

  const result = [];
  const maxDays = 370;

  let count = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    count += 1;
    if (count > maxDays) break;

    if (fromDate && d < fromDate) continue;
    if (toDateObj && d > toDateObj) continue;

    const currentKey = dateKey(d);

    result.push({
      ...item,
      originalDate: item.date,
      originalEndDate: item.endDate || item.date,
      date: currentKey,
      occurrenceKey: `${item.id}_${currentKey}`,
      isRange: item.date !== (item.endDate || item.date),
    });
  }

  return result;
}

function notionDatePayload(body) {
  const start = body.time ? `${body.date}T${body.time}:00+09:00` : body.date;
  const end = body.endDate
    ? (body.time ? `${body.endDate}T23:59:00+09:00` : body.endDate)
    : undefined;

  return end ? { start, end } : { start };
}

/* =========================
   속성 읽기
========================= */

function readTitle(props, propName) {
  const prop = props?.[propName];

  if (prop?.title) {
    return prop.title.map(t => t.plain_text).join("").trim();
  }

  for (const value of Object.values(props || {})) {
    if (value?.type === "title") {
      return value.title.map(t => t.plain_text).join("").trim();
    }
  }

  return "";
}

function readCheckbox(props, propName) {
  const prop = props?.[propName];
  if (!prop || prop.type !== "checkbox") return false;
  return Boolean(prop.checkbox);
}

function readRichText(props, propName) {
  const arr = props?.[propName]?.rich_text || [];
  return arr.map(t => t.plain_text).join("").trim();
}

function readNumber(props, propName) {
  const prop = props?.[propName];
  if (!prop) return 0;
  if (prop.type === "number") return Number(prop.number || 0);
  if (prop.type === "formula" && prop.formula?.type === "number") return Number(prop.formula.number || 0);
  return 0;
}

function readSelect(props, propName) {
  const prop = props?.[propName];
  if (!prop) return "";

  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "multi_select") return (prop.multi_select || []).map(x => x.name).join(", ");
  if (prop.type === "rich_text") return readRichText(props, propName);
  if (prop.type === "formula") {
    const f = prop.formula;
    if (f.type === "string") return f.string || "";
  }

  return "";
}

function readTextLike(props, propName) {
  const prop = props?.[propName];
  if (!prop) return "";

  if (prop.type === "rich_text") return readRichText(props, propName);
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "multi_select") return (prop.multi_select || []).map(x => x.name).join(", ");
  if (prop.type === "formula") {
    const f = prop.formula;
    if (f.type === "string") return f.string || "";
    if (f.type === "number") return String(f.number ?? "");
    if (f.type === "date") return f.date?.start || "";
  }

  return "";
}

function readMultiSelect(props, propName) {
  return (props?.[propName]?.multi_select || []).map(x => x.name);
}

function readRelationIds(props, propName) {
  return (props?.[propName]?.relation || []).map(x => x.id);
}

function relationValue(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(id => ({ id }));
  return [{ id: value }];
}

function uniqueByOccurrence(items) {
  const seen = new Set();

  return items.filter(item => {
    const k = item.occurrenceKey || `${item.id}_${item.date}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* =========================
   프로젝트 DB
========================= */

async function getProjects(env) {
  if (!env.NOTION_PROJECT_DB_ID) return [];

  const p = projectProps(env);
  const body = {
    sorts: [{ property: p.title, direction: "ascending" }],
  };

  const notionData = await notionQuery(env, env.NOTION_PROJECT_DB_ID, body);

  return notionData.results.map(page => {
    const props = page.properties || {};
    return {
      id: page.id,
      url: page.url,
      title: readTitle(props, p.title) || "이름 없음",
    };
  });
}

/* =========================
   할 일 DB
========================= */

async function getTodos(request, env) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const includeCanceled = url.searchParams.get("includeCanceled") === "true";
  const p = todoProps(env);

  const filter = makeDateRangeFilter(p.date, from ? subtractDays(from, RANGE_QUERY_LOOKBACK_DAYS) : from, to);
  const body = { sorts: [{ property: p.date, direction: "ascending" }] };
  if (filter) body.filter = filter;

  const notionData = await notionQuery(env, env.NOTION_TODO_DB_ID, body);

  const items = notionData.results
    .map(page => {
      const props = page.properties || {};
      const dateInfo = readDateRange(props, p.date);
      const canceled = readCheckbox(props, p.cancel);

      return {
        id: page.id,
        url: page.url,
        type: "todo",
        title: readTitle(props, p.title) || "제목 없음",
        date: dateInfo.date,
        time: dateInfo.time,
        endDate: dateInfo.endDate,
        endTime: dateInfo.endTime,
        done: readCheckbox(props, p.check),
        canceled,
        memo: readRichText(props, p.memo),
        projectIds: readRelationIds(props, p.project),
        color: canceled ? "canceled" : "task",
      };
    })
    .filter(item => includeCanceled || !item.canceled);

  return uniqueByOccurrence(items.flatMap(item => expandDateRange(item, from, to)));
}

async function createTodo(request, env) {
  const body = await request.json();
  const p = todoProps(env);

  if (!body.title) throw new Error("title is required");

  const properties = {
    [p.title]: { title: [{ text: { content: body.title } }] },
    [p.check]: { checkbox: Boolean(body.done) },
  };

  if (body.date) properties[p.date] = { date: notionDatePayload(body) };

  if (body.memo) {
    properties[p.memo] = { rich_text: [{ text: { content: body.memo } }] };
  }

  const projectIds = relationValue(body.projectPageIds || body.projectPageId);
  if (projectIds.length) properties[p.project] = { relation: projectIds };

  const template = getTodoTemplate(env, body);
  return notionCreatePage(env, env.NOTION_TODO_DB_ID, properties, template);
}


async function updateTodo(request, env) {
  const body = await request.json();
  const p = todoProps(env);

  if (!body.id) throw new Error("todo page id is required");

  const properties = {};

  if (body.title !== undefined) properties[p.title] = { title: [{ text: { content: body.title || "제목 없음" } }] };
  if (body.date) properties[p.date] = { date: notionDatePayload(body) };
  if (body.done !== undefined) properties[p.check] = { checkbox: Boolean(body.done) };
  if (body.memo !== undefined) properties[p.memo] = { rich_text: [{ text: { content: body.memo || "" } }] };

  if (body.projectPageIds !== undefined || body.projectPageId !== undefined) {
    properties[p.project] = { relation: relationValue(body.projectPageIds || body.projectPageId) };
  }

  return notionUpdatePage(env, body.id, properties);
}

function getTodoTemplate(env, body) {
  const category = String(body.category || body.memo || body.subject || "");
  const templateId = category.includes("업무")
    ? env.TODO_WORK_TEMPLATE_ID
    : env.TODO_PERSONAL_TEMPLATE_ID;

  if (!templateId) return null;

  return {
    type: "template_id",
    template_id: templateId,
    timezone: "Asia/Seoul",
  };
}

async function updateTodoCheck(request, env) {
  const body = await request.json();
  const p = todoProps(env);

  if (!body.id) throw new Error("todo page id is required");

  return notionUpdatePage(env, body.id, {
    [p.check]: { checkbox: Boolean(body.done) },
  });
}

/* =========================
   일정 DB
========================= */

async function getSchedules(request, env) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const includeCanceled = url.searchParams.get("includeCanceled") === "true";
  const p = scheduleProps(env);

  const filter = makeDateRangeFilter(p.date, from ? subtractDays(from, RANGE_QUERY_LOOKBACK_DAYS) : from, to);
  const body = { sorts: [{ property: p.date, direction: "ascending" }] };
  if (filter) body.filter = filter;

  const notionData = await notionQuery(env, env.NOTION_SCHEDULE_DB_ID, body);

  const items = notionData.results
    .map(page => {
      const props = page.properties || {};
      const dateInfo = readDateRange(props, p.date);
      const category = readSelect(props, p.category);
      const canceled = readCheckbox(props, p.cancel);

      return {
        id: page.id,
        url: page.url,
        type: "schedule",
        title: readTitle(props, p.title) || "제목 없음",
        date: dateInfo.date,
        time: dateInfo.time,
        endDate: dateInfo.endDate,
        endTime: dateInfo.endTime,
        category,
        subject: category || "일정",
        canceled,
        memoTags: readMultiSelect(props, p.memo),
        projectIds: readRelationIds(props, p.project),
        color: canceled ? "canceled" : scheduleColor(category),
      };
    })
    .filter(item => includeCanceled || !item.canceled)
    .filter(item => item.category !== HOME_ANNIV_CATEGORY);

  return uniqueByOccurrence(items.flatMap(item => expandDateRange(item, from, to)));
}

async function createSchedule(request, env) {
  const body = await request.json();
  const p = scheduleProps(env);

  if (!body.title) throw new Error("title is required");
  if (!body.date) throw new Error("date is required");

  const properties = {
    [p.title]: { title: [{ text: { content: body.title } }] },
    [p.date]: { date: notionDatePayload(body) },
  };

  if (body.category) properties[p.category] = { select: { name: body.category } };

  const projectIds = relationValue(body.projectPageIds || body.projectPageId);
  if (projectIds.length) properties[p.project] = { relation: projectIds };

  if (Array.isArray(body.memoTags) && body.memoTags.length) {
    properties[p.memo] = { multi_select: body.memoTags.map(name => ({ name })) };
  }

  return notionCreatePage(env, env.NOTION_SCHEDULE_DB_ID, properties);
}


async function updateSchedule(request, env) {
  const body = await request.json();
  const p = scheduleProps(env);

  if (!body.id) throw new Error("schedule page id is required");

  const properties = {};

  if (body.title !== undefined) properties[p.title] = { title: [{ text: { content: body.title || "제목 없음" } }] };
  if (body.date) properties[p.date] = { date: notionDatePayload(body) };
  if (body.category !== undefined) properties[p.category] = body.category ? { select: { name: body.category } } : { select: null };

  if (body.memoTags !== undefined) {
    properties[p.memo] = { multi_select: Array.isArray(body.memoTags) ? body.memoTags.filter(Boolean).map(name => ({ name })) : [] };
  }

  if (body.projectPageIds !== undefined || body.projectPageId !== undefined) {
    properties[p.project] = { relation: relationValue(body.projectPageIds || body.projectPageId) };
  }

  return notionUpdatePage(env, body.id, properties);
}

async function deleteCalendarPage(request, env) {
  const body = await request.json();

  if (!body.id) throw new Error("calendar page id is required");

  return notionArchivePage(env, body.id);
}

function scheduleColor(category) {
  if (category === "약속") return "meeting";
  if (category === "개인일정") return "personal";
  if (category === "개인") return "personal";
  if (category === "업무일정") return "work";
  if (category === "업무") return "work";
  return "work";
}


/* =========================
   기념일 (Home, Schedule DB 재사용)
   - 일정 DB의 카테고리를 "Home"으로 지정해 저장하고, 일반 일정 조회(getSchedules)에서는 제외한다.
   - D-day 여부/마일스톤/매년반복 여부는 별도 속성 없이 "개인 메모"(multi_select) 태그로 인코딩한다.
     예: dday 타입 -> ["dday","ms100","ms300"], 반복 안 함 -> ["norepeat"]
========================= */

const HOME_ANNIV_CATEGORY = "Home";

function homeAnnivTagsFromBody(body) {
  if (body.type === "dday") {
    const milestones = Array.isArray(body.milestones) && body.milestones.length
      ? body.milestones
      : [100, 200, 300, 500, 1000, 2000];
    return ["dday", ...milestones.map(n => `ms${n}`)];
  }
  const tags = [];
  if (body.repeat === false) tags.push("norepeat");
  return tags;
}

function parseHomeAnnivTags(tags) {
  if (tags.includes("dday")) {
    const milestones = tags
      .filter(t => /^ms\d+$/.test(t))
      .map(t => Number(t.slice(2)))
      .sort((a, b) => a - b);
    return { type: "dday", milestones: milestones.length ? milestones : [100, 200, 300, 500, 1000, 2000] };
  }
  return { type: "date", repeat: !tags.includes("norepeat") };
}

async function getHomeAnniversaries(request, env) {
  const p = scheduleProps(env);
  const body = {
    sorts: [{ property: p.date, direction: "ascending" }],
  };

  const notionData = await notionQuery(env, env.NOTION_SCHEDULE_DB_ID, body);

  return notionData.results
    .filter(page => readSelect(page.properties || {}, p.category) === HOME_ANNIV_CATEGORY)
    .map(page => {
      const props = page.properties || {};
      const dateInfo = readDateRange(props, p.date);
      const tags = readMultiSelect(props, p.memo);
      const parsed = parseHomeAnnivTags(tags);
      const name = readTitle(props, p.title) || "기념일";

      if (parsed.type === "dday") {
        return { id: page.id, url: page.url, name, type: "dday", startDate: dateInfo.date, milestones: parsed.milestones };
      }
      return { id: page.id, url: page.url, name, type: "date", date: dateInfo.date, repeat: parsed.repeat };
    })
    .filter(item => (item.type === "dday" ? item.startDate : item.date));
}

async function createHomeAnniversary(request, env) {
  const body = await request.json();
  const p = scheduleProps(env);

  if (!body.name) throw new Error("name is required");
  const dateValue = body.type === "dday" ? body.startDate : body.date;
  if (!dateValue) throw new Error("date is required");

  const properties = {
    [p.title]: { title: [{ text: { content: body.name } }] },
    [p.date]: { date: { start: dateValue } },
    [p.category]: { select: { name: HOME_ANNIV_CATEGORY } },
    [p.memo]: { multi_select: homeAnnivTagsFromBody(body).map(name => ({ name })) },
  };

  return notionCreatePage(env, env.NOTION_SCHEDULE_DB_ID, properties);
}

async function updateHomeAnniversary(request, env) {
  const body = await request.json();
  const p = scheduleProps(env);

  if (!body.id) throw new Error("anniversary page id is required");

  const properties = {
    [p.category]: { select: { name: HOME_ANNIV_CATEGORY } },
  };

  if (body.name !== undefined) properties[p.title] = { title: [{ text: { content: body.name || "기념일" } }] };

  const dateValue = body.type === "dday" ? body.startDate : body.date;
  if (dateValue) properties[p.date] = { date: { start: dateValue } };

  if (body.type !== undefined) {
    properties[p.memo] = { multi_select: homeAnnivTagsFromBody(body).map(name => ({ name })) };
  }

  return notionUpdatePage(env, body.id, properties);
}


/* =========================
   Daily Mood DB
========================= */

async function getDailyLogs(request, env) {
  if (!env.NOTION_DAILY_LOG_DB_ID) return [];

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const p = dailyProps(env);

  const filter = makeDateRangeFilter(p.date, from, to);
  const body = { sorts: [{ property: p.date, direction: "ascending" }] };
  if (filter) body.filter = filter;

  const notionData = await notionQuery(env, env.NOTION_DAILY_LOG_DB_ID, body);

  return notionData.results.map(page => {
    const props = page.properties || {};
    const dateInfo = readDateRange(props, p.date);

    return {
      id: page.id,
      url: page.url,
      type: "daily",
      title: readTitle(props, p.title) || "하루 기록",
      date: dateInfo.date,
      mood: readSelect(props, p.mood),
      text: readRichText(props, p.text),
    };
  }).filter(item => item.date);
}

async function createDailyLog(request, env) {
  const body = await request.json();
  const p = dailyProps(env);

  if (!body.date) throw new Error("date is required");

  const properties = {
    [p.title]: { title: [{ text: { content: body.title || `${body.date} 하루 기록` } }] },
    [p.date]: { date: { start: body.date } },
  };

  if (body.mood) properties[p.mood] = { select: { name: body.mood } };
  if (body.text !== undefined) properties[p.text] = { rich_text: [{ text: { content: body.text || "" } }] };

  return notionCreatePage(env, env.NOTION_DAILY_LOG_DB_ID, properties);
}

async function updateDailyLog(request, env) {
  const body = await request.json();
  const p = dailyProps(env);

  if (!body.id) throw new Error("daily page id is required");

  const properties = {};

  if (body.title !== undefined) properties[p.title] = { title: [{ text: { content: body.title || "하루 기록" } }] };
  if (body.date) properties[p.date] = { date: { start: body.date } };
  if (body.mood !== undefined) properties[p.mood] = body.mood ? { select: { name: body.mood } } : { select: null };
  if (body.text !== undefined) properties[p.text] = { rich_text: [{ text: { content: body.text || "" } }] };

  return notionUpdatePage(env, body.id, properties);
}


/* =========================
   Maple Boss DB
========================= */

async function safeBossQuery(env, databaseId, body = {}) {
  if (!databaseId) return { results: [] };

  try {
    return await notionQuery(env, databaseId, body);
  } catch (err) {
    console.warn("Boss query failed:", err.message);
    return { results: [] };
  }
}

function bossTitleFallback(props, primary, secondary) {
  return readTitle(props, primary) || readSelect(props, secondary) || readRichText(props, secondary) || readTitle(props, secondary) || "";
}

function isValidNotionPageId(id) {
  return /^[0-9a-f]{32}$/i.test(String(id || "").replace(/-/g, ""));
}

function isHiddenBossCharacterName(name) {
  const n = String(name || "").replace(/\s/g, "");
  return n.includes("총하빙") || n.includes("총합") || n.includes("쌀먹");
}

async function saveBossSetup(request, env) {
  const body = await request.json();
  const p = bossSetupProps(env);
  const characterProps = bossCharacterProps(env);

  if (!body.characterId) throw new Error("characterId is required");
  if (!isValidNotionPageId(body.characterId)) {
    throw new Error("characterId must be a Notion page id. Reload boss characters from Notion first.");
  }

  const bossIds = Array.isArray(body.bossIds) ? body.bossIds.filter(isValidNotionPageId) : [];

  let characterName = body.characterName || "";
  if (!characterName && env.NOTION_BOSS_CHARACTER_DB_ID) {
    const characterData = await safeBossQuery(env, env.NOTION_BOSS_CHARACTER_DB_ID);
    const characterPage = (characterData.results || []).find(page => page.id === body.characterId);
    if (characterPage) characterName = readTitle(characterPage.properties || {}, characterProps.title);
  }

  const title = body.title || `${characterName || "캐릭터"} 기본 보스`;
  const properties = {
    [p.title]: { title: [{ text: { content: title } }] },
    [p.character]: { relation: relationValue(body.characterId) },
    [p.crystal]: { relation: relationValue(bossIds) },
  };

  if (p.active) properties[p.active] = { checkbox: body.active !== false };
  if (p.memo && body.memo !== undefined) {
    properties[p.memo] = { rich_text: [{ text: { content: body.memo || "" } }] };
  }

  const setupData = await safeBossQuery(env, env.NOTION_BOSS_THIS_WEEK_DB_ID);
  const existing = (setupData.results || []).find(page => {
    const ids = readRelationIds(page.properties || {}, p.character);
    return ids.includes(body.characterId);
  });

  if (existing) {
    return notionUpdatePage(env, existing.id, properties);
  }

  return notionCreatePage(env, env.NOTION_BOSS_THIS_WEEK_DB_ID, properties);
}

function bossCycleByName(name) {
  return String(name || "").includes("검은 마법사") ? "monthly" : "weekly";
}

function makeBossFamilyName(name) {
  const raw = String(name || "").trim();
  if (raw.includes("유피테르")) return "유피테르";
  if (raw.includes("찬란한 흉성") || raw.includes("찬란한흉성")) return "찬란한 흉성";
  if (raw.includes("카링")) return "카링";
  const known = [
    "검은 마법사",
    "최초의 대적자",
    "감시자 칼로스",
    "가디언 엔젤 슬라임",
    "선택받은 세렌",
    "진 힐라",
    "파풀라투스",
    "블러디 퀸",
    "시그너스",
    "핑크빈",
    "발드릭스",
    "카링",
    "림보",
    "스우",
    "데미안",
    "루시드",
    "윌",
    "더스크",
    "듄켈",
    "벨룸",
    "매그너스",
    "피에르",
    "반반",
    "자쿰",
    "힐라",
    "카이"
  ];

  for (const item of known) {
    if (raw.includes(item)) return item;
  }

  return raw.replace(/^(익스트림|카오스|하드|노멀|이지)\s+/, "").trim() || raw;
}


function bossRelationTargetForParty(p, partyType) {
  if (partyType === "duo") return p.bossDuo;
  if (partyType === "other") return p.bossOther;
  return p.boss;
}

function normalizeBossMemoKey(value) {
  return String(value || "")
    .replace(/^(익스트림|카오스|하드|노멀|이지)\s+/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function pickBossMemo(fullMemo, bossName, bossFamily = "") {
  const text = String(fullMemo || "").trim();
  if (!text) return "";

  const lines = text.split(/\n+/).map(x => x.trim()).filter(Boolean);
  const keys = [
    String(bossName || "").trim(),
    String(bossFamily || "").trim(),
    normalizeBossMemoKey(bossName),
    normalizeBossMemoKey(bossFamily),
  ].filter(Boolean);

  for (const key of keys) {
    const exact = lines.find(line => line.startsWith(`${key}:`) || line.startsWith(`${key}：`));
    if (exact) return exact.replace(`${key}:`, "").replace(`${key}：`, "").trim();
  }

  for (const line of lines) {
    const parts = line.split(/[:：]/);
    if (parts.length < 2) continue;
    const left = parts.shift().trim();
    const right = parts.join(":").trim();
    const leftNorm = normalizeBossMemoKey(left);
    if (keys.some(key => normalizeBossMemoKey(key) === leftNorm || leftNorm.includes(normalizeBossMemoKey(key)) || normalizeBossMemoKey(key).includes(leftNorm))) {
      return right;
    }
  }

  for (const line of lines) {
    const lineNorm = normalizeBossMemoKey(line);
    const matchedKey = keys.find(key => {
      const keyNorm = normalizeBossMemoKey(key);
      return keyNorm && lineNorm.includes(keyNorm);
    });
    if (matchedKey) {
      return line.replace(new RegExp(String(matchedKey).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "").trim() || line;
    }
  }

  if (lines.length === 1 && !lines[0].includes(":") && !lines[0].includes("：")) {
    const lineNorm = normalizeBossMemoKey(lines[0]);
    if (keys.some(key => {
      const keyNorm = normalizeBossMemoKey(key);
      return keyNorm && (lineNorm.includes(keyNorm) || keyNorm.includes(lineNorm));
    })) return lines[0];
    return "";
  }

  // 매칭 실패 시 전체 메모를 모든 보스에 뿌리지 않는다.
  // 물욕템 or 메모는 득템 전용 속성이므로, 보스명/가족명으로 맞는 줄만 붙인다.
  return "";
}



function normalizeBossWeekInfo(info = {}) {
  const rawStart = compareDateText(info.weekStart || "2026-06-18");
  const start = rawStart < "2026-01-01" ? "2026-06-18" : rawStart;
  const d = new Date(start + "T00:00:00");
  const weekNo = Math.ceil(d.getDate() / 7);
  const month = d.getMonth() + 1;
  const fullYear = d.getFullYear();
  return {
    weekStart: start,
    weekKey: info.weekKey && String(info.weekKey).startsWith(String(fullYear)) ? info.weekKey : `${fullYear}-${String(month).padStart(2, "0")}-W${weekNo}`,
    weekLabel: info.weekLabel && String(info.weekLabel).startsWith(String(fullYear).slice(2)) ? info.weekLabel : `${String(fullYear).slice(2)}년 ${month}월 ${weekNo}주`,
    weekShortLabel: `${month}월 ${weekNo}주`,
  };
}

function bossWeekPageMatches(page, env, info = {}) {
  const p = bossWeekProps(env);
  const props = page.properties || {};
  const title = readTitle(props, p.title);
  const dateInfo = readDateRange(props, p.date);
  const normalized = normalizeBossWeekInfo(info);

  if (dateInfo.date && dateInfo.date === normalized.weekStart) return true;
  if (title === normalized.weekLabel) return true;
  if (title === normalized.weekKey) return true;

  return false;
}

async function getOrCreateBossWeekPage(env, info = {}) {
  if (!env.NOTION_BOSS_WEEK_DB_ID) return null;

  const p = bossWeekProps(env);
  const normalized = normalizeBossWeekInfo(info);
  const title = normalized.weekLabel;
  const startDate = normalized.weekStart;

  const all = await safeBossQuery(env, env.NOTION_BOSS_WEEK_DB_ID, { page_size: 100 });
  const existing = (all.results || []).find(page => bossWeekPageMatches(page, env, normalized));

  if (existing) return existing;

  const properties = {
    [p.title]: { title: [{ text: { content: title } }] },
  };

  if (startDate) {
    properties[p.date] = { date: { start: startDate } };
  }

  try {
    return await notionCreatePage(env, env.NOTION_BOSS_WEEK_DB_ID, properties);
  } catch (err) {
    console.warn("Boss week create failed:", err.message);
    return null;
  }
}

async function getBossRecordDataForWeek(env, weekPage, info = {}) {
  const p = bossRecordProps(env);

  if (weekPage?.id) {
    try {
      return await notionQuery(env, env.NOTION_BOSS_RECORD_DB_ID, {
        page_size: 100,
        filter: {
          property: p.week,
          relation: { contains: weekPage.id },
        },
      });
    } catch (err) {
      console.warn("Boss record week relation query failed:", err.message);
    }
  }

  const data = await safeBossQuery(env, env.NOTION_BOSS_RECORD_DB_ID, { page_size: 100 });
  const normalized = normalizeBossWeekInfo(info);

  return {
    results: (data.results || []).filter(page => {
      const title = readTitle(page.properties || {}, p.title);
      return title === normalized.weekKey || title === normalized.weekLabel;
    }),
  };
}

function bossRecordPageToStates(page, env) {
  const p = bossRecordProps(env);
  const props = page.properties || {};
  const charId = readRelationIds(props, p.character)[0] || "";
  const soloIds = readRelationIds(props, p.boss);
  const duoIds = readRelationIds(props, p.bossDuo);
  const otherIds = readRelationIds(props, p.bossOther);
  const otherParty = readNumber(props, p.party) || 3;
  const memo = readRichText(props, p.memo);
  const title = readTitle(props, p.title);
  const weekIds = readRelationIds(props, p.week);

  const states = [];

  for (const bossId of soloIds) {
    states.push({ recordId: page.id, recordTitle: title, charId, bossId, partyType: "solo", otherParty: 1, memo, weekIds });
  }

  for (const bossId of duoIds) {
    states.push({ recordId: page.id, recordTitle: title, charId, bossId, partyType: "duo", otherParty: 2, memo, weekIds });
  }

  for (const bossId of otherIds) {
    states.push({ recordId: page.id, recordTitle: title, charId, bossId, partyType: "other", otherParty, memo, weekIds });
  }

  return states;
}

function buildBossWeeklyMemo(records) {
  return (records || [])
    .filter(r => String(r.memo || "").trim())
    .map(r => `${r.bossName || "보스"}: ${String(r.memo || "").trim()}`)
    .join("\n");
}

async function saveBossWeeklyRecord(request, env) {
  const body = await request.json();
  const p = bossRecordProps(env);

  if (!isValidNotionPageId(body.characterId)) throw new Error("characterId must be a Notion page id");

  const soloIds = (body.soloBossIds || []).filter(isValidNotionPageId);
  const duoIds = (body.duoBossIds || []).filter(isValidNotionPageId);
  const otherIds = (body.otherBossIds || []).filter(isValidNotionPageId);
  const allBossIds = [...soloIds, ...duoIds, ...otherIds];
  const weekInfo = normalizeBossWeekInfo({
    weekKey: body.weekKey || "",
    weekLabel: body.weekLabel || "",
    weekShortLabel: body.weekShortLabel || "",
    weekStart: body.weekStart || "",
  });
  const weekKey = weekInfo.weekKey;
  const weekPage = await getOrCreateBossWeekPage(env, weekInfo);
  const title = body.title && !String(body.title).includes("25년")
    ? body.title
    : `${body.characterName || "캐릭터"}(${weekInfo.weekShortLabel || weekKey || "보스 기록"})`;
  const memo = body.memo !== undefined ? body.memo : buildBossWeeklyMemo(body.records || []);
  const otherParty = otherIds.length ? Number(body.otherParty || 3) : null;

  const properties = {
    [p.title]: { title: [{ text: { content: title } }] },
    [p.character]: { relation: relationValue(body.characterId) },
    [p.boss]: { relation: relationValue(soloIds) },
    [p.bossDuo]: { relation: relationValue(duoIds) },
    [p.bossOther]: { relation: relationValue(otherIds) },
    [p.party]: { number: otherParty },
    [p.memo]: { rich_text: [{ text: { content: memo || "" } }] },
  };

  if (weekPage?.id) {
    properties[p.week] = { relation: relationValue(weekPage.id) };
  }

  const recordData = await safeBossQuery(env, env.NOTION_BOSS_RECORD_DB_ID, { page_size: 100 });
  const existing = (recordData.results || []).find(page => {
    const props = page.properties || {};
    const titleValue = readTitle(props, p.title);
    const charIds = readRelationIds(props, p.character);
    const weekIds = readRelationIds(props, p.week);
    const sameWeek = weekPage?.id ? weekIds.includes(weekPage.id) : (weekKey && titleValue.includes(weekKey)) || (weekInfo.weekLabel && titleValue.includes(weekInfo.weekLabel)) || (weekInfo.weekShortLabel && titleValue.includes(weekInfo.weekShortLabel));
    return charIds.includes(body.characterId) && sameWeek;
  });

  if (!allBossIds.length) {
    if (existing) {
      await notionArchivePage(env, existing.id);
      return { archived: true, recordId: existing.id };
    }
    return { archived: false };
  }

  if (existing) {
    const page = await notionUpdatePage(env, existing.id, properties);
    return { page, recordId: page.id };
  }

  const page = await notionCreatePage(env, env.NOTION_BOSS_RECORD_DB_ID, properties);
  return { page, recordId: page.id };
}


function normalizeBossPriceName(name){return String(name||"").replace(/\s+/g," ").trim();}
function compareDateText(value){const text=String(value||"").slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(text)?text:"0000-00-00";}
function bossApplyBaseDate(weekInfo,env){const base=compareDateText(weekInfo?.weekStart||env.BOSS_CRYSTAL_BASE_DATE||"2026-06-18");return base<"2026-01-01"?"2026-06-18":base;}
function isBossCrystalActive(props,propName){const prop=props?.[propName];if(!prop)return true;if(prop.type==="checkbox")return Boolean(prop.checkbox);if(prop.type==="formula"&&prop.formula?.type==="boolean")return Boolean(prop.formula.boolean);return true;}
function chooseCrystalForDate(allCrystals,originalCrystal,baseDate){
  if(!originalCrystal)return null;
  const name=normalizeBossPriceName(originalCrystal.name),family=normalizeBossPriceName(originalCrystal.family),clearType=normalizeBossPriceName(originalCrystal.clearType);
  const valid=allCrystals.filter(c=>c.active!==false&&compareDateText(c.applyDate)<=baseDate);
  const exact=valid.filter(c=>normalizeBossPriceName(c.name)===name);
  const familySameType=valid.filter(c=>normalizeBossPriceName(c.family)===family&&(!clearType||normalizeBossPriceName(c.clearType)===clearType));
  const familyAny=valid.filter(c=>normalizeBossPriceName(c.family)===family);
  const candidates=exact.length?exact:(familySameType.length?familySameType:familyAny);
  candidates.sort((a,b)=>compareDateText(b.applyDate).localeCompare(compareDateText(a.applyDate)));
  return candidates[0]||originalCrystal;
}
function visibleCrystalsForDate(allCrystals,baseDate){const map=new Map();for(const c of allCrystals){const e=chooseCrystalForDate(allCrystals,c,baseDate);if(!e)continue;const k=normalizeBossPriceName(e.name);if(!map.has(k))map.set(k,e)}return [...map.values()];}

async function getBossData(request, env) {
  const url = new URL(request.url);
  const weekInfo = {
    weekKey: url.searchParams.get("weekKey") || "",
    weekLabel: url.searchParams.get("weekLabel") || "",
    weekStart: url.searchParams.get("weekStart") || "",
  };
  weekInfo.weekShortLabel = weekInfo.weekLabel ? weekInfo.weekLabel.replace(/^\d{2}년\s*/, "") : "";
  const weekPage = await getOrCreateBossWeekPage(env, weekInfo);
  const characterProps = bossCharacterProps(env);
  const crystalProps = bossCrystalProps(env);
  const setupProps = bossSetupProps(env);

  const [characterData, crystalData, setupData, recordData] = await Promise.all([
    safeBossQuery(env, env.NOTION_BOSS_CHARACTER_DB_ID),
    safeBossQuery(env, env.NOTION_BOSS_CRYSTAL_DB_ID),
    safeBossQuery(env, env.NOTION_BOSS_THIS_WEEK_DB_ID, {
      page_size: 100,
    }),
    getBossRecordDataForWeek(env, weekPage, weekInfo),
  ]);

  const characters = (characterData.results || []).map(page => {
    const props = page.properties || {};
    return {
      id: page.id,
      url: page.url,
      name: readTitle(props, characterProps.title) || "캐릭터",
      level: readNumber(props, characterProps.level),
    };
  }).filter(x => x.name && !isHiddenBossCharacterName(x.name));

  const crystalApplyDate = bossApplyBaseDate(weekInfo, env);

  const allCrystals = (crystalData.results || []).map(page => {
    const props = page.properties || {};
    const displayName = readRichText(props, crystalProps.name) || readSelect(props, crystalProps.name) || readTitle(props, crystalProps.name);
    const title = displayName || readTitle(props, crystalProps.title) || "보스";
    const price = readNumber(props, crystalProps.price);
    const family = makeBossFamilyName(title);
    const applyDateInfo = readDateRange(props, crystalProps.applyDate);
    return {
      id: page.id,
      url: page.url,
      name: title,
      family,
      cycle: bossCycleByName(title),
      price,
      clearType: readSelect(props, crystalProps.clear),
      active: isBossCrystalActive(props, crystalProps.active),
      applyDate: applyDateInfo.date || "",
    };
  }).filter(x => x.name);

  const crystals = visibleCrystalsForDate(allCrystals, crystalApplyDate);
  const crystalMap = new Map(allCrystals.map(x => [x.id, x]));
  const characterMap = new Map(characters.map(x => [x.id, x]));

  const existingBossRecordStates = (recordData.results || []).flatMap(page => bossRecordPageToStates(page, env)).filter(x => x.charId && x.bossId);
  const bossRecordMap = new Map();
  const bossRecordNameMap = new Map();
  const bossRecordFamilyMap = new Map();

  for (const state of existingBossRecordStates) {
    const crystalForState = crystalMap.get(state.bossId);
    const key = `${state.charId}_${state.bossId}`;
    if (!bossRecordMap.has(key)) bossRecordMap.set(key, state);

    if (crystalForState?.name) {
      const nameKey = `${state.charId}_${normalizeBossPriceName(crystalForState.name)}`;
      if (!bossRecordNameMap.has(nameKey)) bossRecordNameMap.set(nameKey, state);
    }

    if (crystalForState?.family) {
      const familyKey = `${state.charId}_${normalizeBossPriceName(crystalForState.family)}`;
      if (!bossRecordFamilyMap.has(familyKey)) bossRecordFamilyMap.set(familyKey, state);
    }
  }

  const setups = (setupData.results || []).map(page => {
    const props = page.properties || {};
    const activeProp = props?.[setupProps.active];
    const active = activeProp ? readCheckbox(props, setupProps.active) : true;
    return {
      id: page.id,
      url: page.url,
      title: readTitle(props, setupProps.title) || "보스 설정",
      active,
      characterIds: readRelationIds(props, setupProps.character),
      crystalIds: readRelationIds(props, setupProps.crystal),
      memo: readRichText(props, setupProps.memo),
    };
  }).filter(x => x.active);

  const records = [];
  for (const setup of setups) {
    const charIds = setup.characterIds.length ? setup.characterIds : [""];
    const crystalIds = setup.crystalIds.length ? setup.crystalIds : [""];

    for (const charId of charIds) {
      const character = characterMap.get(charId);
      for (const crystalId of crystalIds) {
        const originalCrystal = crystalMap.get(crystalId);
        const effectiveCrystal = chooseCrystalForDate(allCrystals, originalCrystal, crystalApplyDate) || originalCrystal;
        const existingState =
          bossRecordMap.get(`${charId}_${crystalId}`) ||
          (effectiveCrystal?.id ? bossRecordMap.get(`${charId}_${effectiveCrystal.id}`) : null) ||
          (originalCrystal?.name ? bossRecordNameMap.get(`${charId}_${normalizeBossPriceName(originalCrystal.name)}`) : null) ||
          (effectiveCrystal?.name ? bossRecordNameMap.get(`${charId}_${normalizeBossPriceName(effectiveCrystal.name)}`) : null) ||
          (originalCrystal?.family ? bossRecordFamilyMap.get(`${charId}_${normalizeBossPriceName(originalCrystal.family)}`) : null) ||
          (effectiveCrystal?.family ? bossRecordFamilyMap.get(`${charId}_${normalizeBossPriceName(effectiveCrystal.family)}`) : null);

        const displayCrystal = existingState ? (crystalMap.get(existingState.bossId) || effectiveCrystal || originalCrystal) : (effectiveCrystal || originalCrystal);
        const bossIdForRecord = existingState?.bossId || displayCrystal?.id || crystalId;
        const memo = "";
        records.push({
          key: `${setup.id}_${charId || "character"}_${bossIdForRecord || "boss"}`,
          setupId: setup.id,
          recordId: existingState?.recordId || "",
          charId: charId || setup.id,
          charName: character?.name || setup.title || "캐릭터",
          bossId: bossIdForRecord || setup.id,
          name: displayCrystal?.name || setup.title || "보스",
          family: displayCrystal?.family || displayCrystal?.name || setup.title || "보스",
          cycle: displayCrystal?.cycle || bossCycleByName(displayCrystal?.name || setup.title),
          price: Number(displayCrystal?.price || 0),
          applyDate: displayCrystal?.applyDate || "",
          memo: memo || existingState?.memo || "",
          partyType: existingState?.partyType || "solo",
          otherParty: existingState?.otherParty || 3,
          clear: Boolean(existingState?.recordId),
          source: "notion",
        });
      }
    }
  }

  const dedupedRecords = [];
  const seenRecordKeys = new Set();

  for (const record of records) {
    const key = `${record.charId}_${record.bossId}`;
    if (seenRecordKeys.has(key)) continue;
    seenRecordKeys.add(key);
    dedupedRecords.push(record);
  }

  const bossMemos = [];
  const seenMemoKeys = new Set();
  for (const state of existingBossRecordStates) {
    const memoText = String(state.memo || "").trim();
    if (!state.charId || !memoText) continue;
    const key = `${state.charId}_${state.recordId || state.recordTitle || memoText}`;
    if (seenMemoKeys.has(key)) continue;
    seenMemoKeys.add(key);
    bossMemos.push({
      charId: state.charId,
      recordId: state.recordId || "",
      recordTitle: state.recordTitle || "",
      memo: memoText,
    });
  }

  return { characters, crystals, setups, records: dedupedRecords, bossMemos };
}

/* =========================
   Money DB
========================= */

async function getMoney(request, env) {
  const url = new URL(request.url);
  const target = monthRange(url.searchParams.get("month"));
  const from = target.from;
  const to = target.to;

  const [incomeRecords, expenseRecords] = await Promise.all([
    getIncomeRecords(env, from, to),
    getExpenseRecords(env, from, to),
  ]);

  const records = [...incomeRecords, ...expenseRecords]
    .filter(x => x.date && x.date >= from && x.date <= to)
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.createdTime || "").localeCompare(a.createdTime || "");
    });

  const income = incomeRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const expense = expenseRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const waste = expenseRecords.filter(r => r.waste).reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const days = {};
  for (const r of records) {
    if (!days[r.date]) days[r.date] = { income: false, expense: false, waste: false, count: 0 };
    if (r.type === "income") days[r.date].income = true;
    if (r.type === "expense") days[r.date].expense = true;
    if (r.waste) days[r.date].waste = true;
    days[r.date].count += 1;
  }

  return {
    month: target.month,
    summary: {
      income,
      expense,
      balance: income - expense,
      waste,
      count: records.length,
    },
    records,
    days,
  };
}

async function getIncomeRecords(env, from, to) {
  const p = incomeProps(env);
  const filter = makeDateRangeFilter(p.date, from, to);
  const body = { sorts: [{ property: p.date, direction: "descending" }] };
  if (filter) body.filter = filter;

  const notionData = await notionQuery(env, env.NOTION_INCOME_DB_ID, body);

  return notionData.results.map(page => {
    const props = page.properties || {};
    const dateInfo = readDateRange(props, p.date);

    return {
      id: page.id,
      url: page.url,
      createdTime: page.created_time || "",
      type: "income",
      title: readTitle(props, p.title) || "수입",
      date: dateInfo.date,
      amount: readNumber(props, p.amount),
      category: readSelect(props, p.subject),
      card: readTextLike(props, p.card),
      account: readTextLike(props, p.card),
      memo: readRichText(props, p.memo),
    };
  });
}

async function getExpenseRecords(env, from, to) {
  const p = expenseProps(env);
  const filter = makeDateRangeFilter(p.date, from, to);
  const body = { sorts: [{ property: p.date, direction: "descending" }] };
  if (filter) body.filter = filter;

  const notionData = await notionQuery(env, env.NOTION_EXPENSE_DB_ID, body);

  return notionData.results.map(page => {
    const props = page.properties || {};
    const dateInfo = readDateRange(props, p.date);

    return {
      id: page.id,
      url: page.url,
      createdTime: page.created_time || "",
      type: "expense",
      title: readTitle(props, p.title) || "지출",
      date: dateInfo.date,
      amount: readNumber(props, p.amount),
      category: readSelect(props, p.subject),
      card: readTextLike(props, p.card),
      payment: readTextLike(props, p.card),
      done: readCheckbox(props, p.done),
      waste: readCheckbox(props, p.waste),
    };
  });
}

async function createIncome(request, env) {
  const body = await request.json();
  const p = incomeProps(env);

  if (!body.title) throw new Error("title is required");
  if (!body.date) throw new Error("date is required");

  const properties = buildIncomeProperties(body, p);
  return notionCreatePage(env, env.NOTION_INCOME_DB_ID, properties);
}

async function updateIncome(request, env) {
  const body = await request.json();
  const p = incomeProps(env);

  if (!body.id) throw new Error("income page id is required");

  const properties = buildIncomeProperties(body, p);
  return notionUpdatePage(env, body.id, properties);
}

function buildIncomeProperties(body, p) {
  const properties = {};

  if (body.title) properties[p.title] = { title: [{ text: { content: body.title } }] };
  if (body.date) properties[p.date] = { date: { start: body.date } };
  if (body.amount !== undefined) properties[p.amount] = { number: Number(body.amount || 0) };
  if (body.category) properties[p.subject] = { select: { name: body.category } };
  if (body.card) properties[p.card] = { select: { name: body.card } };
  if (body.memo !== undefined && p.memo) properties[p.memo] = { rich_text: [{ text: { content: body.memo || "" } }] };

  return properties;
}

async function createExpense(request, env) {
  const body = await request.json();
  const p = expenseProps(env);

  if (!body.title) throw new Error("title is required");
  if (!body.date) throw new Error("date is required");

  const properties = buildExpenseProperties(body, p, true);
  return notionCreatePage(env, env.NOTION_EXPENSE_DB_ID, properties);
}

async function updateExpense(request, env) {
  const body = await request.json();
  const p = expenseProps(env);

  if (!body.id) throw new Error("expense page id is required");

  const properties = buildExpenseProperties(body, p, false);
  return notionUpdatePage(env, body.id, properties);
}


async function deleteMoneyPage(request, env) {
  const body = await request.json();

  if (!body.id) {
    throw new Error("money page id is required");
  }

  return notionArchivePage(env, body.id);
}

function buildExpenseProperties(body, p, isCreate) {
  const properties = {};

  if (body.title) properties[p.title] = { title: [{ text: { content: body.title } }] };
  if (body.date) properties[p.date] = { date: { start: body.date } };
  if (body.amount !== undefined) properties[p.amount] = { number: Number(body.amount || 0) };
  if (body.category) properties[p.subject] = { select: { name: body.category } };
  if (body.card) properties[p.card] = { select: { name: body.card } };
  if (p.done) properties[p.done] = { checkbox: isCreate ? true : body.done !== false };
  if (p.waste) properties[p.waste] = { checkbox: Boolean(body.waste) };

  return properties;
}


