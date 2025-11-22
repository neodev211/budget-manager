'use client';

import { useEffect, useRef, useState } from 'react';
import { useKeyboardShortcuts, getShortcutDisplay, KeyboardShortcut } from '@/lib/hooks/useKeyboardShortcuts';
import { Search, X } from 'lucide-react';

export interface CommandPaletteAction {
  id: string;
  label: string;
  description?: string;
  category?: string;
  shortcut?: KeyboardShortcut;
  action: () => void;
  icon?: React.ReactNode;
}

interface CommandPaletteProps {
  actions: CommandPaletteAction[];
}

export function CommandPalette({ actions }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter actions based on search
  const filteredActions = search
    ? actions.filter(
        (action) =>
          action.label.toLowerCase().includes(search.toLowerCase()) ||
          action.description?.toLowerCase().includes(search.toLowerCase()) ||
          action.category?.toLowerCase().includes(search.toLowerCase())
      )
    : actions.sort((a, b) => (a.category || '').localeCompare(b.category || ''));

  // Group by category if available
  const groupedActions = filteredActions.reduce((acc, action) => {
    const category = action.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(action);
    return acc;
  }, {} as Record<string, CommandPaletteAction[]>);

  // Open palette with Ctrl+K
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      callback: () => setIsOpen(!isOpen),
      description: 'Open command palette',
    },
  ]);

  // Handle keyboard navigation
  useKeyboardShortcuts(
    [
      {
        key: 'Escape',
        callback: () => setIsOpen(false),
      },
      {
        key: 'ArrowDown',
        callback: () => {
          const flatActions = Object.values(groupedActions).flat();
          setSelectedIndex((i) => (i + 1) % flatActions.length);
        },
      },
      {
        key: 'ArrowUp',
        callback: () => {
          const flatActions = Object.values(groupedActions).flat();
          setSelectedIndex((i) => (i - 1 + flatActions.length) % flatActions.length);
        },
      },
      {
        key: 'Enter',
        callback: () => {
          const flatActions = Object.values(groupedActions).flat();
          if (flatActions[selectedIndex]) {
            flatActions[selectedIndex].action();
            setIsOpen(false);
          }
        },
      },
    ],
    { enabled: isOpen }
  );

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const flatActions = Object.values(groupedActions).flat();

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
        title="Open command palette (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
        <span>Command...</span>
        <kbd className="ml-auto text-xs bg-white px-2 py-0.5 rounded border border-gray-300">
          Ctrl K
        </kbd>
      </button>

      {/* Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50">
          <div
            ref={containerRef}
            className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 outline-none text-lg"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Actions List */}
            <div className="max-h-96 overflow-y-auto">
              {flatActions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No commands found.</p>
                  <p className="text-sm mt-2">Try a different search term.</p>
                </div>
              ) : (
                Object.entries(groupedActions).map(([category, categoryActions]) => (
                  <div key={category}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                      {category}
                    </div>
                    {categoryActions.map((action, idx) => {
                      const flatIndex = flatActions.findIndex((a) => a.id === action.id);
                      const isSelected = flatIndex === selectedIndex;

                      return (
                        <button
                          key={action.id}
                          onClick={() => {
                            action.action();
                            setIsOpen(false);
                          }}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          className={`w-full px-4 py-3 flex items-center justify-between gap-4 transition-colors ${
                            isSelected
                              ? 'bg-blue-50 border-l-4 border-blue-600'
                              : 'border-l-4 border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {action.icon && <div className="flex-shrink-0">{action.icon}</div>}
                            <div className="text-left min-w-0">
                              <p className="font-medium text-gray-900">{action.label}</p>
                              {action.description && (
                                <p className="text-xs text-gray-500">{action.description}</p>
                              )}
                            </div>
                          </div>
                          {action.shortcut && (
                            <kbd className="flex-shrink-0 text-xs px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">
                              {getShortcutDisplay(action.shortcut)}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <div className="flex gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span>{flatActions.length} commands</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
