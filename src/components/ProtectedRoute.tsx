import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

const roleDashboard: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  pesquisador: "/pesquisador/dashboard",
  bolsista: "/bolsista/dashboard",
};

const ProtectedRoute = ({ requiredRole, children }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to={roleDashboard[user.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
