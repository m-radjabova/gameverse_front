import { Navigate, useLocation } from "react-router-dom";
import useContextPro from "../hooks/useContextPro";
import type { AppRole } from "../utils/roles";
import { hasAnyRole } from "../utils/roles";

interface Props {
  role?: AppRole;
  roles?: AppRole[];
  children: React.ReactNode;
}
function ProtectedRoute({ role, roles, children }: Props) {
  const location = useLocation();

  const { state: { user,isLoading } } = useContextPro();
  const requiredRoles = roles ?? (role ? [role] : []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-900 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRoles.length && !hasAnyRole(user, requiredRoles)) {
    return <Navigate to="/" replace />;
  }

  return (
    children
  )
}

export default ProtectedRoute
