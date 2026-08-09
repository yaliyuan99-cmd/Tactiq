/**
 * ⌘K command palette — quick navigation for keyboard users.
 *
 * Deliberately small: a filtered list of real destinations and actions, no
 * AI, no fuzzy scoring theatre. Fully keyboard driven (arrows + Enter,
 * Escape closes) with listbox semantics for screen readers; the palette is
 * a shortcut, never the only path to anything.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, CornerDownLeft } from 'lucide-react';

interface PaletteAction {
  id: string;
  label: string;
  hint: string;
  to: string;
}

const ACTIONS: PaletteAction[] = [
  { id: 'home', label: 'Go to Home', hint: 'Dashboard overview', to: '/dashboard' },
  { id: 'ring', label: 'View Ring', hint: 'Interactive hardware view', to: '/dashboard/ring' },
  { id: 'simulator', label: 'Try the Simulator', hint: 'Squeeze, tap, command', to: '/dashboard/simulator' },
  { id: 'training', label: 'Open Training', hint: 'Five-lesson curriculum', to: '/dashboard/training' },
  { id: 'commands', label: 'Change shortcuts', hint: 'Command layout editor', to: '/dashboard/commands' },
  { id: 'history', label: 'Open History', hint: 'Your activity timeline', to: '/dashboard/history' },
  { id: 'device', label: 'Device status', hint: 'Pairing and connection', to: '/dashboard/device' },
  { id: 'accessibility', label: 'Accessibility settings', hint: 'Motion, text size, hand', to: '/dashboard/accessibility' },
  { id: 'account', label: 'Account settings', hint: 'Profile, password, data', to: '/dashboard/account' },
  { id: 'research', label: 'View research', hint: 'Public research page', to: '/research' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      setQuery('');
      setIndex(0);
      // Focus after the dialog paints (rAF can fire before the portal is
      // interactive in some browsers, so a short timeout backs it up).
      requestAnimationFrame(() => inputRef.current?.focus());
      window.setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      previousFocus.current?.focus?.();
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIONS;
    return ACTIONS.filter(
      (a) => a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q),
    );
  }, [query]);

  const run = (action: PaletteAction) => {
    setOpen(false);
    navigate(action.to);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[18vh] px-4 bg-foreground/30"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-lg border border-border bg-background shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[index] ? `palette-${results[index].id}` : undefined}
            aria-label="Search destinations and actions"
            placeholder="Where to?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndex((i) => Math.min(results.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndex((i) => Math.max(0, i - 1));
              } else if (e.key === 'Enter' && results[index]) {
                e.preventDefault();
                run(results[index]);
              }
            }}
            className="flex-1 h-13 py-4 bg-transparent focus:outline-none text-[0.95rem]"
          />
          <kbd className="font-mono-label text-muted-foreground border border-border rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" aria-label="Results" className="max-h-72 overflow-y-auto py-1.5">
          {results.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted-foreground text-center">
              Nothing matches "{query}".
            </li>
          )}
          {results.map((action, i) => (
            <li
              key={action.id}
              id={`palette-${action.id}`}
              role="option"
              aria-selected={i === index}
              onMouseEnter={() => setIndex(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(action)}
              className={`flex items-center justify-between gap-3 mx-1.5 px-2.5 h-11 rounded-md cursor-pointer text-[0.95rem] ${
                i === index ? 'bg-primary/10 text-primary-strong' : 'text-foreground'
              }`}
            >
              <span className="truncate">{action.label}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-muted-foreground">{action.hint}</span>
                {i === index && <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground" aria-hidden />}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
