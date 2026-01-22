import { Navigate } from "react-router-dom";
import useContextPro from "../hooks/useContextPro";

interface Props {
  role: string;
  children: React.ReactNode;
}
function ProtectedRoute({ role, children }: Props) {

  const { state: { user,isLoading } } = useContextPro();

  if (!isLoading && (!user || user.role !== role)) {
    return <Navigate to="/" replace />;
  }

  return (
    children
  )
}

export default ProtectedRoute