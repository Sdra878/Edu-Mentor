import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, User, Briefcase, Award, Play, CheckCircle, 
  Upload, Brain, Moon, Sun, Camera, MapPin, 
  GraduationCap, Mail, Calendar, Phone, Globe, FileText, 
  Edit3, X, Save, Map as MapPinIcon, Search, Plus, ClipboardList, Clock, Download, Printer, Award as Trophy, ShieldCheck, Calendar as CalendarIcon, ArrowLeft, MessageSquare, Send
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeEnrollments, setActiveEnrollments] = useState([]); 
  
  const [approvedInternships, setApprovedInternships] = useState([]);
  const [cvFile, setCvFile] = useState(null); 
  
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
  const [registeredWorkshops, setRegisteredWorkshops] = useState([]);

  // ✅ رسائل: حالات المراسلة
  const [teachersList, setTeachersList] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const chatEndRef = useRef(null);
    // ✅ AI Chatbot States
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: 'bot', text: 'Hi! How can I help you today? 🎓' }]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiChatEndRef = useRef(null);
  const WEBHOOK_URL = 'http://localhost:5678/webhook-test/chat'; // ضع رابط الويب هوك هنا

  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);


  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  const [enrollments, setEnrollments] = useState([]); 
  const [interests, setInterests] = useState([]);
  const [apps, setApps] = useState([]);
  
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
  
  const [trainingData, setTrainingData] = useState({ company: '', cv: '' });
  const [testScore, setTestScore] = useState(null);

  // ✅ رسائل: تلقائي اسكرول لآخر رسالة
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // ✅ رسائل: استخراج المدرسين من الكورسات المسجلة
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

  // === 1. جلب البيانات ===
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

        setWorkshops([
            { id: 1, title: 'Advanced React Patterns', date: '2023-11-15', location: 'Online', capacity: 50, enrolled: 12 },
            { id: 2, title: 'Cyber Security Basics', date: '2023-11-20', location: 'Room 101', capacity: 30, enrolled: 5 }
        ]);
  
        setProfileData({
            name: user?.name || 'Student Name',
            bio: '',
            university: '',
            phone: '',
            country: 'Jordan',
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

  // ✅ رسائل: جلب محادثة مع مدرس معيّن
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

  // ✅ رسائل: إرسال رسالة
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) {
      return alert("Please select a teacher first");
    }
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

  // ✅ رسائل: عند اختيار مدرس → حمّل المحادثة
  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    loadConversation(teacher._id);
  };

  // ✅ رسائل: تحقق إذا الرسالة مني
  const isMyMessage = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    const myId = user?.id || user?._id;
    return senderId?.toString() === myId?.toString();
  };

    // ✅ AI Chatbot Function
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

  // === 2. حفظ البروفايل ===
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
      
      if (!res.ok) {
          throw new Error("Failed to fetch courses");
      }

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
        // ✅ أوجد الكورس الكامل من نتائج البحث (اللي فيها الفيديوهات وبيانات الاستاذ)
        const fullCourseData = searchResults.find(c => c._id === courseId);
        
        if (!fullCourseData) {
          alert("Error: Course data lost");
          return;
        }

        // ✅ أنشئ عنصر تسجيل يحتوي على بيانات الكورس كاملة (وليس البيانات الفارغة من الباك إند)
        const newEnrollment = {
          _id: Date.now(), // ID مؤقت للواجهة
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

  const handleApply = async (e, companyIdOverride = null) => {
    if (e) e.preventDefault();
    const targetCompanyId = companyIdOverride || trainingData.company;

    if (!targetCompanyId) {
      alert("Please enter a company ID or Name");
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('companyId', targetCompanyId);
      
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
        const result = await res.json();
        alert("Application Sent Successfully!");
        
        setTrainingData({ company: '', cv: '' });
        setCvFile(null); 
        
        setApps([...apps, {
          id: result._id || Date.now(), 
          companyName: targetCompanyId, 
          status: 'pending', 
          date: new Date()
        }]);
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to apply");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error: Could not connect to backend");
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
      setExamAnswers({
          ...examAnswers,
          [questionIndex]: optionIndex
      });
  };

  const submitExam = () => {
      let correctCount = 0;
      currentExam.questions.forEach((q, idx) => {
          if (examAnswers[idx] === q.correctIndex) {
              correctCount++;
          }
      });
      const score = Math.round((correctCount / currentExam.questions.length) * 100);
      setExamResult({ score, passed: score > 60 });
  };

  const handleFinishCourse = (course) => {
      if (window.confirm("Are you sure you want to mark this course as complete? You will receive a certificate.")) {
          setActiveEnrollments(activeEnrollments.filter(e => e.course._id !== course._id));
          const newCompletion = {
              _id: Date.now(),
              completed_at: new Date(),
              course: course
          };
          setEnrollments([...enrollments, newCompletion]);
          setCertificateModal(course);
          setSelectedCourse(null);
      }
  };

  const handleRegisterWorkshop = (workshopId) => {
      if(registeredWorkshops.includes(workshopId)) return;
      setRegisteredWorkshops([...registeredWorkshops, workshopId]);
      setWorkshops(workshops.map(w => w.id === workshopId ? {...w, enrolled: w.enrolled + 1} : w));
      alert("Registered Successfully!");
  };

  const handlePrintCertificate = () => {
      window.print();
  };

  const handleInterestToggle = (interest) => {
    setInterests(interests.includes(interest) ? interests.filter(i => i !== interest) : [...interests, interest]);
  };

  const interestOptions = ['Web Development', 'AI', 'Data Science', 'UI/UX', 'Cyber Security'];

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => { 
        setActiveTab(id); 
        setIsEditingProfile(false); 
        setSelectedCourse(null);
      }} 
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

  return (
    <div className={`relative z-0 min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-slate-800'}`}>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #
          @keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}certificate-print-area, #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            background: white;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print">
      <header className="flex justify-between items-center py-8 px-6">
            <div className="text-left">
              <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Student Portal
              </h1>
              <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">
                Welcome, {profileData.name || user?.name || 'Student'}
              </p>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`p-3 rounded-full transition-colors duration-200 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
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
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Degree Level</p>
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
                                                    <option>Jordan</option><option>UAE</option><option>Saudi Arabia</option><option>USA</option>
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
                    <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Available Workshops</h2>
                    {workshops.length === 0 ? (
                        <div className="p-12 text-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed">
                            <p className="text-gray-500">No workshops available right now.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workshops.map(ws => (
                                <div key={ws.id} className={`p-6 rounded-xl border shadow-sm hover:border-blue-400 transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                    <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold"><CalendarIcon size={16} /> {ws.date}</div>
                                    <div className="mb-4">
                                        <h4 className="font-bold text-lg">{ws.title}</h4>
                                        <p className="text-xs text-gray-500 mb-2 mt-1">{ws.location}</p>
                                        <p className="text-sm text-gray-400 line-clamp-2 h-10">Join us for an exciting session on {ws.title}.</p>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                                        <span>Seats: {ws.enrolled} / {ws.capacity}</span>
                                        <span className={ws.capacity - ws.enrolled <= 5 ? 'text-red-500' : 'text-green-500'}>
                                            {ws.capacity - ws.enrolled <= 5 ? 'Filling Fast' : 'Available'}
                                        </span>
                                    </div>
                                    {registeredWorkshops.includes(ws.id) ? (
                                        <button disabled className="w-full py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed">
                                            Registered
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleRegisterWorkshop(ws.id)}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} /> Register Now
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- 3. COURSES SECTION --- */}
            {activeTab === 'courses' && (
              <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 no-print">
                 
               {selectedCourse ? (
    <div className={`w-full rounded-2xl border shadow-xl overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        
        {/* ✅ عرض الفيديو إذا موجود */}
        {selectedCourse.videos && selectedCourse.videos.length > 0 ? (
            <div className="w-full aspect-video bg-black">
                <video 
                    key={selectedCourse.videos[currentVideoIndex]?.url} 
                    className="w-full h-full"
                    controls
                    autoPlay
                >
                    <source 
                        src={selectedCourse.videos[currentVideoIndex]?.url?.startsWith('http') 
                            ? selectedCourse.videos[currentVideoIndex].url 
                            : `http://localhost:5000${selectedCourse.videos[currentVideoIndex].url}`
                        } 
                        type="video/mp4" 
                    />
                    Your browser does not support the video tag.
                </video>
            </div>
        ) : (
            /* لو مفيش فيديو */
            <div className="w-full aspect-video bg-black flex items-center justify-center relative group">
                <Play size={64} className="text-white/50 group-hover:text-white transition-colors" />
                <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                    <p className="text-sm opacity-75">No videos available</p>
                </div>
            </div>
        )}

        {/* ✅ قائمة الفيديوهات (Playlist) */}
        {selectedCourse.videos && selectedCourse.videos.length > 0 && (
            <div className={`p-4 border-t ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                    <Play size={16} className="text-blue-500" /> 
                    Course Videos ({selectedCourse.videos.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedCourse.videos.map((video, index) => (
                        <button
                            key={video._id || index}
                            onClick={() => setCurrentVideoIndex(index)}
                            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-all ${
                                currentVideoIndex === index
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : darkMode
                                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                currentVideoIndex === index ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-slate-300'
                            }`}>
                                {currentVideoIndex === index ? (
                                    <Play size={14} className="ml-0.5" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span className="text-sm font-medium truncate">{video.title || `Video ${index + 1}`}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* ✅ تفاصيل الكورس */}
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {selectedCourse.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        By: {selectedCourse.teacher?.name || selectedCourse.teacher?.full_name || 'Unknown Teacher'}
                    </p>
                </div>
                <button 
                    onClick={() => setSelectedCourse(null)} 
                    className="text-gray-500 hover:text-red-500 p-2"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
                {selectedCourse.category && (
                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full font-medium">
                        {selectedCourse.category}
                    </span>
                )}
                {selectedCourse.level && (
                    <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full font-medium">
                        {selectedCourse.level}
                    </span>
                )}
                {selectedCourse.duration_hours && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Clock size={12} /> {selectedCourse.duration_hours} Hours
                    </span>
                )}
            </div>

            <p className={`leading-relaxed mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                {selectedCourse.description}
            </p>

            <button 
                onClick={() => handleFinishCourse(selectedCourse)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
                <CheckCircle size={18} /> Mark as Complete
            </button>
        </div>
    </div>
) : (
    /* ... باقي كود عرض الكورسات كـ كاردز ... */

                    <>
                        {/* Search Bar */}
                        <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Find & Enroll in Courses</h2>
                            <div className="flex gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Search by course title..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className={`flex-1 px-4 py-3 rounded-xl border outline-none text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                                />
                                <button onClick={handleSearch} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
                                    <Search size={18}/> Search
                                </button>
                            </div>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">Search Results</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {searchResults.map(c => (
                                        <div key={c._id} className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                            <h4 className="font-bold text-lg mb-2">{c.title}</h4>
                                            <p className="text-sm text-gray-500 mb-2">{c.category} · {c.level}</p>
                                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{c.description}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-blue-600">${c.price || 0}</span>
                                                <button onClick={() => handleEnroll(c._id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Enroll</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Active Enrollments */}
                        <div>
                            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Active Courses</h3>
                            {activeEnrollments.length === 0 ? (
                                <div className="p-12 text-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed">
                                    <BookOpen size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3"/>
                                    <p className="text-gray-500">No active courses. Search and enroll above!</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeEnrollments.map(e => (
                                        <div 
                                            key={e._id} 
                                            onClick={() => setSelectedCourse(e)} 
                                            className={`p-6 rounded-xl border shadow-sm cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                                                <Play size={16}/> Continue Learning
                                            </div>
                                            <h4 className="font-bold text-lg mb-1">{e.course?.title || 'Untitled Course'}</h4>
                                            <p className="text-sm text-gray-500">{e.course?.teacher?.name || 'Unknown Instructor'}</p>
                                            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                                                <span>{e.course?.category || ''}</span>
                                                <span>{e.course?.duration_hours || 0}h</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Completed Courses / Certificates */}
                        {enrollments.length > 0 && (
                            <div>
                                <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Completed Courses & Certificates</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {enrollments.map(c => (
                                        <div key={c._id} className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                            <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
                                                <Trophy size={16}/> Completed
                                            </div>
                                            <h4 className="font-bold text-lg mb-1">{c.course?.title || 'Course'}</h4>
                                            <p className="text-sm text-gray-500 mb-3">{c.course?.teacher?.name || ''} · {new Date(c.completed_at).toLocaleDateString()}</p>
                                            <button onClick={() => setCertificateModal(c.course)} className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                                <Award size={16}/> View Certificate
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Certificate Modal */}
                {certificateModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className={`w-full max-w-3xl rounded-2xl shadow-2xl p-8 relative ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                            <button onClick={() => setCertificateModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 no-print"><X size={24}/></button>
                            
                            <div id="certificate-print-area" className={`border-4 border-double border-amber-500 p-10 text-center ${darkMode ? 'bg-slate-900' : 'bg-amber-50'}`}>
                                <Trophy size={48} className="mx-auto text-amber-500 mb-4"/>
                                <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">Certificate of Completion</h2>
                                <p className="text-gray-500 mb-8">This is to certify that</p>
                                <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">{profileData.name || user?.name}</h3>
                                <p className="text-gray-600 dark:text-slate-300 mb-2">has successfully completed the course</p>
                                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{certificateModal.title}</h4>
                                <div className="flex justify-around items-end mt-8">
                                    <div>
                                        <div className="w-40 border-b-2 border-gray-400 mb-2"></div>
                                        <p className="text-sm text-gray-500">Instructor</p>
                                    </div>
                                    <div>
                                        <div className="w-40 border-b-2 border-gray-400 mb-2"></div>
                                        <p className="text-sm text-gray-500">Date</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 no-print">
                                <button onClick={handlePrintCertificate} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                                    <Printer size={16}/> Print Certificate
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
              </div>
            )}

            {/* --- 4. EXAMS SECTION --- */}
            {activeTab === 'exams' && (
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 no-print">
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
                                        <div key={qIdx} className={`p-5 rounded-xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
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
                            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Available Exams</h2>
                            {exams.length === 0 ? (
                                <div className="p-12 text-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed">
                                    <ClipboardList size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3"/>
                                    <p className="text-gray-500">No exams available right now.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {exams.map(exam => (
                                        <div key={exam.id} className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
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
            {activeTab === 'internships' && (
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 no-print">
                    <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Available Internships</h2>
                    {approvedInternships.length === 0 ? (
                        <div className="p-12 text-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed">
                            <Briefcase size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3"/>
                            <p className="text-gray-500">No approved internships available right now.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {approvedInternships.map(intern => (
                                <div key={intern._id} className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                    <Briefcase size={24} className="text-blue-500 mb-3"/>
                                    <h4 className="font-bold text-lg mb-1">{intern.title || intern.company_name || 'Internship'}</h4>
                                    <p className="text-sm text-gray-500 mb-2">{intern.location || 'Remote'}</p>
                                    <p className="text-sm text-gray-400 line-clamp-3 mb-4">{intern.description || 'No description'}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                                        <span className="flex items-center gap-1"><Clock size={12}/> {intern.duration || '3 months'}</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Approved</span>
                                    </div>
                                    <button onClick={(e) => handleApply(e, intern.company?._id || intern._id)} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                        Apply Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- 6. TRAINING SECTION --- */}
            {activeTab === 'training' && (
                <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 no-print">
                    <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Training Applications</h2>
                    
                    <div className={`p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Submit Training Request</h3>
                        <form onSubmit={(e) => handleApply(e)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Company Name / ID</label>
                                <input 
                                    required
                                    value={trainingData.company}
                                    onChange={(e) => setTrainingData({...trainingData, company: e.target.value})}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                                    placeholder="Enter company name or ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Upload CV</label>
                                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${darkMode ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-gray-400'} transition-colors`}>
                                    <Upload size={32} className="mx-auto text-gray-400 mb-2"/>
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="text-sm"/>
                                    {cvFile && <p className="text-sm text-green-500 mt-2">Selected: {cvFile.name}</p>}
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                                <Send size={18}/> Submit Application
                            </button>
                        </form>
                    </div>

                    {apps.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">My Applications</h3>
                            <div className="space-y-3">
                                {apps.map(app => (
                                    <div key={app.id} className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                        <div>
                                            <p className="font-semibold">{app.companyName}</p>
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

            {/* ✅ --- 7. MESSAGES SECTION --- مزبطّت بالكامل */}
            {activeTab === 'messages' && (
              <div className={`max-w-7xl mx-auto rounded-xl border h-[600px] flex overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                
                {/* Sidebar - Teachers List */}
                <div className={`w-1/3 border-r flex flex-col ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="font-bold mb-3">My Teachers</h3>
                    <p className="text-xs text-gray-400 mb-2">Teachers from your enrolled courses</p>
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
                            <p className="text-[10px] text-blue-500 truncate mt-0.5">{t.courseTitle}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="w-2/3 flex flex-col">
                  {/* Chat Header */}
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

                  {/* Messages Area */}
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

                  {/* Message Input */}
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
                      className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${!selectedTeacher || !messageText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
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
            {/* ✅ AI Chatbot Floating UI */}
      <>
        <button 
          onClick={() => setIsAiChatOpen(!isAiChatOpen)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white items-center justify-center shadow-2xl z-50 transition-transform hover:scale-110"
          style={{ display: 'flex' }}
        >
          {isAiChatOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </button>

        {isAiChatOpen && (
          <div className={`fixed bottom-24 right-6 w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-slate-800'}`}
               style={{ animation: 'slideUp 0.3s ease' }}>
            
            <div className="p-4 bg-blue-600 text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
              <div>
                <h3 className="font-bold">Smart AI Assistant</h3>
                <span className="text-xs text-blue-200 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span> Online</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ background: darkMode ? '#1e293b' : '#f8fafc' }}>
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md' : `${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-700 border border-gray-100'} rounded-bl-md`}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-2xl rounded-bl-md ${darkMode ? 'bg-slate-700' : 'bg-white border border-gray-100'}`}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={aiChatEndRef} />
            </div>

            <div className={`p-3 flex gap-2 border-t ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                placeholder="Ask me anything..."
                className={`flex-1 px-4 py-2.5 rounded-xl border outline-none text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-slate-800'}`}
                disabled={aiLoading}
              />
              <button 
                onClick={sendAiMessage} 
                disabled={aiLoading || !aiInput.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition-colors flex items-center"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </>
    </div>
  );
};