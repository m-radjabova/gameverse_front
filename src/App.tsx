import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/home/Home";
import CoursePage from "./pages/course/CoursePage";

import AuthPage from "./pages/login/AuthPage";
import AuthLayout from "./layout/AuthLayout";

import MainLayout from "./layout/MainLayout";

import AdminLayout from "./layout/AdminLayout";
import HelloAdmin from "./pages/admin/HelloAdmin";
import CourseDetail from "./pages/course/CourseDetail";
import ExploreCourses from "./pages/course/ExploreCourses";
import useContextPro from "./hooks/useContextPro";
import Profile from "./components/profile/Profile";
import CheckEmailPage from "./pages/login/CheckEmailPage";

function App() {
  const { state: { isLoading } } = useContextPro();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-900 animate-spin" />
      </div>
    );
  }


  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HelloAdmin />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/courses" element={<CoursePage />} />
        <Route path="/courses/explore" element={<ExploreCourses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
