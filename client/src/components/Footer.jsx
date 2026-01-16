const Footer = () => {
  return (
  <footer className="border-t border-border bg-paper">
    <div className="container-app py-10 text-sm text-charcoal">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
      <div className="font-heading font-medium tracking-[0.04em] text-charcoal">
        Explore <span className="text-gold">Fusion</span>
            </div>
      <div className="text-xs text-muted mt-2">Travel stories, companions, and curated experiences.</div>
          </div>
      <div className="text-muted">
            © {new Date().getFullYear()} Explore Fusion · Built for learning & demos
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
