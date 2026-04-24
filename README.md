# EduTest AI — Neon + Groq AI bilan

AI bilan ishlaydigan test platformasi. Talaba fayl yuklaydi → Groq AI shu fayldan **fayl tilida** savol yaratadi → avtomatik baholaydi.

## ✨ Nima o'zgardi

Avvalgi versiyadan farqli:
- ❌ Mahalliy PostgreSQL kerak emas
- ✅ **Neon** (cloud PostgreSQL) ishlatiladi
- ✅ Talaba test boshlashda **fayl yuklaydi**
- ✅ AI fayl tilini aniqlaydi va **shu tilda** savol yaratadi (o'zbek/rus/ingliz)
- ✅ AI avtomatik baholaydi va maslahat beradi

## 🚀 Ishga tushirish

### 1) Tashqi xizmatlarga ro'yxatdan o'ting

**A) Neon** (ma'lumotlar bazasi) — bepul
1. https://console.neon.tech
2. "New Project" → nom: `edutest` → Create
3. **Connection string**'ni nusxa oling — `postgresql://...@....neon.tech/...?sslmode=require`

**B) Groq** (AI) — bepul
1. https://console.groq.com
2. "API Keys" → "Create API Key"
3. Key'ni nusxa oling (`gsk_...`)

### 2) Backend

```cmd
cd backend
npm install
copy .env.example .env
```

`.env` faylni tahrirlang:

```env
DATABASE_URL="postgresql://...@....neon.tech/...?sslmode=require"
GROQ_API_KEY="gsk_..."
JWT_SECRET="random-long-string-here"
PORT=5000
```

Ishga tushiring:

```cmd
npm run seed    # admin yaratiladi: admin@gmail.com / admin123
npm run dev
```

Backend `http://localhost:5000` da ishlaydi.

### 3) Frontend

**Yangi terminal**:

```cmd
cd frontend
npm install
npm run dev
```

`http://localhost:5173` da ochiladi.

## 🔐 Demo hisob

| Rol | Email | Parol |
|-----|-------|-------|
| Admin | `admin@gmail.com` | `admin123` |

Keyin admin panelidan teacher va student qo'shing.

## 🤖 AI Flow

1. **Admin** teacher va studentlarni qo'shadi, guruhlar yaratadi
2. **Teacher** semestr yaratadi (nom, savol soni, vaqt, deadline, AI prompt)
3. **Student** testga kiradi:
   - Darslik faylini yuklaydi (PDF/DOCX/TXT, maks 20MB)
   - Server fayldan matn ajratadi
   - **Groq AI fayl tilini aniqlaydi** (o'zbek/rus/ingliz)
   - **Shu tilda** 4 variantli savollar yaratadi
4. Student javob beradi — avtomatik saqlanadi
5. **AI baholaydi + maslahat beradi** (fayl tilida)

## 🛠️ Muammolar

**"GROQ_API_KEY topilmadi"** → `.env` faylda Groq key to'g'ri yozilganini tekshiring va backend'ni qayta ishga tushiring

**"connect ECONNREFUSED"** → Neon connection string `?sslmode=require` bilan tugaydimi tekshiring

**"pdf-parse" xatosi** → `npm install` qayta ishga tushiring

**CORS** → Backend va frontend bir paytda ishlayotganini tekshiring
