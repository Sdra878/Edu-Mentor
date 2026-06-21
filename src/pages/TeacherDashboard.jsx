import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; 
import { 
  BookOpen, Users, MessageSquare, Plus, Trash2, FileText, Send, 
  Upload, TrendingUp, CheckCircle, XCircle, Moon, Sun, Clock,
  User, Edit3, MapPin, Calendar, GraduationCap, Mail, Phone, Globe, Brain, Camera, X, Save, ClipboardList, Calendar as CalendarIcon, Search, StickyNote
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
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // --- Data States ---
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]); 
  
  // --- EXAMS STATES ---
  const [exams, setExams] = useState([]);
  const [showExamModal, setShowExamModal] = useState(false);
  
  const [newExam, setNewExam] = useState({ 
    title: '', 
    course: '', 
    passing_score: 50,
    questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }] 
  });
  
  // --- WORKSHOPS STATES ---
  const [workshops, setWorkshops] = useState([]);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [workshopData, setWorkshopData] = useState({ title: '', description: '', date: '', meeting_link: '' });
  
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
  const [courseData, setCourseData] = useState({ title: '', description: '', category: '', level: '', price: '', duration_hours: '' });
  const [assignData, setAssignData] = useState({ title: '', dueDate: '' });
  
  // ✅ رسائل: حالات المراسلة المزبطّة
  const [chatMessages, setChatMessages] = useState([]);
  const [msgData, setMsgData] = useState({ text: '', receiverId: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchStudent, setSearchStudent] = useState('');
  const chatEndRef = useRef(null);

  // تعديل 5: حالة إضافة ملاحظة للكورس
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteCourse, setNoteCourse] = useState(null);
  const [noteText, setNoteText] = useState('');

  const [refresh, setRefresh] = useState(0);

  // ✅ رسائل: تلقائي اسكرول لآخر رسالة
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // === 1. جلب البيانات من الباك إند ===
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if(!token) return;

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
            university: pData.university || prev.university,
            country: pData.country || prev.country,
            bio: pData.bio || prev.bio
          }));
        }

        const coursesRes = await fetch('http://localhost:5000/api/courses/my-courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }

        const studentsRes = await fetch('http://localhost:5000/api/teacher/my-students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }

        const wsRes = await fetch('http://localhost:5000/api/workshops', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(wsRes.ok) {
          const wsData = await wsRes.json();
          setWorkshops(wsData);
        }

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refresh, user?.id]);

  // ✅ رسائل: جلب محادثة مع طالب معيّن
  const loadConversation = async (otherUserId) => {
    if (!otherUserId) {
      setChatMessages([]);
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/messages/conversation/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const msgs = await res.json();
        setChatMessages(msgs);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setChatMessages([]);
    }
  };

  // ✅ رسائل: إرسال رسالة - endpoint و field names صح
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgData.receiverId) {
      return alert("Please select a student first");
    }
    if (!msgData.text.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver: msgData.receiverId,
          message: msgData.text
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setChatMessages(prev => [...prev, newMsg]);
        setMsgData(prev => ({ ...prev, text: '' }));
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Server Error");
    }
  };

  // ✅ رسائل: عند اختيار طالب → حمّل المحادثة
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setMsgData(prev => ({ ...prev, receiverId: student._id }));
    loadConversation(student._id);
  };

  // === Handlers ===

  const handleCreateWorkshop = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/api/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workshopData)
      });

      if(res.ok) {
        const newWs = await res.json();
        setWorkshops([...workshops, newWs]);
        setShowWorkshopModal(false);
        setWorkshopData({ title: '', description: '', date: '', meeting_link: '' });
        alert("Workshop Published Successfully!");
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to create workshop");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  const handleDeleteWorkshop = async (wsId) => {
    if(!confirm("Are you sure you want to delete this workshop?")) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/workshops/${wsId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if(res.ok) {
        setWorkshops(workshops.filter(ws => ws._id !== wsId));
        alert("Workshop Deleted");
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to delete");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const examRes = await fetch('http://localhost:5000/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course: newExam.course,
          title: newExam.title,
          passing_score: Number(newExam.passing_score)
        })
      });

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
        throw new Error(`Failed to create exam (${examRes.status}): ${errorDetails}`);
      }
      
      const createdExam = await examRes.json();
      const examId = createdExam._id;

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

      const createdExamObj = {
        id: createdExam._id,
        title: newExam.title,
        questionsCount: newExam.questions.length,
        submissions: 0,
        questions: newExam.questions
      };
      
      setExams([...exams, createdExamObj]);
      setShowExamModal(false);
      setNewExam({ title: '', course: '', passing_score: 50, questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }] });
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
          cv_url: profileData.cv_url,
          university: profileData.university,
          country: profileData.country,
          bio: profileData.bio
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

  const handleSaveNote = () => {
    if(!noteText.trim()) return alert("Please write a note first");
    alert(`Note saved for course: ${noteCourse.title}\nNote: ${noteText}`);
    setShowNoteModal(false);
    setNoteText('');
    setNoteCourse(null);
  };

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

  // ✅ رسائل: دالة مساعدة لتحقق إذا الرسالة مني
  const isMyMessage = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    const myId = user?.id || user?._id;
    return senderId?.toString() === myId?.toString();
  };

  // ✅ رسائل: دالة لاستخراج اسم المرسل
  const getSenderName = (msg) => {
    if (isMyMessage(msg)) return "You";
    return selectedStudent?.name || selectedStudent?.full_name || msg.receiver?.email?.split('@')[0] || "Student";
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-5 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === id ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-slate-800 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className={`p-6 min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-slate-800'}`}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Welcome, {profileData.full_name || user?.name || 'Teacher'}</h1>
          <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">Manage your courses, students, and workshops</p>
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
        <TabButton id="exams" label="Exam" icon={ClipboardList} />
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
                    { title: "Total Courses", val: courses.length, color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700", icon: BookOpen },
                    { title: "Enrolled Students", val: students.length, color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-slate-800 dark:text-emerald-400 dark:border-slate-700", icon: Users },
                    { title: "Total Workshops", val: workshops.length, color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-slate-800 dark:text-amber-400 dark:border-slate-700", icon: CalendarIcon },
                    { title: "Students Contacted", val: chatMessages.length, color: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-slate-800 dark:text-purple-400 dark:border-slate-700", icon: MessageSquare }
                  ].map((item, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className={`p-6 rounded-xl shadow-sm border ${item.color} flex items-center justify-between relative overflow-hidden group`}>
                      <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">{item.title}</p>
                        <h3 className="text-3xl font-bold mt-2">{item.val}</h3>
                      </div>
                      <div className="p-3 bg-white/30 dark:bg-slate-700/30 rounded-lg relative z-10 group-hover:rotate-12 transition-transform"><item.icon size={28} /></div>
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    </motion.div>
                  ))}
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

                {showCourseForm && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <button onClick={() => setShowCourseForm(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24} /></button>
                      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Create New Course</h2>
                      <form onSubmit={handleAddCourse} className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Title</label><input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium mb-1">Description</label><textarea required rows="3" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-sm font-medium mb-1">Category</label><input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.category} onChange={e => setCourseData({...courseData, category: e.target.value})} /></div>
                          <div><label className="block text-sm font-medium mb-1">Level</label><select required className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.level} onChange={e => setCourseData({...courseData, level: e.target.value})}><option value="">Select Level</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-sm font-medium mb-1">Price ($)</label><input required type="number" min="0" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.price} onChange={e => setCourseData({...courseData, price: e.target.value})} /></div>
                          <div><label className="block text-sm font-medium mb-1">Duration (Hours)</label><input required type="number" min="1" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.duration_hours} onChange={e => setCourseData({...courseData, duration_hours: e.target.value})} /></div>
                        </div>
                        <div className="pt-4 flex justify-end gap-3"><Button type="button" onClick={() => setShowCourseForm(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg">Cancel</Button><Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create Course</Button></div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {showNoteModal && noteCourse && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 relative ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <button onClick={() => setShowNoteModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24}/></button>
                      <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}><StickyNote size={20}/> Add Note</h2>
                      <p className="text-sm text-gray-500 mb-4">Course: <span className="font-bold text-gray-700 dark:text-gray-300">{noteCourse.title}</span></p>
                      <textarea rows="5" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Write your note here..." className={`w-full px-4 py-2 rounded-lg border mb-4 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}></textarea>
                      <div className="flex justify-end"><Button onClick={handleSaveNote} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save Note</Button></div>
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
                          <button onClick={() => { setNoteCourse(c); setNoteText(''); setShowNoteModal(true); }} className="text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-700 p-2 rounded"><FileText size={16}/></button>
                          <button onClick={()=>handleDeleteCourse(c._id || c.id)} className="text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 p-2 rounded"><Trash2 size={16}/></button>
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
                            <div><label className="block text-sm font-medium mb-1">Meeting Link</label><input required type="url" placeholder="e.g. https://zoom.us/j/..." className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={workshopData.meeting_link} onChange={e => setWorkshopData({...workshopData, meeting_link: e.target.value})} /></div>
                        </div>
                        <div className="pt-4 flex justify-end gap-3"><Button type="button" onClick={() => setShowWorkshopModal(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg">Cancel</Button><Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Publish Workshop</Button></div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {selectedWorkshop && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <button onClick={() => setSelectedWorkshop(null)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24}/></button>
                      <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedWorkshop.title}</h2>
                      <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold"><CalendarIcon size={16} /> {new Date(selectedWorkshop.date).toLocaleDateString()}</div>
                      <p className={`mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{selectedWorkshop.description}</p>
                      <a href={selectedWorkshop.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-2 mb-6"><Globe size={16}/> Join Meeting Link</a>
                      
                      <div className="border-t dark:border-slate-700 pt-4">
                        <h4 className="font-bold mb-3">Registered Students ({selectedWorkshop.attendees ? selectedWorkshop.attendees.length : 0})</h4>
                        {selectedWorkshop.attendees && selectedWorkshop.attendees.length > 0 ? (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                             {selectedWorkshop.attendees.map((student, idx) => {
                                const isObject = typeof student === 'object' && student !== null;
                                const displayName = isObject ? (student.name || student.full_name || (student.email ? student.email.split('@')[0] : 'Student')) : `Student ${idx + 1}`;
                                const displayEmail = isObject ? student.email : null;
                                return (
                                  <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><User size={16}/></div>
                                    <div>
                                      <p className="font-semibold">{displayName}</p>
                                      {displayEmail && <p className="text-xs text-gray-500">{displayEmail}</p>}
                                    </div>
                                  </div>
                                );
                             })}
                          </div>
                        ) : <p className="text-sm text-gray-400">No students registered yet.</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workshops.map(ws => (
                    <div key={ws._id} onClick={() => setSelectedWorkshop(ws)} className={`p-6 rounded-xl border shadow-sm relative group cursor-pointer transition-all hover:shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteWorkshop(ws._id); }} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-2 rounded"><Trash2 size={16}/></button>
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold"><CalendarIcon size={16} /> {new Date(ws.date).toLocaleDateString()}</div>
                      <h3 className="font-bold text-lg mb-1">{ws.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ws.description}</p>
                      <div className="border-t pt-3 dark:border-slate-700 mt-2">
                         <div className="flex justify-between items-center text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Globe size={12}/> {ws.meeting_link ? 'Online' : 'Link N/A'}</span>
                            <span className="flex items-center gap-1"><Users size={12}/> {ws.attendees ? ws.attendees.length : 0} Registered</span>
                         </div>
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
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Exams</h2>
                  <Button onClick={() => setShowExamModal(true)}><Plus size={16} className="me-2"/> Create Exam</Button>
                </div>

                {showExamModal && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <button onClick={() => setShowExamModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24} /></button>
                      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Create New Exam</h2>
                      
                      <form onSubmit={handleCreateExam} className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Exam Title</label>
                                <input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Course</label>
                                <select required className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={newExam.course} onChange={e => setNewExam({...newExam, course: e.target.value})}>
                                    <option value="">-- Choose a Course --</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                            <input required type="number" min="1" max="100" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={newExam.passing_score} onChange={e => setNewExam({...newExam, passing_score: e.target.value})} />
                         </div>
                         
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

            {/* ✅ 6. COMMUNICATION / MESSAGES - مزبطّت بالكامل */}
            {activeTab === 'communication' && (
              <div className={`rounded-xl border h-[600px] flex overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                
                {/* Sidebar - Students List */}
                <div className={`w-1/3 border-r flex flex-col ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="font-bold mb-3">Students</h3>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                      <input 
                        type="text" 
                        placeholder="Search student..." 
                        value={searchStudent}
                        onChange={(e) => setSearchStudent(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {students
                      .filter(s => (s.name || s.full_name || '').toLowerCase().includes(searchStudent.toLowerCase()))
                      .map(s => (
                        <div 
                          key={s._id} 
                          onClick={() => handleSelectStudent(s)} 
                          className={`p-3 cursor-pointer border-b dark:border-slate-700 flex items-center gap-3 transition-colors ${selectedStudent?._id === s._id ? 'bg-blue-50 dark:bg-slate-700 border-l-4 border-l-blue-500' : 'hover:bg-gray-100 dark:hover:bg-slate-700/50'}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <User size={18}/>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{s.name || s.full_name || 'Student'}</p>
                            <p className="text-xs text-gray-400 truncate">{s.email || ''}</p>
                          </div>
                        </div>
                      ))
                    }
                    {students.filter(s => (s.name || s.full_name || '').toLowerCase().includes(searchStudent.toLowerCase())).length === 0 && (
                      <div className="p-6 text-center text-gray-400 text-sm">No students found</div>
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="w-2/3 flex flex-col">
                  {/* Chat Header */}
                  <div className={`border-b p-4 dark:border-slate-700 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    {selectedStudent ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <User size={18}/>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{selectedStudent.name || selectedStudent.full_name || 'Student'}</h3>
                          <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle size={10}/> Online</p>
                        </div>
                      </div>
                    ) : (
                      <h3 className="font-bold text-gray-400">Select a student to start chatting</h3>
                    )}
                  </div>

                  {/* Messages Area */}
                  <div id="chat-messages" className="flex-1 p-4 overflow-y-auto space-y-3">
                    {!selectedStudent ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3"/>
                          <p className="text-gray-400">Choose a student from the list to start a conversation</p>
                        </div>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Send size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3"/>
                          <p className="text-gray-400">No messages yet. Say hello!</p>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map(m => {
                        const mine = isMyMessage(m);
                        return (
                          <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] ${mine ? 'order-1' : 'order-1'}`}>
                              <p className={`text-[10px] mb-1 px-1 ${mine ? 'text-right text-gray-400' : 'text-left text-gray-400'}`}>
                                {getSenderName(m)} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                mine 
                                  ? 'bg-blue-600 text-white rounded-br-md' 
                                  : `${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-bl-md`
                              }`}>
                                <p>{m.message}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-slate-700 flex gap-2">
                    <input 
                      required 
                      disabled={!selectedStudent}
                      placeholder={selectedStudent ? "Type a message..." : "Select a student first"} 
                      className={`flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300 placeholder-gray-400'} ${!selectedStudent ? 'opacity-50 cursor-not-allowed' : 'focus:border-blue-500'}`}
                      value={msgData.text} 
                      onChange={e => setMsgData(prev => ({ ...prev, text: e.target.value }))} 
                    />
                    <Button 
                      type="submit" 
                      disabled={!selectedStudent || !msgData.text.trim()}
                      className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${!selectedStudent || !msgData.text.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                    >
                      <Send size={18}/>
                    </Button>
                  </form>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};