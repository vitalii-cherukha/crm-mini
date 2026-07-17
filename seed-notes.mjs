// Додає більше нотаток наявним клієнтам (follow-up-и), проганяючи кожну
// через реальний AI-аналіз (Edge Function analyze-note).
//
// НЕ створює нових клієнтів — знаходить наявних за імʼям і дописує нотатки.
// Запуск: node seed-notes.mjs

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

/** Додаткові нотатки за імʼям клієнта. */
const EXTRA_NOTES = {
  "Олена Коваленко": [
    "Надіслали комерційну пропозицію, Олена підтвердила бюджет і хоче стартувати наступного місяця.",
    "Домовились про презентацію для її керівництва в середу.",
  ],
  "Ігор Мельник": [
    "Технічна команда підтвердила сумісність з їхньою ERP, лишились юридичні деталі.",
    "Ігор затягує з відповіддю вже тиждень, треба делікатно нагадати про себе.",
  ],
  "Наталія Шевченко": [
    "Підписали розширення на другий регіон, дуже задоволена співпрацею та підтримкою.",
  ],
  "Андрій Бондаренко": [
    "Запропонували компенсацію за затримку, але клієнт залишається холодним і роздратованим.",
    "Андрій офіційно повідомив про припинення співпраці та перехід до конкурента.",
  ],
  "Марія Ткаченко": [
    "Передзвонили — Марія все ще збирає інформацію, рішення відкладає, конкретики немає.",
  ],
  "Дмитро Савченко": [
    "Зустріч з CTO пройшла успішно, технічно рішення повністю влаштовує.",
    "NDA підписано з обох сторін, переходимо до узгодження комерційних умов.",
  ],
  "Оксана Поліщук": [
    "Погодили умови пілотного проєкту на 3 місяці, старт наступного тижня.",
    "Оксана попросила навчальні матеріали для команди перед запуском.",
  ],
  "Сергій Гриценко": [
    "Сергій порекомендував нас партнерам — очікуємо кілька нових лідів.",
  ],
  "Вікторія Лисенко": [
    "Провели демо для команди, реакція змішана, ціна все ще стримує рішення.",
    "Вікторія просить кейси схожих клієнтів, щоб обґрунтувати бюджет керівництву.",
  ],
  "Павло Кравчук": [
    "Надіслали вступні матеріали, Павло обіцяв ознайомитись до кінця тижня.",
    "Поки тиша у відповідь, потрібен ще один дотик через тиждень.",
  ],
};

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

async function fetchClients() {
  const res = await fetch(`${REST_URL}/clients?select=id,name`, { headers });
  if (!res.ok) {
    throw new Error(`Fetch clients failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

async function insertNote(clientId, text, ai) {
  const res = await fetch(`${REST_URL}/notes`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
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
  console.log(`Додаю нотатки у ${SUPABASE_URL} ...`);
  const clients = await fetchClients();
  const byName = new Map(clients.map((c) => [c.name, c.id]));

  let noteCount = 0;
  let aiOk = 0;

  for (const [name, notes] of Object.entries(EXTRA_NOTES)) {
    const clientId = byName.get(name);
    if (!clientId) {
      console.log(`! пропущено (не знайдено клієнта): ${name}`);
      continue;
    }
    console.log(`~ ${name}`);
    for (const text of notes) {
      const ai = await analyze(text);
      if (ai) aiOk += 1;
      await insertNote(clientId, text, ai);
      noteCount += 1;
      const tags = ai ? ai.tags.join(", ") : "AI недоступний";
      console.log(`   • [${ai?.sentiment ?? "—"}] ${tags}`);
    }
  }

  console.log(
    `\nГотово: додано ${noteCount} нотаток (AI успішно: ${aiOk}/${noteCount}).`,
  );
}

main().catch((err) => {
  console.error("Помилка:", err.message);
  process.exit(1);
});
