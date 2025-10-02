import { useState, useEffect, useCallback } from "react"
import { db } from "../firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore"
import type { Order, OrderProduct, User } from "../types/types"

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const subscribeOrders = useCallback(() => {
    setLoading(true)
    setError(null)
    
    const ordersRef = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      ordersRef,
      async snapshot => {
        try {
          const allOrders = await Promise.all(
            snapshot.docs.map(async (orderDoc: QueryDocumentSnapshot<DocumentData>) => {
              const orderData = orderDoc.data()
              const orderId = orderDoc.id

              // user fetch
              let user: User | null = null
              if (orderData.userId) {
                try {
                  const userSnap = await getDoc(doc(db, "users", orderData.userId))
                  if (userSnap.exists()) {
                    user = { id: userSnap.id, ...userSnap.data() } as User
                  }
                } catch (err) {
                  console.warn(`User ${orderData.userId} not found:`, err)
                }
              }

              // products fetch
              let products: OrderProduct[] = []
              try {
                const productsSnap = await getDocs(
                  collection(db, "orders", orderId, "orderProducts")
                )
                products = productsSnap.docs.map(p => ({
                  id: p.id,
                  ...p.data(),
                })) as OrderProduct[]
              } catch (err) {
                console.warn(`Products for order ${orderId} not found:`, err)
              }

              return {
                id: orderId,
                userId: orderData.userId,
                user,
                totalPrice: orderData.totalPrice || 0,
                products,
                createdAt: orderData.createdAt,
                status: orderData.status || "",
                paymentMethod: orderData.paymentMethod || "",
                shippingAddress: orderData.shippingAddress || "",
                notes: orderData.notes || "",
                deliveryDate: orderData.deliveryDate || "",
                location: orderData.location,
              } as Order
            })
          )

          setOrders(allOrders)
          console.log(`Real-time: ${allOrders.length} ta order yangilandi`)
          setLoading(false)
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred")
          setLoading(false)
        }
      },
      err => {
        console.error("Real-time listener error:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsub = subscribeOrders()
    return () => unsub && unsub()
  }, [subscribeOrders])

  const getAllOrders = (): Order[] => orders
  const getOrdersByStatus = (status: string): Order[] =>
    orders.filter(order => order.status === status)
  
  const getOrdersByUser = (userId: string): Order[] =>
    orders.filter(order => order.userId === userId)

  return {
    orders,
    loading,
    error,
    refetch: subscribeOrders,
    getAllOrders,
    getOrdersByStatus,
    getOrdersByUser,
  }
}
