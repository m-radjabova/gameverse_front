import { Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/home/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/login/Login";
import HelloAdmin from "./pages/admin/HelloAdmin";
import AdminLayout from "./layout/AdminLayout";
// import Register from "./pages/login/Register";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />


          <Route
            element={
              <ProtectedRoute role="user">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
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
        </Routes>
    </div>
  );
}

export default App;