/**
 * Kinetic command strip — the nine verbs, looping. Decorative reinforcement
 * of the command vocabulary (aria-hidden; the real list lives in the map).
 * Pure CSS animation: runs without JavaScript, and the global
 * prefers-reduced-motion rule freezes it into a plain static row.
 */

const WORDS = ['SQUEEZE', 'TAP', 'CONFIRM', 'BACK', 'UNDO', 'NEXT', 'PREVIOUS', 'READ', 'HOLD'];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="font-mono-label !text-[1.05rem] tracking-[0.25em] text-foreground/80 px-6">
            {w}
          </span>
          <span aria-hidden className="w-2 h-2 rounded-full bg-primary" />
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div aria-hidden className="border-y border-border py-4 overflow-hidden select-none">
      <div className="flex w-max marquee-track">
        <Row />
        <Row />
      </div>
    </div>
  );
}
