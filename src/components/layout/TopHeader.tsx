import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { roleBadge } from "@/constants/ui";
import logoIf from "@/assets/logo-if.png";
import logoCebio from "@/assets/logo-cebio.png";

const TopHeader = () => {
  const { user } = useAuth();
  const badge = user ? roleBadge[user.role] : null;

  return (
    <header className="bg-primary text-primary-foreground h-12 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src={logoIf} alt="IF Goiano" className="h-8 w-auto" />
        <span className="text-primary-foreground/60 font-light text-xl">×</span>
        <img src={logoCebio} alt="CEBIO" className="h-8 w-auto" />
      </div>

      <div className="flex-1 max-w-[280px] mx-6">
        <div className="flex items-center bg-primary-foreground/15 rounded-full px-3.5 py-1.5 gap-2">
          <Search className="w-4 h-4 text-primary-foreground/70" />
          <input
            type="text"
            placeholder="Buscar projetos..."
            className="bg-transparent border-none text-primary-foreground text-[13px] w-full outline-none placeholder:text-primary-foreground/60"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[13px] font-medium">{user?.name}</span>
        {badge && (
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>
    </header>
  );
};

export default TopHeader;
