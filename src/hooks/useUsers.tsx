import { useEffect, useState } from "react";
import apiClient from "../apiClient/apiClient";
import type { User } from "../types/types";

function useUsers() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data);  
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };


  return { users, setUsers};
}

export default useUsers