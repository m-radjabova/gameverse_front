import { useEffect, useState } from "react";
import type { Product, Reviews } from "../types/types";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { FieldValues } from "react-hook-form";

export type ReviewWithUser = Reviews & {
  id: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
};

function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
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
          ? orderBy("createdAt", "desc")
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

  const getUserById = async (userId: string) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      console.error("Get user error:", err);
      setError("Failed to get user");
      return null;
    }
  };

  const listenProductReviews = (productId: string) => {
    const reviewsRef = collection(db, "products", productId, "reviews");

    return onSnapshot(reviewsRef, async (snapshot) => {
      try {
        const reviewsWithUser: ReviewWithUser[] = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const reviewData = docSnap.data() as Reviews;

            let user = null;
            if (reviewData.userId) {
              user = await getUserById(reviewData.userId);
            }

            return {
              id: docSnap.id, // 🔥 endi faqat shu yerda id bor
              ...reviewData,
              user,
            };
          })
        );

        setReviews(reviewsWithUser);
      } catch (err) {
        console.error("Error mapping reviews with user:", err);
        setError("Failed to load reviews with user");
      }
    });
  };


  const addReview = async (
    productId: string,
    review: Omit<Reviews, "id" | "createdAt">
  ) => {
    try {
      const reviewsRef = collection(db, "products", productId, "reviews");
      await addDoc(reviewsRef, {
        ...review,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Add review error:", err);
      setError("Failed to add review");
    }
  };

  return {
    reviews,
    addReview,
    listenProductReviews,
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
