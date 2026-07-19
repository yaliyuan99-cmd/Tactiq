import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Hand,
  ArrowLeft,
  Save,
  Loader2,
  Check,
  RotateCcw,
  Star,
  Layers,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  editableGesturePoints,
  colorMap,
  COMMAND_LIBRARY,
  COMMAND_CATEGORIES,
  DEFAULT_LAYOUT,
  commandLabelFor,
} from '../../lib/gestures';
import type { GestureLayout } from '../../lib/database.types';
import {
  listGestureConfigs,
  saveGestureConfig,
  deleteGestureConfig,
} from '../../lib/api';
import type { GestureConfigRow } from '../../lib/database.types';
import { fieldClass } from '../auth/AuthLayout';

export default function CustomizePage() {
  const [params] = useSearchParams();

  const [layout, setLayout] = useState<GestureLayout>({ ...DEFAULT_LAYOUT });
  const [name, setName] = useState('My Layout');
  const [configId, setConfigId] = useState<string | undefined>();
  const [isActive, setIsActive] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<string>(
    editableGesturePoints[0]?.id ?? '',
  );
  const [activeCategory, setActiveCategory] = useState<string>(COMMAND_CATEGORIES[0]);

  const [configs, setConfigs] = useState<GestureConfigRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load existing layouts (and optionally a specific one from ?id=).
  useEffect(() => {
    let mounted = true;
    listGestureConfigs()
      .then((rows) => {
        if (!mounted) return;
        setConfigs(rows);
        const id = params.get('id');
        const target = id ? rows.find((r) => r.id === id) : undefined;
        if (target) loadConfig(target);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfig = (row: GestureConfigRow) => {
    setLayout({ ...DEFAULT_LAYOUT, ...(row.layout ?? {}) });
    setName(row.name);
    setConfigId(row.id);
    setIsActive(row.is_active);
    setSaved(false);
  };

  const startNew = () => {
    setLayout({ ...DEFAULT_LAYOUT });
    setName('My Layout');
    setConfigId(undefined);
    setIsActive(false);
    setSaved(false);
  };

  const assignCommand = (cmdId: string) => {
    if (!selectedSlot) return;
    setLayout((prev) => ({ ...prev, [selectedSlot]: cmdId }));
    setSaved(false);
  };

  const resetSlot = () => {
    if (!selectedSlot) return;
    setLayout((prev) => ({ ...prev, [selectedSlot]: DEFAULT_LAYOUT[selectedSlot] }));
    setSaved(false);
  };

  const handleSave = async (asNew = false) => {
    setError('');
    setSaving(true);
    try {
      const row = await saveGestureConfig({
        id: asNew ? undefined : configId,
        name: name.trim() || 'My Layout',
        layout,
        isActive,
      });
      setConfigId(row.id);
      // refresh list
      const rows = await listGestureConfigs();
      setConfigs(rows);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your layout.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteGestureConfig(id);
    const rows = await listGestureConfigs();
    setConfigs(rows);
    if (id === configId) startNew();
  };

  const selectedPoint = editableGesturePoints.find((p) => p.id === selectedSlot);
  const filteredCommands = useMemo(
    () => COMMAND_LIBRARY.filter((c) => c.category === activeCategory),
    [activeCategory],
  );

  // Group the editable slots by finger so the (now full) list stays scannable.
  const slotGroups = useMemo(() => {
    const groups: { finger: string; points: typeof editableGesturePoints }[] = [];
    for (const p of editableGesturePoints) {
      let g = groups.find((x) => x.finger === p.finger);
      if (!g) {
        g = { finger: p.finger, points: [] };
        groups.push(g);
      }
      g.points.push(p);
    }
    return groups;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Top bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Hand className="w-6 h-6" />
            <span className="text-xl font-semibold">Tactiq</span>
          </Link>
          <Link
            to="/account"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Customise your keyboard</h1>
            <p className="text-muted-foreground">
              Pick a slot, assign a command, then save it as a reusable layout.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm hover:bg-secondary transition-colors"
            >
              <Plus className="w-4 h-4" /> New layout
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Left: editable slots */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Editable slots
              </h2>
              <span className="text-xs text-muted-foreground">
                {editableGesturePoints.length} keys
              </span>
            </div>
            {slotGroups.map((group) => (
              <div key={group.finger} className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground/80 px-1">
                  {group.finger}
                </h3>
                {group.points.map((point) => {
                  const colors = colorMap[point.type];
                  const isSel = selectedSlot === point.id;
                  return (
                    <button
                      key={point.id}
                      onClick={() => setSelectedSlot(point.id)}
                      aria-pressed={isSel}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSel
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:bg-secondary/40'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.bg}`}
                        aria-hidden="true"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">
                          {point.position}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate">
                          {commandLabelFor(layout, point.id)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="rounded-xl border border-border bg-secondary/20 p-3 text-xs text-muted-foreground">
              Every key is now remappable — including the 9-grid letter keys and the
              spacebar. Re-assigning a letter key changes what you type there, so keep
              enough keys on letters to write. Use the <strong>Keypad</strong> category to
              put a letter or space back, or hit <strong>Reset slot</strong>.
            </div>
          </div>

          {/* Right: command picker + save panel */}
          <div className="space-y-6">
            {/* Command picker */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-semibold">
                  Assign to{' '}
                  <span className="text-primary">
                    {selectedPoint ? `${selectedPoint.finger} · ${selectedPoint.position}` : '—'}
                  </span>
                </h2>
                <button
                  onClick={resetSlot}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset slot
                </button>
              </div>

              {/* category tabs */}
              <div className="flex flex-wrap gap-2 mb-5">
                {COMMAND_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={activeCategory === cat}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      activeCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  const assigned = selectedSlot && layout[selectedSlot] === cmd.id;
                  return (
                    <motion.button
                      key={cmd.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => assignCommand(cmd.id)}
                      aria-pressed={!!assigned}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        assigned
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-secondary/40'
                      }`}
                    >
                      <span
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          assigned ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-medium flex-1">{cmd.label}</span>
                      {assigned && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* Save panel */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
                <div>
                  <label htmlFor="layout-name" className="block text-sm mb-1.5">
                    Layout name
                  </label>
                  <input
                    id="layout-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldClass}
                    placeholder="e.g. Running, Work, Everyday"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none pb-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[var(--color-primary)]"
                  />
                  <Star className={`w-4 h-4 ${isActive ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                  Set active
                </label>
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive mt-3">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:shadow-lg transition-shadow font-medium disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                    </>
                  ) : saved ? (
                    <>
                      <Check className="w-4 h-4" /> Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> {configId ? 'Save changes' : 'Save layout'}
                    </>
                  )}
                </button>
                {configId && (
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-70"
                  >
                    Save as copy
                  </button>
                )}
              </div>
            </section>

            {/* Saved layouts */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Your saved layouts</h2>
              </div>
              {configs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No saved layouts yet — build one above and hit save.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  <AnimatePresence initial={false}>
                    {configs.map((c) => (
                      <motion.li
                        key={c.id}
                        layout
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between py-3 gap-3"
                      >
                        <button
                          onClick={() => loadConfig(c)}
                          className="flex-1 text-left min-w-0"
                        >
                          <span className="font-medium flex items-center gap-2">
                            {c.name}
                            {c.is_active && (
                              <span className="inline-flex items-center gap-1 text-xs text-primary">
                                <Star className="w-3 h-3 fill-primary" /> Active
                              </span>
                            )}
                            {c.id === configId && (
                              <span className="text-xs text-muted-foreground">· editing</span>
                            )}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            Updated {new Date(c.updated_at).toLocaleDateString()}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          aria-label={`Delete ${c.name}`}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
