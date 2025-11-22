import { useState, useEffect } from "react";
import { Controller, useForm, type FieldValues } from "react-hook-form";
import useUsers from "../../hooks/useUsers";
import { FaUser, FaEdit, FaTrash, FaEnvelope } from "react-icons/fa";
import type { ReqUser, User } from "../../types/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Drawer,
  Box,
  TextField
} from "@mui/material";
import ModalHeader from "../projects/add_modal/ModalHeader";
import FormField from "../projects/add_modal/FromField";
import { inputStyles } from "../../utils";
import SubmitButton from "../projects/add_modal/SubmitButton";
import { IoMdCheckmarkCircle } from "react-icons/io";

const UserList = () => {
  const { users, addUser, deleteUser, updateUser } = useUsers();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const { handleSubmit, formState: { errors }, reset, control } = useForm({
    defaultValues: {
      username: '',
      email: ''
    }
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        username: editingUser.username,
        email: editingUser.email
      });
    }
  }, [editingUser, reset]);

  const handleCloseModal = () => {
    setOpenAddModal(false);
    setEditingUser(null);
    reset();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setOpenAddModal(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const onSubmit = (data: FieldValues) => {
    
    if (editingUser) {
      updateUser({ 
        id: editingUser.id, 
        username: data.username, 
        email: data.email 
      });
    } else {
      addUser(data as ReqUser);
    }
    handleCloseModal();
  };

  return (
    <div className="projects-container">
      <div className="user-table-container">
        <div className="projects-header">
          <h2 className="projects-title">User List</h2>
          <button
            className="user-add-btn"
            onClick={() => setOpenAddModal(true)}
          >
            <FaUser className="user-add-icon" />
            Add User
          </button>
        </div>

        <div className="user-table-body">
          <table className="user-table">
            <thead className="user-table-header">
              <tr>
                <th className="user-table-heading">Name</th>
                <th className="user-table-heading">Email</th>
                <th className="user-table-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="user-table-row">
                  <td className="user-table-cell">{user.username}</td>
                  <td className="user-table-cell">{user.email}</td>
                  <td className="user-table-cell">
                    <div className="user-action-buttons">
                      <button
                        className="user-edit-btn"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        <FaEdit className="user-action-icon" />
                      </button>
                      <button
                        className="user-delete-btn"
                        onClick={() => handleDeleteClick(user)}
                        title="Delete User"
                      >
                        <FaTrash className="user-action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        className="status-modal-drawer"
        anchor="right"
        open={openAddModal}
        onClose={handleCloseModal}
      >
        <Box className="status-modal-container" sx={{ p: 3, width: 700 }}>
          <ModalHeader 
            isEditing={!!editingUser} 
            onClose={handleCloseModal} 
            title={editingUser ? "Edit User" : "Create User"}
          />

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}
          >
            <Controller
              name="username"
              control={control}
              rules={{ required: "Username is required" }}
              render={({ field }) => (
                <FormField
                  icon={<FaUser style={{ color: "#6366f1", fontSize: "1.1rem" }} />}
                  label="Username"
                  error={errors.username?.message as string}
                >
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Enter username..."
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    sx={inputStyles}
                  />
                </FormField>
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{ 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              }}
              render={({ field }) => (
                <FormField
                  icon={<FaEnvelope style={{ color: "#6366f1", fontSize: "1.1rem" }} />}
                  label="Email"
                  error={errors.email?.message as string}
                >
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Enter email..."
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={inputStyles}
                  />
                </FormField>
              )}
            />
            
            <SubmitButton
              isEditing={editingUser !== null}
              startIcon={editingUser ? <FaEdit /> : <IoMdCheckmarkCircle />}
            >
              {editingUser ? "Update User" : "Create User"}
            </SubmitButton>
          </Box>
        </Box>
      </Drawer>


      <Dialog
        open={deleteModalOpen}
        onClose={handleCancelDelete}
        className="delete-confirmation-modal"
        PaperProps={{
          className: "modal-paper",
        }}
      >
        <DialogTitle className="modal-title">
          <FaTrash className="title-icon" />
          Delete User
        </DialogTitle>

        <DialogContent className="modal-content">
          <Typography className="modal-message">
            Are you sure you want to delete "
            <span className="task-name-highlight">
              {userToDelete?.username || "this user"}
            </span>"?
            <br />
            <span className="warning-text">
              This action cannot be undone.
            </span>
          </Typography>
        </DialogContent>

        <DialogActions className="modal-actions">
          <Button
            onClick={handleCancelDelete}
            className="cancel-btn"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            className="confirm-delete-btn"
            variant="contained"
            startIcon={<FaTrash />}
            color="error"
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserList;