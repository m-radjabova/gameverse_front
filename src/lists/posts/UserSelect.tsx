import React from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { User } from "../../types/types";

interface Props {
  users: User[];
  selectedUser: number | "";
  setSelectedUser: React.Dispatch<React.SetStateAction<number | "">>;
}

function UserSelect({ users, selectedUser, setSelectedUser }: Props) {
  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedUser(value === "" ? "" : Number(value));
  };

  return (
    <FormControl fullWidth className="mb-2">
        <InputLabel id="user-select-label" sx={{ color: "#2e4a7dff" }}>
          Filter by User
        </InputLabel>
        <Select
          labelId="user-select-label"
          value={selectedUser === "" ? "" : selectedUser.toString()}
          onChange={handleChange}
          label="Filter by User"
          sx={{
              color: "#1a3a5dff",
              minWidth: 200,
                '& .MuiSvgIcon-root': {
                  color: "#2e4a7dff"
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#c8cbe6ff',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#81a4d6ff',
                },
            }}
            className="select-user"
        >
          <MenuItem value="">
            <em>All Users</em>
            </MenuItem>
            {users.map((user) => (
                <MenuItem
                    key={user.id}
                    value={user.id}
                    sx={{ color: "#1a3a5dff" }}
                >
                    {user.name}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
  );
}



export default UserSelect;