import { useEffect, useState } from "react";
import type { User } from "../types/types";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 

  const q = query(collection(db, "users"), orderBy("createdAt", "asc"));

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(q);
      const users: User[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

 
  const updateUserRole = async (userId: string, newRoles: string[]) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { roles: newRoles });
      toast.success("User roles updated!");
      await getUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update roles");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      toast.success("User deleted!");
      setUsers((prev) => prev.filter((u) => u.id !== userId)); 
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    users: filteredUsers,
    loading,
    updateUserRole,
    deleteUser,
    searchTerm,
    setSearchTerm,
  };
}

export default useUsers;