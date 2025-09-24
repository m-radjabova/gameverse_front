import { useEffect, useState } from "react";
import type { Category } from "../types/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const q = query(collection(db, "categories"), orderBy("createdAt", "asc"));

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const snapshot = await getDocs(q);
      const categories: Category[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Category[];
      setCategories(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const addCategory = async (newCategory: Omit<Category, "id">) => {
    try {
      await addDoc(collection(db, "categories"), {
        ...newCategory,
        createdAt: serverTimestamp(),
      });
      await getCategories(); // ✅ UI yangilanadi
    } catch (err) {
      console.error("Add category error:", err);
      setError("Failed to add category");
    }
  };

  const updateCategory = async (id: string, updatedData: Partial<Category>) => {
    try {
      const docRef = doc(db, "categories", id);
      await updateDoc(docRef, updatedData);
      await getCategories(); // ✅ yangilangan ma'lumot qayta yuklanadi
    } catch (err) {
      console.error("Update category error:", err);
      setError("Failed to update category");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const docRef = doc(db, "categories", id);
      await deleteDoc(docRef);
      await getCategories(); // ✅ UI yangilanadi
    } catch (err) {
      console.error("Delete category error:", err);
      setError("Failed to delete category");
    }
  };

  return { categories, error, addCategory, updateCategory, deleteCategory };
}

export default useCategories;
