import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // (اختياري) هنا يمكنك عمل طلب للسيرفر للتحقق من التوكن وجلب بيانات المستخدم الحالية
      // كمثال بسيط سنفترض وجود بيانات مخزنة أو سنقوم بطلب تحقق
      axios.get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
           .then(res => setUser(res.data))
           .catch(() => localStorage.removeItem('token'));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user: userData } = response.data;
      
      // حفظ التوكن
      localStorage.setItem('token', token);
      
      // تحديث حالة المستخدم (هذا هو الأهم لكي يعمل RoleBasedRedirect)
      setUser(userData); 
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    // قمت بإضافة setUser هنا، هذا هو التعديل الوحيد المطلوب في هذا الملف
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);