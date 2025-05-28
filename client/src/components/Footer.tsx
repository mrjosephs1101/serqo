export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur border-t border-border py-3 px-6 z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground mb-3 sm:mb-0">
          <span>© {new Date().getFullYear()} Serqo</span>
          <span className="mx-2">•</span>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <span className="mx-2">•</span>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            <i className="ri-map-pin-line mr-1"></i><span>United States</span>
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            <i className="ri-settings-line mr-1"></i><span>Preferences</span>
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            <i className="ri-question-line mr-1"></i><span>Help</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
