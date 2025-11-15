import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography,
  Button,
  Container,
  Input,
  Stack,
  Pagination,
  CircularProgress,
} from "@mui/material";
import type { User } from "../../types/types";
import { FaEdit, FaTrash } from "react-icons/fa";
import useUsers from "../../hooks/useUsers";
import UserModal from "./UserForm";
import { useState, useMemo } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import Select from "react-select";

function UserList() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);

  const { users, pages, addUser, updateUser, deleteUser, isLoading, cities } =
    useUsers({ searchTerm: debouncedSearch, cities: selectedCities, page });

  const cityOptions = useMemo(
    () => [
      { value: "", label: "All Cities" },
      ...cities.map((city: string) => ({
        value: city,
        label: city,
      })),
    ],
    [cities]
  );

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

 

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mt={4}
        p={2}
      >
        <Box display="flex" gap={2} width="100%" mb={2}>
          <Input
            sx={{ flex: 1 }}
            type="search"
            placeholder="Search users by username..."
            value={search}
            onChange={handleSearchChange}
          />
          <Box sx={{ minWidth: 200 }}>
            <Select
              isMulti
              options={cityOptions}
              value={cityOptions.filter((c) => selectedCities.includes(c.value))}
              onChange={(selected) => {
                const values = selected ? selected.map((s) => s.value) : [];
                setSelectedCities(values);
                setPage(1);
              }}
              placeholder="Select cities..."
              isClearable
            />

          </Box>
        </Box>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" width="100%">
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Button variant="contained" onClick={handleCreateUser} size="large">
            Create User
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Table sx={{ minWidth: 650 }} aria-label="user table">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>username</strong>
              </TableCell>
              <TableCell>
                <strong>email</strong>
              </TableCell>
              <TableCell>
                <strong>City</strong>
              </TableCell>
              <TableCell>
                <strong>Street</strong>
              </TableCell>
              <TableCell>
                <strong>actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: User) => (
              <TableRow
                key={user.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {user.username}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.address.city}</TableCell>
                <TableCell>{user.address.street}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditUser(user)}
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
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" color="textSecondary">
                    {search || selectedCities
                      ? "No users found matching your filters"
                      : "No users available"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <UserModal
        isOpen={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        editingUser={selectedUser}
      />

      <Stack spacing={2} my={4} alignItems="center">
        <Pagination
          count={pages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Stack>
    </Container>
  );
}

export default UserList;
