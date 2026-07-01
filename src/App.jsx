import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { LanguageProvider } from './context/LanguageContext';   
import { AdminDashboard } from './pages/AdminDashboard'; 
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { CompanyDashboard } from './pages/CompanyDashboard'; 
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import {
  LandingPage,
  AllPathsPage,
  AllPartnersPage,
  AllCoursesPage,
  AllWorkshopsPage
} from './pages/LandingPage';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  // تم التعديل هنا: وضعنا user.user_type بدلاً من user.role
  if (!user) return <LoginPage />;
  
  if (user.user_type === 'admin') return <AdminDashboard />;
  if (user.user_type === 'teacher') return <TeacherDashboard />;
  if (user.user_type === 'student') return <StudentDashboard />;
  if (user.user_type === 'company') return <CompanyDashboard />;
  
  // وتم التعديل هنا أيضاً
  return <div className="p-10 text-center">Welcome {user.user_type}.</div>;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<RoleBasedRedirect />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
<Route path="/" element={<LandingPage />} />
<Route path="/all-paths" element={<AllPathsPage />} />
<Route path="/all-partners" element={<AllPartnersPage />} />
<Route path="/all-courses" element={<AllCoursesPage />} />
<Route path="/all-workshops" element={<AllWorkshopsPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;