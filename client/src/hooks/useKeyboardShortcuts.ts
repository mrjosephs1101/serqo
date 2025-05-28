import { useEffect, useState } from 'react';

interface KeyboardShortcutsOptions {
  onSearchFocus?: () => void;
  onClearSearch?: () => void;
  onVoiceSearch?: () => void;
  onCategoryChange?: (category: string) => void;
  onToggleShortcutsModal?: () => void;
}

export function useKeyboardShortcuts({
  onSearchFocus,
  onClearSearch,
  onVoiceSearch,
  onCategoryChange,
  onToggleShortcutsModal
}: KeyboardShortcutsOptions) {
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if shortcuts are disabled or if the user is typing in an input/textarea
      if (!shortcutsEnabled || 
          event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // '/' or 'Ctrl+K' to focus search
      if ((event.key === '/' || (event.ctrlKey && event.key === 'k'))) {
        event.preventDefault();
        onSearchFocus?.();
      }

      // '?' to toggle shortcuts modal
      if (event.key === '?') {
        event.preventDefault();
        onToggleShortcutsModal?.();
      }

      // 'Esc' to clear search
      if (event.key === 'Escape') {
        onClearSearch?.();
      }

      // Alt+A to switch to "all" category
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        onCategoryChange?.('all');
      }

      // Alt+I to switch to "images" category
      if (event.altKey && event.key === 'i') {
        event.preventDefault();
        onCategoryChange?.('images');
      }

      // Alt+V to start voice search
      if (event.altKey && event.key === 'v') {
        event.preventDefault();
        onVoiceSearch?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    shortcutsEnabled, 
    onSearchFocus, 
    onClearSearch, 
    onVoiceSearch, 
    onCategoryChange, 
    onToggleShortcutsModal
  ]);

  return {
    enableShortcuts: () => setShortcutsEnabled(true),
    disableShortcuts: () => setShortcutsEnabled(false)
  };
}
