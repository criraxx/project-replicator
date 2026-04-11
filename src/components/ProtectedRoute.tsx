import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  requiredRole: UserRole | "any";
  children: React.ReactNode;
}

const roleDashboard: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  pesquisador: "/pesquisador/dashboard",
  bolsista: "/bolsista/dashboard",
};

const ProtectedRoute = ({ requiredRole, children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Verificando sessão...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole !== "any" && user.role !== requiredRole) {
    return <Navigate to={roleDashboard[user.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
