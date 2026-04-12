import { useAuth } from "@/contexts/AuthContext";
import { demoProjects, demoNotifications, demoAuditLogs, demoCategories, demoAllUsers } from "@/data/demoData";

/**
 * Returns demo-aware data fetchers.
 * In demo mode, returns mock data instead of calling the API.
 */
export const useDemoData = () => {
  const { user, isDemoMode } = useAuth();

  const getProjects = (ownOnly = false) => {
    if (!isDemoMode) return null; // signal: use real API
    let projects = [...demoProjects];
    if (ownOnly && user) {
      projects = projects.filter(p => p.owner_id === user.id);
    }
    return projects;
  };

  const getProjectById = (id: number) => {
    if (!isDemoMode) return null;
    return demoProjects.find(p => p.id === id) || null;
  };

  const getNotifications = () => {
    if (!isDemoMode) return null;
    return demoNotifications;
  };

  const getAuditLogs = () => {
    if (!isDemoMode) return null;
    return demoAuditLogs;
  };

  const getCategories = () => {
    if (!isDemoMode) return null;
    return demoCategories;
  };

  const getUsers = () => {
    if (!isDemoMode) return null;
    return demoAllUsers;
  };

  const getStats = () => {
    if (!isDemoMode) return null;
    return {
      total: demoProjects.length,
      pending: demoProjects.filter(p => p.status === "pendente").length,
      approved: demoProjects.filter(p => p.status === "aprovado").length,
      rejected: demoProjects.filter(p => p.status === "rejeitado").length,
    };
  };

  return { isDemoMode, getProjects, getProjectById, getNotifications, getAuditLogs, getCategories, getUsers, getStats };
};
