import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Post } from "../../types/types";
import UseModal from "../../hooks/useModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Post) => void;
  editingPost: Post | null;
}

const PostModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, editingPost }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Post>({
    defaultValues: {
      title: "",
      body: "",
      user_id: 1,
    },
  });

  useEffect(() => {
    if (editingPost) {
      reset(editingPost);
    } else {
      reset({
        title: "",
        body: "",
        user_id: 1,
      });
    }
  }, [editingPost, reset, isOpen]);

  const submitHandler = (data: Post) => {
    const newPost = { ...data, id: editingPost ? editingPost.id : 0 };
    onSubmit(newPost);
  };

  return (
    <UseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPost ? "Update Post" : "Create Post"}
      size="lg"
    >
      <form onSubmit={handleSubmit(submitHandler)} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            placeholder="Enter post title"
            {...register("title", { 
              required: "Title is required", 
              minLength: { 
                value: 5, 
                message: "Title must be at least 5 characters" 
              },
              maxLength: {
                value: 200,
                message: "Title must be less than 200 characters"
              }
            })}
          />
          {errors.title && <span className="error">{errors.title.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="body">Content</label>
          <textarea
            id="body"
            placeholder="Enter post content"
            rows={6}
            {...register("body", { 
              required: "Content is required", 
              minLength: { 
                value: 10, 
                message: "Content must be at least 10 characters" 
              },
              maxLength: {
                value: 1000,
                message: "Content must be less than 1000 characters"
              }
            })}
          />
          {errors.body && <span className="error">{errors.body.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="user_id">User ID</label>
          <input
            type="number"
            id="user_id"
            placeholder="Enter user ID"
            {...register("user_id", { 
              required: "User ID is required", 
              min: { 
                value: 1, 
                message: "User ID must be at least 1" 
              },
              valueAsNumber: true
            })}
          />
          {errors.user_id && <span className="error">{errors.user_id.message}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {editingPost ? "Update Post" : "Create Post"}
          </button>
        </div>
      </form>
    </UseModal>
  );
};

export default PostModal;