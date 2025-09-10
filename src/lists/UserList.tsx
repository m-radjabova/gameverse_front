import { useState } from 'react';
import useUsers from "../hooks/useUsers";
import { FiSearch, FiMail, FiPhone, FiUser, FiHeart, FiInstagram, FiTwitter } from 'react-icons/fi';
import { FaPinterest } from 'react-icons/fa';

function UserList() {
  const { users } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-5">
      <div className="row mb-5 text-center">
        <div className="col">
          <h1 className="display-4 fw-bold text-gradient">Users List </h1>
        </div>
      </div>

      <div className="row mb-4 justify-content-center">
        <div className="col-md-6">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              <FiSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row">
        {filteredUsers.map(user => (
          <div key={user.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm user-card">
              <div className="card-body p-4 text-center">
                <div className="mb-3">
                  <div className="avatar-circle mx-auto mb-3">
                    <FiUser className="avatar-icon" />
                  </div>
                  <h5 className="fw-bold mb-1">{user.name}</h5>
                  <p className="text-muted mb-2">@{user.username}</p>
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <FiMail className="me-2 text-primary" />
                    <span>{user.email}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-center">
                    <FiPhone className="me-2 text-primary" />
                    <span>{user.phone}</span>
                  </div>
                </div>

                <div className="d-flex justify-content-center social-icons mb-3">
                  <a href="#" className="mx-2"><FiInstagram className="text-danger" /></a>
                  <a href="#" className="mx-2"><FiTwitter className="text-info" /></a>
                  <a href="#" className="mx-2"><FaPinterest className="text-danger" /></a>
                </div>

                <button className="btn btn-outline-primary btn-sm rounded-pill">
                  <FiHeart className="me-1" /> Like
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="row text-center mt-5">
          <div className="col">
            <h5 className="text-muted">No users found.</h5>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;