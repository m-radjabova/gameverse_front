import { Route, Routes } from "react-router-dom"

import MainLayout from "./layout/MainLayout"
// import UserListForSql from "./components/usersForSql/UserListForSql"
import PostList from "./components/posts/PostsList"
import CommentList from "./components/comments/CommentList"
import TodoList from "./components/todos/TodoList"
import CarList from "./components/car/CarList"

function App() {

  return (
    <div>
      <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<CarList />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/posts/:id/comments" element={<CommentList />} />
            <Route path="/todos/:id" element={<TodoList />} />
          </Route>
      </Routes>
    </div>
  )
}

export default App