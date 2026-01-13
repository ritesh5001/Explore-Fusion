const Footer = () => {
  return (
    <footer className="border-t border-soft dark:border-white/10 bg-white/60 dark:bg-[#0F1F1A]/60 backdrop-blur-md">
      <div className="container-app py-8 text-sm text-charcoal dark:text-sand">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <div className="font-heading font-bold tracking-tight text-mountain dark:text-sand">
              Explore <span className="text-forest">Fusion</span>
            </div>
            <div className="text-xs text-charcoal/70 dark:text-sand/70 mt-1">Travel. Community. Control center.</div>
          </div>
          <div className="text-charcoal/70 dark:text-sand/70">
            © {new Date().getFullYear()} Explore Fusion · Built for learning & demos
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
