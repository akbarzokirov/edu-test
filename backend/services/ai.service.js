// ============================================
//  Groq AI servisi
//  - Fayl matnidan savol yaratadi
//  - Fayl tili qanday bo'lsa, savollar ham shu tilda
//  - Test natijasini baholaydi va fikr bildiradi
// ============================================

require("dotenv").config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Groq API ga so'rov yuborish
 */
async function callGroq(messages, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY .env faylda topilmadi");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.max_tokens ?? 4000,
      response_format: options.json ? { type: "json_object" } : undefined,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API xatolik (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Matn tilini aniqlash (oddiy heuristic)
 * - Kirill + uzbek harflari => "uz"
 * - Kirill + russian so'zlari => "ru"  
 * - Lotin => "en" yoki "uz" (teacher promptiga qarab)
 * Agar noaniq bo'lsa Groq'ga qoldiramiz
 */
function detectLanguageHint(text) {
  const sample = text.slice(0, 2000).toLowerCase();

  // Uzbek belgilari (o', g', sh, ch)
  const uzbekMarkers = /\b(bo'l|so'z|o'qi|yoki|uchun|kerak|haqida|lekin|bo'yicha)\b/i;
  // Russian belgilari
  const russianMarkers = /[а-яё]/i;
  // Kirill uzbekcha belgilari
  const kirillUzMarkers = /\b(оʻ|гʻ|ekan|uchun|bolalar)\b/i;

  if (russianMarkers.test(sample) && !kirillUzMarkers.test(sample)) {
    return "ru";
  }
  if (uzbekMarkers.test(sample)) {
    return "uz";
  }
  // Default — AI o'zi tilni aniqlab savol yaratadi
  return "auto";
}

/**
 * Fayl matni va teacher prompt'idan AI savollar yaratadi
 * FAYL TILIDA javob beradi.
 */
async function generateQuestions({
  fileText,
  teacherPrompt = "",
  questionCount = 10,
  languageHint = "auto",
}) {
  // Matnni qisqartirish (Groq context limit uchun)
  const MAX_CHARS = 14000;
  const clippedText =
    fileText.length > MAX_CHARS
      ? fileText.slice(0, MAX_CHARS) + "\n...(qisqartirildi)"
      : fileText;

  const systemPrompt = `Siz tajribali o'qituvchisiz. Sizga darslik yoki mavzu matni beriladi, siz undan test savollarni yaratasiz.

MUHIM QOIDALAR:
1. TIL: Savollar VA variantlar AYNAN berilgan matn tilida bo'lishi shart. Agar matn o'zbek tilida bo'lsa — savollar o'zbekcha. Agar rus tilida bo'lsa — ruscha. Agar ingliz tilida bo'lsa — inglizcha. Tilni aralashtirmang.
2. Har bir savolda AYNAN 4 ta variant (A, B, C, D) bo'lishi shart.
3. Faqat BIR variant to'g'ri bo'lishi kerak.
4. Savollar matnga asoslangan bo'lsin — matndan tashqaridagi ma'lumotlardan foydalanmang.
5. Savollar turli darajada bo'lsin — ba'zi oson, ba'zi o'rta, ba'zi qiyin.
6. Javobni faqat JSON formatida qaytaring, boshqa hech narsa yozmang.

JSON formati:
{
  "detectedLanguage": "uz" | "ru" | "en" | "other",
  "questions": [
    {
      "id": 1,
      "text": "Savol matni...",
      "options": [
        { "id": "a", "text": "Variant A" },
        { "id": "b", "text": "Variant B" },
        { "id": "c", "text": "Variant C" },
        { "id": "d", "text": "Variant D" }
      ],
      "correctOption": "b",
      "explanation": "Nima uchun bu to'g'ri"
    }
  ]
}`;

  const userPrompt = `Matn:
"""
${clippedText}
"""

${teacherPrompt ? `O'qituvchi ko'rsatmasi: ${teacherPrompt}\n` : ""}
Savol soni: ${questionCount}

${languageHint !== "auto" ? `Til: ${languageHint === "uz" ? "o'zbek" : languageHint === "ru" ? "rus" : "ingliz"}` : "Tilni matnning o'zidan aniqlang va shu tilda javob bering"}

Faqat JSON qaytaring.`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { json: true, max_tokens: 6000, temperature: 0.5 }
  );

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // Ba'zan AI JSON'ni ```json ```bilan o'raydi
    const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();
    parsed = JSON.parse(cleaned);
  }

  const questions = (parsed.questions || []).slice(0, questionCount).map((q, idx) => ({
    id: idx + 1,
    text: String(q.text || "").trim(),
    options: (q.options || []).slice(0, 4).map((o, i) => ({
      id: o.id || ["a", "b", "c", "d"][i],
      text: String(o.text || "").trim(),
    })),
    correctOption: String(q.correctOption || "a").toLowerCase(),
    explanation: String(q.explanation || "").trim(),
  }));

  // Validatsiya: har bir savol to'g'ri formatda
  const valid = questions.filter(
    (q) => q.text && q.options.length === 4 && ["a", "b", "c", "d"].includes(q.correctOption)
  );

  if (valid.length === 0) {
    throw new Error("AI to'g'ri formatda savol yarata olmadi");
  }

  return {
    detectedLanguage: parsed.detectedLanguage || languageHint,
    questions: valid,
  };
}

/**
 * Talaba javoblarini baholash
 * Har bir savol to'g'riligini key-match orqali aniqlaymiz,
 * umumiy fikrni AI'dan olamiz
 */
async function gradeAttempt({ questions, answers, language = "uz" }) {
  let correctCount = 0;
  const details = questions.map((q) => {
    const userAnswer = answers[q.id] || answers[String(q.id)];
    const isCorrect = userAnswer === q.correctOption;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      questionText: q.text,
      userAnswer: userAnswer || null,
      correctOption: q.correctOption,
      isCorrect,
    };
  });

  const score = Math.round((correctCount / questions.length) * 100);

  // AI feedback — faqat qisqa summary
  let feedback = "";
  try {
    const langName =
      language === "ru" ? "rus" : language === "en" ? "ingliz" : "o'zbek";
    const summary = details.slice(0, 10).map(
      (d) => `Savol: ${d.questionText.slice(0, 80)} | Javob: ${d.userAnswer || "yo'q"} | To'g'ri: ${d.correctOption} | ${d.isCorrect ? "✓" : "✗"}`
    ).join("\n");

    const systemMsg = `Siz o'qituvchisiz. Talabaning test natijalarini tahlil qilib, ${langName} tilida qisqa (3-4 jumla) maslahat bering. Quvontiring, kuchli va zaif tomonlarini ayting, qaysi mavzuni takrorlash kerakligini ayting. Faqat matn qaytaring, JSON emas.`;

    const userMsg = `Test natijasi: ${correctCount}/${questions.length} to'g'ri (${score}%).

Savol va javoblar:
${summary}

Qisqa maslahat bering (${langName} tilida):`;

    feedback = await callGroq(
      [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      { temperature: 0.6, max_tokens: 500 }
    );
  } catch (e) {
    feedback = ""; // AI feedback ishlamasa ham score berilsin
  }

  return {
    score,
    correctCount,
    totalCount: questions.length,
    details,
    feedback: feedback.trim(),
  };
}

module.exports = {
  generateQuestions,
  gradeAttempt,
  detectLanguageHint,
};
