import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { User } from "../../types/types";
import UseModal from "../../hooks/useModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: User) => void;
  editingUser: User | null;
}

const UserModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, editingUser }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<User>({
    defaultValues: {
      username: "",
      email: "",
      address: {
        street: "",
        city: ""
      },
    },
  });

  useEffect(() => {
    if (editingUser) {
      reset(editingUser);
    } else {
      reset({
        username: "",
        email: "",
        address: {
          street: "",
          city: ""
        },
      });
    }
  }, [editingUser, reset, isOpen]); 

  const submitHandler = (data: User) => {
    const newUser = { ...data, id: editingUser ? editingUser.id : 0 };
    onSubmit(newUser);
  };

  return (
    <UseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUser ? "Update User" : "Create User"}
      size="md"
    >
      <form onSubmit={handleSubmit(submitHandler)} className="user-form">
        <div className="form-group">
          <label htmlFor="username">Full Name</label>
          <input
            type="text"
            id="username"
            placeholder="Enter full name"
            {...register("username", { 
              required: "Name is required", 
              minLength: { 
                value: 5, 
                message: "Name must be at least 5 characters" 
              } 
            })}
          />
          {errors.username && <span className="error">{errors.username.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter email"
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address"
              }
            })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="street">Street</label>
          <input
            type="text"
            id="street"
            placeholder="Enter street address"
            {...register("address.street", { 
              required: "Street is required",
              minLength: {
                value: 3,
                message: "Street must be at least 3 characters"
              }
            })}
          />
          {errors.address?.street && <span className="error">{errors.address.street.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            placeholder="Enter city"
            {...register("address.city", { 
              required: "City is required",
              minLength: {
                value: 2,
                message: "City must be at least 2 characters"
              }
            })}
          />
          {errors.address?.city && <span className="error">{errors.address.city.message}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {editingUser ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </UseModal>
  );
};

export default UserModal;