import { Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/home/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/login/Login";
import Signup from "./pages/login/SingUp";
import HelloAdmin from "./pages/admin/HelloAdmin";
import AdminLayout from "./layout/AdminLayout";

function App() {
  return (
    <div>
      <Routes>
         <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />


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