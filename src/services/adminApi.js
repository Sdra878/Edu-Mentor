// src/services/adminApi.js
import axios from 'axios';

// ===== الكلاينت القديم (لا تغيره) =====
const API_URL = 'http://localhost:5000/api/auth'; 

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== كلاينت جديد للأدمن =====
const adminClient = axios.create({
  baseURL: 'http://localhost:5000/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // --- Users ---
  getAllUsers: async () => {
    const res = await apiClient.get('/users');
    return res.data;
  },
  deleteUser: async (id) => {
    return await apiClient.delete(`/user/${id}`);
  },
  createUser: async (data) => {
    return await apiClient.post('/users', data);
  },

  // --- Requests (Teachers & Companies) ---
  getTeachers: async () => {
    const res = await apiClient.get('/teachers');
    console.log("Teachers Response:", res.data); 
    return res.data;
  },

  getCompanies: async () => {
    const res = await apiClient.get('/companies'); 
    return res.data;
  },

  updateTeacherStatus: async (id, status) => {
    const res = await apiClient.put(`/teachers/${id}`, { status });
    return res.data;
  },

  updateStatus: async (id, status) => {
     return await apiClient.put(`/teachers/${id}`, { status });
  },

  // --- Content (Courses) ---
  getContent: async () => {
    const res = await apiClient.get('/pending/content');
    return res.data;
  },
  updateContentStatus: async (id, status) => {
    const res = await apiClient.put(`/content/${id}`, { status });
    return res.data;
  },

  // --- Certifications ---
  getCertifications: async () => {
    const res = await apiClient.get('/certifications');
    return res.data;
  },
  addCertification: async (data) => {
    return await apiClient.post('/certifications', data);
  },
  updateCertification: async (id, data) => {
    return await apiClient.put(`/certifications/${id}`, data);
  },
  deleteCertification: async (id) => {
    return await apiClient.delete(`/certifications/${id}`);
  },

  // --- Settings ---
  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data; 
  },
  updateMaintenanceMode: async (isActive) => {
    return await apiClient.put('/settings/maintenance', { maintenanceMode: isActive });
  },

  // ===== الإضافات الجديدة (تستخدم adminClient) =====
  
  // SMTP - Approve/Reject User
  approveUser: async (id) => {
    const res = await adminClient.put(`/approve-user/${id}`);
    return res.data;
  },
  rejectUser: async (id) => {
    const res = await adminClient.put(`/reject-user/${id}`);
    return res.data;
  },

  // Pending Courses
  getPendingCourses: async () => {
    const res = await adminClient.get('/pending-courses');
    return res.data;
  },
  approveCourse: async (id) => {
    const res = await adminClient.put(`/approve-course/${id}`);
    return res.data;
  },
  rejectCourse: async (id) => {
    const res = await adminClient.put(`/reject-course/${id}`);
    return res.data;
  },

  // Delete Requests
  getDeleteRequests: async () => {
    const res = await adminClient.get('/delete-requests');
    return res.data;
  },
  deleteCourseByAdmin: async (id) => {
    const res = await adminClient.delete(`/courses/${id}`);
    return res.data;
  },

  // Pending Internships
  getPendingInternships: async () => {
    const res = await adminClient.get('/pending-internships');
    return res.data;
  },

  // Server Control
  shutdownServer: async () => {
    const res = await adminClient.post('/shutdown');
    return res.data;
  },
  startServer: async () => {
    const res = await adminClient.post('/start');
    return res.data;
  },
};