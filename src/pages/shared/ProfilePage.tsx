import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { formatDateBrasilia } from "@/lib/formatters";
import { demoUsers } from "@/data/demoData";

interface ProfilePageProps {
  backPath: string;
}

const ProfilePage = ({ backPath }: ProfilePageProps) => {
  const { user, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", institution: "", department: "",
    cpf: "", birth_date: "", registration_number: "", role: "",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirmPass: "" });
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
    admin: "Administrador", pesquisador: "Pesquisador", bolsista: "Bolsista",
  };

  useEffect(() => {
    if (isDemoMode && user) {
      const du = demoUsers[user.role];
      setProfile({
        name: du.name, email: du.email, phone: "(62) 99999-0000", institution: du.institution,
        department: "Departamento de Bioinsumos", cpf: du.cpf || "", birth_date: "1985-03-15",
        registration_number: "REG-" + du.id, role: du.role,
      });
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setProfile({
          name: data.name || "", email: data.email || "", phone: data.phone || "",
          institution: data.institution || "", department: data.department || "",
          cpf: data.cpf || "", birth_date: data.birth_date || "",
          registration_number: data.registration_number || "", role: data.role || "",
        });
      } catch {
        if (user) setProfile(p => ({ ...p, name: user.name, email: user.email, institution: user.institution, role: user.role }));
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ email: profile.email, phone: profile.phone.replace(/\D/g, "") });
      const saved = localStorage.getItem("cebio_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.email = profile.email;
        localStorage.setItem("cebio_user", JSON.stringify(parsed));
      }
      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!passwords.current) { toast({ title: "Erro", description: "Informe a senha atual", variant: "destructive" }); return; }
    if (passwords.newPass.length < 6) { toast({ title: "Erro", description: "A nova senha deve ter no minimo 6 caracteres", variant: "destructive" }); return; }
    if (passwords.newPass !== passwords.confirmPass) { toast({ title: "Erro", description: "As novas senhas nao coincidem", variant: "destructive" }); return; }
    setChangingPass(true);
    try {
      await api.changePassword(passwords.current, passwords.newPass);
      toast({ title: "Sucesso", description: "Senha alterada com sucesso!" });
      setPasswords({ current: "", newPass: "", confirmPass: "" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally { setChangingPass(false); }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando perfil...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <button onClick={() => navigate(backPath)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-6">Meu Perfil</h1>

        {/* Read-only info */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informacoes Pessoais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Nome", value: profile.name },
              { label: "Funcao", value: roleLabel[profile.role] || profile.role },
              { label: "CPF", value: profile.cpf ? profile.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—" },
              { label: "Data de Nascimento", value: profile.birth_date ? formatDateBrasilia(profile.birth_date) : "—" },
              { label: "Instituicao", value: profile.institution || "—" },
              { label: "Departamento", value: profile.department || "—" },
              { label: "Matricula", value: profile.registration_number || "—" },
            ].map((item, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-muted-foreground mb-1">{item.label}</label>
                <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Editable */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Dados Editaveis</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input type="text" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: formatPhone(e.target.value) })} placeholder="(XX) 9XXXX-XXXX" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" maxLength={16} />
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Alteracoes"}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Alterar Senha</h2>
          <div className="space-y-4">
            {[
              { label: "Senha Atual", value: passwords.current, key: "current" as const, show: showCurrentPass, toggle: () => setShowCurrentPass(!showCurrentPass) },
              { label: "Nova Senha", value: passwords.newPass, key: "newPass" as const, show: showNewPass, toggle: () => setShowNewPass(!showNewPass), placeholder: "Minimo 6 caracteres" },
              { label: "Confirmar Nova Senha", value: passwords.confirmPass, key: "confirmPass" as const, show: showConfirmPass, toggle: () => setShowConfirmPass(!showConfirmPass) },
            ].map((field, i) => (
              <div key={i} className="relative">
                <label className="block text-sm font-medium mb-1">{field.label}</label>
                <input type={field.show ? "text" : "password"} value={field.value} onChange={(e) => setPasswords({ ...passwords, [field.key]: e.target.value })} placeholder={field.placeholder} className="w-full px-3 py-2 pr-10 border border-border rounded-lg text-sm bg-card" />
                <button type="button" onClick={field.toggle} className="absolute right-3 top-8 text-muted-foreground">
                  {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={changingPass} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
              {changingPass ? "Alterando..." : "Alterar Senha"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
