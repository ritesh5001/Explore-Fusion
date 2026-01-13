const Footer = () => {
  return (
    <footer className="border-t border-soft bg-white/60 backdrop-blur-md">
    <div className="container-app py-8 text-sm text-charcoal">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <div className="font-heading font-bold tracking-tight text-mountain">
            Explore <span className="text-forest">Fusion</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">Travel. Community. Control center.</div>
        </div>
        <div className="text-gray-600">
          © {new Date().getFullYear()} Explore Fusion · Built for learning & demos
        </div>
      </div>
    </div>
    </footer>
  );
};

export default Footer;
