import logoCebio from "@/assets/logo-if.png";
import logoIf from "@/assets/logo-cebio.png";
import logoFapeg from "@/assets/logo-fapeg.png";
import logoUtt from "@/assets/logo-utt.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-[1360px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logos */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="bg-white/95 rounded-lg px-4 py-2 flex items-center gap-5">
              <img src={logoCebio} alt="CEBIO" className="h-12 w-auto object-contain" />
              <img src={logoIf} alt="IF Goiano" className="h-12 w-auto object-contain" />
              <img src={logoFapeg} alt="FAPEG" className="h-12 w-auto object-contain" />
              <img src={logoUtt} alt="UTT Campus Iporá" className="h-12 w-auto object-contain" />
            </div>
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
