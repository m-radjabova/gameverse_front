import { useEffect, useState } from "react";
import type { Product } from "../types/types";
import {collection,onSnapshot,orderBy,query,where,addDoc,updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { FieldValues } from "react-hook-form";

function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsubscribe = getProduct();
    return unsubscribe;
  }, [selectedCategory]);

  const getProduct = () => {
    try {
      const queryIf =
        selectedCategory === ""
          ? orderBy("createdAt", "asc")
          : where("categoryId", "==", selectedCategory);

      const q = query(collection(db, "products"), queryIf);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const getProducts: Product[] = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Product[];

            setProducts(getProducts);
            setLoading(false);
          } catch (mapError) {
            console.error("Mapping error:", mapError);
            setError("Error processing products");
            setLoading(false);
          }
        },
        (firestoreError) => {
          console.error("Firestore error:", firestoreError);
          setError("Error loading products");
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error("Query error:", err);
      setError("Failed to load products");
      setLoading(false);
      return () => {};
    }
  };

  const addProduct = async (newProduct: FieldValues) => {
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Add product error:", err);
      setError("Failed to add product");
    }
  };

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
    try {
      const docRef = doc(db, "products", id);
      await updateDoc(docRef, updatedData);
    } catch (err) {
      console.error("Update product error:", err);
      setError("Failed to update product");
    }
  };


  const deleteProduct = async (id: string) => {
    try {
      const docRef = doc(db, "products", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Delete product error:", err);
      setError("Failed to delete product");
    }
  };

  return {
    products,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}

export default useProducts;