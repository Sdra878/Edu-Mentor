import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { 
  Users, UserPlus, Building2, FileText, 
  Shield, Layers, Save, X, AlertOctagon, Moon, Sun, Briefcase, Search, Trash2, CheckCircle
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

  // Data States
  const [stats, setStats] = useState({});
  const [teachers, setTeachers] = useState([]); 
  const [companies, setCompanies] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [content, setContent] = useState([]); // الكورسات المعلقة
  const [internships, setInternships] = useState([]); // الوظائف المعلقة
  
  // States للبحث والمحتوى المقبول
  const [searchQuery, setSearchQuery] = useState('');
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [approvedInternships, setApprovedInternships] = useState([]);
  const [contentView, setContentView] = useState('pending');

  const [certifications, setCertifications] = useState([]); 
  const [settings, setSettings] = useState({ maintenanceMode: false });
  const [refresh, setRefresh] = useState(0);

  // === دالة جلب البيانات ===
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        // 1. جلب المعلمين المعلقين
        const tRes = await axios.get('http://localhost:5000/api/admin/pending/teacher', config);
        
        // 2. جلب المستخدمين
        let uData = [];
        try {
            const uRes = await axios.get('http://localhost:5000/api/admin/users', config);
            uData = uRes.data;
        } catch (e) { console.log("Users API missing or failed"); }

        // 3. جلب الشركات المعلقة
        let cData = [];
        try {
            const cRes = await axios.get('http://localhost:5000/api/admin/pending/companies', config);
            cData = cRes.data;
        } catch (e) { console.log("Companies API missing or failed"); }

        // 4. جلب الكورسات المعلقة
        let cntData = [];
        try {
            const cntRes = await axios.get('http://localhost:5000/api/admin/pending/courses', config);
            cntData = cntRes.data;
        } catch (e) { console.log("Courses API missing or failed"); }

        // 5. جلب الوظائف المعلقة
        let iData = [];
        try {
            const iRes = await axios.get('http://localhost:5000/api/admin/pending/internships', config);
            iData = iRes.data;
        } catch (e) { console.log("Internships API missing or failed"); }

        // --- جلب الكورسات المقبولة (Approved Courses) ---
        let acData = [];
        try {
            const acRes = await axios.get('http://localhost:5000/api/admin/approved/courses', config);
            acData = acRes.data;
        } catch (e) { console.log("Approved Courses API missing"); }

        // --- جلب الوظائف المقبولة (Approved Internships) ---
        let aiData = [];
        try {
            const aiRes = await axios.get('http://localhost:5000/api/admin/approved/internships', config);
            aiData = aiRes.data;
        } catch (e) { console.log("Approved Internships API missing"); }

        // تعيين البيانات
        setTeachers(tRes.data);
        setAllUsers(uData);
        setCompanies(cData);
        setContent(cntData);
        setInternships(iData);
        setApprovedCourses(acData);
        setApprovedInternships(aiData);
        
        setCertifications([]);
        setSettings({ maintenanceMode: false });

        // حساب الإحصائيات
        setStats({
          totalStudents: uData.filter(u => u.user_type === 'student').length,
          activeTeachers: uData.filter(u => u.user_type === 'teacher' && u.is_active).length,
          pendingRequests: tRes.data.length + cData.length,
          pendingContent: cntData.length + iData.length, 
          pendingInternships: iData.length
        });

      } catch (error) {
        console.error("Critical Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refresh]);

  // === دالة حذف المستخدم ===
  const handleDeleteUser = async (id) => {
    if(!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User deleted successfully!");
      setRefresh(prev => prev + 1); // تحديث القائمة
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  // === دوال الموافقة/الرفض ===
  const handleTeacherAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let url = action === 'approved' ? `http://localhost:5000/api/admin/approved/${id}` : `http://localhost-5000/api/admin/reject/${id}`;
      const response = await axios.put(url, {}, config);
      if(response.status === 200) { setRefresh(prev => prev + 1); alert(`Teacher ${action}d successfully!`); }
    } catch (err) { console.error(err); alert("Failed to update teacher status."); }
  };

  const handleCompanyAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const url = action === 'approved' ? `http://localhost:5000/api/admin/approved/${id}` : `http://localhost-5000/api/admin/reject/${id}`;
      const response = await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      if(response.status === 200) { setRefresh(prev => prev + 1); alert(`Company ${action} successfully!`); }
    } catch (err) { console.error(err); alert("Failed to update company status."); }
  };

  const handleContentAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let url = action === 'approved' ? `http://localhost:5000/api/admin/approve/course/${id}` : `http://localhost:5000/api/admin/reject/course/${id}`;
      const response = await axios.put(url, {}, config);
      if(response.status === 200) { setRefresh(prev => prev + 1); alert(`Course ${action}d successfully!`); }
    } catch (err) { console.error("Error in handleContentAction:", err); alert("Failed to update course status."); }
  };

  const handleInternshipAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      const response = await axios.put(`http://localhost:5000/api/internships/${id}`, { status: action === 'approved' ? 'approved' : 'rejected' }, config);
      if(response.status === 200) { setRefresh(prev => prev + 1); alert(`Internship ${action}d successfully!`); }
    } catch (err) { console.error("Error in handleInternshipAction:", err); alert("Failed to update internship status."); }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-5 py-3 font-medium transition-all border-b-2 ${activeTab === id ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-slate-800 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  // فلترة المستخدمين للبحث
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
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${settings.maintenanceMode ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            <div className={`w-2 h-2 rounded-full ${settings.maintenanceMode ? 'bg-white' : 'bg-white'}`}></div>
            {settings.maintenanceMode ? 'Maintenance Mode' : 'System Live'}
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-full transition-colors duration-200 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className={`flex overflow-x-auto border-b gap-2 rounded-t-xl px-2 shadow-sm mb-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <TabButton id="overview" label="Overview" icon={Layers} />
        <TabButton id="users" label="Manage Users" icon={Users} />
        <TabButton id="requests" label="Requests" icon={UserPlus} />
        <TabButton id="content" label="Content Review" icon={FileText} />
        <TabButton id="certifications" label="Certifications" icon={Layers} />
        <TabButton id="settings" label="System" icon={Shield} />
      </div>

      {loading ? <div className="p-20 text-center text-gray-500 dark:text-slate-400">Loading Dashboard...</div> : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* --- 1. OVERVIEW --- */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Total Students", val: stats.totalStudents || 0, color: "bg-blue-300 text-white border-blue-600 shadow-md dark:bg-slate-800 dark:border-slate-700", icon: Users },
                    { title: "Active Teachers", val: stats.activeTeachers || 0, color: "bg-emerald-300 text-white border-emerald-600 shadow-md dark:bg-slate-800 dark:border-slate-700", icon: UserPlus },
                    { title: "Pending Requests", val: stats.pendingRequests || 0, color: "bg-amber-300 text-white border-amber-500 shadow-md dark:bg-slate-800 dark:border-slate-700", icon: Shield },
                    { title: "Pending Content", val: stats.pendingContent || 0, color: "bg-purple-300 text-white border-purple-600 shadow-md dark:bg-slate-800 dark:border-slate-700", icon: FileText }
                  ].map((item, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className={`p-6 rounded-xl border flex items-center justify-between relative overflow-hidden group ${item.color}`}>
                      <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">{item.title}</p>
                        <h3 className="text-3xl font-bold mt-2">{item.val}</h3>
                      </div>
                      <div className="p-3 bg-white/20 dark:bg-black/20 rounded-lg relative z-10 group-hover:scale-110 transition-transform"><item.icon size={28} /></div>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className={`p-5 rounded-xl border flex items-start gap-4 ${darkMode ? 'bg-orange-900/20 border-orange-900/50' : 'bg-orange-50 border-orange-100'}`}>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-100 text-orange-600'}`}><AlertOctagon size={24} /></div>
                      <div>
                        <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Pending Approvals</h4>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>You have {stats.pendingRequests} requests waiting.</p>
                        <button onClick={() => setActiveTab('requests')} className={`mt-3 text-sm font-bold hover:underline ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Review Now &rarr;</button>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* --- 2. REQUESTS (Logic Fixed: No Duplicate Emails) --- */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                {/* Pending Teachers */}
                <div>
                  <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}><UserPlus size={18}/> Pending Teachers</h3>
                  <div className="grid gap-4">
                    {teachers.length === 0 ? <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No pending requests</p> : teachers.map(t => (
                      <div key={t._id} className={`p-4 rounded-lg border flex justify-between items-center shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        <div>
                          {/* التعديل: عرض الاسم أو الايميل */}
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t.name ? t.name : t.email}</p>
                          
                          {/* التعديل: عرض الايميل في السطر الثاني فقط إذا كان الاسم موجوداً لتجنب التكرار */}
                          {t.name ? (
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.email}</p>
                          ) : (
                            <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Teacher Registration</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleTeacherAction(t._id, 'rejected')} variant="danger" className="text-xs">Reject</Button>
                          <Button onClick={() => handleTeacherAction(t._id, 'approved')} className="text-xs">Approve</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pending Companies */}
                <div>
                  <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}><Building2 size={18}/> Pending Companies</h3>
                  <div className="grid gap-4">
                    {companies.length === 0 ? <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No pending requests</p> : companies.map(c => (
                      <div key={c._id} className={`p-4 rounded-lg border flex justify-between items-center shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        <div>
                          {/* التعديل: عرض اسم الشركة أو الايميل */}
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{c.name ? c.name : c.email}</p>
                          
                          {/* التعديل: نفس منطق المعلمين، لا تكرر الايميل */}
                          {c.name ? (
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{c.email}</p>
                          ) : (
                            <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Company Registration</p>
                          )}
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

            {/* --- 3. USERS (Search & Delete) --- */}
            {activeTab === 'users' && (
               <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold">All Users</h3>
                    {/* Search Input */}
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by email or name..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`pl-10 pr-4 py-2 rounded-lg text-sm w-full md:w-64 outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-primary-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-primary-500'}`}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-700 text-gray-500">
                            <tr>
                                <th className="p-4">Email</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                    <td className="p-4">{u.email}</td>
                                    <td className="p-4 capitalize">{u.user_type}</td>
                                    <td className="p-4 capitalize">{u.status}</td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleDeleteUser(u._id)}
                                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
               </div>
            )}

            {/* --- CONTENT TAB (Pending & Approved) --- */}
            {activeTab === 'content' && (
               <div className="space-y-8">
                 {/* Toggle Buttons */}
                 <div className="flex justify-center mb-6">
                     <div className={`p-1 rounded-lg inline-flex ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                        <button 
                            onClick={() => setContentView('pending')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${contentView === 'pending' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                        >
                            Pending Requests
                        </button>
                        <button 
                            onClick={() => setContentView('approved')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${contentView === 'approved' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                        >
                            <CheckCircle size={16} /> Approved Content
                        </button>
                     </div>
                 </div>

                 {/* قسم الكورسات */}
                 <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                            {contentView === 'pending' ? 'Pending Courses' : 'Approved Courses'}
                        </h3>
                    </div>
                    <div className="p-4">
                        {contentView === 'pending' ? (
                            content.length === 0 ? <p>No pending courses.</p> : 
                            content.map(c => (
                                <div key={c._id} className="p-4 mb-2 border rounded flex justify-between items-center">
                                    <div>
                                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{c.title || 'Untitled Course'}</span>
                                        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}> by {c.teacher?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="text-xs bg-red-500 hover:bg-red-600 text-white" onClick={() => handleContentAction(c._id, 'rejected')}>Reject</Button>
                                        <Button className="text-xs bg-green-500 hover:bg-green-600 text-white" onClick={() => handleContentAction(c._id, 'approved')}>Approve</Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            approvedCourses.length === 0 ? <p>No approved courses found.</p> :
                            approvedCourses.map(c => (
                                <div key={c._id} className="p-4 mb-2 border rounded flex justify-between items-center opacity-80 hover:opacity-100">
                                    <div>
                                        <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>{c.title || 'Untitled Course'}</span>
                                        <span className={`text-xs ml-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Approved</span>
                                        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}> by {c.teacher?.name || 'Unknown'}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                 </div>

                 {/* قسم الوظائف */}
                 <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2"><Briefcase size={18} className="text-blue-500"/> 
                            {contentView === 'pending' ? 'Pending Internships' : 'Approved Internships'}
                        </h3>
                    </div>
                    <div className="p-4">
                        {contentView === 'pending' ? (
                            internships.length === 0 ? <p>No pending internships.</p> : 
                            internships.map(i => (
                                <div key={i._id} className="p-4 mb-2 border rounded flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{i.title || 'Untitled Internship'}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300`}>{i.type || 'On-site'}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span>by {i.company?.name || i.company?.email || 'Unknown Company'}</span>
                                            <span>📍 {i.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="text-xs bg-red-500 hover:bg-red-600 text-white" onClick={() => handleInternshipAction(i._id, 'rejected')}>Reject</Button>
                                        <Button className="text-xs bg-green-500 hover:bg-green-600 text-white" onClick={() => handleInternshipAction(i._id, 'approved')}>Approve</Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            approvedInternships.length === 0 ? <p>No approved internships found.</p> :
                            approvedInternships.map(i => (
                                <div key={i._id} className="p-4 mb-2 border rounded flex justify-between items-center opacity-80 hover:opacity-100">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>{i.title || 'Untitled Internship'}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300`}>Approved</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span>by {i.company?.name || i.company?.email || 'Unknown Company'}</span>
                                            <span>📍 {i.location}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                 </div>
               </div>
            )}

            {/* --- OTHER TABS --- */}
            {['certifications', 'settings'].includes(activeTab) && (
               <div className={`p-10 text-center bg-white dark:bg-slate-800 rounded-xl border ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                 <p className="mb-2">This module is not implemented in the backend yet.</p>
                 <p className="text-sm text-gray-500">Backend controller is missing for this feature.</p>
               </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};