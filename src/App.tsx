import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/home/Home";
import CoursePage from "./pages/course/CoursePage";

import AuthPage from "./pages/login/AuthPage";
import AuthLayout from "./layout/AuthLayout";

import MainLayout from "./layout/MainLayout";

import AdminLayout from "./layout/AdminLayout";
import HelloAdmin from "./pages/admin/HelloAdmin";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
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
          <ProtectedRoute role="user">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/courses" element={<CoursePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;