// ============================================
//  Fayl yuklash middleware (multer)
//  Xotirada saqlaymiz — disk'ga yozmaymiz
// ============================================

const multer = require("multer");

const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = /\.(pdf|docx?|txt)$/i;
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_EXTENSIONS.test(file.originalname)) {
      return cb(new Error("Faqat PDF, DOCX, DOC yoki TXT fayllar qabul qilinadi"));
    }
    cb(null, true);
  },
});

module.exports = upload;
