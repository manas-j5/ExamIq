import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout & Protected Route Guard
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableExams from './pages/student/AvailableExams';
import ExamInstructions from './pages/student/ExamInstructions';
import ExamPortal from './pages/student/ExamPortal';
import ExamResult from './pages/student/ExamResult';
import StudentResults from './pages/student/StudentResults';
import StudentProfile from './pages/student/StudentProfile';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import ManageExams from './pages/faculty/ManageExams';
import CreateExam from './pages/faculty/CreateExam';
import QuestionBank from './pages/faculty/QuestionBank';
import ExamQuestionsManager from './pages/faculty/ExamQuestionsManager';
import LiveMonitoring from './pages/faculty/LiveMonitoring';
import ExamAnalytics from './pages/faculty/ExamAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseSubjectManagement from './pages/admin/CourseSubjectManagement';
import SystemOverview from './pages/admin/SystemOverview';

// Root redirect handler
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Root Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Distraction-Free Exam Portal (Full Screen, No regular navbar/sidebar) */}
            <Route
              path="/student/exam/:examId/live"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <ExamPortal />
                </ProtectedRoute>
              }
            />

            {/* Student Protected Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/exams" element={<AvailableExams />} />
              <Route path="/student/exam/:examId/instructions" element={<ExamInstructions />} />
              <Route path="/student/results" element={<StudentResults />} />
              <Route path="/student/results/:resultId" element={<ExamResult />} />
              <Route path="/student/profile" element={<StudentProfile />} />
            </Route>

            {/* Faculty Protected Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/exams" element={<ManageExams />} />
              <Route path="/faculty/exams/create" element={<CreateExam />} />
              <Route path="/faculty/exams/edit/:id" element={<CreateExam />} />
              <Route path="/faculty/exams/:examId/questions" element={<ExamQuestionsManager />} />
              <Route path="/faculty/questions" element={<QuestionBank />} />
              <Route path="/faculty/monitoring" element={<LiveMonitoring />} />
              <Route path="/faculty/exams/:examId/analytics" element={<ExamAnalytics />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/academics" element={<CourseSubjectManagement />} />
              <Route path="/admin/overview" element={<SystemOverview />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
