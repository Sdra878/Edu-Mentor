import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import { 
  Briefcase, FileText, Search, Plus, 
  CheckCircle, XCircle, Send, Tag, 
  Shield, Moon, Sun, TrendingUp, Clock, Download, 
  LogOut, Users, UserCheck
} from 'lucide-react';

export const CompanyDashboard = () => {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [talents, setTalents] = useState([]);
  const [searchSkill, setSearchSkill] = useState('');
  
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobFormData, setJobFormData] = useState({ title: '', type: 'On-site', location: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        const jobsRes = await fetch('http://localhost:5000/api/internships', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(jobsRes.ok) setInternships(await jobsRes.json());

        const appsRes = await fetch('http://localhost:5000/api/applications/company', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(appsRes.ok) {
            const appsData = await appsRes.json();
            const enrichedApps = appsData.map(app => ({
                ...app,
                cvUrl: app.cv ? `http://localhost:5000/uploads/${app.cv}` : null
            }));
            setApplications(enrichedApps);
        }
        
        setTalents([
            { id: 1, name: 'Ahmad Khalil', email: 'ahmad@test.com', university: 'Jordan University', skills: ['React', 'Node.js', 'MongoDB'], status: 'Available' },
            { id: 2, name: 'Sara Mansour', email: 'sara@test.com', university: 'Yarmouk University', skills: ['Python', 'AI', 'Data Science'], status: 'Available' },
            { id: 3, name: 'Omar Ziad', email: 'omar@test.com', university: 'Applied Science University', skills: ['UI/UX', 'Figma', 'CSS'], status: 'Employed' },
            { id: 4, name: 'Layla Hassan', email: 'layla@test.com', university: 'Hashemite University', skills: ['Java', 'Spring Boot', 'SQL'], status: 'Available' }
        ]);

      } catch (error) {
        console.error("Error loading company data", error);
      }
      setLoading(false);
    };
    loadData();
  }, [refresh]);

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
        body: JSON.stringify({ ...jobFormData, status: 'pending' })
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

  const handleApplicationAction = async (id, action) => {
    const token = localStorage.getItem('token');
    const url = action === 'accepted' 
      ? `http://localhost:5000/api/applications/accept/${id}`
      : `http://localhost:5000/api/applications/reject/${id}`;

    try {
      const res = await fetch(url, {
        method: 'put',
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

  const handleInvite = (studentId, studentName) => {
    if (confirm(`Send invitation to ${studentName}?`)) {
        alert(`Invitation sent to ${studentName} successfully!`);
        setTalents(talents.map(t => t.id === studentId ? { ...t, status: 'Invited' } : t));
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} 
      className={`flex items-center gap-2 px-5 py-3 font-medium transition-all border-b-2 whitespace-nowrap
      ${activeTab === id ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-slate-800 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className={`p-6 min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-slate-800'}`}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Company <span className="text-primary-600">Dashboard</span></h1>
          <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">Manage your internships & talent</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-full transition-colors duration-200 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className={`p-3 rounded-full transition-colors duration-200 ${darkMode ? 'bg-slate-800 text-red-400 hover:bg-red-900/30' : 'bg-gray-200 text-red-500 hover:bg-red-50'}`} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className={`flex overflow-x-auto border-b gap-2 rounded-t-xl px-2 shadow-sm mb-8 mx-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <TabButton id="overview" label="Overview" icon={TrendingUp} />
        <TabButton id="post-internship" label="Post Internship" icon={Plus} />
        <TabButton id="find-talent" label="Find Talent" icon={Search} />
        <TabButton id="review-applications" label="Review Applications" icon={FileText} />
      </div>

      {loading ? <div className="p-20 text-center text-gray-500 dark:text-slate-400">Loading Dashboard...</div> : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* ========== OVERVIEW ========== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 3 كروت بس */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "My Internships", val: internships.length, color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700", icon: Briefcase },
                    { title: "Applications", val: applications.length, color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-slate-800 dark:text-emerald-400 dark:border-slate-700", icon: FileText },
                    { title: "Active Jobs", val: internships.filter(i => i.status === 'approved').length, color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-slate-800 dark:text-amber-400 dark:border-slate-700", icon: CheckCircle }
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

                {/* Recent Activity */}
                <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Clock size={18} className="text-primary-600" /> Recent Activity
                  </h3>
                  {internships.length === 0 ? (
                    <p className="text-gray-500 text-sm bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl">No internships posted yet. Start by posting your first internship!</p>
                  ) : (
                    <ul className="space-y-3">
                      {internships.slice(0, 5).map((job, idx) => (
                        <motion.li 
                          key={job._id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`flex justify-between items-center text-sm p-4 bg-gray-50 dark:bg-slate-700/60 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-sm transition-shadow`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${job.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                              <Briefcase size={16} />
                            </div>
                            <div>
                              <span className="font-medium text-slate-700 dark:text-slate-200">{job.title}</span>
                              <span className={`block text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{job.type} · {job.location}</span>
                            </div>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${job.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : job.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {job.status}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recent Applications */}
                <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Users size={18} className="text-emerald-500" /> Recent Applications
                  </h3>
                  {applications.length === 0 ? (
                    <p className="text-gray-500 text-sm bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl">No applications received yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {applications.slice(0, 5).map((app, idx) => (
                        <motion.li 
                          key={app._id || app.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`flex justify-between items-center text-sm p-4 bg-gray-50 dark:bg-slate-700/60 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-sm transition-shadow`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                              {(app.student?.name || app.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium text-slate-700 dark:text-slate-200">{app.student?.name || app.name || 'Unknown'}</span>
                              <span className={`block text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{app.internship?.title || 'Applicant'}</span>
                            </div>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${app.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {app.status}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* ========== POST INTERNSHIP ========== */}
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
                    <div className="grid grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Type</label>
                        <select className={`w-full px-4 py-2 border rounded-lg outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`}
                          value={jobFormData.type} onChange={e => setJobFormData({...jobFormData, type: e.target.value})}>
                          <option>On-site</option><option>Remote</option><option>Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Location</label>
                        <input required type="text" placeholder="" 
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

            {/* ========== FIND TALENT ========== */}
            {activeTab === 'find-talent' && (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            <Search size={20} className="text-primary-600"/> Search for Talent
                        </h3>
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Tag size={18} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by skill (e.g., React, AI, Design)..." 
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                                    value={searchSkill}
                                    onChange={e => setSearchSkill(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {talents
                            .filter(t => t.skills.some(s => s.toLowerCase().includes(searchSkill.toLowerCase())))
                            .map(student => (
                            <div key={student.id} className={`p-6 rounded-xl border shadow-sm hover:border-primary-500 transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{student.name}</h4>
                                        <p className="text-sm text-gray-500">{student.university}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {student.skills.map(skill => (
                                        <span key={skill} className="px-2 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between border-t pt-3 dark:border-slate-700">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${student.status === 'Available' ? 'bg-green-100 text-green-700' : student.status === 'Invited' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {student.status}
                                    </span>
                                    {student.status !== 'Employed' && (
                                        <button 
                                            onClick={() => handleInvite(student.id, student.name)}
                                            className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <Send size={14} /> Invite
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========== REVIEW APPLICATIONS ========== */}
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
                        <th className="p-4">CV</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
                      {applications.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">No applications found.</td></tr>
                      ) : applications.map(app => (
                        <tr key={app._id || app.id} className={`hover:${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                          <td className="p-4">
                            <div className="font-medium text-sm">{app.student?.name || app.name || 'Unknown'}</div>
                            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>{app.student?.email || app.email || ''}</div>
                          </td>
                          <td className="p-4 text-sm">{app.internship?.title || 'Applicant'}</td>
                          
                          <td className="p-4">
                            {app.cvUrl ? (
                                <a 
                                    href={app.cvUrl} 
                                    download="CV"
                                    target="_blank"
                                    rel="noreferrer" 
                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 font-medium text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Download size={14} />
                                    <span>Download CV</span>
                                </a>
                            ) : (
                                <span className="text-xs text-gray-400 italic">No CV</span>
                            )}
                          </td>
                          
                          <td className="p-4 text-sm">
                            <span className={`text-xs px-2 py-1.5 rounded-full font-bold ${app.status === 'pending' ? 'bg-amber-100 text-amber-700' : app.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {app.status === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleApplicationAction(app._id, 'rejected')} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"><XCircle size={16}/></button>
                                <button onClick={() => handleApplicationAction(app._id, 'accepted')} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"><CheckCircle size={16}/></button>
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