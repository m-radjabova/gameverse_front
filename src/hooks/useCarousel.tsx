import { useEffect, useState } from "react";
import type { CarouselItem } from "../types/types";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function useCarousel() {
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);

  const q = query(collection(db, "carousel"), orderBy("createdAt", "asc"));

  useEffect(() => {
    getCarousel();
  }, []);

  const getCarousel = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(q);
      const carouselItems: CarouselItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CarouselItem[];
      setCarousel(carouselItems);
    } catch (error) {
      console.error("Error fetching carousel items:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCarousel = async (newItem: CarouselItem) => {
    try {
      await addDoc(collection(db, "carousel"), {
        ...newItem,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Add category error:", err);
    }
  };

  const updateCarousel = async (id: string, updatedData: Partial<CarouselItem>) => {
    try {
      const docRef = doc(db, "carousel", id);
      await updateDoc(docRef, updatedData);
    } catch (err) {
      console.error("Update category error:", err);
    }
  };

  const deleteCarousel = async (id: string) => {
    try {
      const docRef = doc(db, "categories", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Delete category error:", err);
    }
  };
  return { carousel, loading, addCarousel, updateCarousel, deleteCarousel };
}

export default useCarousel;
