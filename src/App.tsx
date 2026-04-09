import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminActions from "./pages/admin/AdminActions";
import AdminReports from "./pages/admin/AdminReports";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBatchApproval from "./pages/admin/AdminBatchApproval";
import AdminMassNotification from "./pages/admin/AdminMassNotification";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAcademicLevels from "./pages/admin/AdminAcademicLevels";
import PesquisadorDashboard from "./pages/pesquisador/PesquisadorDashboard";
import PesquisadorProjects from "./pages/pesquisador/PesquisadorProjects";
import PesquisadorHistory from "./pages/pesquisador/PesquisadorHistory";
import BolsistaDashboard from "./pages/bolsista/BolsistaDashboard";
import BolsistaProjects from "./pages/bolsista/BolsistaProjects";
import BolsistaHistory from "./pages/bolsista/BolsistaHistory";
import SubmissionForm from "./pages/shared/SubmissionForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/projetos" element={<AdminProjects />} />
            <Route path="/admin/usuarios" element={<AdminUsers />} />
            <Route path="/admin/categorias" element={<AdminCategories />} />
            <Route path="/admin/niveis-academicos" element={<AdminAcademicLevels />} />
            <Route path="/admin/acoes" element={<AdminActions />} />
            <Route path="/admin/relatorios" element={<AdminReports />} />
            <Route path="/admin/auditoria" element={<AdminAudit />} />
            
            {/* Pesquisador */}
            <Route path="/pesquisador/dashboard" element={<PesquisadorDashboard />} />
            <Route path="/pesquisador/projetos" element={<PesquisadorProjects />} />
            <Route path="/pesquisador/submissao" element={<SubmissionForm />} />
            <Route path="/pesquisador/historico" element={<PesquisadorHistory />} />
            
            {/* Bolsista */}
            <Route path="/bolsista/dashboard" element={<BolsistaDashboard />} />
            <Route path="/bolsista/projetos" element={<BolsistaProjects />} />
            <Route path="/bolsista/submissao" element={<SubmissionForm />} />
            <Route path="/bolsista/historico" element={<BolsistaHistory />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
