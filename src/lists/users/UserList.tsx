import { useState } from 'react';
import useUsers from "../../hooks/useUsers";
import { FiSearch, FiMail, FiPhone} from 'react-icons/fi';

function UserList() {
  const { users } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-w-full p-4">
      <div className="mb-4 ">
        <div className="text-center border-b pb-2">
          <h1 className="text-2xl font-bold">Users List </h1>
        </div>
      </div>

      <div className="mt-4 mb-6">
        <div className="min-w-full">
          <div className="flex items-center border rounded-full px-3 py-2 gap-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
            <span className="text-gray-500">
              <FiSearch className = "w-6 h-6" />
            </span>
            <input
              type="text"
              className="flex-grow outline-none"
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="border rounded-2xl p-4 shadow hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-white">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {user.name[0]}
                </div>
                <div>
                  <h5 className="font-bold text-lg">{user.name}</h5>
                  <p className="text-gray-500">@{user.username}</p>
                </div>
            </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiMail className="text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiPhone className="text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="">
          <div className="">
            <h5 className="">No users found.</h5>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;