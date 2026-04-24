# EduTest AI — Admin Panel

Zamonaviy ta'lim platformasining admin paneli. **React + Vite + Tailwind CSS** bilan qurilgan.

## Imkoniyatlar

- **Dashboard** — statistikalar, area/bar grafiklar, faoliyat feed'i
- **O'qituvchilar** — to'liq CRUD, avtomatik login/parol generatsiyasi, guruh biriktirish
- **O'quvchilar** — monitoring, guruh bo'yicha filter, qidiruv
- **Guruhlar** — grid card view, CRUD amallari
- **Semestrlar** — barcha semestrlarni kuzatish (admin faqat nazorat qiladi)
- **Sozlamalar** — profil, parol almashtirish, bildirishnomalar
- Mobile responsive, Plus Jakarta Sans, indigo/slate dizayn tizimi

## Texnologiyalar

- **React 18** + **Vite 5** — tezkor dev server
- **Tailwind CSS 3** — utility-first styling, custom design tokens
- **React Router 6** — role-based routing (ADMIN / TEACHER / STUDENT)
- **Recharts** — grafiklar
- **Lucide React** — ikonlar
- **React Hot Toast** — notification'lar
- **Axios** — API qatlami (interceptor'lar bilan)

## Ishga tushirish

```bash
# 1. Paketlarni o'rnating
npm install

# 2. Dev serverni ishga tushiring
npm run dev

# 3. Brauzerda oching: http://localhost:5173
```

## Login (Demo rejimi)

Istalgan login/parolni kiriting. Login qiymatiga qarab rol tanlanadi:

| Login'da so'z  | Rol       |
|----------------|-----------|
| (oddiy)        | `ADMIN`   |
| `teacher`      | `TEACHER` (placeholder sahifa) |
| `student`      | `STUDENT` (placeholder sahifa) |

Masalan: `admin` / `123456` → admin panelga kiradi.

## Loyiha tuzilishi

```
src/
├── api/              # axios instance + endpoint stub'lar
├── components/
│   ├── ui/           # Button, Input, Modal, Badge, Avatar, ...
│   └── layout/       # Sidebar, Topbar, AdminLayout, PageHeader
├── context/          # AuthContext
├── pages/
│   ├── Login.jsx
│   ├── NotFound.jsx
│   └── admin/        # Dashboard, Teachers, Students, Groups, Semesters, Settings
├── routes/           # ProtectedRoute, AppRoutes
├── utils/            # helpers, mockData
├── App.jsx
├── main.jsx
└── index.css         # Tailwind + custom utility class'lar
```

## Backend integratsiyasi

Hozir mock data ishlatiladi (`src/utils/mockData.js`). Real backend'ga ulanish uchun:

1. `.env` faylida `VITE_API_URL` ni o'rnating:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
2. Sahifalardagi mock import'larni `adminApi` chaqiruvlariga almashtiring. Endpoint'lar `src/api/adminApi.js` da stub qilingan:
   - `authApi.login(data)`
   - `teachersApi.list() / create() / update() / remove() / resetPassword()`
   - `studentsApi.list() / remove()`
   - `groupsApi.list() / create() / update() / remove()`
   - `semestersApi.list() / remove()`
   - `dashboardApi.stats() / activity() / chart()`

## Build

```bash
npm run build    # ./dist ga production build
npm run preview  # build'ni lokal tekshirish
```

## Keyingi bosqichlar

- [ ] Teacher Panel (o'qituvchi dashboard, semestr yaratish, AI prompt input)
- [ ] Student Panel (fayl yuklash, test topshirish, LaTeX/KaTeX)
- [ ] Backend integratsiyasi (Prisma + Neon + Supabase Storage + Groq AI)
- [ ] Real autentifikatsiya (JWT, refresh token)

---

**Loyiha holati:** Admin panel MVP — production-ready frontend (mock data bilan).
