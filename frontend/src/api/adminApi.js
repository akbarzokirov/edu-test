import api from "./axios";

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  changePassword: (data) => api.post("/auth/change-password", data),
};

export const dashboardApi = {
  stats: () => api.get("/admin/stats"),
  activity: () => api.get("/admin/activity"),
  chart: () => api.get("/admin/chart"),
};

export const teachersApi = {
  list: (params) => api.get("/admin/teachers", { params }),
  create: (data) => api.post("/admin/teachers", data),
  update: (id, data) => api.patch(`/admin/teachers/${id}`, data),
  remove: (id) => api.delete(`/admin/teachers/${id}`),
  resetPassword: (id) => api.post(`/admin/teachers/${id}/reset-password`),
};

export const studentsApi = {
  list: (params) => api.get("/admin/students", { params }),
  remove: (id) => api.delete(`/admin/students/${id}`),
};

export const groupsApi = {
  list: () => api.get("/admin/groups"),
  create: (data) => api.post("/admin/groups", data),
  update: (id, data) => api.patch(`/admin/groups/${id}`, data),
  remove: (id) => api.delete(`/admin/groups/${id}`),
};

export const semestersApi = {
  list: (params) => api.get("/admin/semesters", { params }),
  remove: (id) => api.delete(`/admin/semesters/${id}`),
};
