import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Check, CheckCheck, ExternalLink, ArrowLeft } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_NAV, PESQUISADOR_NAV, BOLSISTA_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { formatDateBrasilia } from "@/lib/formatters";
import { usePolling } from "@/hooks/usePolling";

const NotificationsPage = ({ backPath }: { backPath?: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const pathRole = location.pathname.startsWith("/admin") ? "admin" : location.pathname.startsWith("/pesquisador") ? "pesquisador" : "bolsista";
  const navItems = pathRole === "admin" ? ADMIN_NAV : pathRole === "pesquisador" ? PESQUISADOR_NAV : BOLSISTA_NAV;
  const roleBase = `/${pathRole}`;
  const back = backPath || `${roleBase}/dashboard`;

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.listNotifications();
      setNotifications(Array.isArray(data) ? data : (data as any).notifications || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  // usePolling handles both initial fetch + periodic refresh; for demo mode, just fetch once
  usePolling(fetchNotifications, 15000);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  const handleClick = (n: any) => {
    if (!n.is_read) handleMarkAsRead(n.id);
    if (n.related_project_id) {
      navigate(`${roleBase}/projeto?id=${n.related_project_id}`);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  const notifTypeIcon: Record<string, string> = {
    info: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-600",
    approval: "bg-purple-100 text-purple-600",
  };

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AppLayout pageName="Notificações" navItems={navItems} notificationCount={unreadCount}>
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => navigate(back)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Todas lidas"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <CheckCheck className="w-3.5 h-3.5" /> Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(["all", "unread", "read"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : "Lidas"}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground text-sm">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhuma notificação</p>
              <p className="text-xs mt-1">
                {filter === "unread" ? "Todas as notificações foram lidas" : "Você ainda não recebeu notificações"}
              </p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex gap-3 px-5 py-4 border-b border-border last:border-0 transition-colors cursor-pointer ${
                  n.is_read ? "bg-card hover:bg-muted/30" : "bg-accent/20 hover:bg-accent/40"
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${notifTypeIcon[n.notification_type] || notifTypeIcon.info}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-tight ${n.is_read ? "text-foreground" : "text-foreground font-semibold"}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDateBrasilia(n.created_at)} • {timeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  {n.related_project_id && (
                    <span className="text-xs text-primary flex items-center gap-1 mt-1.5">
                      <ExternalLink className="w-3 h-3" /> Ver projeto
                    </span>
                  )}
                </div>
                {!n.is_read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                    className="text-muted-foreground hover:text-primary shrink-0 mt-1"
                    title="Marcar como lida"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
