import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, FlaskConical, GraduationCap } from "lucide-react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logoIf from "@/assets/logo-if.png";
import logoCebio from "@/assets/logo-cebio.png";

const demoButtons: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { role: "admin", label: "Administrador", icon: <Shield className="w-4 h-4" />, desc: "Painel completo" },
  { role: "pesquisador", label: "Pesquisador", icon: <FlaskConical className="w-4 h-4" />, desc: "Submissão e acompanhamento" },
  { role: "bolsista", label: "Bolsista", icon: <GraduationCap className="w-4 h-4" />, desc: "Projetos e histórico" },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const saved = localStorage.getItem("cebio_user");
      const loggedUser = saved ? JSON.parse(saved) : null;
      toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
      if (loggedUser?.role === "admin") navigate("/admin/dashboard");
      else if (loggedUser?.role === "pesquisador") navigate("/pesquisador/dashboard");
      else navigate("/bolsista/dashboard");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginDemo(role);
    toast({ title: "Modo Demonstração", description: `Entrando como ${role}.` });
    if (role === "admin") navigate("/admin/dashboard");
    else if (role === "pesquisador") navigate("/pesquisador/dashboard");
    else navigate("/bolsista/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--cebio-green-bg))" }}>
      <div className="bg-card rounded-2xl p-10 w-full max-w-[420px] shadow-lg border border-border">
        <div className="flex items-center justify-center gap-5 mb-6">
          <img src={logoIf} alt="IF Goiano" className="h-[60px] w-auto" />
          <span className="text-2xl text-muted-foreground/50 font-light">×</span>
          <img src={logoCebio} alt="CEBIO" className="h-[60px] w-auto" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-primary">Centro de Excelência em Bioinsumos</h2>
          <p className="text-sm text-muted-foreground">Sistema de Gestão de Projetos Acadêmicos</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">Usuário</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors bg-card text-foreground" />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">Senha</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" required className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors bg-card text-foreground pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg text-[15px] font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Entrando..." : "Entrar no Sistema"}
          </button>
        </form>

        <div className="text-center mt-5">
          <a href="#" className="text-sm text-primary hover:underline">Esqueceu sua senha?</a>
        </div>

        {/* Demo Mode */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3 uppercase tracking-wider font-medium">Acesso Demonstração</p>
          <div className="flex flex-col gap-2">
            {demoButtons.map((btn) => (
              <button
                key={btn.role}
                onClick={() => handleDemoLogin(btn.role)}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left"
              >
                <span className="text-primary">{btn.icon}</span>
                <div>
                  <span className="text-sm font-medium text-foreground">{btn.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{btn.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
