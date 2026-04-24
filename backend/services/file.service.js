// ============================================
//  Fayldan matn olish servisi
//  PDF, DOCX, DOC, TXT formatlarini qo'llaydi
// ============================================

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Buffer va fayl nomi asosida matnni ajratib olish
 * @param {Buffer} buffer - fayl bayt ma'lumoti
 * @param {string} filename - asl fayl nomi (kengaytmani aniqlash uchun)
 * @returns {Promise<string>} matn
 */
async function extractText(buffer, filename) {
  const ext = (filename || "").toLowerCase().split(".").pop();

  try {
    if (ext === "pdf") {
      const result = await pdfParse(buffer);
      return clean(result.text);
    }

    if (ext === "docx" || ext === "doc") {
      const result = await mammoth.extractRawText({ buffer });
      return clean(result.value);
    }

    if (ext === "txt") {
      return clean(buffer.toString("utf8"));
    }

    // Noma'lum format — UTF-8 sifatida o'qib ko'ramiz
    return clean(buffer.toString("utf8"));
  } catch (err) {
    throw new Error(`Faylni o'qishda xatolik: ${err.message}`);
  }
}

/**
 * Matnni tozalash: ortiqcha bo'sh qatorlarni olib tashlash
 */
function clean(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

module.exports = { extractText };
