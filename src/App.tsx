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
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
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
            <Route path="/admin/products" element={<AdminProduct />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/carousel" element={<AdminCarousel />} />
          </Route>
          <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App