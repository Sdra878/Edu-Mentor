import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, User, Briefcase, Award, Play, CheckCircle, 
  Upload, Brain, Moon, Sun, Camera, MapPin, 
  GraduationCap, Mail, Calendar, Phone, Globe, FileText, 
  Edit3, X, Save, Map as MapPinIcon, Search, Plus, ClipboardList, Clock, Download, Printer, Award as Trophy, ShieldCheck, Calendar as CalendarIcon
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // States للبحث والتسجيل
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeEnrollments, setActiveEnrollments] = useState([]); 
  
  // --- State: الوظائف والملف ---
  const [approvedInternships, setApprovedInternships] = useState([]);
  const [cvFile, setCvFile] = useState(null); 
  
  // --- EXAMS STATES ---
  // ملاحظة: هنا نضع بيانات وهمية للعرض في القائمة، ولكن عند الضغط سنقوم بالجلب من الباك إند
  const [exams, setExams] = useState([
      // يمكنك إضافة الـ ID الخاص بالامتحان الذي أنشأته في لوحة المعلم هنا لتجربته
      // مثال: { id: "YOUR_EXAM_ID_FROM_DB", title: 'Exam from Backend', questions: [] }
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
  
  // --- CERTIFICATE STATE ---
  const [certificateModal, setCertificateModal] = useState(null); 
  
  // --- NEW: WORKSHOPS STATES ---
  const [workshops, setWorkshops] = useState([]);
  const [registeredWorkshops, setRegisteredWorkshops] = useState([]);
  
  // Data States
  const [enrollments, setEnrollments] = useState([]); 
  const [interests, setInterests] = useState([]);
  const [apps, setApps] = useState([]);
  
  // Profile Data
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

        // أ) جلب الكورسات المكتملة (My CV) - هون رح تظهر الشهادات
        const cvRes = await fetch('http://localhost:5000/api/students/cv', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(cvRes.ok) {
          const cvData = await safeParse(cvRes);
          if(cvData) setEnrollments(cvData);
        } else {
            console.error("CV Fetch Error:", cvRes.statusText);
            // Mock Data للتجربة
            setEnrollments([
                { _id: 101, completed_at: new Date(), course: { _id: 1, title: 'Full Stack Development', teacher: { name: 'Dr. Ahmad' }, duration_hours: 40, category: 'Programming' } }
            ]);
        }
  
        // ب) جلب الكورسات النشطة
        const enrollRes = await fetch('http://localhost:5000/api/enrollments/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(enrollRes.ok) {
          const enrollData = await safeParse(enrollRes);
          if(enrollData) setActiveEnrollments(enrollData);
        }
  
        // ج) جلب الوظائف
        const intRes = await fetch('http://localhost:5000/api/internships', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if(intRes.ok) {
            const allInternships = await safeParse(intRes);
            if(allInternships) {
                setApprovedInternships(allInternships.filter(i => i.approval_status === 'approved'));
            }
        }

        // --- NEW: MOCK WORKSHOPS ---
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

  // === 3. البحث عن كورس ===
  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/courses?title=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      const enrolledIds = activeEnrollments.map(e => e.course._id);
      const completedIds = enrollments.map(c => c.course._id);
      
      let available = data.filter(c => 
        !enrolledIds.includes(c._id) && !completedIds.includes(c._id)
      );

      available = available.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(available);
    } catch (error) {
      console.error(error);
      alert("Error searching courses");
    }
  };

  // === 4. التسجيل في كورس ===
  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/enrollments/${courseId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        let newEnrollment = {};
        
        if (contentType && contentType.includes("application/json")) {
            newEnrollment = await res.json();
        }
        
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

  // === 5. تقديم طلب تدريب ===
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

  // === EXAM HANDLERS (Connected to Backend) ===
  const startExam = async (exam) => {
      const token = localStorage.getItem('token');
      
      try {
          // التحقق هل الامتحان حقيقي من الباك إند أم وهمي
          // إذا كان الـ ID طويل (MongoDB ID) سنقوم بالجلب، وإلا سنستخدم البيانات المحلية
          if (exam.id && typeof exam.id === 'string' && exam.id.length > 5) {
              const res = await fetch(`http://localhost:5000/api/exams/${exam.id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
              });

              if (res.ok) {
                  const data = await res.json();
                  
                  // تحويل البيانات القادمة من الباك إند لتناسب شكل الواجهة الأمامية
                  const formattedExam = {
                      id: data.exam._id,
                      title: data.exam.title,
                      questions: data.questions.map(q => ({
                          text: q.text,
                          options: q.options,
                          // الباك إند يعيد correct_answer كنص، نحتاج لإيجاد رقمه (index)
                          correctIndex: q.options.indexOf(q.correct_answer) 
                      }))
                  };
                  setCurrentExam(formattedExam);
                  setExamAnswers({});
              } else {
                  alert("Failed to load exam questions.");
              }
          } else {
              // بيانات وهمية محلية
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
      
      alert(`Exam Submitted! Your Score: ${score}%`);
      setCurrentExam(null);
      
      // إزالة الامتحان من القائمة (للتجربة فقط)
      setExams(exams.filter(e => e.id !== currentExam.id));
  };

  // --- NEW: WORKSHOP REGISTRATION HANDLER ---
  const handleRegisterWorkshop = (workshopId) => {
      if(registeredWorkshops.includes(workshopId)) return;
      setRegisteredWorkshops([...registeredWorkshops, workshopId]);
      
      // Update enrolled count locally (mock update)
      setWorkshops(workshops.map(w => w.id === workshopId ? {...w, enrolled: w.enrolled + 1} : w));
      alert("Registered Successfully!");
  };

  // === CERTIFICATE HANDLER ===
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
      
      {/* Print Styles for Certificate */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-area, #certificate-print-area * {
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

      {/* Header */}
      <div className="no-print">
      <header className="flex justify-between items-center py-8 px-6">
            <div className="text-left">
              <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Student Portal
              </h1>
              <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">
                Welcome, {user?.name || 'Student'}
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

      {/* Full Width Navigation Bar */}
      <div className={`flex overflow-x-auto border-b gap-2 rounded-t-xl px-2 shadow-sm mb-8 mx-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} no-print`}>
        <div className="">
            <div className="flex overflow-x-auto gap-2 scrollbar-hide">
                <TabButton id="profile" label="My Profile" icon={User} />
                <TabButton id="courses" label="My Courses (CV)" icon={BookOpen} />
                <TabButton id="workshops" label="Workshops" icon={CalendarIcon} />
                <TabButton id="exams" label="Exams" icon={ClipboardList} />
                <TabButton id="internships" label="Internships" icon={Briefcase} />
                <TabButton id="training" label="Training" icon={Award} />
                <TabButton id="invitations" label="Invitations" icon={Mail} />
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
                 
                 {/* قسم البحث */}
                 <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2"><Search size={20}/> Find New Courses</h3>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="Search course title..." 
                        className={`flex-1 px-4 py-3 rounded-xl border outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                        value={searchTerm}
                        onChange={e=>setSearchTerm(e.target.value)}
                        onKeyDown={e=>e.key==='Enter' && handleSearch()}
                      />
                      <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold transition-colors">Search</button>
                    </div>
                 </div>

                 {searchResults.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                      {searchResults.map(course => (
                        <div key={course._id} className={`p-5 rounded-xl border flex flex-col justify-between ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                          <div>
                            <h4 className="font-bold text-lg mb-1">{course.title}</h4>
                            <p className="text-xs text-gray-500 mb-2">Teacher: {course.teacher?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
                          </div>
                          <button onClick={() => handleEnroll(course._id)} className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"><Plus size={16} /> Enroll Now</button>
                        </div>
                      ))}
                    </div>
                 )}

                 {/* قسم الكورسات النشطة */}
                 <div>
                    <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Active Courses</h3>
                    {activeEnrollments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 border border-dashed rounded-xl">No active enrollments.</p>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {activeEnrollments.map(enr => (
                            <div key={enr._id} className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-bold text-lg">{enr.course?.title}</h4>
                                  <p className="text-xs text-gray-500">Teacher: {enr.course?.teacher?.name}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${enr.completed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {enr.completed ? 'Completed' : 'In Progress'}
                                </span>
                              </div>
                              
                              <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{enr.progress || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700">
                                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${enr.progress || 0}%` }}></div>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-4">
                                <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
                                    + Resume Learning
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                    )}
                 </div>

                 {/* قسم الكورسات المكتملة + الشهادات */}
                 <div>
                    <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Completed Courses (CV)</h2>
                    {enrollments.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                          <p>No courses completed yet.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {enrollments.map((item, index) => (
                               <div key={index} className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                   <div className="flex items-center gap-2 mb-2">
                                       <CheckCircle className="text-green-500" size={20} />
                                       <h3 className="font-bold text-lg">{item.course?.title || "Course Title"}</h3>
                                   </div>
                                   <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                       Completed on: {new Date(item.completed_at).toLocaleDateString()}
                                   </p>
                                   {/* CERTIFICATE BUTTON */}
                                   <button 
                                      onClick={() => setCertificateModal(item.course)}
                                      className="w-full mt-2 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                   >
                                      <Award size={16}/> View Certificate
                                   </button>
                               </div>
                           ))}
                        </div>
                    )}
                 </div>

              </div>
            )}

            {/* --- 4. EXAMS SECTION --- */}
            {activeTab === 'exams' && (
                <div className="max-w-4xl mx-auto px-6 py-8 no-print">
                    {!currentExam ? (
                        <div>
                            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Available Exams</h2>
                            {exams.length === 0 ? (
                                <div className="p-12 text-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed">
                                    <p className="text-gray-500">No exams available right now.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {exams.map(exam => (
                                        <div key={exam.id} className={`p-6 rounded-xl border flex items-center justify-between ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:shadow-md transition-all'}`}>
                                            <div>
                                                <h3 className="font-bold text-xl mb-1">{exam.title}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-2"><Clock size={14}/> {exam.questions.length} Questions</p>
                                            </div>
                                            <Button onClick={() => startExam(exam)}>Start Exam</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* TAKING EXAM VIEW */
                        <div className={`p-8 rounded-2xl border shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-8 border-b pb-4 dark:border-slate-700">
                                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{currentExam.title}</h2>
                                <span className="text-sm font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">In Progress</span>
                            </div>
                            
                            <div className="space-y-8">
                                {currentExam.questions.map((q, idx) => (
                                    <div key={idx}>
                                        <p className="font-bold text-lg mb-4"><span className="text-gray-400 mr-2">Q{idx+1}.</span> {q.text}</p>
                                        <div className="space-y-3">
                                            {q.options.map((opt, oIdx) => (
                                                <label key={oIdx} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${examAnswers[idx] === oIdx ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'}`}>
                                                    <input 
                                                        type="radio" 
                                                        name={`q-${idx}`} 
                                                        className="w-4 h-4 text-blue-600"
                                                        checked={examAnswers[idx] === oIdx}
                                                        onChange={() => handleAnswerChange(idx, oIdx)}
                                                    />
                                                    <span className="ml-3">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t dark:border-slate-700 flex justify-end">
                                <Button onClick={submitExam} className="bg-green-600 hover:bg-green-700">Submit Exam</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- 5. INTERNSHIPS SECTION --- */}
            {activeTab === 'internships' && (
              <div className="max-w-7xl mx-auto px-6 py-8 no-print">
                <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Available Internships</h2>
                {approvedInternships.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed">
                        <p className="text-gray-500">No internships approved yet.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {approvedInternships.map(internship => (
                            <div key={internship._id} className={`p-6 rounded-xl border shadow-sm hover:border-blue-400 transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                <div className="mb-4">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-lg">{internship.title}</h4>
                                        <span className={`text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-600`}>{internship.type}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2 mt-1">{internship.company?.email || 'Company'}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={12}/> {internship.location}</div>
                                </div>
                                <div className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{internship.description}</div>
                                <button 
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.onchange = (e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setCvFile(e.target.files[0]);
                                                handleApply(null, internship.company._id);
                                            }
                                        };
                                        input.click();
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

            {/* --- 6. TRAINING SECTION --- */}
            {activeTab === 'training' && (
              <div className="max-w-6xl mx-auto px-6 py-8 no-print">
                <div className={`p-8 rounded-3xl border shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">Apply for Training</h2>
                  <div className="grid md:grid-cols-2 gap-12">
                      <form onSubmit={(e) => handleApply(e)} className="space-y-6">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Company ID</label>
                              <input 
                                required 
                                placeholder="e.g. 64a5b..." 
                                className={`w-full px-5 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary-200 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-200'}`} 
                                value={trainingData.company} 
                                onChange={e=>setTrainingData({...trainingData, company:e.target.value})} 
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Upload CV (PDF)</label>
                              <input 
                                type="file" 
                                className="hidden" 
                                id="cv-upload" 
                                onChange={handleFileChange}
                              />
                              <div 
                                onClick={() => document.getElementById('cv-upload').click()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all ${darkMode ? 'border-slate-600 hover:bg-slate-700/50' : 'border-gray-300'}`}
                              >
                                  <Upload size={48} className="mx-auto mb-4 text-gray-400"/>
                                  <p className="text-base text-gray-500 font-medium">{cvFile ? cvFile.name : "Click to upload CV"}</p>
                              </div>
                          </div>
                          <Button type="submit" className="w-full py-3 text-lg">Submit Application</Button>
                      </form>
                      <div>
                          <h3 className="font-bold text-xl mb-6 text-slate-800 dark:text-white">My Applications</h3>
                          <div className="space-y-4">
                              {apps.length === 0 ? <p className="text-gray-400 text-sm bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl text-center">No applications yet.</p> : apps.map(app => (
                                  <div key={app.id} className={`flex justify-between items-center p-5 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                                      <div><p className="font-bold text-lg">{app.companyName}</p><p className="text-xs text-gray-500">{new Date(app.date).toLocaleDateString()}</p></div>
                                      <span className={`text-sm px-4 py-1.5 rounded-full font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{app.status}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                </div>
              </div>
            )}
                        {/* --- NEW: INVITATIONS SECTION --- */}
                        {activeTab === 'invitations' && (
                <div className="max-w-5xl mx-auto px-6 py-8 no-print">
                    <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Invitations</h2>
                    
                    {/* Mock Data for Invitations */}
                    {[
                        { id: 101, companyName: 'Tech Solutions', role: 'Junior React Developer', date: new Date().toLocaleDateString(), status: 'pending' },
                        { id: 102, companyName: 'Innovate Corp', role: 'Data Analyst Intern', date: new Date().toLocaleDateString(), status: 'accepted' }
                    ].filter(inv => inv.status !== 'rejected').length === 0 ? (
                        <div className="p-12 text-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed">
                            <p className="text-gray-500">No invitations pending.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {[ 
                                { id: 101, companyName: 'Tech Solutions', role: 'Junior React Developer', date: new Date().toLocaleDateString(), status: 'pending' },
                                { id: 102, companyName: 'Innovate Corp', role: 'Data Analyst Intern', date: new Date().toLocaleDateString(), status: 'accepted' }
                            ].map(inv => (
                                <div key={inv.id} className={`p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-center justify-between ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className={`p-4 rounded-full ${inv.companyName.includes('Tech') ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                            <Briefcase size={24}/>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{inv.companyName}</h3>
                                            <p className="text-sm text-gray-500">{inv.role} • Invited on {inv.date}</p>
                                        </div>
                                    </div>
                                    
                                    {inv.status === 'pending' ? (
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => alert(`Invitation from ${inv.companyName} rejected.`)}
                                                className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 font-bold transition-colors"
                                            >
                                                Decline
                                            </button>
                                            <button 
                                                onClick={() => alert(`Invitation from ${inv.companyName} accepted! Application sent.`)}
                                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-bold transition-colors"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold uppercase">Accepted</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}

      {/* --- ENHANCED CERTIFICATE MODAL --- */}
      {certificateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div id="certificate-print-area" className="relative bg-white text-slate-900 w-[950px] max-w-full p-0 shadow-2xl flex flex-col items-center text-center overflow-hidden">
                
                {/* Border */}
                <div className="absolute inset-[20px] border-[2px] border-slate-200 pointer-events-none"></div>
                <div className="absolute inset-[24px] border-double border-[8px] border-yellow-500 pointer-events-none rounded-sm"></div>

                {/* Header Section */}
                <div className="relative z-10 pt-16 pb-8 px-12 w-full flex flex-col items-center">
                    <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6 border border-yellow-100">
                        <Trophy size={48} className="text-yellow-600" />
                    </div>
                    
                    <h1 className="text-5xl font-serif font-bold text-slate-800 mb-1 tracking-widest uppercase">Certificate</h1>
                    <h2 className="text-xl text-yellow-700 font-semibold tracking-widest uppercase mb-4">Of Completion</h2>
                    <div className="h-1 w-32 bg-yellow-400 mb-8"></div>
                    
                    <p className="text-lg text-slate-500 font-medium uppercase tracking-wider mb-2">Proudly Presented To</p>
                    <h3 className="text-5xl font-serif font-extrabold text-blue-900 border-b-2 border-blue-200 pb-4 px-8 w-full max-w-3xl leading-tight">
                        {profileData.name}
                    </h3>
                </div>

                {/* Middle Section */}
                <div className="relative z-10 px-12 w-full flex flex-col items-center mb-12">
                    <p className="text-lg text-slate-500 font-medium uppercase tracking-wider mb-4">For Successfully Completing</p>
                    <h4 className="text-3xl font-serif text-slate-800 font-bold max-w-2xl leading-tight mb-8">
                        {certificateModal.title}
                    </h4>
                    
                    {/* New: Details Grid */}
                    <div className="w-full max-w-3xl grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-100 text-left mb-8">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Certificate ID</p>
                            <p className="text-slate-800 font-mono font-bold tracking-widest">CERT-2023-{Math.floor(Math.random()*10000)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Issue Date</p>
                            <p className="text-slate-800 font-bold">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Duration</p>
                            <p className="text-slate-800 font-bold">{certificateModal.duration_hours || 40} Hours</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Grade</p>
                            <p className="text-green-700 font-bold uppercase">Excellent</p>
                        </div>
                    </div>
                </div>

                {/* Footer / Signatures */}
                <div className="relative z-10 w-full px-12 pb-16 flex justify-between items-end mt-4">
                    
                    {/* Instructor Signature */}
                    <div className="flex flex-col items-center w-1/3 border-r border-slate-200 pr-8">
                        <div className="mb-4 text-blue-500 font-cursive text-3xl font-serif italic opacity-80">Dr. Signature</div>
                        <div className="h-0.5 w-full bg-slate-400 mb-2"></div>
                        <p className="font-bold text-slate-800">{certificateModal.teacher?.name || 'Course Instructor'}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Instructor</p>
                    </div>

                    {/* Verification Info */}
                    <div className="flex flex-col items-center w-1/3 border-r border-slate-200 pr-8">
                         <div className="p-3 border border-slate-300 rounded-full mb-2 bg-slate-50">
                             <ShieldCheck size={24} className="text-slate-400"/>
                         </div>
                         <p className="text-xs text-slate-400 font-mono">VERIFY AT: verify.edu/cert/{Math.floor(Math.random()*9999)}</p>
                    </div>

                    {/* Director Signature */}
                    <div className="flex flex-col items-center w-1/3">
                         <div className="mb-4 text-blue-500 font-cursive text-3xl font-serif italic opacity-80">John Doe</div>
                        <div className="h-0.5 w-full bg-slate-400 mb-2"></div>
                        <p className="font-bold text-slate-800">Academic Director</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">EduTech University</p>
                    </div>

                </div>

                {/* Print Controls (Hidden on Print) */}
                <div className="absolute top-6 right-6 flex gap-3 no-print z-50">
                    <button 
                        onClick={() => setCertificateModal(null)}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg shadow-lg transition-colors"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                    <button 
                        onClick={handlePrintCertificate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
                        title="Print / Save PDF"
                    >
                        <Printer size={20} /> Print / Save PDF
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};