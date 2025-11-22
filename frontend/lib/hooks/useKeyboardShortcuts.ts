import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string; // 'Enter', 'Escape', 'n', 's', 'k', etc.
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description?: string;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts
 *
 * Usage:
 * useKeyboardShortcuts([
 *   { key: 'n', ctrl: true, callback: () => openNewForm(), description: 'Create new item' },
 *   { key: 'Escape', callback: () => closeModal(), description: 'Close modal' },
 *   { key: 's', ctrl: true, callback: () => saveForm(), description: 'Save form' },
 * ]);
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = { enabled: true, preventDefault: true }
) {
  useEffect(() => {
    if (!options.enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase() ||
          event.code === shortcut.key;

        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          if (options.preventDefault) {
            event.preventDefault();
          }
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, options]);
}

/**
 * Get all registered shortcuts for display in help/command palette
 */
export function getShortcutDisplay(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');

  const keyDisplay = shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase();
  parts.push(keyDisplay);

  return parts.join('+');
}
