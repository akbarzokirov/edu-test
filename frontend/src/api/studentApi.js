import api from "./axios";

export const studentApi = {
  // Semestrlar ro'yxati
  listSemesters: () => api.get("/student/semesters"),
  getSemesterDetail: (id) => api.get(`/student/semesters/${id}`),

  /**
   * ⭐ Test boshlash — fayl yuklash + AI savol yaratish
   * @param {number|string} semesterId
   * @param {File} file — talaba tanlagan darslik fayli
   * @param {Function} onProgress — upload progress callback
   */
  startAttempt: (semesterId, file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/student/semesters/${semesterId}/start`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress,
      timeout: 180000, // AI savol yaratish 2-3 daqiqa olishi mumkin
    });
  },

  // Test ustida ishlash
  saveProgress: (attemptId, data) =>
    api.patch(`/student/attempts/${attemptId}/progress`, data),

  submitAttempt: (attemptId, data) =>
    api.post(`/student/attempts/${attemptId}/submit`, data, { timeout: 90000 }),

  getAttempt: (attemptId) => api.get(`/student/attempts/${attemptId}`),

  // Natijalar
  getMyResults: () => api.get("/student/results"),
  getMyGroup: () => api.get("/student/group"),
};
