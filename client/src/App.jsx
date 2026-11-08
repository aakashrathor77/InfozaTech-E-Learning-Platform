
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyCourses from "./pages/MyCourses.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import InstructorDashboard from "./pages/InstructorDashboard.jsx";
import AddLesson from "./pages/AddLesson.jsx";
import CreateQuiz from "./pages/CreateQuiz.jsx";
import Certificates from "./pages/Certificates.jsx";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "instructor" ? "/instructor" : "/"}
        replace
      />
    );
  }

  return children;
}

function DashboardRedirect() {
  const token = localStorage.getItem("token");
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === "instructor" ? "/instructor" : "/"}
      replace
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute role="student">
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={<DashboardRedirect />}
      />

      <Route
        path="/my-courses"
        element={
          <ProtectedRoute role="student">
            <MyCourses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/course/:courseId"
        element={
          <ProtectedRoute>
            <CourseDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/certificates"
        element={
          <ProtectedRoute role="student">
            <Certificates />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor"
        element={
          <ProtectedRoute role="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-lesson"
        element={
          <ProtectedRoute role="instructor">
            <AddLesson />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-quiz"
        element={
          <ProtectedRoute role="instructor">
            <CreateQuiz />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;
