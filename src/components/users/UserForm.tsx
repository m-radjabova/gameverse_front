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
      phone_number: "",
      address: "",
      age: 18,
    },
  });

  useEffect(() => {
    if (editingUser) {
      reset(editingUser);
    } else {
      reset({
        username: "",
        email: "",
        phone_number: "",
        address: "",
        age: 18,
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
          <label htmlFor="phone_number">Phone Number</label>
          <input
            type="text"
            id="phone_number"
            placeholder="+998901234567"
            {...register("phone_number", {
              required: "Phone number is required",
              pattern: {
                value: /^\+998\d{9}$/,
                message: "Phone number must match +998XXXXXXXXX format"
              }
            })}
          />
          {errors.phone_number && <span className="error">{errors.phone_number.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            placeholder="Enter age"
            {...register("age", { 
              required: "Age is required", 
              min: { 
                value: 18, 
                message: "Age must be at least 18" 
              }, 
              max: { 
                value: 100, 
                message: "Age must be 100 or less" 
              } 
            })}
          />
          {errors.age && <span className="error">{errors.age.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            placeholder="Enter address"
            {...register("address", { 
              required: "Address is required",
              minLength: {
                value: 5,
                message: "Address must be at least 5 characters"
              }
            })}
          />
          {errors.address && <span className="error">{errors.address.message}</span>}
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