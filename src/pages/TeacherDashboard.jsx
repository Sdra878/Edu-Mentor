import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; 
import { 
  BookOpen, Users, MessageSquare, Plus, Trash2, FileText, Send, 
  Upload, TrendingUp, CheckCircle, XCircle, Moon, Sun, Clock,
  User, Edit3, MapPin, Calendar, GraduationCap, Mail, Phone, Globe, Brain, Camera, X, Save, ClipboardList, Calendar as CalendarIcon
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth(); 
  
  const [darkMode, setDarkMode] = useState(true);
  
  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Tabs State
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // --- Data States ---
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]); 
  const [messages, setMessages] = useState([]); 
  
  // --- EXAMS STATES ---
  const [exams, setExams] = useState([]);
  const [showExamModal, setShowExamModal] = useState(false);
  
  // تحديث الحالة لتكون فارغة للبداية (سنختار من القائمة)
  const [newExam, setNewExam] = useState({ 
    title: '', 
    course: '', 
    passing_score: 50,
    questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }] 
  });
  
  // --- NEW: WORKSHOPS STATES ---
  const [workshops, setWorkshops] = useState([]);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [workshopData, setWorkshopData] = useState({ title: '', description: '', date: '', location: '', capacity: '' });
  
  // --- Profile States ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.name || '',
    phone: '',
    specialization: '',
    qualifications: '',
    years_experince: '', 
    linkedin_url: '',
    cv_url: '',
    university: '', 
    country: '', 
    gradYear: '', 
    dob: '', 
    bio: ''
  });

  const [interests, setInterests] = useState([]); 
  const interestOptions = ['Web Development', 'AI', 'Data Science', 'Mathematics', 'IoT', 'Cloud Computing', 'Cybersecurity'];

  // --- Forms States ---
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null); 
  const [courseData, setCourseData] = useState({ 
    title: '', 
    description: '',
    category: '',
    level: '',
    price: '',
    duration_hours: ''
  });
  const [assignData, setAssignData] = useState({ title: '', dueDate: '' });
  const [msgData, setMsgData] = useState({ text: '', receiverId: 'all' });

  const [refresh, setRefresh] = useState(0);

  // === 1. جلب البيانات من الباك إند ===
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if(!token) return;

        // Mock Data للتجربة
        setWorkshops([
            { id: 1, title: 'Advanced React Patterns', date: '2023-11-15', location: 'Online', capacity: 50, enrolled: 12 }
        ]);

        // أ) جلب البروفايل
        const profileRes = await fetch('http://localhost:5000/api/teacher/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(profileRes.ok) {
          const pData = await profileRes.json();
          setProfileData(prev => ({
            ...prev,
            full_name: pData.full_name || '',
            phone: pData.phone || '',
            specialization: pData.specialization || '',
            qualifications: pData.qualifications || '',
            years_experince: pData.years_experince || '',
            linkedin_url: pData.linkedin_url || '',
            cv_url: pData.cv_url || '',
          }));
        }

        // ب) جلب الكورسات
        const coursesRes = await fetch('http://localhost:5000/api/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }

        // ج) جلب الطلاب
        const studentsRes = await fetch('http://localhost:5000/api/teacher/my-students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }

        // د) جلب الرسائل
        const msgRes = await fetch('http://localhost:5000/api/messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(msgRes.ok) {
          const msgsData = await msgRes.json();
          setMessages(msgsData);
        }

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refresh, user?.id]);

  // === Handlers ===

  // --- CREATE WORKSHOP HANDLER ---
  const handleCreateWorkshop = (e) => {
    e.preventDefault();
    const newWorkshopItem = {
        id: Date.now(),
        ...workshopData,
        enrolled: 0
    };
    setWorkshops([...workshops, newWorkshopItem]);
    setShowWorkshopModal(false);
    setWorkshopData({ title: '', description: '', date: '', location: '', capacity: '' });
    alert("Workshop Created Successfully!");
  };

  // --- CREATE EXAM HANDLER (Fixed & Connected) ---
  const handleCreateExam = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // 1. إنشاء الامتحان
      const examRes = await fetch('http://localhost:5000/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course: newExam.course, // يجب أن يكون ID
          title: newExam.title,
          passing_score: Number(newExam.passing_score)
        })
      });

      // --- معالجة الخطأ ---
      if (!examRes.ok) {
        let errorDetails = "Unknown Error";
        const contentType = examRes.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            try {
                const errData = await examRes.json();
                errorDetails = errData.message || JSON.stringify(errData);
            } catch (e) {
                errorDetails = "Failed to parse error JSON";
            }
        } else {
            try {
                errorDetails = await examRes.text();
            } catch (e) {
                errorDetails = "Failed to read error text";
            }
        }

        console.error("❌ Server Error Details:", errorDetails);
        console.error("Status Code:", examRes.status);
        throw new Error(`Failed to create exam (${examRes.status}): ${errorDetails}`);
      }
      
      const createdExam = await examRes.json();
      const examId = createdExam._id;

      // 2. إضافة الأسئلة
      const questionPromises = newExam.questions.map(q => {
        const correctAnswerText = q.options[q.correctIndex];

        return fetch('http://localhost:5000/api/exams/question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            exam: examId,
            text: q.text,
            options: q.options,
            correct_answer: correctAnswerText
          })
        });
      });

      await Promise.all(questionPromises);

      // 3. تحديث الواجهة
      const createdExamObj = {
        id: createdExam._id,
        title: newExam.title,
        questionsCount: newExam.questions.length,
        submissions: 0,
        questions: newExam.questions
      };
      
      setExams([...exams, createdExamObj]);
      setShowExamModal(false);
      setNewExam({ 
        title: '', 
        course: '', 
        passing_score: 50, 
        questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }] 
      });
      
      alert("Exam Created Successfully & Saved to DB!");

    } catch (error) {
      console.error("Connection Error:", error);
      alert(error.message);
    }
  };

  const addQuestionField = () => {
    setNewExam({
        ...newExam,
        questions: [...newExam.questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...newExam.questions];
    updatedQuestions[index][field] = value;
    setNewExam({ ...newExam, questions: updatedQuestions });
  };

  // حفظ البروفايل
  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/teacher/me', {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: profileData.full_name,
          phone: profileData.phone,
          specialization: profileData.specialization,
          qualifications: profileData.qualifications,
          years_experince: profileData.years_experince, 
          linkedin_url: profileData.linkedin_url,
          cv_url: profileData.cv_url
        })
      });

      if (res.ok) {
        alert("Profile Updated Successfully!");
        setIsEditingProfile(false);
        setRefresh(r => r + 1); 
      } else {
        alert("Error updating profile");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  // إضافة كورس
  const handleAddCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...courseData,
          price: Number(courseData.price),
          duration_hours: Number(courseData.duration_hours)
        })
      });

      if (res.ok) {
        const newCourse = await res.json();
        setCourses([...courses, newCourse]); 
        setShowCourseForm(false);
        setCourseData({ title: '', description: '', category: '', level: '', price: '', duration_hours: '' });
        alert("Course Added Successfully!");
      } else {
        alert("Error adding course");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server Error");
    }
  };

  // حذف كورس
  const handleDeleteCourse = async (id) => {
    if(confirm("Delete this course?")) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            setCourses(courses.filter(c => (c._id || c.id) !== id));
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // إرسال رسالة
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: msgData.receiverId, 
          text: msgData.text
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages([...messages, newMsg]);
        setMsgData({ text: '', receiverId: 'all' });
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // إضافة واجب (مؤقت)
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if(!selectedCourse) return alert("Select a course first");
    alert("Assignments feature needs backend connection");
  };

  const handleInterestToggle = (interest) => {
    if (interests.includes(interest)) {
        setInterests(interests.filter(i => i !== interest));
    } else {
        setInterests([...interests, interest]);
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-5 py-3 font-medium transition-all border-b-2 ${activeTab === id ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-slate-800 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className={`p-6 min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-slate-800'}`}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Teacher Portal</h1>
          <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">Welcome back, {profileData.full_name || user?.name || 'Teacher'}</p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-full transition-colors duration-200 ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}>
          {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
      </header>

      <div className={`flex overflow-x-auto border-b gap-2 rounded-t-xl px-2 shadow-sm mb-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <TabButton id="profile" label="My Profile" icon={User} />
        <TabButton id="overview" label="Overview" icon={TrendingUp} />
        <TabButton id="courses" label="My Courses" icon={BookOpen} />
        <TabButton id="workshops" label="Workshops" icon={CalendarIcon} />
        <TabButton id="exams" label="Exams & Quizzes" icon={ClipboardList} />
        <TabButton id="classwork" label="Classwork" icon={Users} />
        <TabButton id="communication" label="Messages" icon={MessageSquare} />
      </div>

      {loading ? <div className="p-20 text-center">Loading...</div> : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            
            {/* 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Total Courses", val: courses.length, color: "bg-blue-300 text-white border-blue-600 shadow-md dark:bg-slate-800 dark:border-slate-700", icon: BookOpen },
                    { title: "Enrolled Students", val: students.length, color: "bg-emerald-300 text-white border-emerald-600 shadow-md dark:bg-slate-800 dark:border-slate-700", icon: Users },
                    { title: "Pending Assignments", val: 0, color: "bg-amber-300 text-white border-amber-500 shadow-md dark:bg-slate-800 dark:border-slate-700", icon: FileText },
                    { title: "Unread Messages", val: messages.length, color: "bg-purple-300 text-white border-purple-600 shadow-md dark:bg-slate-800 dark:border-slate-700", icon: MessageSquare }
                  ].map((item, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className={`p-6 rounded-xl shadow-sm border ${item.color} flex items-center justify-between relative overflow-hidden group`}>
                      <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">{item.title}</p>
                        <h3 className="text-3xl font-bold mt-2">{item.val}</h3>
                      </div>
                      <div className="p-3 bg-white/20 rounded-lg relative z-10 group-hover:rotate-12 transition-transform"><item.icon size={28} /></div>
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <button onClick={() => setActiveTab('classwork')} className={`p-5 rounded-xl border flex items-start gap-4 hover:shadow-md transition-shadow text-left ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><FileText size={24} /></div>
                      <div>
                        <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Create Assignment</h4>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Add homework for your students.</p>
                      </div>
                   </button>
                   <button onClick={() => setActiveTab('communication')} className={`p-5 rounded-xl border flex items-start gap-4 hover:shadow-md transition-shadow text-left ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}><MessageSquare size={24} /></div>
                      <div>
                        <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Send Announcement</h4>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Broadcast a message to the class.</p>
                      </div>
                   </button>
                   <button onClick={() => setActiveTab('courses')} className={`p-5 rounded-xl border flex items-start gap-4 hover:shadow-md transition-shadow text-left ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><BookOpen size={24} /></div>
                      <div>
                        <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Manage Content</h4>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Upload new materials.</p>
                      </div>
                   </button>
                </div>
              </div>
            )}

            {/* 2. MANAGE COURSES */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>My Courses</h2>
                  <Button onClick={() => setShowCourseForm(true)}><Plus size={16} className="me-2"/> Add New Course</Button>
                </div>

                {/* Modal Form */}
                {showCourseForm && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <button onClick={() => setShowCourseForm(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24} /></button>
                      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Create New Course</h2>
                      <form onSubmit={handleAddCourse} className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label><input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label><textarea required rows="3" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label><input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.category} onChange={e => setCourseData({...courseData, category: e.target.value})} /></div>
                          <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Level</label><select required className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.level} onChange={e => setCourseData({...courseData, level: e.target.value})}><option value="">Select Level</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price ($)</label><input required type="number" min="0" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.price} onChange={e => setCourseData({...courseData, price: e.target.value})} /></div>
                          <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Duration (Hours)</label><input required type="number" min="1" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.duration_hours} onChange={e => setCourseData({...courseData, duration_hours: e.target.value})} /></div>
                        </div>
                        <div className="pt-4 flex justify-end gap-3"><Button type="button" onClick={() => setShowCourseForm(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg">Cancel</Button><Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create Course</Button></div>
                      </form>
                    </div>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(c => (
                    <div key={c._id || c.id} className={`p-6 rounded-xl border shadow-sm relative group ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:shadow-md'}`}>
                      <h3 className="font-bold text-lg mb-2">{c.title}</h3>
                      <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{c.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={()=>setSelectedCourse(c)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><FileText size={16}/></button>
                          <button onClick={()=>handleDeleteCourse(c._id || c.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. WORKSHOPS SECTION */}
            {activeTab === 'workshops' && (
               <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Workshops & Events</h2>
                  <Button onClick={() => setShowWorkshopModal(true)}><Plus size={16} className="me-2"/> Announce Workshop</Button>
                </div>

                {/* Create Workshop Modal */}
                {showWorkshopModal && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <button onClick={() => setShowWorkshopModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24} /></button>
                      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Announce New Workshop</h2>
                      <form onSubmit={handleCreateWorkshop} className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Workshop Title</label><input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={workshopData.title} onChange={e => setWorkshopData({...workshopData, title: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium mb-1">Description</label><textarea required rows="3" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={workshopData.description} onChange={e => setWorkshopData({...workshopData, description: e.target.value})} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1">Date</label><input required type="date" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={workshopData.date} onChange={e => setWorkshopData({...workshopData, date: e.target.value})} /></div>
                            <div><label className="block text-sm font-medium mb-1">Location</label><input required type="text" placeholder="e.g. Online, Room 101" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={workshopData.location} onChange={e => setWorkshopData({...workshopData, location: e.target.value})} /></div>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Capacity</label><input required type="number" min="1" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={workshopData.capacity} onChange={e => setWorkshopData({...workshopData, capacity: e.target.value})} /></div>
                        <div className="pt-4 flex justify-end gap-3"><Button type="button" onClick={() => setShowWorkshopModal(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg">Cancel</Button><Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Publish Workshop</Button></div>
                      </form>
                    </div>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workshops.map(ws => (
                    <div key={ws.id} className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold"><CalendarIcon size={16} /> {ws.date}</div>
                      <h3 className="font-bold text-lg mb-1">{ws.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ws.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3 dark:border-slate-700">
                         <span>{ws.location}</span>
                         <span>{ws.enrolled} / {ws.capacity} Enrolled</span>
                      </div>
                    </div>
                  ))}
                </div>
               </div>
            )}

            {/* 4. EXAMS SECTION */}
            {activeTab === 'exams' && (
               <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Exams & Quizzes</h2>
                  <Button onClick={() => setShowExamModal(true)}><Plus size={16} className="me-2"/> Create Exam</Button>
                </div>

                {/* Create Exam Modal */}
                {showExamModal && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <button onClick={() => setShowExamModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24} /></button>
                      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Create New Exam</h2>
                      
                      <form onSubmit={handleCreateExam} className="space-y-6">
                         {/* Exam Basic Details (Updated) */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Exam Title</label>
                                <input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} />
                            </div>
                            
                            {/* UPDATED: Course Selection Dropdown */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Course</label>
                                <select 
                                    required 
                                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                                    value={newExam.course}
                                    onChange={e => setNewExam({...newExam, course: e.target.value})}
                                >
                                    <option value="">-- Choose a Course --</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                                {courses.length === 0 && <p className="text-xs text-red-500 mt-1">No courses found. Please create one first in "My Courses" tab.</p>}
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                            <input required type="number" min="1" max="100" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={newExam.passing_score} onChange={e => setNewExam({...newExam, passing_score: e.target.value})} />
                         </div>
                         
                         {/* Questions Section */}
                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">Questions</h3>
                                <button type="button" onClick={addQuestionField} className="text-blue-500 text-sm font-bold hover:underline">+ Add Question</button>
                            </div>
                            
                            {newExam.questions.map((q, qIdx) => (
                                <div key={qIdx} className={`p-4 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                                    <label className="block text-sm font-medium mb-2">Question {qIdx + 1}</label>
                                    <input required type="text" className={`w-full px-4 py-2 rounded-lg border mb-3 ${darkMode ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white'}`} placeholder="Enter question..." value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} />
                                    
                                    <label className="block text-xs font-bold mb-2 uppercase text-gray-500">Options</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2">
                                                <input type="radio" name={`correct-${qIdx}`} checked={q.correctIndex === oIdx} onChange={() => updateQuestion(qIdx, 'correctIndex', oIdx)} className="accent-green-500" />
                                                <input required type="text" className={`flex-1 px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white'}`} placeholder={`Option ${oIdx+1}`} value={opt} onChange={e => {
                                                    const newOpts = [...q.options];
                                                    newOpts[oIdx] = e.target.value;
                                                    updateQuestion(qIdx, 'options', newOpts);
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-400"><CheckCircle size={12} className="inline mr-1"/> Select the radio button for the correct answer.</p>
                                </div>
                            ))}
                         </div>

                         <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" onClick={() => setShowExamModal(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg">Cancel</Button>
                            <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Publish Exam</Button>
                         </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams.map(exam => (
                    <div key={exam.id} className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                      <h3 className="font-bold text-lg mb-1">{exam.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{exam.questionsCount} Questions</p>
                      <div className="flex justify-between items-center border-t pt-3 dark:border-slate-700">
                         <span className="text-xs text-gray-400">Submissions: <span className="font-bold text-blue-500">{exam.submissions}</span></span>
                         <button className="text-sm text-gray-500 hover:text-blue-500">View Results</button>
                      </div>
                    </div>
                  ))}
                </div>
               </div>
            )}

            {/* 5. CLASSWORK */}
            {activeTab === 'classwork' && (
               <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="mb-6 border-b pb-4">
                  <label className="block text-sm font-medium mb-2">Select Course to Manage</label>
                  <select className={`w-full md:w-1/3 px-4 py-2 border rounded-lg outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`} onChange={(e) => setSelectedCourse(courses.find(c => (c._id || c.id) === e.target.value))}>
                    <option value="">-- Choose a Course --</option>
                    {courses.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>)}
                  </select>
                </div>
                {selectedCourse ? (
                    <div className="space-y-8">
                        <div><h3 className="font-bold mb-4"><Users size={18}/> Enrolled Students</h3>
                            {students.length > 0 ? students.map(s => (
                                <div key={s._id || s.id} className={`flex items-center justify-between p-3 mb-2 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                                    <span>{s.name || s.full_name || 'Student'}</span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                                </div>
                            )) : <p className="text-gray-400">No students enrolled yet.</p>}
                        </div>
                        <form onSubmit={handleAddAssignment} className={`p-4 rounded-lg border ${darkMode ? 'bg-slate-700/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                             <h3 className="font-bold mb-4"><FileText size={18}/> Assignments</h3>
                             <div className="grid md:grid-cols-2 gap-4 mb-2">
                                <input required placeholder="Title" className={`px-4 py-2 border rounded-lg ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`} value={assignData.title} onChange={e=>setAssignData({...assignData, title:e.target.value})} />
                                <input type="date" required className={`px-4 py-2 border rounded-lg ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`} value={assignData.dueDate} onChange={e=>setAssignData({...assignData, dueDate:e.target.value})} />
                             </div>
                             <Button type="submit"><Send size={16} className="me-2"/> Send</Button>
                        </form>
                    </div>
                ) : <div className="text-center py-20 text-gray-400">Select a course</div>}
               </div>
            )}

            {/* 6. COMMUNICATION */}
            {activeTab === 'communication' && (
              <div className={`p-6 rounded-xl border h-[600px] flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="border-b pb-4 mb-4 flex justify-between items-center">
                    <h3 className="font-bold">Messages</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {messages.length === 0 ? <p className="text-center text-gray-400 mt-10">No messages yet.</p> :
                        messages.map(m => (
                            <div key={m._id || m.id} className={`flex flex-col ${m.senderId === user.id ? 'items-end' : 'items-start'}`}>
                                 <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${m.senderId === user.id ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white rounded-bl-none'}`}>
                                    <p>{m.text || m.message}</p>
                                 </div>
                            </div>
                        ))
                    }
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input required placeholder="Type a message..." className={`flex-1 px-4 py-2 border rounded-lg ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`} value={msgData.text} onChange={e=>setMsgData({...msgData, text:e.target.value})} />
                    <Button type="submit"><Send size={18}/></Button>
                </form>
              </div>
            )}

            {/* --- 7. MY PROFILE SECTION --- */}
            {activeTab === 'profile' && (
              <div className="w-full relative">
                {!isEditingProfile && (
                  <div className="w-full">
                    <div className="h-32 md:h-60 w-full bg-gradient-to-r from-black-600 via-primary-600 to-blue-600 relative">
                        <div className="absolute top-6 right-6">
                            <button onClick={() => setIsEditingProfile(true)} className="bg-white text-blue-600 hover:bg-gray-50 shadow-lg border border-gray-100 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all"><Edit3 size={16} /> Edit Profile</button>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none"><div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div><div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-300 blur-3xl"></div></div>
                    </div>
                    <div className="max-w-7xl mx-auto px-6 relative -mt-20 md:-mt-24 z-10 pb-12">
                        <div className="flex flex-col md:flex-row items-end md:items-end gap-6 mb-8">
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-8 border-white dark:border-slate-900 bg-gray-200 dark:bg-slate-800 shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0"><User size={80} className="text-gray-400 dark:text-slate-600"/></div>
                            <div className="flex-1 mb-2 text-center md:text-left">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">{profileData.full_name || user?.name}</h2>
                                <p className="text-xl text-primary-600 dark:text-primary-400 font-medium mt-1">{profileData.specialization}</p>
                                <div className="flex flex-col md:flex-row items-center gap-4 mt-3 text-gray-600 dark:text-slate-400 text-sm">
                                    <span className="flex items-center gap-1"><MapPin size={16} className="text-primary-500"/> {profileData.university}, {profileData.country}</span>
                                    <span className="hidden md:inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span className="flex items-center gap-1"><Calendar size={16} className="text-primary-500"/> {profileData.years_experince} Years Experience</span>
                                </div>
                            </div>
                            <div className="hidden md:flex gap-4 mb-4">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 text-center min-w-[100px]"><p className="text-2xl font-bold text-slate-800 dark:text-white">{courses.length}</p><p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Courses</p></div>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 text-center min-w-[100px]"><p className="text-2xl font-bold text-slate-800 dark:text-white">{students.length}</p><p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Students</p></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <section className={`p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"><FileText size={20}/></div>About Me</h3>
                                    <p className="text-gray-600 dark:text-slate-400 leading-8 text-lg">{profileData.qualifications}</p>
                                </section>
                            </div>
                            <div className="space-y-8">
                                <section className={`p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Contact Information</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4"><div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><Mail size={20}/></div><div><p className="text-xs text-gray-500 font-bold uppercase">Email</p><p className="text-slate-700 dark:text-slate-300 font-medium">{user?.email}</p></div></div>
                                        <div className="flex items-start gap-4"><div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"><Phone size={20}/></div><div><p className="text-xs text-gray-500 font-bold uppercase">Phone</p><p className="text-slate-700 dark:text-slate-300 font-medium">{profileData.phone}</p></div></div>
                                        <div className="flex items-start gap-4"><div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"><Globe size={20}/></div><div><p className="text-xs text-gray-500 font-bold uppercase">LinkedIn</p><p className="text-slate-700 dark:text-slate-300 font-medium">{profileData.linkedin_url || 'Not provided'}</p></div></div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* === EDIT MODE === */}
                {isEditingProfile && (
                  <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className={`rounded-3xl shadow-2xl overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <div className="p-8 md:p-10">
                            <div className="flex items-center justify-between mb-10 border-b border-gray-100 dark:border-slate-700 pb-6">
                                <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Profile</h2><p className="text-sm text-gray-500 mt-1">Update your personal information and preferences.</p></div>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 flex items-center gap-2 transition-colors"><X size={18} /> Cancel</button>
                                    <button onClick={handleSaveProfile} className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/30 transition-colors"><Save size={18} /> Save Changes</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="space-y-8">
                                    <div className="text-center"><div className="w-32 h-32 mx-auto rounded-full bg-gray-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-4"><User size={50} className="text-gray-400"/></div><button className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1"><Camera size={16}/> Change Photo</button></div>
                                </div>
                                <div className="lg:col-span-2 space-y-8">
                                    <div>
                                        <h4 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-4">Personal Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label><input value={profileData.full_name} onChange={(e) => setProfileData({...profileData, full_name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`} /></div>
                                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label><input value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`} /></div>
                                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn URL</label><input value={profileData.linkedin_url} onChange={(e) => setProfileData({...profileData, linkedin_url: e.target.value})} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`} /></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-4">Professional Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialization</label><input value={profileData.specialization} onChange={(e) => setProfileData({...profileData, specialization: e.target.value})} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`} /></div>
                                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Years of Experience</label><input type="number" value={profileData.years_experince} onChange={(e) => setProfileData({...profileData, years_experince: e.target.value})} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`} /></div>
                                        </div>
                                        <div className="mt-4"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qualifications</label><textarea rows="4" value={profileData.qualifications} onChange={(e) => setProfileData({...profileData, qualifications: e.target.value})} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}></textarea></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};