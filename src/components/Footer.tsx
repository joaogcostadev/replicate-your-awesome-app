import vetLifeLogo from "@/assets/vetlife-logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border py-8 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src={vetLifeLogo} alt="VetLife 24h" className="w-6 h-6" />
          <span className="text-muted-foreground">
            © 2026 VetLife 24h. Todos os direitos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;