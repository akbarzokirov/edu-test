import api from "./axios";

export const teacherApi = {
  // Dashboard
  stats: () => api.get("/teacher/stats"),

  // Guruhlar
  groups: () => api.get("/teacher/groups"),

  // Talabalar (CRUD)
  students: (params) => api.get("/teacher/students", { params }),
  createStudent: (data) => api.post("/teacher/students", data),
  updateStudent: (id, data) => api.patch(`/teacher/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/teacher/students/${id}`),

  // Semestrlar
  listSemesters: () => api.get("/teacher/semesters"),
  createSemester: (data) => api.post("/teacher/semesters", data),
  updateSemester: (id, data) => api.patch(`/teacher/semesters/${id}`, data),
  deleteSemester: (id) => api.delete(`/teacher/semesters/${id}`),

  // Natijalar
  listResults: (params) => api.get("/teacher/results", { params }),
  getResultDetail: (id) => api.get(`/teacher/results/${id}`),

  // ⭐ O'quvchi yuklagan faylni download qilish
  // Response — blob bo'lishi uchun responseType: "blob"
  downloadAttemptFile: (id) =>
    api.get(`/teacher/results/${id}/download`, { responseType: "blob" }),
};
