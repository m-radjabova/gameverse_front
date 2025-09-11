import { useState } from "react";
import PostsList from "./lists/posts/PostsList"
import UserList from "./lists/users/UserList";
import TodosList from "./lists/todos/TodosList";

function App() {
  const [component, setComponent] = useState<'users' | 'posts' | 'todos'>('users');

  return (
    <div className="container mx-auto p-4">
      <div className="buttons">
        <button className={`btn btn-outline-danger me-2 ${component === 'users' ? 'active' : ''}`} onClick={() => setComponent('users')}>Users</button>
        <button className={`btn btn-outline-primary me-2 ${component === 'posts' ? 'active' : ''}`} onClick={() => setComponent('posts')}>Posts</button>
        <button className={`btn btn-outline-success ${component === 'todos' ? 'active' : ''}`} onClick={() => setComponent('todos')}>Todos</button>
      </div>
      <div className="content">
        {component === 'users' && <UserList />}
        {component === 'posts' && <PostsList />}
        {component === 'todos' && <TodosList />}
      </div>
    </div>
  )
}

export default App