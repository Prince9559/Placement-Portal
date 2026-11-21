
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import StudentDetails from "./pages/admin/StudentDetails";
import Questions from "./pages/admin/Questions";
import Materials from "./pages/admin/Materials";
import CodingQuestions from "./pages/admin/CodingQuestions";
import InterviewQuestions from "./pages/admin/InterviewQuestions";
import Tests from "./pages/admin/Tests";
import Results from "./pages/admin/Results";
import AdminNotifications from "./pages/admin/Notifications";
import Settings from "./pages/admin/Settings";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import PracticeTests from "./pages/student/PracticeTests";
import TestAttempt from "./pages/student/TestAttempt";
import TestResult from "./pages/student/TestResult";
import ResultDetails from "./pages/student/ResultDetails";
import StudyMaterial from "./pages/student/StudyMaterial";
import MyBookmarks from "./pages/student/MyBookmarks";
import MyProgress from "./pages/student/MyProgress";
import Coding from "./pages/student/Coding";
import Interview from "./pages/student/Interview";
import StudentNotifications from "./pages/student/Notifications";

function App() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/students" element={<Students />} />
      <Route path="/admin/students/:id" element={<StudentDetails />} />
      <Route path="/admin/questions" element={<Questions />} />
      <Route path="/admin/coding-questions" element={<CodingQuestions />} />
      <Route path="/admin/interview-questions" element={<InterviewQuestions />} />
      <Route path="/admin/materials" element={<Materials />} />
      <Route path="/admin/tests" element={<Tests />} />
      <Route path="/admin/results" element={<Results />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />
      <Route path="/admin/settings" element={<Settings />} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/tests" element={<PracticeTests />} />
      <Route path="/student/tests/:id/attempt" element={<TestAttempt />} />
      <Route path="/student/results" element={<TestResult />} />
      <Route path="/student/results/:id" element={<ResultDetails />} />
      <Route path="/student/materials" element={<StudyMaterial />} />
      <Route path="/student/bookmarks" element={<MyBookmarks />} />
      <Route path="/student/progress" element={<MyProgress />} />
      <Route path="/student/coding" element={<Coding />} />
      <Route path="/student/interview" element={<Interview />} />
      <Route path="/student/notifications" element={<StudentNotifications />} />

      {/* Not Found */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
