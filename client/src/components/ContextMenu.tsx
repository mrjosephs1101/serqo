import React, { useState, useEffect, useRef } from 'react';
import { Check, Copy, Search, Sparkles, Code, MessageSquare, ClipboardCheck, PenLine } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (text: string) => void;
  divider?: boolean;
}

const ContextMenu: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      setPosition({ x: e.pageX, y: e.pageY });
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const handleClick = () => {
    setVisible(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const searchWithAI = (text: string) => {
    showToast('Searching with AI: ' + text);
    // Implement AI search functionality here
    window.location.href = `/?q=${encodeURIComponent(text)}`;
  };

  const grammarCheck = (text: string) => {
    showToast('Grammar checking: ' + text);
    // Implement grammar check functionality
  };

  const spellCheck = (text: string) => {
    showToast('Spell checking: ' + text);
    // Implement spell check functionality
  };

  const translateText = (text: string) => {
    showToast('Translating: ' + text);
    // Implement translation functionality
  };

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-neutral-800 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center gap-2';
    toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>
    <span>${message}</span>`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
  };

  const lookupDefinition = (text: string) => {
    showToast('Looking up definition for: ' + text);
    // Implement dictionary lookup functionality
  };

  const analyzeWithAI = (text: string) => {
    showToast('Analyzing with AI: ' + text);
    // Implement AI analysis functionality
  };

  const items: ContextMenuItem[] = [
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy className="h-4 w-4 mr-2" />,
      action: copyToClipboard
    },
    {
      id: 'search',
      label: 'Search with AI',
      icon: <Search className="h-4 w-4 mr-2" />,
      action: searchWithAI,
      divider: true
    },
    {
      id: 'grammar',
      label: 'Grammar Check',
      icon: <PenLine className="h-4 w-4 mr-2" />,
      action: grammarCheck
    },
    {
      id: 'spell',
      label: 'Spell Check',
      icon: <ClipboardCheck className="h-4 w-4 mr-2" />,
      action: spellCheck,
      divider: true
    },
    {
      id: 'analyze',
      label: 'Analyze with AI',
      icon: <Sparkles className="h-4 w-4 mr-2" />,
      action: analyzeWithAI
    },
    {
      id: 'define',
      label: 'Look up Definition',
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
      action: lookupDefinition
    },
    {
      id: 'translate',
      label: 'Translate',
      icon: <Code className="h-4 w-4 mr-2" />,
      action: translateText
    }
  ];

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  if (!visible) return null;

  // Adjust position if menu would go off screen
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 220),
    y: Math.min(position.y, window.innerHeight - 300)
  };

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 w-56 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900 animate-[scaleIn_0.15s_ease-out_forwards]"
      style={{ 
        top: adjustedPosition.y, 
        left: adjustedPosition.x
      }}
    >
      <div className="p-1.5">
        {items.map((item) => (
          <React.Fragment key={item.id}>
            <button
              className="flex w-full items-center rounded-sm px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              onClick={() => {
                item.action(selectedText);
                setVisible(false);
              }}
            >
              {item.icon}
              {item.label}
            </button>
            {item.divider && (
              <div className="my-1 h-px w-full bg-neutral-200 dark:bg-neutral-800" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ContextMenu;