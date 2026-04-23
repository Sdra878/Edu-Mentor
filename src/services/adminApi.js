// src/services/adminApi.js
import axios from 'axios';

// ملاحظة: تأكد أن هذا الرابط يطابق مكان وضعك للمسارات في الباك إند
// إذا وضعت مسارات الأدمن في ملف auth.js، فالرابط هو /api/auth
// إذا أنشأت ملف admin.js، فالرابط هو /api/admin
const API_URL = 'http://localhost:5000/api/auth'; 

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة التوكن تلقائياً من الـ LocalStorage
apiClient.interceptors.request.use((config) => {
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
  // التعديل 1: تغيير الرابط ليتطابق مع الباك إند
  getTeachers: async () => {
    // نفترض أنك أضفت المسار router.get('/teachers', ...) في الباك إند
    const res = await apiClient.get('/teachers');
    console.log("Teachers Response:", res.data); 
    return res.data;
  },

  getCompanies: async () => {
    // نفس الفكرة للشركات
    const res = await apiClient.get('/companies'); 
    return res.data;
  },

  // التعديل 2: تغيير دالة التحديث لتتوافق مع Dashboard
  updateTeacherStatus: async (id, status) => {
    // الـ Dashboard يرسل 'approved' أو 'rejected'
    // الباك إند يتوقع { status: 'approved' }
    const res = await apiClient.put(`/teachers/${id}`, { status });
    return res.data;
  },

  // دالة عامة للتحديث (اختياري)
  updateStatus: async (id, status) => {
     // يمكن استخدام هذه الدالة للمعلم والشركة
     return await apiClient.put(`/teachers/${id}`, { status });
  },

  // --- Content (Courses) ---
  // ملاحظة: هذه الأقسام تعتمد على وجود مسارات محتوى في الباك إند
  getContent: async () => {
    const res = await apiClient.get('/pending/content');
    return res.data;
  },
  updateContentStatus: async (id, status) => {
    const res = await apiClient.put(`/content/${id}`, { status });
    return res.data;
  },

  // --- Certifications (الجديدة) ---
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

  // --- Settings (الجديدة) ---
  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data; 
  },
  updateMaintenanceMode: async (isActive) => {
    return await apiClient.put('/settings/maintenance', { maintenanceMode: isActive });
  }
};