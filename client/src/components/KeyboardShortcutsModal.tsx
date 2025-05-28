import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";

type KeyboardShortcutsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background border border-purple-500/30 shadow-lg shadow-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-heading font-bold">
            Keyboard Shortcuts
          </DialogTitle>
          <DialogClose className="text-muted-foreground hover:text-foreground transition-colors absolute right-3 sm:right-4 top-3 sm:top-4">
            <i className="ri-close-line text-lg sm:text-xl"></i>
          </DialogClose>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="col-span-1 sm:col-span-2 p-2.5 sm:p-3 bg-primary rounded-lg mb-2">
            <h3 className="text-purple-500 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Navigation</h3>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-muted-foreground text-xs sm:text-sm">Focus search</span>
              <span className="font-mono bg-primary-light px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm whitespace-nowrap">/ or Ctrl+K</span>
            </div>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-muted-foreground text-xs sm:text-sm">Navigate results</span>
              <span className="font-mono bg-primary-light px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">↑ / ↓</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground text-xs sm:text-sm">Open result</span>
              <span className="font-mono bg-primary-light px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">Enter</span>
            </div>
          </div>
          <div className="p-2.5 sm:p-3 bg-primary rounded-lg">
            <h3 className="text-purple-500 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Categories</h3>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-muted-foreground text-xs sm:text-sm">All</span>
              <span className="font-mono bg-primary-light px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">Alt+A</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground text-xs sm:text-sm">Images</span>
              <span className="font-mono bg-primary-light px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">Alt+I</span>
            </div>
          </div>
          <div className="p-2.5 sm:p-3 bg-primary rounded-lg">
            <h3 className="text-purple-500 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Actions</h3>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-muted-foreground text-xs sm:text-sm">Clear search</span>
              <span className="font-mono bg-primary-light px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">Esc</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground text-xs sm:text-sm">Voice search</span>
              <span className="font-mono bg-primary-light px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">Alt+V</span>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-5 text-center text-muted-foreground text-xs sm:text-sm">
          Press <span className="font-mono bg-primary-light px-1.5 sm:px-2 py-0.5 rounded text-xs">?</span> anytime to show this panel
        </div>
      </DialogContent>
    </Dialog>
  );
}
