const MOCK_DELAY = 400; 



class MockSupabase {
  constructor() { this.init(); }

  init() {
    if (!localStorage.getItem('edu_jobs')) {
      const jobs = JSON.parse(localStorage.getItem('edu_jobs')) || [];
      jobs.push({
          id: 'job_1', companyId: 'company_1', title: 'Frontend Intern', description: 'React Developer needed.', location: 'Remote', type: 'Internship', createdAt: new Date().toISOString()
      });
      localStorage.setItem('edu_jobs', JSON.stringify(jobs));
  }
  if (!localStorage.getItem('edu_applications')) {
      const apps = JSON.parse(localStorage.getItem('edu_applications')) || [];
      apps.push({
          id: 'app_1', jobId: 'job_1', studentId: 'student_1', name: 'Ali Hassan', university: 'MIT', major: 'Computer Science', status: 'Pending'
      });
      localStorage.setItem('edu_applications', JSON.stringify(apps));
  }
    if (!localStorage.getItem('edu_interests')) {
      localStorage.setItem('edu_interests', JSON.stringify({
          'student_1': ['Web Development', 'AI', 'Data Science']
      }));
  }
  if (!localStorage.getItem('edu_enrollments')) {
      localStorage.setItem('edu_enrollments', JSON.stringify([
          // الطالب مسجل في دورة واحدة وقدم عليها بنسبة 100%
          { id: 'enroll_1', studentId: 'student_1', courseId: 'course_1', progress: 100, completed: true, completedAt: new Date().toISOString() }
      ]));
  }
  if (!localStorage.getItem('edu_training_apps')) {
      localStorage.setItem('edu_training_apps', JSON.stringify([
          { id: 'app_1', studentId: 'student_1', companyName: 'Tech Corp', status: 'Applied', date: new Date().toISOString() }
      ]));
  }
    // 1. تهيئة المستخدمين (إضافة بيانات تجريبية ثابتة)
    // 1. تهيئة المستخدمين (إضافة بيانات تجريبية ثابتة)
    if (!localStorage.getItem('edu_users')) {
      // حساب الأدمن
      const admin = { id: 'admin_1', email: 'admin@edu.com', password: 'admin', role: 'admin', is_verified: true, is_active: true, created_at: new Date().toISOString() };
      
      // حساب المعلم
      const teacher = { id: 'teacher_demo_1', email: 'teacher1@test.com', password: '123', role: 'teacher', is_verified: true, is_active: true, created_at: new Date().toISOString() };
      
      // --- حساب الشركة (الإضافة الجديدة) ---
      const company = { 
        id: 'company_demo_1', 
        email: 'company1@test.com', // نفس الإيميل في LoginPage
        password: '123',             // نفس الباسورد في LoginPage
        role: 'company', 
        is_verified: true, 
        is_active: true, // مهم جداً لكي يسمح بالدخول
        created_at: new Date().toISOString() 
      };
      // ---------------------------------

      // طلاب وهميون
      const students = [
        { id: 'student_1', email: 'student1@test.com', password: '123', role: 'student', is_verified: true, is_active: true, created_at: new Date().toISOString() },
        { id: 'student_2', email: 'student2@test.com', password: '123', role: 'student', is_verified: true, is_active: true, created_at: new Date().toISOString() },
        { id: 'student_3', email: 'student3@test.com', password: '123', role: 'student', is_verified: true, is_active: true, created_at: new Date().toISOString() }
      ];

      // تحديث: أضفنا 'company' إلى المصفوفة
      localStorage.setItem('edu_users', JSON.stringify([admin, teacher, company, ...students]));
      
      // بروفايلات إضافية
      localStorage.setItem('edu_teachers', JSON.stringify([{ id: 'teacher_demo_1', name: 'Dr. Ahmed Teacher', specialization: 'Computer Science', experience: '5', is_approved: true }]));
      
      // --- إضافة بروفايل الشركة (الإضافة الجديدة) ---
      localStorage.setItem('edu_companies', JSON.stringify([
        { id: 'company_demo_1', name: 'Tech Solutions', industry: 'Software Development', is_approved: true }
      ]));
      // -----------------------------------------

      localStorage.setItem('edu_students', JSON.stringify([
        { id: 'student_1', name: 'Ali Hassan', university: 'MIT', gradYear: 2024 },
        { id: 'student_2', name: 'Sara Smith', university: 'Harvard', gradYear: 2023 },
        { id: 'student_3', name: 'Omar Khaled', university: 'Oxford', gradYear: 2024 }
      ]));
    }

    // 2. تهيئة الجداول الجديدة (دورات، واجبات، رسائل) مع بيانات وهمية
    if (!localStorage.getItem('edu_courses')) {
      localStorage.setItem('edu_courses', JSON.stringify([
        { id: 'course_1', teacherId: 'teacher_demo_1', title: 'Advanced Web Development', description: 'Deep dive into React, Node.js, and Databases.', createdAt: new Date().toISOString() },
        { id: 'course_2', teacherId: 'teacher_demo_1', title: 'Data Structures 101', description: 'Introduction to algorithms and data structures.', createdAt: new Date().toISOString() },
        { id: 'course_3', teacherId: 'teacher_demo_1', title: 'UI/UX Masterclass', description: 'Learn how to design beautiful interfaces.', createdAt: new Date().toISOString() }
      ]));
    }

    if (!localStorage.getItem('edu_assignments')) {
      localStorage.setItem('edu_assignments', JSON.stringify([
        { id: 'assign_1', courseId: 'course_1', title: 'Build a Portfolio', dueDate: '2023-12-30' },
        { id: 'assign_2', courseId: 'course_2', title: 'Binary Tree Implementation', dueDate: '2023-11-15' }
      ]));
    }

    if (!localStorage.getItem('edu_messages')) {
      localStorage.setItem('edu_messages', JSON.stringify([
        { id: 'msg_1', senderId: 'teacher_demo_1', receiverId: 'student_1', text: 'Welcome to the Web Development course!', timestamp: new Date(Date.now() - 10000000).toISOString() },
        { id: 'msg_2', senderId: 'student_1', receiverId: 'teacher_demo_1', text: 'Thank you, Dr. Ahmed! Looking forward to it.', timestamp: new Date(Date.now() - 5000000).toISOString() },
        { id: 'msg_3', senderId: 'teacher_demo_1', receiverId: 'all', text: 'Reminder: The assignment is due tomorrow!', timestamp: new Date().toISOString() }
      ]));
    }
    
    // باقي الجداول
    if (!localStorage.getItem('edu_companies')) localStorage.setItem('edu_companies', JSON.stringify([]));
    if (!localStorage.getItem('edu_certifications')) localStorage.setItem('edu_certifications', JSON.stringify([]));
    if (!localStorage.getItem('edu_content')) localStorage.setItem('edu_content', JSON.stringify([]));
    if (!localStorage.getItem('edu_settings')) localStorage.setItem('edu_settings', JSON.stringify({ maintenanceMode: false }));
  }

  // --- Auth Functions ---
  async register(email, password, metadata) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const users = JSON.parse(localStorage.getItem('edu_users'));
    if (users.find(u => u.email === email)) throw new Error("EMAIL_EXISTS");

    const newUser = {
      id: `user_${Date.now()}`, email, password,
      role: metadata.role, is_verified: true,
      is_active: metadata.role === 'student',
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('edu_users', JSON.stringify(users));

    const profileData = metadata.profile || {};
    if (metadata.role === 'teacher') {
      const teachers = JSON.parse(localStorage.getItem('edu_teachers'));
      teachers.push({ id: newUser.id, ...profileData, is_approved: false });
      localStorage.setItem('edu_teachers', JSON.stringify(teachers));
    } else if (metadata.role === 'company') {
      const companies = JSON.parse(localStorage.getItem('edu_companies'));
      companies.push({ id: newUser.id, ...profileData, is_approved: false });
      localStorage.setItem('edu_companies', JSON.stringify(companies));
    } else if (metadata.role === 'student') {
      const students = JSON.parse(localStorage.getItem('edu_students'));
      students.push({ id: newUser.id, ...profileData });
      localStorage.setItem('edu_students', JSON.stringify(students));
    }
    return { user: newUser, error: null };
  }

  async login(email, password) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const users = JSON.parse(localStorage.getItem('edu_users'));
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("INVALID_CREDENTIALS");
    if (!user.is_active) throw new Error("ACCOUNT_INACTIVE");
    return { user, error: null };
  }

  // --- Admin Functions ---
  async getTeachers() {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    return JSON.parse(localStorage.getItem('edu_teachers'));
  }

  async getCompanies() {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    return JSON.parse(localStorage.getItem('edu_companies'));
  }

  async updateStatus(type, id, isApproved) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const key = type === 'teacher' ? 'edu_teachers' : 'edu_companies';
    const list = JSON.parse(localStorage.getItem(key));
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) {
      list[idx].is_approved = isApproved;
      localStorage.setItem(key, JSON.stringify(list));
      
      const users = JSON.parse(localStorage.getItem('edu_users'));
      const uIdx = users.findIndex(u => u.id === id);
      if (uIdx !== -1) {
        users[uIdx].is_active = isApproved;
        localStorage.setItem('edu_users', JSON.stringify(users));
      }
    }
  }

  async getAllUsers() {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const users = JSON.parse(localStorage.getItem('edu_users'));
    const teachers = JSON.parse(localStorage.getItem('edu_teachers'));
    const companies = JSON.parse(localStorage.getItem('edu_companies'));
    const students = JSON.parse(localStorage.getItem('edu_students'));

    return users.map(u => {
      let details = {};
      if (u.role === 'teacher') details = teachers.find(t => t.id === u.id) || {};
      if (u.role === 'company') details = companies.find(c => c.id === u.id) || {};
      if (u.role === 'student') details = students.find(s => s.id === u.id) || {};
      return { ...u, ...details };
    });
  }

  async deleteUser(id) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    let users = JSON.parse(localStorage.getItem('edu_users'));
    users = users.filter(u => u.id !== id);
    localStorage.setItem('edu_users', JSON.stringify(users));

    const tables = ['edu_teachers', 'edu_companies', 'edu_students'];
    tables.forEach(table => {
      let data = JSON.parse(localStorage.getItem(table));
      data = data.filter(item => item.id !== id);
      localStorage.setItem(table, JSON.stringify(data));
    });
  }

  async createUser(data) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const users = JSON.parse(localStorage.getItem('edu_users'));
    if (users.find(u => u.email === data.email)) throw new Error("EMAIL_EXISTS");

    const newUser = {
      id: `user_${Date.now()}`,
      email: data.email,
      password: data.password,
      role: data.role,
      is_verified: true,
      is_active: true, 
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('edu_users', JSON.stringify(users));
    return { user: newUser, error: null };
  }

  async getContent() {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    return JSON.parse(localStorage.getItem('edu_content'));
  }

  async updateContentStatus(id, status) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const list = JSON.parse(localStorage.getItem('edu_content'));
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem('edu_content', JSON.stringify(list));
    }
  }

  async getCertifications() {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    return JSON.parse(localStorage.getItem('edu_certifications'));
  }

  async addCertification(cert) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const list = JSON.parse(localStorage.getItem('edu_certifications'));
    const newCert = { id: `cert_${Date.now()}`, ...cert };
    list.push(newCert);
    localStorage.setItem('edu_certifications', JSON.stringify(list));
    return newCert;
  }

  async updateCertification(id, updatedData) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const list = JSON.parse(localStorage.getItem('edu_certifications'));
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedData };
      localStorage.setItem('edu_certifications', JSON.stringify(list));
    }
  }

  async deleteCertification(id) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    let list = JSON.parse(localStorage.getItem('edu_certifications'));
    list = list.filter(x => x.id !== id);
    localStorage.setItem('edu_certifications', JSON.stringify(list));
  }

  async getSettings() {
    return JSON.parse(localStorage.getItem('edu_settings'));
  }

  async updateMaintenanceMode(isMaintenance) {
    const settings = { maintenanceMode: isMaintenance };
    localStorage.setItem('edu_settings', JSON.stringify(settings));
  }

  // --- Teacher Functions ---
  async getCourses(teacherId) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const allCourses = JSON.parse(localStorage.getItem('edu_courses')) || [];
    return allCourses.filter(c => c.teacherId === teacherId);
  }

  async addCourse(teacherId, title, description) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const courses = JSON.parse(localStorage.getItem('edu_courses')) || [];
    const newCourse = {
      id: `course_${Date.now()}`,
      teacherId,
      title,
      description,
      createdAt: new Date().toISOString()
    };
    courses.push(newCourse);
    localStorage.setItem('edu_courses', JSON.stringify(courses));
    return newCourse;
  }

  async deleteCourse(courseId) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    let courses = JSON.parse(localStorage.getItem('edu_courses')) || [];
    courses = courses.filter(c => c.id !== courseId);
    localStorage.setItem('edu_courses', JSON.stringify(courses));
  }

  async getAssignments(courseId) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_assignments')) || [];
    return all.filter(a => a.courseId === courseId);
  }

  async addAssignment(courseId, title, dueDate) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_assignments')) || [];
    const newAssign = { id: `assign_${Date.now()}`, courseId, title, dueDate };
    all.push(newAssign);
    localStorage.setItem('edu_assignments', JSON.stringify(all));
    return newAssign;
  }

  async getMessages(teacherId) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_messages')) || [];
    return all.filter(m => m.senderId === teacherId || m.receiverId === teacherId || m.receiverId === 'all');
  }

  async sendMessage(senderId, receiverId, text) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_messages')) || [];
    all.push({
      id: `msg_${Date.now()}`,
      senderId,
      receiverId,
      text,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('edu_messages', JSON.stringify(all));
  }
   // --- Student Functions ---

   async getStudentInterests(studentId) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_interests')) || {};
    return all[studentId] || [];
  }

  async saveStudentInterests(studentId, interests) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_interests')) || {};
    all[studentId] = interests;
    localStorage.setItem('edu_interests', JSON.stringify(all));
  }

  async getEnrollments(studentId) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_enrollments')) || [];
    return all.filter(e => e.studentId === studentId);
  }

  async enrollCourse(studentId, courseId) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_enrollments')) || [];
    all.push({
        id: `enroll_${Date.now()}`,
        studentId, courseId,
        progress: 0,
        completed: false
    });
    localStorage.setItem('edu_enrollments', JSON.stringify(all));
  }

  async updateProgress(enrollmentId, progress) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_enrollments')) || [];
    const idx = all.findIndex(e => e.id === enrollmentId);
    if (idx !== -1) {
        all[idx].progress = progress;
        if (progress >= 100) {
            all[idx].completed = true;
            all[idx].completedAt = new Date().toISOString();
        }
        localStorage.setItem('edu_enrollments', JSON.stringify(all));
    }
  }

  async getTrainingApps(studentId) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_training_apps')) || [];
    return all.filter(a => a.studentId === studentId);
  }

  async applyForTraining(studentId, companyName, cvData) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_training_apps')) || [];
    all.push({
        id: `app_${Date.now()}`,
        studentId, companyName,
        cvData, // محاكاة ملف الـ CV
        status: 'Pending',
        date: new Date().toISOString()
    });
    localStorage.setItem('edu_training_apps', JSON.stringify(all));
  }
  async getAllCourses() {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    return JSON.parse(localStorage.getItem('edu_courses')) || [];
  }

  // دالة جلب الدورات الخاصة بالمعلم (للمعلم فقط)
  async getCoursesByTeacher(teacherId) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const all = JSON.parse(localStorage.getItem('edu_courses')) || [];
    return all.filter(c => c.teacherId === teacherId);
  }
    // --- Company Functions ---

    async getJobs(companyId) {
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      const allJobs = JSON.parse(localStorage.getItem('edu_jobs')) || [];
      return allJobs.filter(j => j.companyId === companyId);
    }
  
    async addJob(companyId, title, description, location, type) {
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      const jobs = JSON.parse(localStorage.getItem('edu_jobs')) || [];
      const newJob = {
        id: `job_${Date.now()}`,
        companyId,
        title,
        description,
        location,
        type, // 'Internship', 'Full-time', 'Part-time'
        createdAt: new Date().toISOString()
      };
      jobs.push(newJob);
      localStorage.setItem('edu_jobs', JSON.stringify(jobs));
      return newJob;
    }
  
    async deleteJob(jobId) {
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      let jobs = JSON.parse(localStorage.getItem('edu_jobs')) || [];
      jobs = jobs.filter(j => j.id !== jobId);
      localStorage.setItem('edu_jobs', JSON.stringify(jobs));
    }
  
    async getApplications(jobId) {
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      const allApps = JSON.parse(localStorage.getItem('edu_applications')) || [];
      return allApps.filter(a => a.jobId === jobId);
    }
  
    async updateApplicationStatus(appId, status) {
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      const allApps = JSON.parse(localStorage.getItem('edu_applications')) || [];
      const idx = allApps.findIndex(a => a.id === appId);
      if (idx !== -1) {
        allApps[idx].status = status;
        localStorage.setItem('edu_applications', JSON.stringify(allApps));
      }
    }
  
    async searchTalents(interest) {
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      const students = JSON.parse(localStorage.getItem('edu_students')) || [];
      const studentIds = students.map(s => s.id);
      
      // محاكاة: إجلب الطلاب الذين لديهم الاهتمامات
      const allInterests = JSON.parse(localStorage.getItem('edu_interests')) || {};
      
      // بحث في الطلاب إذا كان الاهتم موجود في قائمتهم
      return students.filter(s => {
        const studentInterests = allInterests[s.id] || [];
        return interest ? studentInterests.some(i => i.toLowerCase().includes(interest.toLowerCase())) : false;
      });
    }
}

export default new MockSupabase();