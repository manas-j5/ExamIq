import axios from 'axios';

let rawBase = import.meta.env.VITE_API_URL || '';
if (rawBase.endsWith('/')) {
  rawBase = rawBase.slice(0, -1);
}
const API_BASE_URL = rawBase ? (rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`) : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('exam_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRequest = error.config.url.includes('/auth/');
      if (!isAuthRequest) {
        localStorage.removeItem('exam_token');
        localStorage.removeItem('exam_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Student Services
export const studentService = {
  getDashboard: () => api.get('/student/dashboard'),
  getExams: () => api.get('/student/exams'),
  getExamInstructions: (examId) => api.get(`/student/exam/${examId}/instructions`),
  startExam: (examId) => api.post(`/student/exam/${examId}/start`),
  saveAnswer: (payload) => api.post('/student/exam/save-answer', payload),
  submitExam: (attemptId) => api.post(`/student/exam/${attemptId}/submit`),
  recordViolation: (payload) => api.post('/student/exam/violation', payload),
  getResults: () => api.get('/student/results'),
  getResultDetail: (resultId) => api.get(`/student/result/${resultId}`),
  getProfile: () => api.get('/student/profile'),
};

// Faculty Services
export const facultyService = {
  getDashboard: () => api.get('/faculty/dashboard'),
  getExams: () => api.get('/faculty/exams'),
  createExam: (data) => api.post('/faculty/exams', data),
  updateExam: (id, data) => api.put(`/faculty/exams/${id}`, data),
  deleteExam: (id) => api.delete(`/faculty/exams/${id}`),
  getQuestions: (subjectId) => api.get('/faculty/questions', { params: { subjectId } }),
  createQuestion: (data) => api.post('/faculty/questions', data),
  updateQuestion: (id, data) => api.put(`/faculty/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/faculty/questions/${id}`),
  getExamQuestions: (examId) => api.get(`/faculty/exams/${examId}/questions`),
  addExamQuestion: (examId, data) => api.post(`/faculty/exams/${examId}/questions`, data),
  removeExamQuestion: (examId, questionId) => api.delete(`/faculty/exams/${examId}/questions/${questionId}`),
  getExamMonitoring: (examId) => api.get(`/faculty/exams/${examId}/monitoring`),
  getExamResults: (examId) => api.get(`/faculty/exams/${examId}/results`),
};

// Admin Services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (role) => api.get('/admin/users', { params: { role } }),
  createUser: (data) => api.post('/admin/users', data),
  updateUserStatus: (id, active) => api.put(`/admin/users/${id}/status`, null, { params: { active } }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getCourses: () => api.get('/admin/courses'),
  createCourse: (data) => api.post('/admin/courses', data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getSubjects: (courseId) => api.get('/admin/subjects', { params: { courseId } }),
  createSubject: (data) => api.post('/admin/subjects', data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
  getSystemOverview: () => api.get('/admin/overview'),
};

export default api;
