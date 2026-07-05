import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, Users, MessageSquare, Plus, Trash2, FileText, Send,
  Upload, TrendingUp, CheckCircle, XCircle, Moon, Sun, Clock,
  User, Edit3, MapPin, Calendar, GraduationCap, Mail, Phone, Globe, Brain, Camera, X, Save, ClipboardList, Calendar as CalendarIcon, Search, StickyNote, Video
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const emailName = user?.email ? user.email.split('@')[0] : '';

  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const [exams, setExams] = useState([]);
  const [showExamModal, setShowExamModal] = useState(false);

  const [newExam, setNewExam] = useState({
    title: '',
    course: '',
    passing_score: 50,
    questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }]
  });

  const [workshops, setWorkshops] = useState([]);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [workshopData, setWorkshopData] = useState({ title: '', description: '', date: '', meeting_link: '' });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
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

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [courseData, setCourseData] = useState({ title: '', description: '', category: '', level: '', duration_hours: '' });
  const [courseVideos, setCourseVideos] = useState([]);

  const [chatMessages, setChatMessages] = useState([]);
  const [msgData, setMsgData] = useState({ text: '', receiverId: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchStudent, setSearchStudent] = useState('');
  const chatEndRef = useRef(null);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteCourse, setNoteCourse] = useState(null);
  const [noteText, setNoteText] = useState('');

  const [refresh, setRefresh] = useState(0);
  const [editingCourse, setEditingCourse] = useState(null);
const [editCourseData, setEditCourseData] = useState({ title: '', description: '' });
const [editNewVideos, setEditNewVideos] = useState([]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    let interval;
    if (selectedStudent) {
      interval = setInterval(() => {
        loadConversation(selectedStudent._id);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedStudent]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // ✅ تحميل البروفايل — يحل مشكلة الـ Refresh
        const profileRes = await fetch('http://localhost:5000/api/teacher/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const pData = await profileRes.json();
          setProfileData({
            full_name: pData.full_name || '',
            phone: pData.phone || '',
            specialization: pData.specialization || '',
            qualifications: pData.qualifications || '',
            years_experince: pData.years_experince || '',
            linkedin_url: pData.linkedin_url || '',
            cv_url: pData.cv_url || '',
            university: pData.university || '',
            country: pData.country || '',
            gradYear: pData.gradYear || '',
            dob: pData.dob || '',
            bio: pData.bio || ''
          });
        }

        const coursesRes = await fetch('http://localhost:5000/api/courses/my-courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }

        const studentsRes = await fetch('http://localhost:5000/api/teacher/my-students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }

        // ✅ تحميل الامتحانات من الـ API
        const examsRes = await fetch('http://localhost:5000/api/exams/my-exams', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(examsData);
        }

        const wsRes = await fetch('http://localhost:5000/api/workshops', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (wsRes.ok) {
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
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        // 1. تعديل الاسم والوصف
        const res = await fetch(`http://localhost:5000/api/courses/${editingCourse._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: editCourseData.title,
                description: editCourseData.description
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: "Error" }));
            throw new Error(err.message || "Error updating course");
        }

        let updatedCourse = await res.json();

        // 2. رفع الفيديوهات الجديدة (واحد واحد عشان الباك ياخدهم)
        if (editNewVideos.length > 0) {
            for (const video of editNewVideos) {
                const videoFormData = new FormData();
                videoFormData.append('video', video); // ✅ اسم الحقل 'video' مو 'videos' لأنو الراوت single
                
                const vidRes = await fetch(`http://localhost:5000/api/courses/${editingCourse._id}/videos`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: videoFormData
                });

                if (vidRes.ok) {
                    const newVid = await vidRes.json();
                    updatedCourse.videos.push(newVid);
                }
            }
        }

        // 3. تحديث الواجهة
        setCourses(courses.map(c => c._id === updatedCourse._id ? updatedCourse : c));
        setEditingCourse(null);
        setEditCourseData({ title: '', description: '' });
        setEditNewVideos([]);
        alert("Course Updated Successfully!");

    } catch (error) {
        console.error(error);
        alert(error.message || "Server Error");
    }
};

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
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

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setMsgData(prev => ({
      ...prev,
      receiverId: student._id
    }));
    loadConversation(student._id);
  };

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

      if (res.ok) {
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
    if (!confirm("Are you sure you want to delete this workshop?")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/workshops/${wsId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
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
          } catch (ee) {
            errorDetails = "Failed to parse error JSON";
          }
        } else {
          try {
            errorDetails = await examRes.text();
          } catch (ee) {
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

      setExams(prev => [...prev, {
        _id: examId,
        title: newExam.title,
        questions: newExam.questions,
        passing_score: Number(newExam.passing_score),
        course: newExam.course
      }]);

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
        console.log("عدد الفيديوهات الي بترسل:", courseVideos.length);
    console.log("أسماء الفيديوهات:", courseVideos.map(v => v.name));
    try {
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('category', courseData.category);
      formData.append('level', courseData.level);
      // ❌ لا يوجد price
      formData.append('duration_hours', courseData.duration_hours);

      courseVideos.forEach((video) => {
        formData.append('videos', video);
      });

      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const newCourse = await res.json();
        setCourses([...courses, newCourse]);
        setShowCourseForm(false);
        setCourseData({ title: '', description: '', category: '', level: '', duration_hours: '' });
        setCourseVideos([]);
        setFormKey(k => k + 1);
        alert("Course Added Successfully with Videos!");
      } else {
        const errData = await res.json().catch(() => ({ message: "Error adding course" }));
        alert(errData.message || "Error adding course");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server Error");
    }
  };

  const handleDeleteCourse = async (id) => {
    if (confirm("Delete this course?")) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setCourses(courses.filter(c => (c._id || c.id) !== id));
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return alert("Please write a note first");
    alert(`Note saved for course: ${noteCourse.title}\nNote: ${noteText}`);
    setShowNoteModal(false);
    setNoteText('');
    setNoteCourse(null);
  };

  const handleInterestToggle = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const isMyMessage = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    const myId = user?.id || user?._id;
    if (!senderId || !myId) return false;
    return senderId.toString() === myId.toString();
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-5 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === id
          ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-slate-800 dark:text-primary-400'
          : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
        }`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className={`p-6 min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-slate-800'}`}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Welcome, {profileData.full_name || user?.name || emailName || 'Teacher'}
          </h1>
          <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">Manage your courses, students, and workshops</p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-full transition-colors duration-200 ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className={`flex overflow-x-auto border-b gap-2 rounded-t-xl px-2 shadow-sm mb-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <TabButton id="profile" label="My Profile" icon={User} />
        <TabButton id="overview" label="Overview" icon={TrendingUp} />
        <TabButton id="courses" label="My Courses" icon={BookOpen} />
        <TabButton id="workshops" label="Workshops" icon={CalendarIcon} />
        <TabButton id="exams" label="Exam" icon={ClipboardList} />
        {/* ❌ تم حذف تاب Classwork */}
        <TabButton id="communication" label="Messages" icon={MessageSquare} />
      </div>

      {loading ? <div className="p-20 text-center">Loading...</div> : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* ========== 1. PROFILE ========== */}
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
                          <User size={80} className="text-gray-400 dark:text-slate-600" />
                        </div>

                        <div className="flex-1 mb-2 text-center md:text-left">
                          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">{profileData.full_name || emailName}</h2>
                          <p className="text-xl text-primary-600 dark:text-primary-400 font-medium mt-1">{profileData.specialization}</p>
                          <div className="flex flex-col md:flex-row items-center gap-4 mt-3 text-gray-600 dark:text-slate-400 text-sm">
                            <span className="flex items-center gap-1"><MapPin size={16} className="text-primary-500" /> {profileData.university}, {profileData.country}</span>
                            <span className="hidden md:inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="flex items-center gap-1"><Calendar size={16} className="text-primary-500" /> {profileData.qualifications}</span>
                          </div>
                        </div>

                        <div className="hidden md:flex gap-4 mb-4">
                          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 text-center min-w-[100px]">
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{courses.length}</p>
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
                              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"><FileText size={20} /></div>
                              About Me
                            </h3>
                            <p className="text-gray-600 dark:text-slate-400 leading-8 text-lg">{profileData.bio || "No bio added yet."}</p>
                          </section>

                          <section className={`p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><GraduationCap size={20} /></div>
                              Education & Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                              <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">University</p>
                                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{profileData.university}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Qualifications</p>
                                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{profileData.qualifications}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Years of Experience</p>
                                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{profileData.years_experince}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Graduation Year</p>
                                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{profileData.gradYear}</p>
                              </div>
                            </div>
                          </section>
                        </div>

                        <div className="space-y-8">
                          <section className={`p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Contact Information</h3>
                            <div className="space-y-6">
                              <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><Mail size={20} /></div>
                                <div>
                                  <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                                  <p className="text-slate-700 dark:text-slate-300 font-medium">{user?.email}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"><Phone size={20} /></div>
                                <div>
                                  <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                                  <p className="text-slate-700 dark:text-slate-300 font-medium">{profileData.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"><Globe size={20} /></div>
                                <div>
                                  <p className="text-xs text-gray-500 font-bold uppercase">LinkedIn</p>
                                  <p className="text-slate-700 dark:text-slate-300 font-medium">{profileData.linkedin_url}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"><MapPin size={20} /></div>
                                <div>
                                  <p className="text-xs text-gray-500 font-bold uppercase">Country</p>
                                  <p className="text-slate-700 dark:text-slate-300 font-medium">{profileData.country}</p>
                                </div>
                              </div>
                            </div>
                          </section>

                          <section className={`p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Brain size={18} className="text-primary-500" /> Interests</h3>
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
                                <User size={50} className="text-gray-400" />
                              </div>
                              <button className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1">
                                <Camera size={16} /> Change Photo
                              </button>
                            </div>

                            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-100'}`}>
                              <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Brain size={18} className="text-primary-600" /> My Interests</h3>
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
                                    value={profileData.full_name}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                                  <input
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                                  <input
                                    type="date"
                                    value={profileData.dob}
                                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                                  <select
                                    value={profileData.country}
                                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                  >
                                    <option value="">Select Country</option>
                                    <option>Syria</option><option>Jordan</option><option>UAE</option><option>Saudi Arabia</option><option>USA</option>
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn URL</label>
                                  <input
                                    value={profileData.linkedin_url}
                                    onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-4">Education & Professional</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">University / Institution</label>
                                  <input
                                    value={profileData.university}
                                    onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialization</label>
                                  <input
                                    value={profileData.specialization}
                                    onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qualifications</label>
                                  <input
                                    value={profileData.qualifications}
                                    onChange={(e) => setProfileData({ ...profileData, qualifications: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Years of Experience</label>
                                  <input
                                    type="number"
                                    value={profileData.years_experince}
                                    onChange={(e) => setProfileData({ ...profileData, years_experince: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500/50 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 focus:border-primary-500'}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Graduation Year</label>
                                  <input
                                    type="number"
                                    value={profileData.gradYear}
                                    onChange={(e) => setProfileData({ ...profileData, gradYear: e.target.value })}
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
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
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

            {/* ========== 2. OVERVIEW ========== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Total Courses", val: courses.length, color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700", icon: BookOpen },
                    { title: "Enrolled Students", val: students.length, color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-slate-800 dark:text-emerald-400 dark:border-slate-700", icon: Users },
                    { title: "Total Workshops", val: workshops.length, color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-slate-800 dark:text-amber-400 dark:border-slate-700", icon: CalendarIcon },
                    { title: "Total Exams", val: exams.length, color: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-slate-800 dark:text-purple-400 dark:border-slate-700", icon: ClipboardList }
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

            {/* ========== 3. COURSES ========== */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>My Courses</h2>
                  <Button onClick={() => { setShowCourseForm(true); setFormKey(k => k + 1); }}><Plus size={16} className="me-2" /> Add New Course</Button>
                </div>

                {showCourseForm && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <button onClick={() => { setShowCourseForm(false); setCourseVideos([]); }} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24} /></button>
                      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Create New Course</h2>
                      <form onSubmit={handleAddCourse} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.title} onChange={e => setCourseData({ ...courseData, title: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea required rows="3" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.description} onChange={e => setCourseData({ ...courseData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.category} onChange={e => setCourseData({ ...courseData, category: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Level</label>
                            <select required className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.level} onChange={e => setCourseData({ ...courseData, level: e.target.value })}>
                              <option value="">Select Level</option>
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                          </div>
                        </div>
                        {/* ❌ تم حذف حقل السعر */}
                        <div>
                          <label className="block text-sm font-medium mb-1">Duration (Hours)</label>
                          <input required type="number" min="1" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={courseData.duration_hours} onChange={e => setCourseData({ ...courseData, duration_hours: e.target.value })} />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                            <Video size={16} /> Course Videos
                          </label>
                          <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${darkMode ? 'border-slate-600 hover:border-blue-500 bg-slate-700/30' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}>
                            <Upload size={32} className={`mx-auto mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                            <p className={`text-sm mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Click to select videos or drag & drop</p>
                            <p className="text-xs text-gray-400 mb-3">MP4, MOV, AVI — Max 10 videos</p>
                            <input
                              key={formKey}
                              type="file"
                              multiple
                              accept="video/*"
                              onChange={(e) => setCourseVideos(Array.from(e.target.files))} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          {courseVideos.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {courseVideos.map((v, i) => (
                                <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Video size={14} className="text-blue-500 flex-shrink-0" />
                                    <span className="truncate">{v.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-gray-400">{(v.size / (1024 * 1024)).toFixed(1)} MB</span>
                                    <button type="button" onClick={() => setCourseVideos(courseVideos.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                  </div>
                                </div>
                              ))}
                              <p className="text-xs text-blue-500 font-medium">{courseVideos.length} video(s) selected</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                          <Button type="button" onClick={() => { setShowCourseForm(false); setCourseVideos([]); }} className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg">Cancel</Button>
                          <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                            <Upload size={16} /> Create Course
                          </Button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
                {/* ✅ مودال تعديل الكورس */}
                {editingCourse && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                            <button onClick={() => { setEditingCourse(null); setEditCourseData({ title: '', description: '' }); setEditNewVideos([]); }} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24} /></button>
                            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}><Edit3 size={20} /> Edit Course</h2>
                            
                            <form onSubmit={handleUpdateCourse} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input required type="text" value={editCourseData.title} onChange={e => setEditCourseData({ ...editCourseData, title: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea required rows="3" value={editCourseData.description} onChange={e => setEditCourseData({ ...editCourseData, description: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Video size={16} /> Add New Videos</label>
                                    <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${darkMode ? 'border-slate-600 hover:border-blue-500 bg-slate-700/30' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}>
                                        <Upload size={24} className={`mx-auto mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                                        <p className="text-xs text-gray-400">Click to add videos</p>
                                        <input
                                            type="file"
                                            multiple
                                            accept="video/*"
                                            onChange={(e) => setEditNewVideos(Array.from(e.target.files))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    
                                    {editNewVideos.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {editNewVideos.map((v, i) => (
                                                <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                                                    <span className="truncate text-xs flex items-center gap-1"><Video size={12} className="text-green-500" />{v.name}</span>
                                                    <button type="button" onClick={() => setEditNewVideos(editNewVideos.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {editingCourse.videos && editingCourse.videos.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 mb-1">Current Videos ({editingCourse.videos.length}):</p>
                                            <div className="flex flex-wrap gap-1">
                                                {editingCourse.videos.map((v, i) => (
                                                    <span key={i} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Video size={10} /> {v.title || `Video ${i+1}`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" onClick={() => { setEditingCourse(null); setEditCourseData({ title: '', description: '' }); setEditNewVideos([]); }} className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg">Cancel</Button>
                                    <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Save size={16} /> Save Changes</Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}

                {/* ❌ تم حذف مودال الملاحظة بالكامل */}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(c => (
                    <div key={c._id || c.id} className={`p-6 rounded-xl border shadow-sm relative group ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:shadow-md'}`}>
                      {c.videos && c.videos.length > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          <Video size={14} className="text-blue-500" />
                          <span className="text-xs text-blue-500 font-medium">{c.videos.length} video(s)</span>
                        </div>
                      )}
                      <h3 className="font-bold text-lg mb-2">{c.title}</h3>
                      <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{c.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {c.category && <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">{c.category}</span>}
                        {c.level && <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full">{c.level}</span>}
                        {c.duration_hours && <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">{c.duration_hours}h</span>}
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                        
                        {/* ✅ زرين بس: تعديل وحذف */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { 
                              setEditingCourse(c); 
                              setEditCourseData({ title: c.title, description: c.description }); 
                              setEditNewVideos([]); 
                            }} 
                            className="text-amber-500 hover:bg-amber-100 dark:hover:bg-slate-700 p-2 rounded"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDeleteCourse(c._id || c.id)} className="text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 p-2 rounded"><Trash2 size={16} /></button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== 4. WORKSHOPS ========== */}
            {activeTab === 'workshops' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Workshops & Events</h2>
                  <Button onClick={() => setShowWorkshopModal(true)}><Plus size={16} className="me-2" /> Announce Workshop</Button>
                </div>

                {showWorkshopModal && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <button onClick={() => setShowWorkshopModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24} /></button>
                      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Announce New Workshop</h2>
                      <form onSubmit={handleCreateWorkshop} className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Workshop Title</label><input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={workshopData.title} onChange={e => setWorkshopData({ ...workshopData, title: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium mb-1">Description</label><textarea required rows="3" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={workshopData.description} onChange={e => setWorkshopData({ ...workshopData, description: e.target.value })} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-sm font-medium mb-1">Date</label><input required type="date" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={workshopData.date} onChange={e => setWorkshopData({ ...workshopData, date: e.target.value })} /></div>
                          <div><label className="block text-sm font-medium mb-1">Meeting Link</label><input required type="url" placeholder="e.g. https://zoom.us/j/..." className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={workshopData.meeting_link} onChange={e => setWorkshopData({ ...workshopData, meeting_link: e.target.value })} /></div>
                        </div>
                        <div className="pt-4 flex justify-end gap-3"><Button type="button" onClick={() => setShowWorkshopModal(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg">Cancel</Button><Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Publish Workshop</Button></div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {selectedWorkshop && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <button onClick={() => setSelectedWorkshop(null)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24} /></button>
                      <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedWorkshop.title}</h2>
                      <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold"><CalendarIcon size={16} /> {new Date(selectedWorkshop.date).toLocaleDateString()}</div>
                      <p className={`mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{selectedWorkshop.description}</p>
                      <a href={selectedWorkshop.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-2 mb-6"><Globe size={16} /> Join Meeting Link</a>
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
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><User size={16} /></div>
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
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteWorkshop(ws._id); }} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-2 rounded"><Trash2 size={16} /></button>
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold"><CalendarIcon size={16} /> {new Date(ws.date).toLocaleDateString()}</div>
                      <h3 className="font-bold text-lg mb-1">{ws.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ws.description}</p>
                      <div className="border-t pt-3 dark:border-slate-700 mt-2">
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Globe size={12} /> {ws.meeting_link ? 'Online' : 'Link N/A'}</span>
                          <span className="flex items-center gap-1"><Users size={12} /> {ws.attendees ? ws.attendees.length : 0} Registered</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== 5. EXAMS ========== */}
            {activeTab === 'exams' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Exams</h2>
                  <Button onClick={() => setShowExamModal(true)}><Plus size={16} className="me-2" /> Create Exam</Button>
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
                            <input required type="text" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={newExam.title} onChange={e => setNewExam({ ...newExam, title: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Select Course</label>
                            <select required className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={newExam.course} onChange={e => setNewExam({ ...newExam, course: e.target.value })}>
                              <option value="">-- Choose a Course --</option>
                              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                          <input required type="number" min="1" max="100" className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} value={newExam.passing_score} onChange={e => setNewExam({ ...newExam, passing_score: e.target.value })} />
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
                                    <input required type="text" className={`flex-1 px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white'}`} placeholder={`Option ${oIdx + 1}`} value={opt} onChange={e => {
                                      const newOpts = [...q.options];
                                      newOpts[oIdx] = e.target.value;
                                      updateQuestion(qIdx, 'options', newOpts);
                                    }} />
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-green-600 dark:text-green-400"><CheckCircle size={12} className="inline mr-1" /> Select the radio button for the correct answer.</p>
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
                    <div key={exam._id} className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                      <h3 className="font-bold text-lg mb-1">{exam.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{exam.questions?.length || 0} Questions</p>
                      <div className="flex justify-between items-center border-t pt-3 dark:border-slate-700">
                        <span className="text-xs text-gray-400">Passing: <span className="font-bold text-green-500">{exam.passing_score || 50}%</span></span>
                        <span className="text-xs text-gray-400">Course: <span className="font-bold text-blue-500">{courses.find(c => c._id === exam.course)?.title || 'N/A'}</span></span>
                      </div>
                    </div>
                  ))}
                  {exams.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-400">
                      <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
                      <p>No exams created yet. Click "Create Exam" to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ❌ تم حذف تاب Classwork بالكامل */}

            {/* ========== 6. MESSAGES ========== */}
            {activeTab === 'communication' && (
              <div className={`flex gap-6 h-[600px] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>

                {/* قائمة الطلاب */}
                <div className={`w-80 flex-shrink-0 rounded-2xl border overflow-hidden flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-3">Students</h3>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchStudent}
                        onChange={e => setSearchStudent(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300 placeholder-gray-400'}`}
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {students
                      .filter((student, index, self) =>
                        index === self.findIndex((s) => s._id === student._id)
                      )
                      .filter(s => {
                        const name = s.full_name || s.name || s.email || '';
                        return name.toLowerCase().includes(searchStudent.toLowerCase());
                      })
                      .map(student => (
                        <button
                          key={student._id}
                          onClick={() => handleSelectStudent(student)}
                          className={`w-full flex items-center gap-3 p-4 text-left transition-colors border-b dark:border-slate-700 ${
                            selectedStudent?._id === student._id
                              ? darkMode ? 'bg-blue-900/30 border-l-4 border-l-blue-500' : 'bg-blue-50 border-l-4 border-l-blue-500'
                              : darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-600'}`}>
                            {(student.full_name || student.name || student.email || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{student.full_name || student.name || student.email?.split('@')[0]}</p>
                            <p className="text-xs text-gray-400 truncate">{student.email}</p>
                          </div>
                        </button>
                      ))
                    }
                    {students.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm">No students enrolled yet</div>
                    )}
                  </div>
                </div>

                {/* منطقة الشات */}
                <div className={`flex-1 rounded-2xl border overflow-hidden flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>

                  {!selectedStudent ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Select a student to start chatting</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`p-4 border-b flex items-center gap-3 ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                          {(selectedStudent.full_name || selectedStudent.name || selectedStudent.email || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{selectedStudent.full_name || selectedStudent.name || selectedStudent.email?.split('@')[0]}</p>
                          <p className="text-xs text-gray-400">{selectedStudent.email}</p>
                        </div>
                      </div>

                      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${darkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        {chatMessages.length === 0 && (
                          <div className="text-center text-gray-400 text-sm mt-20">No messages yet. Say hello!</div>
                        )}
                        {chatMessages.map((msg, idx) => {
                          const myMsg = isMyMessage(msg);
                          return (
                            <div key={msg._id || idx} className={`flex ${myMsg ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                                myMsg
                                  ? 'bg-blue-600 text-white rounded-br-md'
                                  : darkMode
                                    ? 'bg-slate-700 text-slate-200 rounded-bl-md'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                              }`}>
                                <p className={`text-[10px] font-bold mb-1 ${myMsg ? 'text-blue-200' : 'text-blue-500'}`}>
                                  {myMsg ? 'You' : (msg.sender?.full_name || msg.sender?.email?.split('@')[0] || 'Student')}
                                </p>
                                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                <p className={`text-[10px] mt-1 ${myMsg ? 'text-blue-200/70' : 'text-gray-400'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={handleSendMessage} className={`p-4 border-t flex gap-2 ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                        <input
                          required
                          placeholder={`Message ${selectedStudent.full_name || selectedStudent.name || 'student'}...`}
                          className={`flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${
                            darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' : 'bg-gray-50 border-gray-300 placeholder-gray-400 focus:border-blue-500'
                          }`}
                          value={msgData.text}
                          onChange={e => setMsgData(prev => ({ ...prev, text: e.target.value }))}
                        />
                        <Button
                          type="submit"
                          disabled={!msgData.text.trim()}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={18} />
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};