import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, User, Briefcase, Award, Play, CheckCircle, 
  Upload, Brain, Moon, Sun, Camera, MapPin, 
  GraduationCap, Mail, Calendar, Phone, Globe, FileText, 
  Edit3, X, Save, Map as MapPinIcon, Search, Plus, 
  ClipboardList, Clock, Download, Printer, Award as Trophy, 
  ShieldCheck, Calendar as CalendarIcon, ArrowLeft, 
  MessageSquare, Send, Users, LogOut, XCircle
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeEnrollments, setActiveEnrollments] = useState([]); 
  
  const [approvedInternships, setApprovedInternships] = useState([]);
  const [cvFile, setCvFile] = useState(null); 
const [showApplyModal, setShowApplyModal] = useState(false); // ✅ أضف هذا
const [selectedInternship, setSelectedInternship] = useState(null); // ✅ أضف هذا
  
  const [exams, setExams] = useState([
      { 
          id: 1, 
          title: 'React Basics Quiz (Mock)', 
          questions: [
              { text: 'What is React?', options: ['Library', 'Framework', 'Language', 'Database'], correctIndex: 0 },
              { text: 'What is JSX?', options: ['JS XML', 'Java XML', 'JSON', 'None'], correctIndex: 0 }
          ]
      }
  ]); 
  const [currentExam, setCurrentExam] = useState(null); 
  const [examAnswers, setExamAnswers] = useState({});
  const [examResult, setExamResult] = useState(null);
  
 const [certificateModal, setCertificateModal] = useState(null); 
  
  const [workshops, setWorkshops] = useState([]);
  const [workshopSearch, setWorkshopSearch] = useState('');
  const [workshopLoading, setWorkshopLoading] = useState(false);

  const [teachersList, setTeachersList] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const chatEndRef = useRef(null);

  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: 'bot', text: 'Hi! How can I help you today? 🎓' }]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiChatEndRef = useRef(null);
  const WEBHOOK_URL = 'http://localhost:5678/webhook-test/chat';

  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  const [enrollments, setEnrollments] = useState([]); 
  const [interests, setInterests] = useState([]);
  const [apps, setApps] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  
  const [profileData, setProfileData] = useState({ 
    name: '', 
    bio: '', 
    university: '', 
    phone: '', 
    country: '', 
    level: '', 
    gradYear: '', 
    dob: '' 
  });
  
  const [trainingData, setTrainingData] = useState({ company: '', internship: '', cv: '' });
  const [testScore, setTestScore] = useState(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (activeEnrollments.length === 0) {
      setTeachersList([]);
      return;
    }
    const teachersMap = new Map();
    activeEnrollments.forEach(e => {
      if (e.course && e.course.teacher) {
        const t = e.course.teacher;
        if (t._id && !teachersMap.has(t._id)) {
          teachersMap.set(t._id, {
            _id: t._id,
            name: t.name || t.full_name || 'Teacher',
            email: t.email || '',
            courseTitle: e.course.title || ''
          });
        }
      }
    });
    setTeachersList(Array.from(teachersMap.values()));
  }, [activeEnrollments]);

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if(!token) {
        setLoading(false);
        return;
      }
  
      try {
        const safeParse = async (res) => {
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Non-JSON Response received:", text);
                return null;
            }
            return await res.json();
        };

        const cvRes = await fetch('http://localhost:5000/api/students/cv', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(cvRes.ok) {
          const cvData = await safeParse(cvRes);
          if(cvData) setEnrollments(cvData);
        } else {
            console.error("CV Fetch Error:", cvRes.statusText);
            setEnrollments([
                { _id: 101, completed_at: new Date(), course: { _id: 1, title: 'Full Stack Development', teacher: { name: 'Dr. Ahmad' }, duration_hours: 40, category: 'Programming' } }
            ]);
        }
  
        const enrollRes = await fetch('http://localhost:5000/api/enrollments/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(enrollRes.ok) {
          const enrollData = await safeParse(enrollRes);
          if(enrollData) setActiveEnrollments(enrollData);
        }
  
        const intRes = await fetch('http://localhost:5000/api/internships', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(intRes.ok) {
            const allInternships = await safeParse(intRes);
            if(allInternships) {
                setApprovedInternships(allInternships.filter(i => i.approval_status === 'approved'));
            }
        }
                // ✅ جلب قائمة الشركات عشان نربط الإيميل بالـ ID
        let compData = [];
        try {
          const compRes = await fetch('http://localhost:5000/api/companies', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (compRes.ok) {
            const data = await compRes.json();
            compData = Array.isArray(data) ? data : [];
          }
        } catch (e) {}
        setCompaniesList(compData);

        const wsRes = await fetch('http://localhost:5000/api/workshops', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (wsRes.ok) {
          const wsData = await wsRes.json();
          setWorkshops(wsData);
        } else {
          console.error("Workshops fetch error:", wsRes.statusText);
          setWorkshops([]);
        }
  
        setProfileData({
            name: user?.name || user?.email?.split('@')[0] || '',
            bio: '',
            university: '',
            phone: '',
            country: '',
            level: '',
            gradYear: '',
            dob: ''
        });
  
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, [user?.id]);

  const loadConversation = async (teacherId) => {
    if (!teacherId) {
      setChatMessages([]);
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/messages/conversation/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const msgs = await res.json();
        setChatMessages(msgs);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setChatMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return alert("Please select a teacher first");
    if (!messageText.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver: selectedTeacher._id,
          message: messageText
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setChatMessages(prev => [...prev, newMsg]);
        setMessageText('');
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Server Error");
    }
  };

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    loadConversation(teacher._id);
  };

  const isMyMessage = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    const myId = user?.id || user?._id;
    return senderId?.toString() === myId?.toString();
  };

  const sendAiMessage = async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;
    setAiMessages(prev => [...prev, { role: 'user', text }]);
    setAiInput('');
    setAiLoading(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setAiMessages(prev => [...prev, { role: 'bot', text: data.output || data.message || 'Error.' }]);
    } catch (err) {
      setAiMessages(prev => [...prev, { role: 'bot', text: 'Connection error.' }]);
    }
    setAiLoading(false);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/students/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          education_level: profileData.level, 
          university: profileData.university,
          graduating_year: profileData.gradYear, 
          country: profileData.country,
          date_of_birth: profileData.dob
        })
      });
      if (res.ok) {
        alert("Profile Updated Successfully!");
        setIsEditingProfile(false);
      } else { 
        alert("Error updating profile"); 
      }
    } catch (error) { 
      console.error(error); 
      alert("Server Error"); 
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/courses?title=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to fetch courses");

      const data = await res.json();
      
      const enrolledIds = activeEnrollments
        .filter(e => e && e.course && e.course._id)
        .map(e => e.course._id);
        
      const completedIds = enrollments
        .filter(c => c && c.course && c.course._id)
        .map(c => c.course._id);
      
      let available = data.filter(c => 
        c._id &&
        !enrolledIds.includes(c._id) && 
        !completedIds.includes(c._id)
      );

      available = available.filter(c => 
        c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(available);
    } catch (error) {
      console.error("Search Error:", error);
      alert("Error searching courses");
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/enrollments/${courseId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const fullCourseData = searchResults.find(c => c._id === courseId);
        if (!fullCourseData) { alert("Error: Course data lost"); return; }

        const newEnrollment = {
          _id: Date.now(),
          course: fullCourseData 
        };

        alert("Enrolled Successfully!");
        setSearchResults(searchResults.filter(c => c._id !== courseId));
        setActiveEnrollments([...activeEnrollments, newEnrollment]);
      } else {
        const errorText = await res.text();
        console.error("Enroll Error:", errorText);
        alert(`Failed to enroll: ${res.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleApply = async (e, { companyId, internshipId } = {}) => {
    if (e) e.preventDefault();
    
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      
      // ✅ الباكند متوقع اسم الحقل 'internship' مش 'internshipId'
      if (internshipId) formData.append('internship', internshipId);
      if (companyId) formData.append('companyId', companyId);
      
      if (cvFile) {
          formData.append('cv', cvFile);
      }

      const res = await fetch('http://localhost:5000/api/applications/apply', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData 
      });

      if (res.ok) {
        alert("Application Sent Successfully!");
        setCvFile(null); 
        setApps(prev => [...prev, {
          id: Date.now(), 
          companyId: companyId, 
          internshipId: internshipId,
          status: 'pending', 
          date: new Date()
        }]);
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to apply");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };
  const startExam = async (exam) => {
      const token = localStorage.getItem('token');
      setExamResult(null);
      
      try {
          if (exam.id && typeof exam.id === 'string' && exam.id.length > 5) {
              const res = await fetch(`http://localhost:5000/api/exams/${exam.id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
              });

              if (res.ok) {
                  const data = await res.json();
                  const formattedExam = {
                      id: data.exam._id,
                      title: data.exam.title,
                      questions: data.questions.map(q => ({
                          text: q.text,
                          options: q.options,
                          correctIndex: q.options.indexOf(q.correct_answer) 
                      }))
                  };
                  setCurrentExam(formattedExam);
                  setExamAnswers({});
              } else {
                  alert("Failed to load exam questions.");
              }
          } else {
              setCurrentExam(exam);
              setExamAnswers({});
          }
      } catch (error) {
          console.error("Error fetching exam:", error);
          alert("Server Error: Could not connect to backend.");
      }
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
      setExamAnswers({ ...examAnswers, [questionIndex]: optionIndex });
  };

  const submitExam = () => {
      let correctCount = 0;
      currentExam.questions.forEach((q, idx) => {
          if (examAnswers[idx] === q.correctIndex) correctCount++;
      });
      const score = Math.round((correctCount / currentExam.questions.length) * 100);
      setExamResult({ score, passed: score > 60 });
  };

  const handleFinishCourse = (course) => {
      if (window.confirm("Are you sure you want to mark this course as complete? You will receive a certificate.")) {
          setActiveEnrollments(activeEnrollments.filter(e => e.course._id !== course._id));
          const newCompletion = { _id: Date.now(), completed_at: new Date(), course };
          setEnrollments([...enrollments, newCompletion]);
          setCertificateModal(course);
          setSelectedCourse(null);
      }
  };

  const handleJoinWorkshop = async (workshopId) => {
    const token = localStorage.getItem('token');
    if (!token) return alert("Please login first");

    try {
      const res = await fetch(`http://localhost:5000/api/workshops/join/${workshopId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setWorkshops(prev =>
          prev.map(ws => {
            if (ws._id === workshopId) {
              return { ...ws, attendees: [...(ws.attendees || []), { _id: user?._id || user?.id }] };
            }
            return ws;
          })
        );
        alert("Registered Successfully!");
      } else {
        const errData = await res.json().catch(() => ({ message: "Failed to join" }));
        alert(errData.message || "Failed to register");
      }
    } catch (error) {
      console.error("Join workshop error:", error);
      alert("Server Error");
    }
  };

  const isStudentRegistered = (workshop) => {
    if (!workshop.attendees || !Array.isArray(workshop.attendees)) return false;
    const myId = user?._id || user?.id;
    return workshop.attendees.some(a => {
      const attendeeId = a?._id || a;
      return attendeeId?.toString() === myId?.toString();
    });
  };

  const filteredWorkshops = workshops.filter(ws =>
    ws.title?.toLowerCase().includes(workshopSearch.toLowerCase()) ||
    ws.description?.toLowerCase().includes(workshopSearch.toLowerCase())
  );

  const handlePrintCertificate = () => { window.print(); };

  const handleInterestToggle = (interest) => {
    setInterests(interests.includes(interest) ? interests.filter(i => i !== interest) : [...interests, interest]);
  };

  const interestOptions = ['Web Development', 'AI', 'Data Science', 'UI/UX', 'Cyber Security'];

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => { setActiveTab(id); setIsEditingProfile(false); setSelectedCourse(null); }} 
      className={`relative flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 
        ${activeTab === id 
          ? 'text-blue-600 dark:text-blue-400' 
          : 'text-gray-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-300' 
        }`}
    >
      <Icon size={18} /> 
      <span>{label}</span>
      {activeTab === id && (
        <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-lg"></span>
      )}
    </button>
  );

  const getVideoUrl = (video) => {
    if (!video) return '';
    if (video.url && video.url.startsWith('http')) return video.url;
    if (video.url && video.url.startsWith('/')) return `http://localhost:5000${video.url}`;
    return video.url || '';
  };

  const getVideoTitle = (video, index) => {
    if (!video) return `Video ${index + 1}`;
    return video.title || `Video ${index + 1}`;
  };

  return (
    <div className={`relative z-0 min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-slate-800'}`}>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-print-area, #certificate-print-area * { visibility: visible; }
          #certificate-print-area {
            position: absolute; left: 0; top: 0; width: 100%; height: 100%;
            z-index: 9999; background: white; margin: 0; padding: 0; border: none; box-shadow: none;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print">
      <header className="flex justify-between items-center py-8 px-6">
            <div className="text-left">
              <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Student Portal
              </h1>
              {/* ✅ 2. اسم الطالب الفعلي */}
              <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">
                Welcome, {user?.name || profileData.name || 'Student'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout} 
                className={`p-3 rounded-full transition-colors duration-200 ${darkMode ? 'bg-slate-800 text-red-400 hover:bg-red-900/30' : 'bg-gray-200 text-red-500 hover:bg-red-50'}`} 
                title="Logout"
              >
                <LogOut size={20} />
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className={`p-3 rounded-full transition-colors duration-200 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
        </header>
      </div>

      <div className={`flex overflow-x-auto border-b gap-2 rounded-t-xl px-2 shadow-sm mb-8 mx-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} no-print`}>
        <div>
            <div className="flex overflow-x-auto gap-2 scrollbar-hide">
                <TabButton id="profile" label="My Profile" icon={User} />
                <TabButton id="courses" label="My Courses" icon={BookOpen} />
                <TabButton id="workshops" label="Workshops" icon={CalendarIcon} />
                <TabButton id="exams" label="Exams" icon={ClipboardList} />
                <TabButton id="internships" label="Internships" icon={Briefcase} />
                <TabButton id="training" label="Training" icon={Award} />
                <TabButton id="messages" label="Messages" icon={MessageSquare} />
            </div>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center">Loading...</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="w-full px-6"
          >
            
            {/* --- 1. MY PROFILE SECTION --- */}
            {activeTab === 'profile' && (
              <div className="w-full relative">
                {!isEditingProfile && (
                  <div className="w-full no-print">
                    <div className="h-32 md:h-60 w-full bg-gradient-to-r from-black-600 via-primary-600 to-blue-600 relative">
                        <div className="absolute top-6 right-6">
                            <button 
                                onClick={() => setIsEditingProfile(true)}
                                className="bg-white text-blue-600 hover:bg-gray-50 shadow-lg border border-gray-100 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all"
                            >
                                <Edit3 size={16} /> Edit Profile
                            </button>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                            <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-300 blur-3xl"></div>
                        </div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-6 relative -mt-20 md:-mt-24 z-10 pb-12">
                        <div className="flex flex-col md:flex-row items-end md:items-end gap-6 mb-8">
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-8 border-white dark:border-slate-900 bg-gray-200 dark:bg-slate-800 shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                <User size={80} className="text-gray-400 dark:text-slate-600"/>
                            </div>
                            
                            <div className="flex-1 mb-2 text-center md:text-left">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">{profileData.name}</h2>
                                <p className="text-xl text-primary-600 dark:text-primary-400 font-medium mt-1">{profileData.level}</p>
                                <div className="flex flex-col md:flex-row items-center gap-4 mt-3 text-gray-600 dark:text-slate-400 text-sm">
                                    <span className="flex items-center gap-1"><MapPinIcon size={16} className="text-primary-500"/> {profileData.university}, {profileData.country}</span>
                                    <span className="hidden md:inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span className="flex items-center gap-1"><Calendar size={16} className="text-primary-500"/> Class of {profileData.gradYear}</span>
                                </div>
                            </div>
                            
                            <div className="hidden md:flex gap-4 mb-4">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 text-center min-w-[100px]">
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{enrollments.length + activeEnrollments.length}</p>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Courses</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 text-center min-w-[100px]">
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{interests.length}</p>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Interests</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <section className={`p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"><FileText size={20}/></div>
                                        About Me
                                    </h3>
                                    <p className="text-gray-600 dark:text-slate-400 leading-8 text-lg">{profileData.bio || "No bio added yet."}</p>
                                </section>

                                <section className={`p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><GraduationCap size={20}/></div>
                                        Education & Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                        <div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">University</p>
                                            <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{profileData.university}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Education Level</p>
                                            <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{profileData.level}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Graduation Year</p>
                                            <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{profileData.gradYear}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                                            <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{profileData.dob}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-8">
                                <section className={`p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Contact Information</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><Mail size={20}/></div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                                                <p className="text-slate-700 dark:text-slate-300 font-medium">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"><Phone size={20}/></div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                                                <p className="text-slate-700 dark:text-slate-300 font-medium">{profileData.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"><Globe size={20}/></div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase">Country</p>
                                                <p className="text-slate-700 dark:text-slate-300 font-medium">{profileData.country}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className={`p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Brain size={18} className="text-primary-500"/> Interests</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {interests.map(interest => (
                                            <span key={interest} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                                                {interest}
                                            </span>
                                        ))}
                                        {interests.length === 0 && <p className="text-sm text-gray-400 italic">No interests selected yet.</p>}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* === EDIT MODE === */}
                {isEditingProfile && (
                  <div className="max-w-6xl mx-auto px-6 py-8 no-print">
                    <div className={`rounded-3xl shadow-2xl overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <div className="p-8 md:p-10">
                            <div className="flex items-center justify-between mb-10 border-b border-gray-100 dark:border-slate-700 pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Profile</h2>
                                    <p className="text-sm text-gray-500 mt-1">Update your personal information and preferences.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsEditingProfile(false)}
                                        className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 flex items-center gap-2 transition-colors"
                                    >
                                        <X size={18} /> Cancel
                                    </button>
                                    <button 
                                        onClick={handleSaveProfile}
                                        className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/30 transition-colors"
                                    >
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <div className="w-32 h-32 mx-auto rounded-full bg-gray-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-4">
                                            <User size={50} className="text-gray-400"/>
                                        </div>
                                        <button className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1">
                                            <Camera size={16}/> Change Photo
                                        </button>
                                    </div>

                                    <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-100'}`}>
                                        <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Brain size={18} className="text-primary-600"/> My Interests</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {interestOptions.map(interest => (
                                                <button 
                                                    key={interest}
                                                    onClick={() => handleInterestToggle(interest)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                                                        interests.includes(interest) 
                                                        ? 'bg-primary-600 text-white border-primary-600 shadow-md' 
                                                        : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-500 hover:border-primary-600 hover:text-primary-600'
                                                    }`}
                                                >
                                                    {interest}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-8">
                                    <div>
                                        <h4 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-4">Personal Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                                <input 
                                                  value={profileData.name} 
                                                  onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                                                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                                                <input 
                                                  value={profileData.phone} 
                                                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                                                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                                                <input 
                                                  type="date" 
                                                  value={profileData.dob} 
                                                  onChange={(e) => setProfileData({...profileData, dob: e.target.value})} 
                                                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`} 
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                                                <select 
                                                  value={profileData.country} 
                                                  onChange={(e) => setProfileData({...profileData, country: e.target.value})} 
                                                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                                >
                                                    <option value="">Select Country</option>
                                                    <option>Jordan</option>
                                                    <option>Syria</option>
                                                    <option>UAE</option>
                                                    <option>Saudi Arabia</option>
                                                    <option>USA</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-4">Education</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">University / School</label>
                                                <input 
                                                  value={profileData.university} 
                                                  onChange={(e) => setProfileData({...profileData, university: e.target.value})} 
                                                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Education Level</label>
                                                <select 
                                                  value={profileData.level} 
                                                  onChange={(e) => setProfileData({...profileData, level: e.target.value})} 
                                                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                                >
                                                    <option value="">Select Level</option>
                                                    <option>Bachelor's Degree</option><option>Master's Degree</option><option>High School</option><option>PhD</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Graduation Year</label>
                                                <input 
                                                  type="number" 
                                                  value={profileData.gradYear} 
                                                  onChange={(e) => setProfileData({...profileData, gradYear: e.target.value})} 
                                                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-4">About Me</h4>
                                        <textarea 
                                          rows="4" 
                                          value={profileData.bio} 
                                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})} 
                                          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- 2. WORKSHOPS SECTION --- */}
            {activeTab === 'workshops' && (
                <div className="max-w-7xl mx-auto px-6 py-8 no-print">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <h2 className={`text-3xl font-bold text-left ${darkMode ? 'text-white' : 'text-slate-900'}`}>Available Workshops</h2>
                        
                        <div className="relative w-full md:w-96">
                            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="Search workshops by title or description..."
                                value={workshopSearch}
                                onChange={(e) => setWorkshopSearch(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/40 ${
                                    darkMode 
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                                        : 'bg-white border-gray-200 text-slate-800 placeholder-gray-400'
                                }`}
                            />
                            {workshopSearch && (
                                <button 
                                    onClick={() => setWorkshopSearch('')}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {workshopSearch && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 text-left">
                            Showing {filteredWorkshops.length} result{filteredWorkshops.length !== 1 ? 's' : ''} for "{workshopSearch}"
                        </p>
                    )}

                    {filteredWorkshops.length === 0 ? (
                        <div className={`p-16 text-center rounded-2xl border-2 border-dashed ${
                            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                        }`}>
                            <CalendarIcon size={48} className={`mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                            <p className={`text-lg font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                {workshopSearch ? 'No workshops match your search' : 'No workshops available right now'}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                {workshopSearch ? 'Try different keywords' : 'Check back later for new workshops'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredWorkshops.map(ws => {
                                const registered = isStudentRegistered(ws);
                                const attendeeCount = ws.attendees?.length || 0;
                                const isOnline = ws.meeting_link ? true : false;
                                const workshopDate = new Date(ws.date);
                                const isPast = workshopDate < new Date();
                                
                                // ✅ 3. إخفاء الورشات المنتهية بالكامل
                                if (isPast && !registered) return null;
                                
                                return (
                                    <div 
                                        key={ws._id} 
                                        className={`p-6 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md text-left ${
                                            registered 
                                                ? 'border-green-400 dark:border-green-500' 
                                                : 'border-transparent hover:border-blue-400'
                                        } ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`flex items-center gap-2 text-sm font-bold ${isPast ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                <CalendarIcon size={15} />
                                                {workshopDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                            {registered && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                                                    <CheckCircle size={12} /> Joined
                                                </span>
                                            )}
                                            {/* ✅ 3. تم شيل "Expired" بالكامل */}
                                        </div>

                                        <h4 className="font-bold text-lg mb-2 leading-tight text-left">{ws.title}</h4>
                                        
                                        <p className={`text-sm mb-4 line-clamp-3 min-h-[48px] text-left ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                            {ws.description || 'No description provided.'}
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                                <User size={13} className="text-blue-500" />
                                                <span>By: {ws.teacher?.email || 'Teacher'}</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                                <Globe size={13} className={isOnline ? 'text-green-500' : 'text-gray-400'} />
                                                <span>{isOnline ? 'Online Meeting' : 'No link provided'}</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                                <Users size={13} className="text-purple-500" />
                                                <span>{attendeeCount} registered</span>
                                            </div>
                                        </div>

                                        {registered ? (
                                            <div className="space-y-2">
                                                {ws.meeting_link && (
                                                    <a 
                                                        href={ws.meeting_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <Play size={15} /> Join Meeting
                                                    </a>
                                                )}
                                                <button disabled className="w-full py-2 bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-lg font-medium cursor-not-allowed text-sm">
                                                    <CheckCircle size={15} className="inline mr-1" /> Already Registered
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleJoinWorkshop(ws._id)}
                                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
                                            >
                                                <Plus size={15} /> Register Now
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* --- 3. COURSES SECTION --- */}
            {activeTab === 'courses' && (
              <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 no-print">
                 {selectedCourse ? (
                <div className={`w-full rounded-2xl border shadow-xl overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    
                    <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                        <button 
                            onClick={() => { setSelectedCourse(null); setCurrentVideoIndex(0); }} 
                            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4 font-medium"
                        >
                            <ArrowLeft size={18} /> Back to Courses
                        </button>
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedCourse.title}</h2>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{selectedCourse.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {selectedCourse.category && <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full">{selectedCourse.category}</span>}
                            {selectedCourse.level && <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full">{selectedCourse.level}</span>}
                            {selectedCourse.duration_hours && <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full flex items-center gap-1"><Clock size={12} /> {selectedCourse.duration_hours}h</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                        
                        <div className="lg:col-span-2 p-6">
                            {selectedCourse.videos && selectedCourse.videos.length > 0 ? (
                                <>
                                    <div className="relative w-full bg-black rounded-xl overflow-hidden aspect-video">
                                        <video
                                            key={currentVideoIndex}
                                            controls
                                            autoPlay
                                            className="w-full h-full"
                                            src={getVideoUrl(selectedCourse.videos[currentVideoIndex])}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {getVideoTitle(selectedCourse.videos[currentVideoIndex], currentVideoIndex)}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">Video {currentVideoIndex + 1} of {selectedCourse.videos.length}</p>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => setCurrentVideoIndex(Math.max(0, currentVideoIndex - 1))}
                                            disabled={currentVideoIndex === 0}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentVideoIndex === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            <ArrowLeft size={16} /> Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentVideoIndex(Math.min(selectedCourse.videos.length - 1, currentVideoIndex + 1))}
                                            disabled={currentVideoIndex === selectedCourse.videos.length - 1}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentVideoIndex === selectedCourse.videos.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            Next <ArrowLeft size={16} className="rotate-180" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className={`flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed ${darkMode ? 'border-slate-600 bg-slate-700/30' : 'border-gray-300 bg-gray-50'}`}>
                                    <Play size={48} className="text-gray-300 dark:text-slate-500 mb-4" />
                                    <p className="text-gray-400 dark:text-slate-400 font-medium">No videos available yet</p>
                                    <p className="text-xs text-gray-400 mt-1">The teacher hasn't uploaded videos for this course</p>
                                </div>
                            )}
                        </div>

                        <div className={`border-l p-4 ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
                            <h4 className={`font-bold mb-4 text-sm uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                                Videos ({selectedCourse.videos?.length || 0})
                            </h4>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                                {selectedCourse.videos && selectedCourse.videos.map((video, index) => (
                                    <button
                                        key={video._id || index}
                                        onClick={() => setCurrentVideoIndex(index)}
                                        className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 ${currentVideoIndex === index ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-blue-50 text-gray-700 border border-gray-200'}`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentVideoIndex === index ? 'bg-white/20 text-white' : darkMode ? 'bg-slate-600 text-slate-300' : 'bg-blue-100 text-blue-600'}`}>
                                            {currentVideoIndex === index ? <Play size={14} className="ml-0.5" /> : index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{getVideoTitle(video, index)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {selectedCourse.videos && selectedCourse.videos.length > 0 && (
                                <button
                                    onClick={() => handleFinishCourse(selectedCourse)}
                                    className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <CheckCircle size={18} /> Finish Course
                                </button>
                            )}
                        </div>
                    </div>

                    {selectedCourse.teacher && (
                        <div className={`p-6 border-t ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${darkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                    {(selectedCourse.teacher.name || selectedCourse.teacher.full_name || 'T').charAt(0)}
                                </div>
                                <div>
                                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedCourse.teacher.name || selectedCourse.teacher.full_name || 'Teacher'}</p>
                                    <p className="text-sm text-gray-500">{selectedCourse.teacher.specialization || selectedCourse.teacher.email || ''}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                ) : (
                  <>
                    <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-4 text-left ${darkMode ? 'text-white' : 'text-slate-900'}`}>Find Courses</h2>
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search by course title..."
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-blue-500'}`}
                                />
                            </div>
                            <button onClick={handleSearch} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
                                <Search size={18} /> Search
                            </button>
                        </div>
                    </div>

                    {searchResults.length > 0 && (
                        <div>
                            <h3 className={`text-lg font-bold mb-4 text-left ${darkMode ? 'text-white' : 'text-slate-900'}`}>Results ({searchResults.length})</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {searchResults.map(course => (
                                    <div key={course._id} className={`p-6 rounded-xl border shadow-sm hover:shadow-lg transition-all text-left ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                        {course.videos?.length > 0 && (
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <Play size={14} className="text-blue-500" />
                                                <span className="text-xs text-blue-500 font-semibold">{course.videos.length} Video(s)</span>
                                            </div>
                                        )}
                                        <h4 className="font-bold text-lg mb-2">{course.title}</h4>
                                        <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{course.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {course.category && <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">{course.category}</span>}
                                            {course.level && <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full">{course.level}</span>}
                                            {course.price !== undefined && <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">{course.price === 0 ? 'Free' : `$${course.price}`}</span>}
                                        </div>
                                        {course.teacher && <p className="text-xs text-gray-400 mb-4">By {course.teacher.name || course.teacher.full_name || 'Teacher'}</p>}
                                        <button onClick={() => handleEnroll(course._id)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                                            <Plus size={16} /> Enroll Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className={`text-xl font-bold mb-4 text-left ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Enrolled Courses ({activeEnrollments.length})</h3>
                        {activeEnrollments.length === 0 ? (
                            <div className={`p-12 text-center rounded-xl border-2 border-dashed ${darkMode ? 'border-slate-700' : 'border-gray-300'}`}>
                                <BookOpen size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
                                <p className="text-gray-400">No courses enrolled yet</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeEnrollments.map(enrollment => {
                                    const course = enrollment.course;
                                    if (!course) return null;
                                    return (
                                        <div
                                            key={enrollment._id || course._id}
                                            onClick={() => { setSelectedCourse(course); setCurrentVideoIndex(0); }}
                                            className={`p-6 rounded-xl border shadow-sm cursor-pointer hover:shadow-lg transition-all group text-left ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                        >
                                            {course.videos?.length > 0 && (
                                                <div className="flex items-center gap-1.5 mb-3">
                                                    <Play size={14} className="text-blue-500" />
                                                    <span className="text-xs text-blue-500 font-semibold">{course.videos.length} Video(s)</span>
                                                </div>
                                            )}
                                            <h4 className="font-bold text-lg mb-2 group-hover:text-blue-500 transition-colors">{course.title}</h4>
                                            <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{course.description}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-400">
                                                <span>Enrolled</span>
                                                <span className="flex items-center gap-1 text-blue-500 font-medium"><Play size={12} /> Watch</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {enrollments.length > 0 && (
                        <div>
                            <h3 className={`text-xl font-bold mb-4 text-left ${darkMode ? 'text-white' : 'text-slate-900'}`}>Completed ({enrollments.length})</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {enrollments.map(enrollment => {
                                    const course = enrollment.course;
                                    if (!course) return null;
                                    return (
                                        <div key={enrollment._id} className={`p-6 rounded-xl border shadow-sm text-left ${darkMode ? 'bg-slate-800 border-green-700/50' : 'bg-white border-green-200'}`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <CheckCircle size={16} className="text-green-500" />
                                                <span className="text-xs text-green-500 font-semibold">Completed</span>
                                            </div>
                                            <h4 className="font-bold text-lg mb-2">{course.title}</h4>
                                            <button onClick={() => setCertificateModal(course)} className="w-full mt-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm">
                                                <Award size={16} /> Certificate
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* --- 4. EXAMS SECTION --- */}
            {/* ✅ 4. زيّن عاليسار */}
            {activeTab === 'exams' && (
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 no-print text-left">
                    {currentExam ? (
                        <div className={`w-full max-w-3xl mx-auto rounded-2xl border shadow-xl overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                            <div className={`p-6 border-b ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{currentExam.title}</h2>
                                        <p className="text-sm text-gray-500">{currentExam.questions.length} Questions</p>
                                    </div>
                                    <button onClick={() => { setCurrentExam(null); setExamResult(null); setExamAnswers({}); }} className="text-gray-500 hover:text-red-500">
                                        <X size={24}/>
                                    </button>
                                </div>
                            </div>

                            {examResult ? (
                                <div className="p-8 text-center">
                                    <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 ${examResult.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {examResult.passed ? <Trophy size={64}/> : <XCircle size={64}/>}
                                    </div>
                                    <h3 className={`text-3xl font-bold mb-2 ${examResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {examResult.passed ? 'Passed!' : 'Failed'}
                                    </h3>
                                    <p className="text-xl text-gray-600 dark:text-slate-300 mb-6">Score: {examResult.score}%</p>
                                    <button onClick={() => { setCurrentExam(null); setExamResult(null); setExamAnswers({}); }} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                                        Back to Exams
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 space-y-6">
                                    {currentExam.questions.map((q, qIdx) => (
                                        <div key={qIdx} className={`p-5 rounded-xl border text-left ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                                            <p className="font-bold mb-4 text-slate-800 dark:text-white">Q{qIdx + 1}: {q.text}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options.map((opt, oIdx) => (
                                                    <button 
                                                        key={oIdx}
                                                        onClick={() => handleAnswerChange(qIdx, oIdx)}
                                                        className={`p-3 rounded-lg border text-left text-sm transition-all ${
                                                            examAnswers[qIdx] === oIdx 
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' 
                                                                : `${darkMode ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'}`
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={submitExam}
                                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-green-500/30"
                                        >
                                            <CheckCircle size={18}/> Submit Exam
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <h2 className={`text-3xl font-bold text-left ${darkMode ? 'text-white' : 'text-slate-900'}`}>Available Exams</h2>
                            {exams.length === 0 ? (
                                <div className="p-12 text-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed">
                                    <ClipboardList size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3"/>
                                    <p className="text-gray-500">No exams available right now.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {exams.map(exam => (
                                        <div key={exam.id} className={`p-6 rounded-xl border shadow-sm text-left ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                            <ClipboardList size={24} className="text-blue-500 mb-3"/>
                                            <h4 className="font-bold text-lg mb-2">{exam.title}</h4>
                                            <p className="text-sm text-gray-500 mb-4">{exam.questions.length} Questions</p>
                                            <button onClick={() => startExam(exam)} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                                <Play size={16}/> Start Exam
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* --- 5. INTERNSHIPS SECTION --- */}
            {/* ✅ 5. شيل "Approved" */}
            {activeTab === 'internships' && (
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 no-print">
                    <h2 className={`text-3xl font-bold text-left ${darkMode ? 'text-white' : 'text-slate-900'}`}>Available Internships</h2>
                    {approvedInternships.length === 0 ? (
                        <div className="p-12 text-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed">
                            <Briefcase size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3"/>
                            <p className="text-gray-500">No internships available right now.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {approvedInternships.map(intern => (
                                <div key={intern._id} className={`p-6 rounded-xl border shadow-sm text-left ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                    <Briefcase size={24} className="text-blue-500 mb-3"/>
                                    <h4 className="font-bold text-lg mb-1">{intern.title || intern.company_name || 'Internship'}</h4>
                                    <p className="text-sm text-gray-500 mb-1">{intern.location || 'Remote'}</p>
                                    {intern.company?.email && (
                                        <p className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-md inline-block mb-2 font-mono">
                                            {intern.company.email}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-400 line-clamp-3 mb-4">{intern.description || 'No description'}</p>
                                    <div className="flex items-center text-xs text-gray-400 mb-4">
                                        <span className="flex items-center gap-1"><Clock size={12}/> {intern.duration || '3 months'}</span>
                                    </div>
                                    <button 
    onClick={() => {
        setSelectedInternship(intern);
        setShowApplyModal(true);
        setCvFile(null); // نفضي الملف القديم إذا كان موجود
    }} 
    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
>
    Apply Now
</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
{activeTab === 'training' && (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 no-print">
        <h2 className={`text-3xl font-bold text-left ${darkMode ? 'text-white' : 'text-slate-900'}`}>Training Applications</h2>
        
        <div className={`p-8 rounded-2xl border shadow-sm text-left ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Submit Training Request</h3>
            <form onSubmit={(e) => handleApply(e)} className="space-y-6">
                
                {/* ✅ dropdown للشركة */}
                <div>
                    <label className="block text-sm font-medium mb-2">Select Company</label>
                    <select 
                        required
                        value={trainingData.company}
                        onChange={(e) => {
                            const newCompany = e.target.value;
                            setTrainingData(prev => ({ ...prev, company: newCompany, internship: '' }));
                        }}
                        className={`w-full px-4 py-3 rounded-xl border outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                    >
                        <option value="">-- Choose a Company --</option>
                        {[...new Map(approvedInternships.map(intern => {
                            const companyId = intern.company?._id || intern.company_id || intern.company;
                            const companyName = intern.company?.name || intern.company_name || (intern.company?.email ? intern.company.email.split('@')[0] : 'Unknown Company');
                            return [companyId, { id: companyId, name: companyName }];
                        }))].map(([id, info]) => (
                            <option key={id} value={id}>{info.name}</option>
                        ))}
                    </select>
                </div>

                {/* ✅ dropdown للـ Internship - جديد! */}
                <div>
                    <label className="block text-sm font-medium mb-2">Select Internship</label>
                    <select 
                        required
                        value={trainingData.internship}
                        onChange={(e) => setTrainingData({...trainingData, internship: e.target.value})}
                        className={`w-full px-4 py-3 rounded-xl border outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                        disabled={!trainingData.company}
                    >
                        <option value="">-- Choose an Internship --</option>
                        {trainingData.company && approvedInternships
                            .filter(intern => {
                                const companyId = intern.company?._id || intern.company_id || intern.company;
                                return companyId?.toString() === trainingData.company?.toString();
                            })
                            .map(intern => (
                                <option key={intern._id} value={intern._id}>
                                    {intern.title} - {intern.location || 'Remote'}
                                </option>
                            ))
                        }
                    </select>
                    {!trainingData.company && (
                        <p className="text-xs text-gray-400 mt-2">Select a company first</p>
                    )}
                </div>

                {/* CV Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2">Upload CV</label>
                    <input 
                      type="file" 
                      id="cv-file-input" 
                      accept=".pdf,.doc,.docx" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="cv-file-input"
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-900/10 ${
                        darkMode ? 'border-slate-600' : 'border-gray-300'
                      }`}
                    >
                      <Upload size={32} className="text-blue-500 mb-2"/>
                      <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        {cvFile ? cvFile.name : 'Click here to choose a file'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX</span>
                    </label>
                </div>

                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                    <Send size={18}/> Submit Application
                </button>
            </form>
        </div>

        {/* My Applications */}
        {apps.length > 0 && (
            <div>
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">My Applications</h3>
                <div className="space-y-3">
                    {apps.map(app => (
                        <div key={app.id} className={`flex items-center justify-between p-4 rounded-xl border text-left ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                            <div>
                                <p className="font-semibold">{app.companyName}</p>
                                {app.internshipId && <p className="text-xs text-blue-400">Internship ID: {app.internshipId}</p>}
                                <p className="text-xs text-gray-400">{new Date(app.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                                app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                            }`}>{app.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
)}

            {/* --- 7. MESSAGES SECTION --- */}
            {/* ✅ 7. شيل "re" تحت الإيميل */}
            {activeTab === 'messages' && (
              <div className={`max-w-7xl mx-auto rounded-xl border h-[600px] flex overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                
                <div className={`w-1/3 border-r flex flex-col text-left ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="font-bold mb-1">My Teachers</h3>
                    <p className="text-xs text-gray-400">Teachers from your enrolled courses</p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {teachersList.length === 0 ? (
                      <div className="p-6 text-center">
                        <User size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-2"/>
                        <p className="text-sm text-gray-400">No teachers found.</p>
                        <p className="text-xs text-gray-400 mt-1">Enroll in courses to see your teachers here.</p>
                      </div>
                    ) : (
                      teachersList.map(t => (
                        <div 
                          key={t._id} 
                          onClick={() => handleSelectTeacher(t)} 
                          className={`p-4 cursor-pointer border-b dark:border-slate-700 flex items-center gap-3 transition-colors ${selectedTeacher?._id === t._id ? 'bg-blue-50 dark:bg-slate-700 border-l-4 border-l-blue-500' : 'hover:bg-gray-100 dark:hover:bg-slate-700/50'}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
                            <GraduationCap size={18}/>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{t.name}</p>
                            <p className="text-xs text-gray-400 truncate">{t.email}</p>
                            {/* ✅ 7. تم شيل سطر courseTitle اللي كان تحت الإيميل */}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="w-2/3 flex flex-col">
                  <div className={`border-b p-4 dark:border-slate-700 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    {selectedTeacher ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                          <GraduationCap size={18}/>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{selectedTeacher.name}</h3>
                          <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle size={10}/> Teacher</p>
                        </div>
                      </div>
                    ) : (
                      <h3 className="font-bold text-gray-400">Select a teacher to start chatting</h3>
                    )}
                  </div>

                  <div id="chat-messages" className="flex-1 p-4 overflow-y-auto space-y-3">
                    {!selectedTeacher ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3"/>
                          <p className="text-gray-400">Choose a teacher from the list to start a conversation</p>
                        </div>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Send size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3"/>
                          <p className="text-gray-400">No messages yet. Say hello to {selectedTeacher.name}!</p>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map(m => {
                        const mine = isMyMessage(m);
                        return (
                          <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[75%]">
                              <p className={`text-[10px] mb-1 px-1 ${mine ? 'text-right text-gray-400' : 'text-left text-gray-400'}`}>
                                {mine ? 'You' : selectedTeacher.name} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

                  <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-slate-700 flex gap-2">
                    <input 
                      required 
                      disabled={!selectedTeacher}
                      placeholder={selectedTeacher ? `Message ${selectedTeacher.name}...` : "Select a teacher first"} 
                      className={`flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300 placeholder-gray-400'} ${!selectedTeacher ? 'opacity-50 cursor-not-allowed' : 'focus:border-blue-500'}`}
                      value={messageText} 
                      onChange={e => setMessageText(e.target.value)} 
                    />
                    <Button 
                      type="submit" 
                      disabled={!selectedTeacher || !messageText.trim()}
                      className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                        !selectedTeacher || !messageText.trim()
                          ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                      }`}
                    >
                      <Send size={16} />
                    </Button>
                  </form>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}

      {/* ✅ Certificate Modal */}
      {certificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div id="certificate-print-area" className={`w-full max-w-3xl p-10 rounded-2xl border shadow-2xl ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'}`}>
            <div className="text-center">
              <div className="mb-4">
                <Award size={48} className="mx-auto text-amber-500" />
              </div>
              <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">Certificate of Completion</h2>
              <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mb-6"></div>
              <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">This is to certify that</p>
              <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">{user?.name || profileData.name || 'Student'}</h3>
              <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">has successfully completed</p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{certificateModal.title}</h4>
              <p className="text-gray-400 text-sm mb-8">Issued on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <div className="flex justify-center gap-4 no-print">
                <button onClick={handlePrintCertificate} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
                  <Printer size={18} /> Print Certificate
                </button>
                <button onClick={() => setCertificateModal(null)} className="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-medium flex items-center gap-2 transition-colors hover:bg-gray-300 dark:hover:bg-slate-600">
                  <X size={18} /> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ AI Chatbot Floating Button & Modal */}
      <div className="fixed bottom-6 right-6 z-50 no-print">
        {isAiChatOpen ? (
          <div className={`w-96 h-[500px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <h3 className="font-bold text-sm flex items-center gap-2"><Brain size={18} className="text-purple-500"/> AI Assistant</h3>
              <button onClick={() => setIsAiChatOpen(false)} className="text-gray-400 hover:text-red-500"><X size={18}/></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {aiMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-md' 
                      : `${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-bl-md`
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className={`px-4 py-2.5 rounded-2xl rounded-bl-md text-sm ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={aiChatEndRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendAiMessage(); }} className="p-3 border-t dark:border-slate-700 flex gap-2">
              <input 
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                placeholder="Ask me anything..."
                className={`flex-1 px-4 py-2 rounded-xl text-sm border outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200'}`}
              />
              <button type="submit" disabled={aiLoading} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-1 text-sm font-medium disabled:opacity-50">
                <Send size={14}/>
              </button>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setIsAiChatOpen(true)}
            className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/40 flex items-center justify-center transition-all hover:scale-110"
          >
            <Brain size={24}/>
          </button>
        )}
      </div>

      {/* --- هنا حط كود المودل --- */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-print"
            onClick={() => setShowApplyModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-md mx-4 p-6 rounded-2xl shadow-2xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-slate-800'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Apply to Internship</h3>
                <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
              </div>
              
              {/* Internship Info */}
              {selectedInternship && (
                <div className={`p-4 rounded-xl mb-6 border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-100'}`}>
                  <h4 className="font-bold text-blue-600 dark:text-blue-400">{selectedInternship.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{selectedInternship.location || 'Remote'}</p>
                </div>
              )}

              {/* CV Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload your CV (Optional)</label>
                <input 
                  type="file" 
                  id="modal-cv-input"
                  accept=".pdf,.doc,.docx" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <label 
                  htmlFor="modal-cv-input"
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-900/10 ${
                    darkMode ? 'border-slate-600' : 'border-gray-300'
                  }`}
                >
                  <Upload size={28} className="text-blue-500 mb-2"/>
                  <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    {cvFile ? cvFile.name : 'Click to choose CV file'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowApplyModal(false)} 
                  className={`flex-1 py-3 rounded-xl font-medium border transition-colors ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={(e) => {
                    handleApply(e, { internshipId: selectedInternship._id });
                    setShowApplyModal(false); 
                  }} 
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};