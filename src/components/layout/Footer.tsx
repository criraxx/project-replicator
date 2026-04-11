import logoIf from "@/assets/logo-if.png";
import logoCebio from "@/assets/logo-cebio.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-[1360px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logos */}
          <div className="flex items-center gap-4">
            <img src={logoIf} alt="IF Goiano" className="h-10 w-auto brightness-0 invert opacity-90" />
            <span className="text-primary-foreground/40 font-light text-2xl">×</span>
            <img src={logoCebio} alt="CEBIO" className="h-10 w-auto brightness-0 invert opacity-90" />
          </div>

          {/* Info */}
          <div className="text-center md:text-right">
            <p className="text-sm font-medium opacity-90">CEBIO Brasil — Sistema de Gestão de Projetos</p>
            <p className="text-xs opacity-60 mt-1">Instituto Federal Goiano • Centro de Bioética</p>
            <p className="text-xs opacity-50 mt-1">© {year} Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
