import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user?.role === "pesquisador") {
      navigate("/pesquisador/dashboard");
    } else {
      navigate("/bolsista/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  return null;
};

export default Index;
