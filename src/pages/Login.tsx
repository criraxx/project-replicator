import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logoIf from "@/assets/logo-if.png";
import logoCebio from "@/assets/logo-cebio.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--cebio-green-bg))" }}>
      <div className="bg-card rounded-2xl p-10 w-full max-w-[400px] shadow-lg border border-border">
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

      </div>
    </div>
  );
};

export default Login;
