import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import { 
  Briefcase, FileText, MessageSquare, Search, Users, Plus, 
  CheckCircle, XCircle, Send, Filter, MoreVertical, Calendar, 
  MapPin, DollarSign, Shield, Moon, Sun, TrendingUp, Clock
} from 'lucide-react';

export const CompanyDashboard = () => {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  
  // States
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [talents, setTalents] = useState([]);
  
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobFormData, setJobFormData] = useState({ title: '', type: 'On-site', location: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [refresh, setRefresh] = useState(0);

  // تأثير الدارك مود
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // === تحميل البيانات الحقيقية من الباك إند ===
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        // 1. جلب الوظائف المنشورة (GET /api/internships) -> تم التعديل للجمع
        const jobsRes = await fetch('http://localhost:5000/api/internships', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(jobsRes.ok) setInternships(await jobsRes.json());

        // 2. جلب الطلبات الواردة (GET /api/applications/company) -> تم التعديل للجمع
        const appsRes = await fetch('http://localhost:5000/api/applications/company', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(appsRes.ok) setApplications(await appsRes.json());
        
        // 3. جلب الطلاب
        setTalents([]); 

      } catch (error) {
        console.error("Error loading company data", error);
      }
      setLoading(false);
    };
    loadData();
  }, [refresh]);

  // === نشر وظيفة جديدة (POST /api/internships) -> تم التعديل للجمع ===
  const handlePostJob = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobFormData)
      });

      if (res.ok) {
        setShowJobForm(false);
        setJobFormData({ title: '', type: 'On-site', location: '', description: '' });
        setRefresh(r => r + 1);
        alert("Internship Posted Successfully!");
      } else {
        alert("Failed to post internship");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  // === التعامل مع الطلب: قبول أو رفض (تم التعديل للجمع) ===
  const handleApplicationAction = async (id, action) => {
    const token = localStorage.getItem('token');
    // تم التعديل: استخدام /api/applications
    const url = action === 'accepted' 
      ? `http://localhost:5000/api/applications/accept/${id}`
      : `http://localhost:5000/api/applications/reject/${id}`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setRefresh(r => r + 1);
        alert(`Application ${action}d successfully!`);
      } else {
        alert("Failed to update application");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} 
      className={`flex items-center gap-2 px-5 py-3 font-medium transition-all border-b-2 whitespace-nowrap
      ${activeTab === id ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-slate-800 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-slate-400'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className={`p-6 min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-slate-800'}`}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Company Dashboard</h1>
          <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">Manage your internships</p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-full ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className={`flex overflow-x-auto border-b gap-2 rounded-t-xl px-2 mb-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <TabButton id="overview" label="Overview" icon={TrendingUp} />
        <TabButton id="post-internship" label="Post Internship" icon={Plus} />
        <TabButton id="review-applications" label="Review Applications" icon={FileText} />
      </div>

      {loading ? <div className="p-20 text-center">Loading...</div> : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            
            {/* قسم النشر */}
            {activeTab === 'post-internship' && (
              <div className="max-w-2xl mx-auto">
                <div className={`p-8 rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Briefcase className="text-primary-600"/> Post New Internship</h3>
                  <form onSubmit={handlePostJob} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Job Title</label>
                      <input required type="text" placeholder="React Developer" 
                        className={`w-full px-4 py-2 border rounded-lg outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`}
                        value={jobFormData.title} onChange={e => setJobFormData({...jobFormData, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Type</label>
                        <select className={`w-full px-4 py-2 border rounded-lg outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`}
                          value={jobFormData.type} onChange={e => setJobFormData({...jobFormData, type: e.target.value})}>
                          <option>On-site</option><option>Remote</option><option>Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Location</label>
                        <input required type="text" placeholder="Amman, Jordan" 
                          className={`w-full px-4 py-2 border rounded-lg outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`}
                          value={jobFormData.location} onChange={e => setJobFormData({...jobFormData, location: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Description</label>
                      <textarea required rows="4" 
                        className={`w-full px-4 py-2 border rounded-lg outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`}
                        value={jobFormData.description} onChange={e => setJobFormData({...jobFormData, description: e.target.value})}></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="secondary" onClick={() => setShowJobForm(false)}>Cancel</Button>
                      <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white">Post Internship</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* قسم مراجعة الطلبات */}
            {activeTab === 'review-applications' && (
              <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-slate-700/50">
                  <h3 className={`font-bold ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>Applications Received</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className={`text-xs uppercase font-bold ${darkMode ? 'bg-slate-700/50 text-slate-400' : 'bg-gray-50 text-gray-500'}`}>
                      <tr>
                        <th className="p-4">Candidate</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
                      {applications.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No applications found.</td></tr>
                      ) : applications.map(app => (
                        <tr key={app._id || app.id} className={`hover:${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                          <td className="p-4">
                            <div className="font-medium text-sm">{app.student?.name || app.name || 'Unknown'}</div>
                            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>{app.student?.email || app.email || ''}</div>
                          </td>
                          <td className="p-4 text-sm">{app.internship?.title || 'Applicant'}</td>
                          <td className="p-4 text-sm">
                            <span className={`text-xs px-2 py-1 rounded-full ${app.status === 'pending' ? 'bg-amber-100 text-amber-700' : app.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {app.status === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleApplicationAction(app._id, 'rejected')} className="text-red-500 hover:bg-red-50 p-2 rounded"><XCircle size={16}/></button>
                                <button onClick={() => handleApplicationAction(app._id, 'accepted')} className="bg-green-600 text-white p-2 rounded hover:bg-green-700"><CheckCircle size={16}/></button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 uppercase font-bold">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};