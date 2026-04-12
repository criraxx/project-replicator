import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminActions from "./pages/admin/AdminActions";
import AdminReports from "./pages/admin/AdminReports";
import AdminExports from "./pages/admin/AdminExports";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminBatchApproval from "./pages/admin/AdminBatchApproval";
import AdminBatchRejection from "./pages/admin/AdminBatchRejection";
import AdminMassNotification from "./pages/admin/AdminMassNotification";
import AdminBatchResetPassword from "./pages/admin/AdminBatchResetPassword";
import PesquisadorDashboard from "./pages/pesquisador/PesquisadorDashboard";
import PesquisadorProjects from "./pages/pesquisador/PesquisadorProjects";
import PesquisadorHistory from "./pages/pesquisador/PesquisadorHistory";
import BolsistaDashboard from "./pages/bolsista/BolsistaDashboard";
import BolsistaProjects from "./pages/bolsista/BolsistaProjects";
import BolsistaHistory from "./pages/bolsista/BolsistaHistory";
import SubmissionForm from "./pages/shared/SubmissionForm";
import EditProjectPage from "./pages/shared/EditProjectPage";
import ProjectDetailView from "./pages/shared/ProjectDetailView";
import ProfilePage from "./pages/shared/ProfilePage";
import NotificationsPage from "./pages/shared/NotificationsPage";
import UserReports from "./pages/shared/UserReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ConfirmDialogProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/projetos" element={<ProtectedRoute requiredRole="admin"><AdminProjects /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/usuario" element={<ProtectedRoute requiredRole="admin"><AdminUserDetail /></ProtectedRoute>} />
            <Route path="/admin/acoes" element={<ProtectedRoute requiredRole="admin"><AdminActions /></ProtectedRoute>} />
            <Route path="/admin/relatorios" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/auditoria" element={<ProtectedRoute requiredRole="admin"><AdminAudit /></ProtectedRoute>} />
            <Route path="/admin/exportacao" element={<ProtectedRoute requiredRole="admin"><AdminExports /></ProtectedRoute>} />
            <Route path="/admin/aprovacao-lote" element={<ProtectedRoute requiredRole="admin"><AdminBatchApproval /></ProtectedRoute>} />
            <Route path="/admin/rejeicao-lote" element={<ProtectedRoute requiredRole="admin"><AdminBatchRejection /></ProtectedRoute>} />
            <Route path="/admin/notificacao-massa" element={<ProtectedRoute requiredRole="admin"><AdminMassNotification /></ProtectedRoute>} />
            <Route path="/admin/reset-senha-lote" element={<ProtectedRoute requiredRole="admin"><AdminBatchResetPassword /></ProtectedRoute>} />
            <Route path="/admin/projeto" element={<ProtectedRoute requiredRole="admin"><ProjectDetailView isAdmin /></ProtectedRoute>} />
            <Route path="/admin/perfil" element={<ProtectedRoute requiredRole="admin"><ProfilePage backPath="/admin/dashboard" /></ProtectedRoute>} />
            <Route path="/admin/notificacoes" element={<ProtectedRoute requiredRole="admin"><NotificationsPage /></ProtectedRoute>} />
            
            {/* Pesquisador */}
            <Route path="/pesquisador/dashboard" element={<ProtectedRoute requiredRole="pesquisador"><PesquisadorDashboard /></ProtectedRoute>} />
            <Route path="/pesquisador/projetos" element={<ProtectedRoute requiredRole="pesquisador"><PesquisadorProjects /></ProtectedRoute>} />
            <Route path="/pesquisador/submissao" element={<ProtectedRoute requiredRole="pesquisador"><SubmissionForm /></ProtectedRoute>} />
            <Route path="/pesquisador/editar" element={<ProtectedRoute requiredRole="pesquisador"><EditProjectPage /></ProtectedRoute>} />
            <Route path="/pesquisador/historico" element={<ProtectedRoute requiredRole="pesquisador"><PesquisadorHistory /></ProtectedRoute>} />
            <Route path="/pesquisador/perfil" element={<ProtectedRoute requiredRole="pesquisador"><ProfilePage backPath="/pesquisador/dashboard" /></ProtectedRoute>} />
            <Route path="/pesquisador/notificacoes" element={<ProtectedRoute requiredRole="pesquisador"><NotificationsPage /></ProtectedRoute>} />
            
            {/* Bolsista */}
            <Route path="/bolsista/dashboard" element={<ProtectedRoute requiredRole="bolsista"><BolsistaDashboard /></ProtectedRoute>} />
            <Route path="/bolsista/projetos" element={<ProtectedRoute requiredRole="bolsista"><BolsistaProjects /></ProtectedRoute>} />
            <Route path="/bolsista/submissao" element={<ProtectedRoute requiredRole="bolsista"><SubmissionForm /></ProtectedRoute>} />
            <Route path="/bolsista/editar" element={<ProtectedRoute requiredRole="bolsista"><EditProjectPage /></ProtectedRoute>} />
            <Route path="/bolsista/historico" element={<ProtectedRoute requiredRole="bolsista"><BolsistaHistory /></ProtectedRoute>} />
            <Route path="/bolsista/perfil" element={<ProtectedRoute requiredRole="bolsista"><ProfilePage backPath="/bolsista/dashboard" /></ProtectedRoute>} />
            <Route path="/bolsista/notificacoes" element={<ProtectedRoute requiredRole="bolsista"><NotificationsPage /></ProtectedRoute>} />
            
            {/* Shared - protected, any authenticated role */}
            <Route path="/projeto" element={<ProtectedRoute requiredRole="any"><ProjectDetailView /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </ConfirmDialogProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
