import { Route, Routes } from "react-router-dom"
import Home from "./pages/home/Home"

import Projects from "./components/projects/Projects"
import AdminLayout from "./layout/AdminLayout"
function App() {


  return (
    <div>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
        </Route>

        {/* <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<Register />} />
        </Route>
        
        <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HelloAdmin />} />
          </Route>
          <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  )
}

export default App