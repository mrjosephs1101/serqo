import { useState } from "react";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import AIAssistant from "./AIAssistant";
import UserMenu from "./UserMenu";
import { Sparkles, Keyboard } from "lucide-react";

export default function Header() {
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  
  return (
    <>
      <header className="py-3 sm:py-4 px-4 sm:px-8 md:px-12 flex justify-between items-center sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold">
            <span className="text-white">Ser</span>
            <span className="text-accent">qo</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Small screen AI Assistant button */}
          <button 
            className="sm:hidden p-2 text-purple-500 hover:text-purple-400 transition-colors" 
            aria-label="AI Assistant"
            onClick={() => setIsAIAssistantOpen(true)}
          >
            <Sparkles className="h-5 w-5" />
          </button>
          
          <button 
            className="p-2 text-muted-foreground hover:text-foreground transition-colors" 
            aria-label="Keyboard shortcuts"
            onClick={() => setIsShortcutsModalOpen(true)}
          >
            <Keyboard className="h-5 w-5" />
          </button>
          
          {/* Larger screen AI Assistant button */}
          <button
            className="hidden sm:flex items-center px-3 py-1.5 bg-primary/50 rounded-full hover:bg-primary/70 transition-colors cursor-pointer"
            onClick={() => setIsAIAssistantOpen(true)}
          >
            <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
            <span className="text-sm text-muted-foreground">AI Assistant</span>
          </button>
          
          <div className="ml-2">
            <UserMenu />
          </div>
        </div>
      </header>
      
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
      
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </>
  );
}
