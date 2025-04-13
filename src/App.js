import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Login from './components/auth/Login';
import AdminLogin from './components/auth/AdminLogin';
import TeacherLogin from './components/auth/TeacherLogin';
import StudentLogin from './components/auth/StudentLogin';
import Setup from './components/auth/Setup'; // Add Setup component
import StudentProfile from './components/student/StudentProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import CreateQuiz from './components/teacher/CreateQuiz';
import AttemptQuiz from './components/student/AttemptQuiz';
import QuizResults from './components/teacher/QuizResults';
import ManageTeachers from './components/admin/ManageTeachers';
import ManageStudents from './components/admin/ManageStudents';
import Analytics from './components/admin/Analytics';
import Navbar from './components/common/Navbar';
import DebugPanel from './components/common/DebugPanel';

function PrivateRoute({ element, allowedRoles }) {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to the appropriate dashboard based on role
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" />;
    if (userRole === 'teacher') return <Navigate to="/teacher/dashboard" />;
    if (userRole === 'student') return <Navigate to="/student/dashboard" />;
    return <Navigate to="/login" />;
  }
  
  return element;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto py-8 px-4">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<Setup />} /> {/* Add Setup route */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/teacher/login" element={<TeacherLogin />} />
              <Route path="/student/login" element={<StudentLogin />} />
              
              {/* Student Routes */}
              <Route 
                path="/student/profile" 
                element={<PrivateRoute element={<StudentProfile />} allowedRoles={['student']} />} 
              />
              <Route 
                path="/student/dashboard" 
                element={<PrivateRoute element={<StudentDashboard />} allowedRoles={['student']} />} 
              />
              <Route 
                path="/quiz/:quizId" 
                element={<PrivateRoute element={<AttemptQuiz />} allowedRoles={['student']} />} 
              />
              
              {/* Teacher Routes */}
              <Route 
                path="/teacher/dashboard" 
                element={<PrivateRoute element={<TeacherDashboard />} allowedRoles={['teacher']} />} 
              />
              <Route 
                path="/teacher/create-quiz" 
                element={<PrivateRoute element={<CreateQuiz />} allowedRoles={['teacher']} />} 
              />
              <Route 
                path="/teacher/quiz-results/:quizId" 
                element={<PrivateRoute element={<QuizResults />} allowedRoles={['teacher']} />} 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={<PrivateRoute element={<AdminDashboard />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/admin/manage-teachers" 
                element={<PrivateRoute element={<ManageTeachers />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/admin/manage-students" 
                element={<PrivateRoute element={<ManageStudents />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/admin/analytics" 
                element={<PrivateRoute element={<Analytics />} allowedRoles={['admin']} />} 
              />
            </Routes>
          </div>
          <DebugPanel />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
