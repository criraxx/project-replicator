import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    department: "",
    cpf: "",
    birth_date: "",
    registration_number: "",
    role: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const roleLabel: Record<string, string> = {
    admin: "Administrador",
    pesquisador: "Pesquisador",
    bolsista: "Bolsista",
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          institution: data.institution || "",
          department: data.department || "",
          cpf: data.cpf || "",
          birth_date: data.birth_date || "",
          registration_number: data.registration_number || "",
          role: data.role || "",
        });
      } catch {
        // fallback to local user
        if (user) {
          setProfile((p) => ({ ...p, name: user.name, email: user.email, institution: user.institution, role: user.role }));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateProfile({
        email: profile.email,
        phone: profile.phone.replace(/\D/g, ""),
      });
      // update local storage
      const saved = localStorage.getItem("cebio_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.email = profile.email;
        localStorage.setItem("cebio_user", JSON.stringify(parsed));
      }
      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current) {
      toast({ title: "Erro", description: "Informe a senha atual", variant: "destructive" });
      return;
    }
    if (passwords.newPass.length < 6) {
      toast({ title: "Erro", description: "A nova senha deve ter no minimo 6 caracteres", variant: "destructive" });
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      toast({ title: "Erro", description: "As novas senhas nao coincidem", variant: "destructive" });
      return;
    }
    setChangingPass(true);
    try {
      await api.changePassword(passwords.current, passwords.newPass);
      toast({ title: "Sucesso", description: "Senha alterada com sucesso!" });
      setPasswords({ current: "", newPass: "", confirmPass: "" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setChangingPass(false);
    }
  };

  const goBack = () => {
    if (user?.role === "admin") navigate("/admin/dashboard");
    else if (user?.role === "pesquisador") navigate("/pesquisador/dashboard");
    else navigate("/bolsista/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-6">Meu Perfil</h1>

        {/* Profile info */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informacoes Pessoais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Nome</label>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">{profile.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Funcao</label>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">{roleLabel[profile.role] || profile.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">CPF</label>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">{profile.cpf || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Data de Nascimento</label>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">{profile.birth_date || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Instituicao</label>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">{profile.institution || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Departamento</label>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">{profile.department || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Matricula</label>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">{profile.registration_number || "—"}</p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Dados Editaveis</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: formatPhone(e.target.value) })}
                placeholder="(XX) 9XXXX-XXXX"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card"
                maxLength={16}
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar Alteracoes"}
            </button>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Alterar Senha</h2>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Senha Atual</label>
              <input
                type={showCurrentPass ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg text-sm bg-card"
              />
              <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-8 text-muted-foreground">
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Nova Senha</label>
              <input
                type={showNewPass ? "text" : "password"}
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg text-sm bg-card"
                placeholder="Minimo 6 caracteres"
              />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-8 text-muted-foreground">
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
              <input
                type={showConfirmPass ? "text" : "password"}
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg text-sm bg-card"
              />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-8 text-muted-foreground">
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleChangePassword}
              disabled={changingPass}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {changingPass ? "Alterando..." : "Alterar Senha"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
