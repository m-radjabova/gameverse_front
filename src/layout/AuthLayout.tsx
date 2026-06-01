import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AuthLayout() {
  const location = useLocation();
  const isInitialPageLoad = location.key === "default";

  if (location.pathname === "/login" && isInitialPageLoad) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}
