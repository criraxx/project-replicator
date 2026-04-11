import { useState } from "react";
import { Download, FileSpreadsheet, FileText, FileJson, CheckSquare, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
  { key: "users", label: "Usuários", desc: "Todos os usuários cadastrados no sistema" },
  { key: "projects", label: "Projetos", desc: "Todos os projetos e seus autores" },
  { key: "categories", label: "Categorias", desc: "Categorias de projetos" },
  { key: "audit", label: "Auditoria", desc: "Logs de auditoria (últimos 5.000)" },
  { key: "notifications", label: "Notificações", desc: "Notificações enviadas (últimas 5.000)" },
];

const AdminExports = () => {
  const { toast } = useToast();
  const [selectedSections, setSelectedSections] = useState<string[]>(["all"]);
  const [exporting, setExporting] = useState<string | null>(null);

  const allSelected = selectedSections.includes("all") || selectedSections.length === SECTIONS.length;

  const toggleSection = (key: string) => {
    if (key === "all") {
      setSelectedSections(["all"]);
      return;
    }
    let next = selectedSections.filter(s => s !== "all");
    if (next.includes(key)) {
      next = next.filter(s => s !== key);
    } else {
      next.push(key);
    }
    if (next.length === 0) next = ["all"];
    if (next.length === SECTIONS.length) next = ["all"];
    setSelectedSections(next);
  };

  const downloadBlob = async (format: string) => {
    setExporting(format);
    try {
      const sections = allSelected ? ["all"] : selectedSections;
      const res = await fetch(`/api/exports/full/${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("cebio_token") || ""}`,
        },
        body: JSON.stringify({ sections }),
      });
      if (!res.ok) throw new Error("Falha ao gerar exportação");
      const blob = await res.blob();
      const ext = format === "excel" ? "xlsx" : format;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `exportacao_cebio_${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast({ title: "Sucesso", description: `Exportação ${format.toUpperCase()} gerada com sucesso!` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  return (
    <AppLayout pageName="Exportação de Dados" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-lg sm:text-[22px] font-semibold mb-1.5">Exportação Completa</h2>
        <p className="text-sm opacity-90">Exporte todos os dados do sistema em Excel, PDF ou JSON</p>
      </div>

      {/* Section selection */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          Selecionar Dados para Exportação
        </h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => toggleSection("all")}
              className="mt-0.5 w-4 h-4 accent-primary"
            />
            <div>
              <span className="font-semibold text-sm">Todos os Dados</span>
              <p className="text-xs text-muted-foreground">Exportar tudo: usuários, projetos, categorias, auditoria e notificações</p>
            </div>
          </label>
          <div className="border-t border-border pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SECTIONS.map(s => (
              <label key={s.key} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={allSelected || selectedSections.includes(s.key)}
                  onChange={() => toggleSection(s.key)}
                  disabled={allSelected}
                  className="mt-0.5 w-4 h-4 accent-primary"
                />
                <div>
                  <span className="font-medium text-sm">{s.label}</span>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => downloadBlob("excel")}
          disabled={!!exporting}
          className="flex flex-col items-center gap-3 bg-card rounded-xl border border-border p-8 hover:border-primary hover:shadow-md transition-all disabled:opacity-50"
        >
          {exporting === "excel" ? <Loader2 className="w-10 h-10 text-primary animate-spin" /> : <FileSpreadsheet className="w-10 h-10 text-primary" />}
          <span className="font-semibold text-foreground">Exportar Excel</span>
          <span className="text-xs text-muted-foreground text-center">Planilha com abas separadas para cada seção</span>
        </button>

        <button
          onClick={() => downloadBlob("pdf")}
          disabled={!!exporting}
          className="flex flex-col items-center gap-3 bg-card rounded-xl border border-border p-8 hover:border-primary hover:shadow-md transition-all disabled:opacity-50"
        >
          {exporting === "pdf" ? <Loader2 className="w-10 h-10 text-cebio-red animate-spin" /> : <FileText className="w-10 h-10 text-cebio-red" />}
          <span className="font-semibold text-foreground">Exportar PDF</span>
          <span className="text-xs text-muted-foreground text-center">Relatório formatado com tabelas e cabeçalhos</span>
        </button>

        <button
          onClick={() => downloadBlob("json")}
          disabled={!!exporting}
          className="flex flex-col items-center gap-3 bg-card rounded-xl border border-border p-8 hover:border-primary hover:shadow-md transition-all disabled:opacity-50"
        >
          {exporting === "json" ? <Loader2 className="w-10 h-10 text-cebio-blue animate-spin" /> : <FileJson className="w-10 h-10 text-cebio-blue" />}
          <span className="font-semibold text-foreground">Exportar JSON</span>
          <span className="text-xs text-muted-foreground text-center">Dados brutos em formato JSON para integração</span>
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 bg-muted/50 rounded-xl border border-border p-5">
        <h4 className="text-sm font-semibold mb-2">Informações sobre a Exportação</h4>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>• <strong>Excel:</strong> Gera uma planilha com abas separadas (Resumo, Usuários, Projetos, Autores, Categorias, Auditoria, Notificações)</li>
          <li>• <strong>PDF:</strong> Relatório formatado com tabelas, ideal para impressão e arquivamento</li>
          <li>• <strong>JSON:</strong> Dados brutos para backup ou integração com outros sistemas (senhas não são exportadas)</li>
          <li>• Logs de auditoria e notificações são limitados aos últimos 5.000 registros</li>
        </ul>
      </div>
    </AppLayout>
  );
};

export default AdminExports;
