import logoCebio from "@/assets/logo-cebio-color.png";
import logoIf from "@/assets/logo-if.png";
import logoFapeg from "@/assets/logo-fapeg.png";
import logoUtt from "@/assets/logo-utt.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-[1360px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logos */}
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <img src={logoCebio} alt="CEBIO" className="h-12 w-auto" />
            <img src={logoIf} alt="IF Goiano" className="h-12 w-auto" />
            <img src={logoFapeg} alt="FAPEG" className="h-12 w-auto" />
            <img src={logoUtt} alt="UTT Campus Iporá" className="h-12 w-auto" />
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
