import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UserPlus, Mail, Lock, User, Linkedin, ArrowLeft, GraduationCap, Building, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

const API_URL = 'http://localhost:5000/api/auth';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const [selectedRole, setSelectedRole] = useState(null); 
  
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    industry: '',
    email: '',
    password: '',
    linkedin_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
        setError("Email and Password are required");
        return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        role: selectedRole,
        email: formData.email,
        password: formData.password,
        phone: "0000000000", 
      };

      if (selectedRole === 'teacher') {
        dataToSend.full_name = formData.name;
        dataToSend.linkedin_url = formData.linkedin_url;
        dataToSend.specialization = "Pending";
        dataToSend.qualifications = "Pending";
        dataToSend.years_experince = 0;
      } else if (selectedRole === 'student') {
        dataToSend.name = formData.name;
      } else if (selectedRole === 'company') {
        dataToSend.company_name = formData.company_name;
        dataToSend.industry = formData.industry;
        dataToSend.website = "https://example.com";
        dataToSend.location = "Unknown";
        dataToSend.description = "New Company";
      }

      await axios.post(`${API_URL}/register`, dataToSend);
      
      if (selectedRole === 'teacher' || selectedRole === 'company') {
        alert("Registration Successful! Your account is pending admin approval.");
        navigate('/login');
      } else {
        try {
          await login(formData.email, formData.password);
          navigate('/dashboard'); 
        } catch (loginError) {
          setError("Registration successful but login failed. Please login manually.");
        }
      }

    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans text-slate-200">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Glowing Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl p-4">
        
        {/* Step 1: Role Selection */}
        {!selectedRole ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">Join the Future</h1>
            <p className="text-slate-400 mb-12 text-lg">Select your path to begin your journey</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Student Card */}
              <motion.div 
                onClick={() => handleRoleSelect('student')} 
                className="group relative bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 hover:border-blue-500 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden"
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="p-4 bg-blue-500/10 rounded-2xl mb-6 group-hover:bg-blue-500/20 transition-colors border border-blue-500/30 group-hover:border-blue-500">
                    <GraduationCap className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Student</h3>
                  <p className="text-sm text-slate-400">Access courses & get hired.</p>
                </div>
              </motion.div>

              {/* Teacher Card */}
              <motion.div 
                onClick={() => handleRoleSelect('teacher')} 
                className="group relative bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 hover:border-emerald-500 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden"
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl mb-6 group-hover:bg-emerald-500/20 transition-colors border border-emerald-500/30 group-hover:border-emerald-500">
                    <UserCheck className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Teacher</h3>
                  <p className="text-sm text-slate-400">Share knowledge & earn.</p>
                </div>
              </motion.div>

              {/* Company Card */}
              <motion.div 
                onClick={() => handleRoleSelect('company')} 
                className="group relative bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 hover:border-purple-500 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden"
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="p-4 bg-purple-500/10 rounded-2xl mb-6 group-hover:bg-purple-500/20 transition-colors border border-purple-500/30 group-hover:border-purple-500">
                    <Briefcase className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Company</h3>
                  <p className="text-sm text-slate-400">Post jobs & find talent.</p>
                </div>
              </motion.div>

            </div>
            
            <div className="mt-12 text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors border-b border-transparent hover:border-blue-400">
                Sign In
              </Link>
            </div>
          </motion.div>
        ) : (
          
          // Step 2: Registration Form
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              
              {/* Top Gradient Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

              {/* Back Button */}
              <button 
                onClick={() => setSelectedRole(null)} 
                className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>

              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-blue-500 w-12 h-12 mb-2" />
                  <span className="text-sm text-blue-400 font-medium">Creating Account...</span>
                </div>
              )}

              <div className="text-center mb-8 mt-4">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 mb-4 shadow-lg">
                  {selectedRole === 'student' ? <GraduationCap className="w-8 h-8 text-blue-400" /> : 
                   selectedRole === 'teacher' ? <UserCheck className="w-8 h-8 text-emerald-400" /> : 
                   <Briefcase className="w-8 h-8 text-purple-400" />}
                </div>
                <h1 className="text-2xl font-bold text-white">Register as <span className="capitalize text-blue-400">{selectedRole}</span></h1>
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

              {/* AutoComplete="off" added here */}
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
                
                {/* Dynamic Inputs */}
                {(selectedRole === 'student' || selectedRole === 'teacher') && (
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="e.g. John Doe" 
                                value={formData.name} 
                                onChange={handleChange} 
                                autoComplete="off"
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                                required 
                            />
                        </div>
                    </div>
                )}

                {selectedRole === 'company' && (
                    <>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Company Name</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    name="company_name" 
                                    placeholder="e.g. Tech Solutions Inc." 
                                    value={formData.company_name} 
                                    onChange={handleChange} 
                                    autoComplete="off"
                                    className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Industry</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    name="industry" 
                                    placeholder="e.g. Software, Finance" 
                                    value={formData.industry} 
                                    onChange={handleChange} 
                                    autoComplete="off"
                                    className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
                                    required 
                                />
                            </div>
                        </div>
                    </>
                )}

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
                            autoComplete="new-password"
                            className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                            required 
                        />
                    </div>
                </div>

                {selectedRole === 'teacher' && (
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">LinkedIn Profile</label>
                        <div className="relative">
                            <Linkedin className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input 
                                type="url" 
                                name="linkedin_url" 
                                placeholder="https://linkedin.com/in/..." 
                                value={formData.linkedin_url} 
                                onChange={handleChange} 
                                autoComplete="off"
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                                required 
                            />
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <UserPlus size={20} />}
                    Create Account
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};