import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Button,
} from "@mui/material";
import type { User } from "../../types/types";
import { FaEdit, FaMinus, FaTrash } from "react-icons/fa";
import { Plus } from "react-bootstrap-icons";
import useUsers from "../../hooks/useUsers";
import UserModal from "./UserForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserList() {
  const { users, addUser, updateUser, deleteUser, incrementAge, decrementAge } =
    useUsers();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const handleCreateUser = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = (user: User) => {
    if (user.id) {
      updateUser(user);
    } else {
      addUser(user);
    }
    handleClose();
  };

  return (
    <TableContainer component={Paper}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        p={2}
      >
        <Button variant="contained" onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button variant="contained" onClick={handleCreateUser} size="large">
          Create User
        </Button>
      </Box>
      <Table sx={{ minWidth: 650 }} aria-label="user table">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Name</strong>
            </TableCell>
            <TableCell>
              <strong>Email</strong>
            </TableCell>
            <TableCell>
              <strong>Phone</strong>
            </TableCell>
            <TableCell>
              <strong>Address</strong>
            </TableCell>
            <TableCell>
              <strong>Age</strong>
            </TableCell>
            <TableCell>
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {user.username}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone_number}</TableCell>
              <TableCell>{user.address}</TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => decrementAge(user.id!)}
                    disabled={user.age <= 1}
                  >
                    <FaMinus fontSize="small" />
                  </IconButton>
                  <Typography
                    variant="body1"
                    sx={{ minWidth: 30, textAlign: "center" }}
                  >
                    {user.age}
                  </Typography>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => incrementAge(user.id!)}
                  >
                    <Plus fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditUser(user)} // Tuzatildi: editUser -> handleEditUser
                    size="small"
                  >
                    <FaEdit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => deleteUser(user.id!)}
                    size="small"
                  >
                    <FaTrash />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UserModal 
        isOpen={open} 
        onClose={handleClose} 
        onSubmit={handleSubmit} 
        editingUser={selectedUser} 
      />
    </TableContainer>
  );
}

export default UserList;