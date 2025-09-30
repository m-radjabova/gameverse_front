import { Route, Routes } from "react-router-dom"
import Home from "./pages/home/Home"
import MainLayout from "./layout/MainLayout"
import AuthLayout from "./layout/AuthLayout"
import Login from "./pages/login/Login"
import Register from "./pages/login/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./layout/AdminLayout"
import useLoading from "./hooks/useLoading"
import IsLoading from "./components/IsLoading"
import NotFound from "./components/NotFound"
import CartPage from "./pages/cart/CartPage"
import ShopPage from "./pages/shop/ShopPage"
import AdminProduct from "./pages/admin/products/AdminProduct"
import AdminCategories from "./pages/admin/categories/AdminCategories"
import AdminCarousel from "./pages/admin/carousel/AdminCarousel"
import ChefPage from "./pages/chef/ChefPage"
import AdminUsers from "./pages/admin/users/AdminUsers"
import CartStatus from "./components/cartStatus/CartStatus"
import WaiterPage from "./pages/waiter/WaiterPage"
import BlogPage from "./components/blog/BlogPage"
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard"
import DeliveryPage from "./pages/delivery/DeliveryPage"
import HelloAdmin from "./pages/admin/HelloAdmin"
import Profile from "./components/profile/Profile"
import ProductDisplay from "./components/product/ProductDisplay"


function App() {
  const { loading } = useLoading();

  if (loading) {
    return <IsLoading />;
  }

  return (
    <div>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:id" element={<ProductDisplay />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/cart/order-status" element={<CartStatus />} />
          <Route path="/cart/delivery" element={<DeliveryPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<Register />} />
        </Route>
        
        <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HelloAdmin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProduct />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/carousel" element={<AdminCarousel />} />
            <Route path="/admin/orders" element={<ChefPage />} />
            <Route path="/admin/waiter" element={<WaiterPage />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          <Route
            path="/chef"
            element={
              <ProtectedRoute role="CHEF">
                <ChefPage />
              </ProtectedRoute>
            }
          > 
          </Route>

          <Route
            path="/waiter"
            element={
              <ProtectedRoute role="WAITER">
                <WaiterPage />
              </ProtectedRoute>
            }
          >
          </Route>
          <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App