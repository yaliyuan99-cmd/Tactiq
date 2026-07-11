import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Rewind, FastForward, PhoneCall, Navigation, Voicemail, Siren, Pointer, Settings2, type LucideIcon } from 'lucide-react';
import { gesturePoints, colorMap } from '../../lib/gestures';

type Tint = 'primary' | 'accent' | 'chart1' | 'destructive';

// Literal class strings so Tailwind's JIT can see them (no dynamic interpolation).
const tileStyles: Record<Tint, { icon: string; ripple: string }> = {
  primary: { icon: 'bg-primary/15 text-primary', ripple: 'bg-primary/30' },
  accent: { icon: 'bg-accent/15 text-accent', ripple: 'bg-accent/30' },
  chart1: { icon: 'bg-chart-1/15 text-chart-1', ripple: 'bg-chart-1/30' },
  destructive: { icon: 'bg-destructive/15 text-destructive', ripple: 'bg-destructive/30' }
};

const presets: { icon: LucideIcon; label: string; category: string; tint: Tint }[] = [
  { icon: Rewind, label: 'Rewind 10 seconds', category: 'Media', tint: 'primary' },
  { icon: FastForward, label: 'Fast-forward 30 seconds', category: 'Media', tint: 'primary' },
  { icon: PhoneCall, label: 'Call favorite contact', category: 'Phone', tint: 'accent' },
  { icon: Navigation, label: 'Open navigation', category: 'Apps', tint: 'chart1' },
  { icon: Voicemail, label: 'Replay last voice message', category: 'Messages', tint: 'accent' },
  { icon: Siren, label: 'Emergency SOS', category: 'Safety', tint: 'destructive' }
];

export default function InteractiveHandDemo() {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [pressedPreset, setPressedPreset] = useState<number | null>(null);

  const activePoint = selectedPoint || hoveredPoint;
  const activeGesture = gesturePoints.find(p => p.id === activePoint);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Legend */}
      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        {[
          { type: 'modifier' as const, label: 'Modifier (Thumb)' },
          { type: 'letter' as const, label: 'Letters — 9-grid keypad' },
          { type: 'fixed' as const, label: 'Delete (Pinky)' },
          { type: 'custom' as const, label: 'Custom shortcut (Pinky)' },
          { type: 'return' as const, label: 'Palm — Return' }
        ].map((item) => (
          <div key={item.type} className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${colorMap[item.type].bg}`}></div>
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Hand Visualization */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[3/4] bg-gradient-to-br from-primary/5 to-chart-2/5 rounded-3xl border border-border overflow-hidden"
          >
            {/* Hand outline — line art so each gesture dot sits clearly on a finger */}
            <svg
              viewBox="0 0 300 400"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full text-foreground"
              aria-label="Open hand gesture map"
              role="img"
            >
              <g>
                {/* Silhouette fill (single group opacity so overlaps don't darken) */}
                <g fill="currentColor" opacity="0.08">
                  <rect x="112" y="325" width="96" height="72" rx="26" />
                  <rect x="80" y="198" width="162" height="148" rx="46" />
                  <rect x="92" y="100" width="33" height="148" rx="16.5" />
                  <rect x="134" y="80" width="33" height="168" rx="16.5" />
                  <rect x="176" y="100" width="33" height="148" rx="16.5" />
                  <rect x="214" y="130" width="31" height="120" rx="15.5" />
                  <rect x="80" y="193" width="31" height="104" rx="15.5" transform="rotate(-35 95 290)" />
                </g>
                {/* Outline */}
                <g fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5">
                  <rect x="112" y="325" width="96" height="72" rx="26" />
                  <rect x="80" y="198" width="162" height="148" rx="46" />
                  <rect x="92" y="100" width="33" height="148" rx="16.5" />
                  <rect x="134" y="80" width="33" height="168" rx="16.5" />
                  <rect x="176" y="100" width="33" height="148" rx="16.5" />
                  <rect x="214" y="130" width="31" height="120" rx="15.5" />
                  <rect x="80" y="193" width="31" height="104" rx="15.5" transform="rotate(-35 95 290)" />
                </g>
              </g>
            </svg>

            {/* Gesture Points */}
            <div className="absolute inset-0">
              {gesturePoints.map((point) => {
                const colors = colorMap[point.type];
                const isActive = activePoint === point.id;
                const isBar = point.type === 'space';

                return (
                  // Outer wrapper owns the absolute positioning + centering so the
                  // inner motion element is free to animate `transform` (scale) without
                  // clobbering the translate that keeps the dot on its anchor point.
                  // The spacebar spans a fixed band beneath the fingers instead of
                  // being centered on a single point.
                  <div
                    key={point.id}
                    style={
                      isBar
                        ? { position: 'absolute', left: '34%', right: '21%', top: point.y }
                        : { position: 'absolute', left: point.x, top: point.y }
                    }
                    className={isBar ? '-translate-y-1/2' : '-translate-x-1/2 -translate-y-1/2'}
                  >
                  <motion.div
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedPoint === point.id}
                    aria-label={`${point.label} key — ${point.finger}, ${point.position}`}
                    onMouseEnter={() => setHoveredPoint(point.id)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onFocus={() => setHoveredPoint(point.id)}
                    onBlur={() => setHoveredPoint(null)}
                    onClick={() => setSelectedPoint(selectedPoint === point.id ? null : point.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPoint(selectedPoint === point.id ? null : point.id);
                      }
                    }}
                    whileHover={{ scale: isBar ? 1.04 : 1.15 }}
                    whileTap={{ scale: isBar ? 0.97 : 0.82 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="relative cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {/* Pulse animation when active (dots only) */}
                    {isActive && !isBar && (
                      <motion.div
                        animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 ${colors.bg} rounded-full`}
                      />
                    )}

                    {/* Ring of contact that fires on each press (dots only) */}
                    <AnimatePresence>
                      {selectedPoint === point.id && !isBar && (
                        <motion.div
                          key="press-ripple"
                          initial={{ scale: 0.6, opacity: 0.7 }}
                          animate={{ scale: 2.4, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={`absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border-2 ${colors.border}`}
                        />
                      )}
                    </AnimatePresence>

                    {/* Main key — wide bar for Space, circle for everything else */}
                    <motion.div
                      animate={{
                        scale: isActive && !isBar ? 1.3 : 1,
                        boxShadow: isActive ? `0 0 20px ${colors.glow}` : 'none'
                      }}
                      className={
                        isBar
                          ? `relative w-full h-9 ${colors.bg} rounded-xl border-2 ${colors.border} flex items-center justify-center text-white font-semibold text-xs tracking-[0.3em] uppercase shadow-lg`
                          : `relative w-12 h-12 ${colors.bg} rounded-full border-2 ${colors.border} flex items-center justify-center text-white font-semibold text-xs shadow-lg`
                      }
                    >
                      {point.label}
                    </motion.div>

                    {/* Connecting line to info (dots only, when hovered) */}
                    {isActive && !isBar && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className={`absolute top-1/2 left-full w-4 h-0.5 ${colors.bg} origin-left`}
                      />
                    )}
                  </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Helper text */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <p className="text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
                Click or hover on any dot to learn more
              </p>
            </div>
          </motion.div>
        </div>

        {/* Info Panel */}
        <div className="sticky top-8">
          <AnimatePresence mode="wait">
            {activeGesture ? (
              <motion.div
                key={activeGesture.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-gradient-to-br ${colorMap[activeGesture.type].bg}/10 backdrop-blur-sm border-2 ${colorMap[activeGesture.type].border} rounded-2xl p-6`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 ${colorMap[activeGesture.type].bg} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                    {activeGesture.label}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{activeGesture.finger}</h3>
                    <p className="text-sm text-muted-foreground">{activeGesture.position} knuckle</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{activeGesture.description}</p>

                {activeGesture.gestures && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold mb-2">Available Gestures:</h4>
                    {activeGesture.gestures.map((gesture, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full ${colorMap[activeGesture.type].bg} mt-1.5`} />
                        <span className="text-muted-foreground">{gesture}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeGesture.type === 'letter' && (
                  <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground italic">
                      Part of the 9-grid English keypad. Tap repeatedly to cycle through this key's letters — exactly like typing on a phone dialpad, but with your fingers instead of a screen.
                    </p>
                  </div>
                )}

                {activeGesture.type === 'custom' && (
                  <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground italic">
                      This position is fully customizable. Assign any command: media control, app shortcuts, phone calls, navigation, and more.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <Pointer className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Type with the 9-grid keypad</h3>
                <p className="text-muted-foreground">
                  Click or hover over any dot to see what that knuckle does. The index, middle and ring fingers form a 3×3 keypad — multi-tap each key to type English just like a phone dialpad, while the thumb and pinky handle modifiers and shortcuts.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 grid grid-cols-3 gap-4"
          >
            {[
              { value: '9', label: '9-grid Keys' },
              { value: '26', label: 'Letters' },
              { value: '1–4', label: 'Taps / Key' }
            ].map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Shortcut Customization Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 bg-gradient-to-r from-chart-1/10 via-primary/5 to-chart-2/10 rounded-2xl p-8 border border-primary/20"
      >
        <h3 className="text-xl font-semibold mb-4 text-center">Beyond typing: customizable shortcut slots</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-3xl mx-auto">
          The 9-grid handles English text entry, but the pinky shortcut slots and the thumb's command layer can be mapped to anything. In the companion app you assign each slot to an action from a full library — and all navigation is voice-guided.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {presets.map((preset, i) => {
            const tile = tileStyles[preset.tint];
            const Icon = preset.icon;
            const isPressed = pressedPreset === i;
            return (
              <motion.button
                key={i}
                type="button"
                onTapStart={() => setPressedPreset(i)}
                onTap={() => setPressedPreset(null)}
                onTapCancel={() => setPressedPreset(null)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="group relative overflow-hidden text-left bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {/* Press ripple sweeping from the icon */}
                <AnimatePresence>
                  {isPressed && (
                    <motion.span
                      key="ripple"
                      initial={{ scale: 0, opacity: 0.35 }}
                      animate={{ scale: 6, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                      className={`pointer-events-none absolute left-7 top-9 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full ${tile.ripple}`}
                    />
                  )}
                </AnimatePresence>
                <div className="relative z-10">
                  <motion.div
                    animate={{ scale: isPressed ? 0.9 : 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className={`w-10 h-10 mb-3 rounded-lg flex items-center justify-center ${tile.icon} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <div className="text-sm font-medium mb-1">{preset.label}</div>
                  <div className="text-xs text-muted-foreground">{preset.category}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <Link
            to="/customize"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Settings2 className="w-4 h-4" />
            Customise your keyboard
          </Link>
          <p className="text-sm text-muted-foreground">
            Remap every slot and save your own layouts.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
