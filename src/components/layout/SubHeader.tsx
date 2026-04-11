import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
}

interface SubHeaderProps {
  pageName: string;
  navItems: NavItem[];
  notificationCount?: number;
}

const SubHeader = ({ pageName, navItems, notificationCount = 0 }: SubHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "--";

  return (
    <div className="bg-card border-b border-border h-14 px-6 flex items-center justify-between">
      <div className="flex items-center gap-0 flex-1 justify-center relative">
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

      <div className="flex items-center gap-4 shrink-0">
        <div className="relative cursor-pointer text-muted-foreground">
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] flex items-center justify-center font-bold">
              {notificationCount}
            </span>
          )}
        </div>

        <button onClick={() => navigate("/perfil")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-cebio-green-light flex items-center justify-center text-primary-foreground font-semibold text-sm">
            {initials}
          </div>
          <div className="text-left">
            <div className="text-[13px] font-semibold text-foreground">{user?.name}</div>
            <div className="text-[11px] text-muted-foreground">{user?.institution}</div>
          </div>
        </button>

        <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SubHeader;
