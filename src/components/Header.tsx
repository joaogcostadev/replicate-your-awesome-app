import { Button } from "@/components/ui/button";
import vetLifeLogo from "@/assets/vetlife-logo.png";

const Header = () => {
  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={vetLifeLogo} alt="VetLife 24h" className="w-8 h-8" />
          <span className="text-2xl font-bold text-primary">VetLife 24h</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#home" className="text-primary font-medium hover:text-primary-hover transition-colors">
            Home
          </a>
          <a href="#agendamento" className="text-muted-foreground hover:text-primary transition-colors">
            Agendamento
          </a>
          <a href="#contato" className="text-muted-foreground hover:text-primary transition-colors">
            Contato
          </a>
        </div>

        <Button variant="outline" className="md:hidden">
          Menu
        </Button>
      </nav>
    </header>
  );
};

export default Header;