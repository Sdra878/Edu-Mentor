import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      // استدعاء دالة تسجيل الدخول
      const response = await login(formData.email, formData.password);

      // === التعديل المهم لحل مشكلة User Data: null ===
      // 1. تأكد من أن التوكن موجود في الرد
      if (response.data && response.data.token) {
        // 2. حفظ التوكن
        localStorage.setItem('token', response.data.token);

        // 3. حفظ بيانات المستخدم في LocalStorage
        // نحاول إيجاد بيانات المستخدم في response.data
        // (قد تكون تحت user, student, teacher, أو admin)
        const userData = response.data.user || response.data.student || response.data.teacher || response.data.admin;

        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            console.log("User Saved:", userData); // للتأكد من الحفظ
        } else {
            console.warn("No User Data in response:", response.data);
        }
      }

      // التحويل للصفحة الرئيسية
      navigate('/dashboard'); 
      
    } catch (err) {
      console.error("Login failed", err);
      // إذا كان الخطأ من نوع Axios وله رسالة
      const errorMsg = err.response?.data?.message || err.message || "Invalid email or password";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans text-slate-200">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-4">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
          >
          
          {/* Top Gradient Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-500 w-12 h-12 mb-2" />
              <span className="text-sm text-blue-400 font-medium">Signing In...</span>
            </div>
          )}

          <div className="text-center mb-8 mt-4">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-slate-400 text-sm mt-2">Enter your credentials to access your account</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl text-sm flex items-center gap-2"
            >
              <span className="text-red-500">⚠</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder=""
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <LogIn size={20} />}
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors border-b border-transparent hover:border-blue-400">
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};