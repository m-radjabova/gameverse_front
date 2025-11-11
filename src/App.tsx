import { Route, Routes } from "react-router-dom"
import Home from "./pages/home/Home"
import MainLayout from "./layout/MainLayout"
import AuthLayout from "./layout/AuthLayout"
import Login from "./pages/login/Login"
import Register from "./pages/login/Register"
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from "./layout/AdminLayout"
import HelloAdmin from "./pages/admin/HelloAdmin"
import NotFound from './components/NotFound';
import PostList from "./components/posts/PostList"
import UserList from "./components/users/UserList"
import TodoList from "./components/todos/TodoList"

function App() {


  return (
    <div>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<PostList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/todos" element={<TodoList />} />
        </Route>

        <Route element={<AuthLayout />}>
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
          <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App