import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { 
  Users, UserPlus, Building2, FileText, 
  Shield, Layers, Moon, Sun, Briefcase, Search, Trash2, CheckCircle, LogOut, Power, Bug
} from 'lucide-react';

export const AdminDashboard = () => {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [darkMode, setDarkMode] = useState(true);
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const [stats, setStats] = useState({});
  const [teachers, setTeachers] = useState([]); 
  const [companies, setCompanies] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [content, setContent] = useState([]);
  const [internships, setInternships] = useState([]);
  const [teacherProfiles, setTeacherProfiles] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [approvedInternships, setApprovedInternships] = useState([]);
  const [contentView, setContentView] = useState('pending');
  const [showDebug, setShowDebug] = useState(false);

  const [settings, setSettings] = useState({ maintenanceMode: false });
  const [refresh, setRefresh] = useState(0);
  const [shuttingDown, setShuttingDown] = useState(false);

  const resolveTeacherName = (teacherRef) => {
    if (!teacherRef) return 'Unknown';
    if (typeof teacherRef === 'object') {
      return teacherRef.name || teacherRef.full_name || teacherRef.firstName
        || teacherRef.username || (teacherRef.email ? teacherRef.email.split('@')[0] : 'Unknown');
    }
    const idStr = String(teacherRef);
    for (const u of allUsers) {
      if (String(u._id) === idStr) {
        if (u.name) return u.name;
        if (u.full_name) return u.full_name;
        if (u.firstName) return u.firstName + (u.lastName ? ' ' + u.lastName : '');
        if (u.username) return u.username;
        if (u.email) return u.email.split('@')[0];
      }
    }
    for (const t of teachers) {
      if (String(t._id) === idStr) {
        if (t.name) return t.name;
        if (t.full_name) return t.full_name;
        if (t.email) return t.email.split('@')[0];
      }
    }
    for (const tp of teacherProfiles) {
      if (String(tp._id) === idStr) {
        if (tp.name) return tp.name;
        if (tp.full_name) return tp.full_name;
        if (tp.firstName) return tp.firstName + (tp.lastName ? ' ' + tp.lastName : '');
        if (tp.email) return tp.email.split('@')[0];
      }
    }
    return 'Unknown';
  };

  const resolveCompanyName = (companyRef) => {
    if (!companyRef) return 'Unknown';
    if (typeof companyRef === 'object') {
      return companyRef.name || companyRef.company_name || companyRef.organization
        || (companyRef.email ? companyRef.email.split('@')[0] : 'Unknown');
    }
    const idStr = String(companyRef);
    for (const u of allUsers) {
      if (String(u._id) === idStr) {
        if (u.name) return u.name;
        if (u.company_name) return u.company_name;
        if (u.organization) return u.organization;
        if (u.email) return u.email.split('@')[0];
      }
    }
    for (const c of companies) {
      if (String(c._id) === idStr) {
        if (c.name) return c.name;
        if (c.company_name) return c.company_name;
        if (c.email) return c.email.split('@')[0];
      }
    }
    return 'Unknown';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleSystemShutdown = async () => {
    if (!window.confirm('Are you sure you want to shutdown the system? This will make the entire platform unavailable.')) return;
    setShuttingDown(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/admin/system/shutdown', {}, config);
      setSettings(prev => ({ ...prev, maintenanceMode: true }));
      alert('System has been shut down successfully.');
    } catch (err) {
      console.error('Shutdown error:', err);
      alert('Failed to shutdown the system.');
    } finally {
      setShuttingDown(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const tRes = await axios.get('http://localhost:5000/api/admin/pending/teacher', config);
        
        let uData = [];
        try { const uRes = await axios.get('http://localhost:5000/api/admin/users', config); uData = uRes.data; } catch (e) {}

        let cData = [];
        try { const cRes = await axios.get('http://localhost:5000/api/admin/pending/companies', config); cData = cRes.data; } catch (e) {}

        let cntData = [];
        try { const cntRes = await axios.get('http://localhost:5000/api/admin/pending/courses', config); cntData = cntRes.data; } catch (e) {}

        let iData = [];
        try { const iRes = await axios.get('http://localhost:5000/api/admin/pending/internships', config); iData = iRes.data; } catch (e) {}

        let tpData = [];
        try {
            const tpRes = await axios.get('http://localhost:5000/api/teacher', config);
            if (Array.isArray(tpRes.data)) tpData = tpRes.data;
            else if (tpRes.data && tpRes.data._id) tpData = [tpRes.data];
            else if (tpRes.data && Array.isArray(tpRes.data.teachers)) tpData = tpRes.data.teachers;
        } catch (e) {}

        let acData = [];
        try { const acRes = await axios.get('http://localhost:5000/api/admin/approved/courses', config); acData = acRes.data; } catch (e) {
            try {
                const fallbackRes = await axios.get('http://localhost:5000/api/courses', config);
                const allCourses = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
                const pendingIds = new Set(cntData.map(c => String(c._id)));
                acData = allCourses.filter(c => !pendingIds.has(String(c._id)));
            } catch (e2) {}
        }

        let aiData = [];
        try { const aiRes = await axios.get('http://localhost:5000/api/admin/approved/internships', config); aiData = aiRes.data; } catch (e) {
            try {
                const fallbackRes = await axios.get('http://localhost:5000/api/internships', config);
                const allInternships = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
                const pendingIds = new Set(iData.map(i => String(i._id)));
                aiData = allInternships.filter(i => !pendingIds.has(String(i._id)));
            } catch (e2) {}
        }

        setTeachers(tRes.data);
        setAllUsers(uData);
        setCompanies(cData);
        setContent(cntData);
        setInternships(iData);
        setTeacherProfiles(tpData);
        setApprovedCourses(acData);
        setApprovedInternships(aiData);
        setSettings({ maintenanceMode: false });

        setStats({
          totalStudents: uData.filter(u => u.user_type === 'student').length,
          totalTeachers: uData.filter(u => u.user_type === 'teacher').length,
          totalCompanies: uData.filter(u => u.user_type === 'company').length,
          pendingRequests: tRes.data.length + cData.length,
          pendingContent: cntData.length + iData.length
        });

      } catch (error) {
        console.error("Critical Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refresh]);

  const handleDeleteUser = async (id) => {
    if(!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("User deleted successfully!");
      setRefresh(prev => prev + 1);
    } catch (err) { alert("Failed to delete user."); }
  };

  const handleTeacherAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let url = action === 'approved' ? `http://localhost:5000/api/admin/approved/${id}` : `http://localhost:5000/api/admin/reject/${id}`;
      const response = await axios.put(url, {}, config);
      if(response.status === 200) { setRefresh(prev => prev + 1); alert(`Teacher ${action} successfully!`); }
    } catch (err) { alert("Failed to update teacher status."); }
  };

  const handleCompanyAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let url = action === 'approved' ? `http://localhost:5000/api/admin/approved/${id}` : `http://localhost:5000/api/admin/reject/${id}`;
      const response = await axios.put(url, {}, config);
      if(response.status === 200) { setRefresh(prev => prev + 1); alert(`Company ${action} successfully!`); }
    } catch (err) { alert("Failed to update company status."); }
  };

  const handleContentAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let url = action === 'approved' ? `http://localhost:5000/api/admin/approve/course/${id}` : `http://localhost:5000/api/admin/reject/course/${id}`;
      const response = await axios.put(url, {}, config);
      if(response.status === 200) { setRefresh(prev => prev + 1); alert(`Course ${action}d successfully!`); }
    } catch (err) { alert("Failed to update course status."); }
  };

  const handleInternshipAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      const response = await axios.put(`http://localhost:5000/api/internships/${id}`, { status: action === 'approved' ? 'approved' : 'rejected' }, config);
      if(response.status === 200) { setRefresh(prev => prev + 1); alert(`Internship ${action}d successfully!`); }
    } catch (err) { alert("Failed to update internship status."); }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-5 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === id ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-slate-800 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  const filteredUsers = allUsers.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`p-6 min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-slate-800'}`}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t.appName} <span className="text-primary-600">Admin</span></h1>
          <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">System Control Panel</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${settings.maintenanceMode ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            <div className="w-2 h-2 rounded-full bg-white"></div>
            {settings.maintenanceMode ? 'Maintenance Mode' : 'System Live'}
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-full transition-colors duration-200 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className={`p-3 rounded-full transition-colors duration-200 ${darkMode ? 'bg-slate-800 text-red-400 hover:bg-red-900/30' : 'bg-gray-200 text-red-500 hover:bg-red-50'}`} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className={`flex overflow-x-auto border-b gap-2 rounded-t-xl px-2 shadow-sm mb-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <TabButton id="overview" label="Overview" icon={Layers} />
        <TabButton id="users" label="Manage Users" icon={Users} />
        <TabButton id="requests" label="Requests" icon={UserPlus} />
        <TabButton id="content" label="Content Review" icon={FileText} />
        <TabButton id="settings" label="System" icon={Shield} />
      </div>

      {loading ? <div className="p-20 text-center text-gray-500 dark:text-slate-400">Loading Dashboard...</div> : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* ========== 1. OVERVIEW ========== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* ✅ 4 بالسطر الأول */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Total Students", val: stats.totalStudents || 0, color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700", icon: Users },
                    { title: "Total Teachers", val: stats.totalTeachers || 0, color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-slate-800 dark:text-emerald-400 dark:border-slate-700", icon: UserPlus },
                    { title: "Total Companies", val: stats.totalCompanies || 0, color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-slate-800 dark:text-amber-400 dark:border-slate-700", icon: Building2 },
                    { title: "Pending Requests", val: stats.pendingRequests || 0, color: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-slate-800 dark:text-rose-400 dark:border-slate-700", icon: Shield }
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ y: -5 }} 
                      className={`p-6 rounded-xl shadow-sm border ${item.color} flex items-center justify-between relative overflow-hidden group cursor-default`}
                    >
                      <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">{item.title}</p>
                        <h3 className="text-3xl font-bold mt-2">{item.val}</h3>
                      </div>
                      <div className="p-3 bg-white/30 dark:bg-slate-700/30 rounded-lg relative z-10 group-hover:rotate-12 transition-transform duration-300">
                        <item.icon size={28} />
                      </div>
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    </motion.div>
                  ))}
                </div>

                {/* ✅ الخامسة بنفس الحجم تماماً — نفس grid class بس بكارت واحد */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ y: -5 }} 
                    className={`p-6 rounded-xl shadow-sm border bg-purple-50 text-purple-700 border-purple-100 dark:bg-slate-800 dark:text-purple-400 dark:border-slate-700 flex items-center justify-between relative overflow-hidden group cursor-default`}
                  >
                    <div className="relative z-10">
                      <p className="text-sm opacity-90 font-medium">Pending Content</p>
                      <h3 className="text-3xl font-bold mt-2">{stats.pendingContent || 0}</h3>
                    </div>
                    <div className="p-3 bg-white/30 dark:bg-slate-700/30 rounded-lg relative z-10 group-hover:rotate-12 transition-transform duration-300">
                      <FileText size={28} />
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* ========== 2. REQUESTS ========== */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}><UserPlus size={18}/> Pending Teachers</h3>
                  <div className="grid gap-4">
                    {teachers.length === 0 ? <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No pending requests</p> : teachers.map(t => (
                      <div key={t._id} className={`p-4 rounded-lg border flex justify-between items-center shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        <div>
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t.name ? t.name : t.email}</p>
                          {t.name ? <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.email}</p> : <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Teacher Registration</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleTeacherAction(t._id, 'rejected')} variant="danger" className="text-xs">Reject</Button>
                          <Button onClick={() => handleTeacherAction(t._id, 'approved')} className="text-xs">Approve</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}><Building2 size={18}/> Pending Companies</h3>
                  <div className="grid gap-4">
                    {companies.length === 0 ? <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No pending requests</p> : companies.map(c => (
                      <div key={c._id} className={`p-4 rounded-lg border flex justify-between items-center shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        <div>
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{c.name ? c.name : c.email}</p>
                          {c.name ? <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{c.email}</p> : <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Company Registration</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleCompanyAction(c._id, 'rejected')} variant="danger" className="text-xs">Reject</Button>
                          <Button onClick={() => handleCompanyAction(c._id, 'approved')} className="text-xs">Approve</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========== 3. USERS ========== */}
            {activeTab === 'users' && (
               <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold">All Users</h3>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search by email or name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className={`pl-10 pr-4 py-2 rounded-lg text-sm w-full md:w-64 outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-primary-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-primary-500'}`}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-700 text-gray-500">
                            <tr><th className="p-4">Email</th><th className="p-4">Type</th><th className="p-4">Status</th><th className="p-4 text-center">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                    <td className="p-4">{u.email}</td>
                                    <td className="p-4 capitalize">{u.user_type}</td>
                                    <td className="p-4 capitalize">{u.status}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleDeleteUser(u._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete User"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="4" className="p-4 text-center text-gray-500">No users found.</td></tr>}
                        </tbody>
                    </table>
                </div>
               </div>
            )}

            {/* ========== 4. CONTENT REVIEW ========== */}
            {activeTab === 'content' && (
               <div className="space-y-8">
                 <div className="flex justify-between items-center">
                   <div className="flex justify-center">
                     <div className={`p-1 rounded-lg inline-flex ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                        <button onClick={() => setContentView('pending')} className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${contentView === 'pending' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}>Pending Requests</button>
                        <button onClick={() => setContentView('approved')} className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${contentView === 'approved' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}><CheckCircle size={16} /> Approved Content</button>
                     </div>
                   </div>
                   <button onClick={() => setShowDebug(!showDebug)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${darkMode ? 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500' : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-400'} transition-colors`}>
                     <Bug size={14} /> Debug Data
                   </button>
                 </div>

                 {showDebug && (
                   <div className={`rounded-xl border p-4 text-xs font-mono overflow-auto max-h-80 ${darkMode ? 'bg-slate-950 border-slate-700 text-green-400' : 'bg-gray-900 text-green-400 border-gray-700'}`}>
                     <p className="text-yellow-400 mb-2 font-bold">=== FIRST PENDING COURSE RAW DATA ===</p>
                     <pre>{content.length > 0 ? JSON.stringify(content[0], null, 2) : 'No pending courses'}</pre>
                     <p className="text-yellow-400 mb-2 mt-4 font-bold">=== FIRST PENDING INTERNSHIP RAW DATA ===</p>
                     <pre>{internships.length > 0 ? JSON.stringify(internships[0], null, 2) : 'No pending internships'}</pre>
                     <p className="text-yellow-400 mb-2 mt-4 font-bold">=== FIRST APPROVED COURSE RAW DATA ===</p>
                     <pre>{approvedCourses.length > 0 ? JSON.stringify(approvedCourses[0], null, 2) : 'No approved courses'}</pre>
                     <p className="text-yellow-400 mb-2 mt-4 font-bold">=== FIRST APPROVED INTERNSHIP RAW DATA ===</p>
                     <pre>{approvedInternships.length > 0 ? JSON.stringify(approvedInternships[0], null, 2) : 'No approved internships'}</pre>
                     <p className="text-cyan-400 mb-2 mt-4 font-bold">=== ALL USERS COUNT: {allUsers.length} ===</p>
                     <p className="text-cyan-400 mb-2">=== TEACHER PROFILES COUNT: {teacherProfiles.length} ===</p>
                     {teacherProfiles.length > 0 && <pre>{JSON.stringify(teacherProfiles[0], null, 2)}</pre>}
                   </div>
                 )}

                 <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-4 border-b">
                        <h3 className="font-bold">{contentView === 'pending' ? 'Pending Courses' : 'Approved Courses'}</h3>
                    </div>
                    <div className="p-4">
                        {contentView === 'pending' ? (
                            content.length === 0 ? <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No pending courses.</p> : 
                            content.map(c => (
                                <div key={c._id} className={`p-4 mb-2 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                                    <div>
                                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{c.title || 'Untitled Course'}</span>
                                        <span className={`text-xs block mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                          by {resolveTeacherName(c.teacher || c.teacher_id || c.createdBy || c.instructor)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="text-xs bg-red-500 hover:bg-red-600 text-white" onClick={() => handleContentAction(c._id, 'rejected')}>Reject</Button>
                                        <Button className="text-xs bg-green-500 hover:bg-green-600 text-white" onClick={() => handleContentAction(c._id, 'approved')}>Approve</Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            approvedCourses.length === 0 ? <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No approved courses found.</p> :
                            approvedCourses.map(c => (
                                <div key={c._id} className={`p-4 mb-2 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 opacity-80 hover:opacity-100 transition-opacity ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                          <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>{c.title || 'Untitled Course'}</span>
                                          <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-600'}`}>Approved</span>
                                        </div>
                                        <span className={`text-xs mt-0.5 block ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                          by {resolveTeacherName(c.teacher || c.teacher_id || c.createdBy || c.instructor)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                 </div>

                 <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-4 border-b">
                        <h3 className="font-bold flex items-center gap-2"><Briefcase size={18} className="text-blue-500"/> 
                            {contentView === 'pending' ? 'Pending Internships' : 'Approved Internships'}
                        </h3>
                    </div>
                    <div className="p-4">
                        {contentView === 'pending' ? (
                            internships.length === 0 ? <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No pending internships.</p> : 
                            internships.map(i => (
                                <div key={i._id} className={`p-4 mb-2 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{i.title || 'Untitled Internship'}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>{i.type || 'On-site'}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                            <span>by {resolveCompanyName(i.company || i.company_id || i.postedBy || i.employer)}</span>
                                            <span>📍 {i.location || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="text-xs bg-red-500 hover:bg-red-600 text-white" onClick={() => handleInternshipAction(i._id, 'rejected')}>Reject</Button>
                                        <Button className="text-xs bg-green-500 hover:bg-green-600 text-white" onClick={() => handleInternshipAction(i._id, 'approved')}>Approve</Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            approvedInternships.length === 0 ? <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No approved internships found.</p> :
                            approvedInternships.map(i => (
                                <div key={i._id} className={`p-4 mb-2 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 opacity-80 hover:opacity-100 transition-opacity ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>{i.title || 'Untitled Internship'}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-600'}`}>Approved</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                            <span>by {resolveCompanyName(i.company || i.company_id || i.postedBy || i.employer)}</span>
                                            <span>📍 {i.location || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                 </div>
               </div>
            )}

            {/* ========== 5. SETTINGS / SYSTEM ========== */}
            {activeTab === 'settings' && (
               <div className={`p-8 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                   <Shield size={22} className="text-primary-600" /> System Controls
                 </h3>
                 <div className={`p-6 rounded-xl border-2 border-dashed ${settings.maintenanceMode ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900'}`}>
                   <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-lg ${settings.maintenanceMode ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}><Power size={24} /></div>
                       <div>
                         <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>System {settings.maintenanceMode ? 'is Down' : 'Shutdown'}</h4>
                         <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{settings.maintenanceMode ? 'The platform is currently unavailable for users.' : 'Shut down the entire platform. All users will be logged out.'}</p>
                       </div>
                     </div>
                     <div className="flex gap-3">
                       {settings.maintenanceMode && (
                         <button onClick={async () => {
                             try {
                               const token = localStorage.getItem('token');
                               await axios.post('http://localhost:5000/api/admin/start', {}, { headers: { Authorization: `Bearer ${token}` } });
                               setSettings(prev => ({ ...prev, maintenanceMode: false }));
                               alert('System is back online!');
                             } catch (err) { alert('Failed to start system.'); }
                           }} className="px-6 py-3 rounded-lg font-bold text-sm bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">Start System</button>
                       )}
                       <button onClick={handleSystemShutdown} disabled={shuttingDown || settings.maintenanceMode}
                         className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${settings.maintenanceMode ? 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                         <Power size={16} />{shuttingDown ? 'Shutting Down...' : settings.maintenanceMode ? 'System is Down' : 'Shutdown System'}
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};