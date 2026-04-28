// ============================================
//  Groq AI servisi
//  - Fayl matnidan savol yaratadi
//  - Fayl tili qanday bo'lsa, savollar ham shu tilda
//  - Matematika/fizika/kimyo savollarida LaTeX formulalarni ishlatadi
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
 * Matn tilini aniqlash
 */
function detectLanguageHint(text) {
  const sample = text.slice(0, 2000).toLowerCase();
  const uzbekMarkers = /\b(bo'l|so'z|o'qi|yoki|uchun|kerak|haqida|lekin|bo'yicha)\b/i;
  const russianMarkers = /[а-яё]/i;
  const kirillUzMarkers = /\b(оʻ|гʻ|ekan|uchun|bolalar)\b/i;

  if (russianMarkers.test(sample) && !kirillUzMarkers.test(sample)) {
    return "ru";
  }
  if (uzbekMarkers.test(sample)) {
    return "uz";
  }
  return "auto";
}

/**
 * Subject (fan) bo'yicha LaTeX kerakligini aniqlash
 */
function isSubjectMath(subject = "", teacherPrompt = "") {
  const text = (subject + " " + teacherPrompt).toLowerCase();
  const mathKeywords = [
    "matematika", "math", "математика",
    "fizika", "physics", "физика",
    "kimyo", "chemistry", "химия",
    "algebra", "geometriya", "geometry", "геометрия",
    "trigonometriya", "kalkulyus", "calculus",
    "statistika", "statistics", "статистика",
    "tenglama", "uravnenie", "equation",
    "formula", "формула",
    "diskriminant", "vektor", "vector", "вектор",
    "logarifm", "integral", "hosila", "derivative",
    "funksiya", "function", "функция",
    "matritsa", "matrix", "матрица",
    "ehtimol", "probability", "вероятность",
  ];
  return mathKeywords.some((kw) => text.includes(kw));
}

/**
 * Fayl matni va teacher prompt'idan AI savollar yaratadi
 * FAYL TILIDA + zarur bo'lsa LaTeX formula bilan
 */
async function generateQuestions({
  fileText,
  teacherPrompt = "",
  subject = "",
  questionCount = 10,
  languageHint = "auto",
}) {
  const MAX_CHARS = 14000;
  const clippedText =
    fileText.length > MAX_CHARS
      ? fileText.slice(0, MAX_CHARS) + "\n...(qisqartirildi)"
      : fileText;

  const useLatex = isSubjectMath(subject, teacherPrompt);

  const latexInstructions = useLatex
    ? `
🔢 MATEMATIKA / FIZIKA / KIMYO SAVOLLARI UCHUN MAJBURIY:
- Barcha formulalar, tenglamalar, kasrlar, ildizlar, daraja, indekslarni LaTeX formatda yozing
- Inline formulalar: $...$ ichida (masalan: $x^2 + 2x + 1 = 0$)
- Block formulalar: $$...$$ ichida (masalan: $$\\frac{a+b}{c}$$)
- Misollar:
  • Kvadrat tenglama: $ax^2 + bx + c = 0$
  • Kasr: $\\frac{1}{2}$, $\\frac{x+1}{x-1}$
  • Daraja: $x^2$, $a^{n+1}$, $2^{10}$
  • Ildiz: $\\sqrt{x}$, $\\sqrt[3]{8}$, $\\sqrt{x^2+1}$
  • Yig'indi: $\\sum_{i=1}^{n} i$
  • Integral: $\\int_0^1 x^2 \\, dx$
  • Logarifm: $\\log_{2}{8}$, $\\ln{x}$
  • Trigonometriya: $\\sin{x}$, $\\cos{2x}$, $\\tan{\\alpha}$
  • Yunon harflari: $\\alpha$, $\\beta$, $\\pi$, $\\theta$
  • Tengsizlik: $x \\geq 0$, $a \\neq b$, $x \\leq 5$
  • Ko'paytirish: $a \\cdot b$ yoki $a \\times b$
  • Cheksizlik: $\\infty$
- Variantlardagi javoblar ham LaTeX bo'lsin (masalan "$x = 3$")
- Oddiy raqamlar yoki so'zlar uchun LaTeX kerak emas (masalan: "5 ta bola")
`
    : "";

  const systemPrompt = `Siz tajribali o'qituvchisiz. Sizga darslik yoki mavzu matni beriladi, siz undan test savollarni yaratasiz.

MUHIM QOIDALAR:
1. TIL: Savollar VA variantlar AYNAN berilgan matn tilida bo'lishi shart. Agar matn o'zbek tilida bo'lsa — savollar o'zbekcha. Agar rus tilida bo'lsa — ruscha. Agar ingliz tilida bo'lsa — inglizcha. Tilni aralashtirmang.
2. Har bir savolda AYNAN 4 ta variant (A, B, C, D) bo'lishi shart.
3. Faqat BIR variant to'g'ri bo'lishi kerak.
4. Savollar matnga asoslangan bo'lsin — matndan tashqaridagi ma'lumotlardan foydalanmang.
5. Savollar turli darajada bo'lsin — ba'zi oson, ba'zi o'rta, ba'zi qiyin.
6. Javobni faqat JSON formatida qaytaring, boshqa hech narsa yozmang.
${latexInstructions}

JSON formati:
{
  "detectedLanguage": "uz" | "ru" | "en" | "other",
  "questions": [
    {
      "id": 1,
      "text": "Savol matni (LaTeX formulalar $...$ ichida)",
      "options": [
        { "id": "a", "text": "Variant A" },
        { "id": "b", "text": "Variant B" },
        { "id": "c", "text": "Variant C" },
        { "id": "d", "text": "Variant D" }
      ],
      "correctOption": "b",
      "explanation": "Nima uchun bu to'g'ri (LaTeX bilan)"
    }
  ]
}`;

  const userPrompt = `Matn:
"""
${clippedText}
"""

${teacherPrompt ? `O'qituvchi ko'rsatmasi: ${teacherPrompt}\n` : ""}
${subject ? `Fan: ${subject}\n` : ""}
Savol soni: ${questionCount}

${languageHint !== "auto" ? `Til: ${languageHint === "uz" ? "o'zbek" : languageHint === "ru" ? "rus" : "ingliz"}` : "Tilni matnning o'zidan aniqlang va shu tilda javob bering"}

${useLatex ? "DIQQAT: Bu MATEMATIKA/FIZIKA/KIMYO mavzusi — barcha formulalarni LaTeX (\\$...\\$) formatida yozing." : ""}

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

  const valid = questions.filter(
    (q) => q.text && q.options.length === 4 && ["a", "b", "c", "d"].includes(q.correctOption)
  );

  if (valid.length === 0) {
    throw new Error("AI to'g'ri formatda savol yarata olmadi");
  }

  return {
    detectedLanguage: parsed.detectedLanguage || languageHint,
    questions: valid,
    hasLatex: useLatex,
  };
}

/**
 * Talaba javoblarini baholash
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

  let feedback = "";
  try {
    const langName =
      language === "ru" ? "rus" : language === "en" ? "ingliz" : "o'zbek";
    const summary = details.slice(0, 10).map(
      (d) => `Savol: ${d.questionText.slice(0, 80)} | Javob: ${d.userAnswer || "yo'q"} | To'g'ri: ${d.correctOption} | ${d.isCorrect ? "✓" : "✗"}`
    ).join("\n");

    const systemMsg = `Siz o'qituvchisiz. Talabaning test natijalarini tahlil qilib, ${langName} tilida qisqa (3-4 jumla) maslahat bering. Quvontiring, kuchli va zaif tomonlarini ayting, qaysi mavzuni takrorlash kerakligini ayting. Faqat matn qaytaring, JSON emas. Agar matematika bo'lsa, formulalarni LaTeX ($...$) formatida yozing.`;

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
    feedback = "";
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
  isSubjectMath,
};
