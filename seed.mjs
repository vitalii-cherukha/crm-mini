// Сид-скрипт для наповнення БД демо-даними.
// Створює клієнтів і нотатки; кожна нотатка проганяється через реальний
// AI-аналіз (Edge Function analyze-note), результат зберігається в БД.
//
// Запуск: node seed.mjs
//
// Дані підключення беруться зі змінних середовища або з дефолтів нижче
// (publishable key — публічний, RLS дозволяє anon-запис для тестового стенду).

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? "https://npiqgdexkvgfaqovbmgt.supabase.co";
const ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ??
  "sb_publishable_esl1cIFV0p5qQl7YN_uW3A_iemfhOTY";

const REST_URL = `${SUPABASE_URL}/rest/v1`;
const FN_URL = `${SUPABASE_URL}/functions/v1/analyze-note`;

const headers = {
  "Content-Type": "application/json",
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
};

/** @typedef {{name:string,company:string,phone:string,email:string,status:string,notes:string[]}} Seed */

/** @type {Seed[]} */
const CLIENTS = [
  {
    name: "Олена Коваленко",
    company: "BrightMedia",
    phone: "+380671112233",
    email: "olena@brightmedia.ua",
    status: "new",
    notes: [
      "Перший дзвінок пройшов чудово, клієнтка дуже зацікавлена, бюджет великий, просила надіслати комерційну пропозицію до пʼятниці.",
    ],
  },
  {
    name: "Ігор Мельник",
    company: "TechnoBud",
    phone: "+380502223344",
    email: "igor.melnyk@technobud.com",
    status: "in_progress",
    notes: [
      "Провели демо продукту, є кілька технічних питань щодо інтеграції з їхньою ERP. Потрібен follow-up наступного тижня.",
      "Клієнт попросив знижку, готовий підписати річний контракт за умови -10%.",
    ],
  },
  {
    name: "Наталія Шевченко",
    company: "GreenFarm",
    phone: "+380633334455",
    email: "n.shevchenko@greenfarm.ua",
    status: "in_progress",
    notes: [
      "Дуже задоволена підтримкою, планує розширити співпрацю на другий регіон.",
    ],
  },
  {
    name: "Андрій Бондаренко",
    company: "LogiTrans",
    phone: "+380674445566",
    email: "andriy@logitrans.com",
    status: "closed",
    notes: [
      "Клієнт незадоволений затримкою впровадження, розглядає відмову від угоди та перехід до конкурента.",
    ],
  },
  {
    name: "Марія Ткаченко",
    company: "BeautyLab",
    phone: "+380505556677",
    email: "maria@beautylab.ua",
    status: "new",
    notes: [
      "Залишила заявку на сайті, поки лише збирає інформацію, конкретики немає, нейтрально налаштована.",
    ],
  },
  {
    name: "Дмитро Савченко",
    company: "FinScope",
    phone: "+380636667788",
    email: "dmytro@finscope.io",
    status: "in_progress",
    notes: [
      "Велика компанія, бюджет значний, зацікавлені в enterprise-плані. Потрібна зустріч з їхнім CTO.",
      "Надіслали NDA, чекаємо підписання з їхнього боку.",
    ],
  },
  {
    name: "Оксана Поліщук",
    company: "EduSmart",
    phone: "+380677778899",
    email: "oksana@edusmart.ua",
    status: "new",
    notes: [
      "Цікавиться пілотним проєктом на 3 місяці, бюджет обмежений, але є потенціал для масштабування.",
    ],
  },
  {
    name: "Сергій Гриценко",
    company: "AutoParts UA",
    phone: "+380508889900",
    email: "sergiy@autoparts.ua",
    status: "closed",
    notes: [
      "Угоду успішно закрито, клієнт дуже задоволений результатом, залишив позитивний відгук.",
    ],
  },
  {
    name: "Вікторія Лисенко",
    company: "MediCare",
    phone: "+380639990011",
    email: "viktoria@medicare.ua",
    status: "in_progress",
    notes: [
      "Потребує додаткової демонстрації для команди, поки вагається щодо ціни.",
    ],
  },
  {
    name: "Павло Кравчук",
    company: "BuildPro",
    phone: "+380671230011",
    email: "pavlo@buildpro.com",
    status: "new",
    notes: [
      "Холодний контакт з виставки, поки просто обмінялися візитками, потребує прогріву.",
    ],
  },
];

async function analyze(text) {
  try {
    const res = await fetch(FN_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.summary === "string" && Array.isArray(data.tags)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

async function insertClient(c) {
  const res = await fetch(`${REST_URL}/clients`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({
      name: c.name,
      company: c.company,
      phone: c.phone,
      email: c.email,
      status: c.status,
    }),
  });
  if (!res.ok) {
    throw new Error(`Insert client failed (${res.status}): ${await res.text()}`);
  }
  const [row] = await res.json();
  return row;
}

async function insertNote(clientId, text, ai) {
  const res = await fetch(`${REST_URL}/notes`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({
      client_id: clientId,
      text,
      ai_summary: ai?.summary ?? null,
      ai_tags: ai?.tags ?? null,
      ai_sentiment: ai?.sentiment ?? null,
    }),
  });
  if (!res.ok) {
    throw new Error(`Insert note failed (${res.status}): ${await res.text()}`);
  }
}

async function main() {
  console.log(`Сидінг у ${SUPABASE_URL} ...`);
  let clientCount = 0;
  let noteCount = 0;
  let aiOk = 0;

  for (const c of CLIENTS) {
    const client = await insertClient(c);
    clientCount += 1;
    console.log(`+ клієнт: ${client.name} (${client.status})`);

    for (const text of c.notes) {
      const ai = await analyze(text);
      if (ai) aiOk += 1;
      await insertNote(client.id, text, ai);
      noteCount += 1;
      const tags = ai ? ai.tags.join(", ") : "AI недоступний";
      console.log(`   • нотатка [${ai?.sentiment ?? "—"}] теги: ${tags}`);
    }
  }

  console.log(
    `\nГотово: ${clientCount} клієнтів, ${noteCount} нотаток (AI успішно: ${aiOk}/${noteCount}).`,
  );
}

main().catch((err) => {
  console.error("Помилка сидінгу:", err.message);
  process.exit(1);
});
