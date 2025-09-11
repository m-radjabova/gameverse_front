import { useState } from "react";
import usePosts from "../../hooks/usePosts";
import { BiLike } from 'react-icons/bi';
import AddPostModal from "./AddPostModal";
import { FaEdit, FaTrash, FaPlus, FaFilter } from "react-icons/fa";
import type { Post } from "../../types/types";
import DeletePostModal from "./DeletePostModal";
import useUsers from "../../hooks/useUsers";
import UserSelect from "./UserSelect";
import InfiniteScroll from "react-infinite-scroll-component";

function PostsList() {
  const { posts, createPost, updatePost, deletePost, setSelectedUser, selectedUser, loadMore, hasMore } = usePosts();
  const { users } = useUsers();
  const [isOpen, setOpen] = useState(false)
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const getRandomColor = () => {
    const colors = [
      'linear-gradient(135deg, #43cea2, #185a9d)',
      'linear-gradient(135deg, #ff4e50, #f9d423)',
      'linear-gradient(135deg, #654ea3, #eaafc8)',
      'linear-gradient(135deg, #3a7bd5, #00d2ff)',
      'linear-gradient(135deg, #ff5f6d, #ffc371)',
      'linear-gradient(135deg, #8e2de2, #4a00e0)',
      'linear-gradient(135deg, #3494E6, #EC6EAD)',
      'linear-gradient(135deg, #2b5876, #4e4376)',
      'linear-gradient(135deg, #396afc, #2948ff)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="container-fluid py-5">
      <div className="row mb-4">
        <div className="col text-center">
          <h1 className="display-4 fw-bold text-gradient-post mb-3">Posts Gallery</h1>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row gap-3 align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <button 
                    className="btn btn-outline-primary d-flex align-items-center me-3"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <FaFilter className="me-2" /> Filter
                  </button>
                  {showFilter && (
                    <div className="fade-in">
                      <UserSelect 
                        users={users} 
                        selectedUser={selectedUser}
                        setSelectedUser={setSelectedUser}
                      />
                    </div>
                  )}
                </div>
                
                <button 
                  className="btn btn-primary d-flex align-items-center px-4 py-2 gradient-btn"
                  onClick={() => {setOpen(true); setEditPost(null)}}
                >
                  <FaPlus className="me-2" /> Create Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <InfiniteScroll
          dataLength={posts.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="col-12 text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          }
          endMessage={
            <div className="col-12">
              <p className="text-center text-muted p-3 border-top">All posts loaded ✅</p>
            </div>
          }
        >
          <div className="row">
            {posts.map(post => (
              <div key={post.id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card h-100 shadow-sm post-card border-0 hover-lift">
                  <div 
                    className="card-header-image rounded-top" 
                    style={{ 
                      background: getRandomColor(),
                      height: '160px',
                      position: 'relative'
                    }}
                  >
                    <div className="category-badge">Post #{post.id}</div>
                    <div className="user-badge">User: {post.userId}</div>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold text-dark truncate-title">{post.title}</h5>
                    <p className="card-text text-muted post-body">{post.body}...</p>
                    
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <small className="text-muted">Posted by User {post.userId}</small>
                      <div className="d-flex gap-2">
                        <button 
                          onClick={() => {setOpen(true); setEditPost(post)}}
                          className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center px-3 action-btn"
                        >
                          <FaEdit className="me-1" /> Edit
                        </button>
                        <button
                          onClick={() => {setOpenDeleteModal(true); setDeletePostId(post.id)}}
                          className="btn btn-sm btn-outline-danger rounded-pill d-flex align-items-center px-3 action-btn"
                        >
                          <FaTrash className="me-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </div>
      
      {posts.length === 0 && (
        <div className="row text-center mt-5">
          <div className="col">
            <div className="empty-state p-5">
              <BiLike className="empty-icon display-1 text-muted opacity-25" />
              <h5 className="mt-3 text-muted">No posts found.</h5>
              <p className="text-muted">Try changing your filters or create a new post.</p>
            </div>
          </div>
        </div>
      )}
      
      <AddPostModal 
        isOpen={isOpen} 
        setOpen={setOpen} 
        createPost={createPost} 
        updatePost={updatePost} 
        editPost={editPost}
      />

      <DeletePostModal
        deleteOpenModal={openDeleteModal}
        setDeleteOpenModal={setOpenDeleteModal}
        deletePostId={deletePostId}
        setDeletePostId={setDeletePostId}
        deletePost={deletePost}
      />
    </div>
  );
}

export default PostsList;