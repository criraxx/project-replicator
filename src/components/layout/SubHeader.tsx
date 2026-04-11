import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, LogOut, Check, ExternalLink, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/services/api";

interface NavItem {
  label: string;
  path: string;
}

interface SubHeaderProps {
  pageName: string;
  navItems: NavItem[];
  notificationCount?: number;
}

const SubHeader = ({ pageName, navItems }: SubHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.listNotifications(30);
      setNotifications(data.notifications || []);
      setUnreadCount((data.notifications || []).filter((n: any) => !n.is_read).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifications]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleNotificationClick = (n: any) => {
    if (!n.is_read) handleMarkAsRead(n.id);
    if (n.related_project_id) {
      const role = user?.role;
      if (role === "admin") {
        navigate(`/admin/projeto?id=${n.related_project_id}`);
      } else {
        navigate(`/projeto?id=${n.related_project_id}`);
      }
      setShowNotifications(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "--";

  const notifTypeIcon: Record<string, string> = {
    info: "bg-cebio-blue-bg text-cebio-blue",
    success: "bg-cebio-green-bg text-primary",
    warning: "bg-cebio-yellow-bg text-cebio-yellow",
    error: "bg-cebio-red-bg text-cebio-red",
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Agora";
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <>
      <div className="bg-card border-b border-border h-14 px-3 sm:px-6 flex items-center justify-between">
        {/* Mobile: hamburger + page name */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-foreground p-1">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-bold text-foreground truncate max-w-[160px]">{pageName}</span>
        </div>

        {/* Desktop: page name + nav */}
        <div className="hidden md:flex items-center gap-0 flex-1 justify-center relative">
          <span className="text-base font-bold text-foreground whitespace-nowrap w-[180px] shrink-0 pr-4 absolute left-0">
            {pageName}
          </span>
          <nav className="flex gap-1 pl-[200px] pr-4 justify-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side: notifications, profile, logout */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Notifications bell */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 sm:right-0 top-10 w-[calc(100vw-24px)] sm:w-[380px] max-w-[380px] bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden" style={{ right: "0", left: "auto" }}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h4 className="text-sm font-semibold text-foreground">Notificacoes</h4>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline font-medium">
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Nenhuma notificacao</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors cursor-pointer ${
                          n.is_read ? "bg-card hover:bg-muted/30" : "bg-accent/30 hover:bg-accent/50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${notifTypeIcon[n.notification_type] || notifTypeIcon.info}`}>
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-tight ${n.is_read ? "text-foreground" : "text-foreground font-semibold"}`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{timeAgo(n.created_at)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          {n.related_project_id && (
                            <span className="text-[10px] text-primary flex items-center gap-1 mt-1">
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

                <div className="border-t border-border px-4 py-2.5">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      const base = location.pathname.startsWith("/admin") ? "/admin" : location.pathname.startsWith("/pesquisador") ? "/pesquisador" : "/bolsista";
                      navigate(`${base}/notificacoes`);
                    }}
                    className="w-full text-center text-xs font-semibold text-primary hover:underline"
                  >
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => {
            const role = user?.role;
            if (role === "admin") navigate("/admin/perfil");
            else if (role === "pesquisador") navigate("/pesquisador/perfil");
            else navigate("/bolsista/perfil");
          }} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cebio-green-light flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-sm">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[13px] font-semibold text-foreground">{user?.name}</div>
              <div className="text-[11px] text-muted-foreground">{user?.institution}</div>
            </div>
          </button>

          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border px-3 py-2 flex flex-wrap gap-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

export default SubHeader;
