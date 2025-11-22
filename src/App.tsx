import { Route, Routes } from "react-router-dom"
import Home from "./pages/home/Home"

import Projects from "./components/projects/Projects"
import AdminLayout from "./layout/AdminLayout"
import UserList from "./components/users/UserList"
import useLoading from "./hooks/useLoading"
import IsLoading from "./components/IsLoading"
import TeamList from "./components/teams/TeamList"

function App() {
  const { loading } = useLoading();

  if (loading) {
    return <IsLoading />;
  }

  return (
    <div>
      <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Home />} />
            <Route index path="/projects" element={<Projects />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/teams" element={<TeamList />} />
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