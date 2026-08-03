import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Hand, Moon, Sun, X, Menu, List, CalendarClock, Target, FlaskConical, CheckCircle2, Box, Circle, CircleDot, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { g as gesturePoints } from "./gestures-_WkCo3YC.js";
import { j as joinWaitlist } from "../prerender-entry.js";
import { S as SiteFooter } from "./SiteFooter-D-eQyLDN.js";
import "react-dom/server";
import "node:stream";
import "react-router";
import "@supabase/supabase-js";
const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "The ring", href: "#the-ring" },
  { label: "Research", href: "#research" },
  { label: "Project status", href: "#status" },
  { label: "FAQ", href: "#faq" }
];
function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("tactiq-theme", theme);
  }, [theme]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "#main-content",
        className: "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md",
        children: "Skip to content"
      }
    ),
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("nav", { "aria-label": "Primary", className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16", children: [
        /* @__PURE__ */ jsxs("a", { href: "#main-content", className: "flex items-center gap-2", "aria-label": "Tactiq — back to top of page", children: [
          /* @__PURE__ */ jsx(Hand, { className: "w-5 h-5", "aria-hidden": true }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: "Tactiq" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hidden md:flex items-center gap-7", children: NAV_LINKS.map((l) => /* @__PURE__ */ jsx(
          "a",
          {
            href: l.href,
            className: "text-[0.95rem] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors",
            children: l.label
          },
          l.href
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setTheme((t) => t === "dark" ? "light" : "dark"),
              "aria-label": theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
              className: "w-11 h-11 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
              children: theme === "dark" ? /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4", "aria-hidden": true }) : /* @__PURE__ */ jsx(Sun, { className: "w-4 h-4", "aria-hidden": true })
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "#follow",
              className: "hidden sm:inline-flex items-center px-4 h-11 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity",
              children: "Join the research"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMenuOpen((o) => !o),
              "aria-label": menuOpen ? "Close menu" : "Open menu",
              "aria-expanded": menuOpen,
              className: "md:hidden w-11 h-11 flex items-center justify-center rounded-md border border-border",
              children: menuOpen ? /* @__PURE__ */ jsx(X, { className: "w-5 h-5", "aria-hidden": true }) : /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5", "aria-hidden": true })
            }
          )
        ] })
      ] }),
      menuOpen && /* @__PURE__ */ jsxs("div", { className: "md:hidden border-t border-border py-3 space-y-1", children: [
        NAV_LINKS.map((l) => /* @__PURE__ */ jsx(
          "a",
          {
            href: l.href,
            onClick: () => setMenuOpen(false),
            className: "block px-2 py-3 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary",
            children: l.label
          },
          l.href
        )),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "#follow",
            onClick: () => setMenuOpen(false),
            className: "block px-2 py-3 font-medium text-primary-strong",
            children: "Join the research"
          }
        )
      ] })
    ] }) })
  ] });
}
const rise = (delay) => ({
  initial: { y: 18 },
  animate: { y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }
});
const POINTS = [
  { x: 108, y: 112, kind: "fixed" },
  // index tip — confirm
  { x: 108, y: 224, kind: "fixed" },
  // index base — dismiss/back
  { x: 150, y: 96, kind: "fixed" },
  // middle tip — undo
  { x: 150, y: 220, kind: "fixed" },
  // middle base — next
  { x: 192, y: 112, kind: "fixed" },
  // ring tip — read/repeat
  { x: 192, y: 224, kind: "fixed" },
  // ring base — previous
  { x: 228, y: 232, kind: "shortcut" },
  // pinky base — shortcut 1
  { x: 228, y: 140, kind: "emergency" }
  // pinky tip — shortcut 2 + emergency hold
];
function HandFigure() {
  return /* @__PURE__ */ jsxs("figure", { className: "max-w-md mx-auto lg:mx-0", children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        viewBox: "0 0 300 400",
        role: "img",
        "aria-label": "Line drawing of an open hand wearing the Tactiq ring on the index finger. Eight contact points are marked on the tips and bases of the four fingers: six fixed commands, one personal shortcut on the pinky base, and the pinky tip, which combines a second shortcut with the emergency hold.",
        className: "w-full h-auto text-foreground",
        children: [
          /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeOpacity: "0.45", strokeWidth: "2", children: [
            /* @__PURE__ */ jsx("rect", { x: "112", y: "325", width: "96", height: "72", rx: "26" }),
            /* @__PURE__ */ jsx("rect", { x: "80", y: "198", width: "162", height: "148", rx: "46" }),
            /* @__PURE__ */ jsx("rect", { x: "92", y: "100", width: "33", height: "148", rx: "16.5" }),
            /* @__PURE__ */ jsx("rect", { x: "134", y: "80", width: "33", height: "168", rx: "16.5" }),
            /* @__PURE__ */ jsx("rect", { x: "176", y: "100", width: "33", height: "148", rx: "16.5" }),
            /* @__PURE__ */ jsx("rect", { x: "214", y: "130", width: "31", height: "120", rx: "15.5" }),
            /* @__PURE__ */ jsx("rect", { x: "80", y: "193", width: "31", height: "104", rx: "15.5", transform: "rotate(-35 95 290)" })
          ] }),
          /* @__PURE__ */ jsxs("g", { stroke: "var(--color-primary)", strokeWidth: "5", fill: "none", children: [
            /* @__PURE__ */ jsx("line", { x1: "90", y1: "196", x2: "127", y2: "196" }),
            /* @__PURE__ */ jsx("line", { x1: "90", y1: "206", x2: "127", y2: "206" })
          ] }),
          POINTS.map((p, i) => /* @__PURE__ */ jsxs("g", { className: "point-pop", style: { animationDelay: `${0.5 + i * 0.08}s` }, children: [
            p.kind === "emergency" && /* @__PURE__ */ jsx("circle", { cx: p.x, cy: p.y, r: "14", fill: "none", stroke: "var(--color-primary)", strokeWidth: "2", strokeDasharray: "3 3" }),
            /* @__PURE__ */ jsx(
              "circle",
              {
                cx: p.x,
                cy: p.y,
                r: "8",
                fill: p.kind === "fixed" ? "currentColor" : "var(--color-primary)",
                fillOpacity: p.kind === "fixed" ? 0.85 : 1
              }
            )
          ] }, i))
        ]
      }
    ),
    /* @__PURE__ */ jsxs("figcaption", { className: "mt-3 text-sm text-muted-foreground text-center lg:text-left", children: [
      "Concept illustration — the eight contact points a thumb can reach. Solid dots are fixed commands; ",
      /* @__PURE__ */ jsx("span", { className: "text-primary-strong font-medium", children: "orange" }),
      " dots are the two personal shortcuts, and the dashed circle marks the five-second emergency hold. Not a finished production device."
    ] })
  ] });
}
function Hero() {
  return /* @__PURE__ */ jsx("section", { className: "px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(motion.p, { ...rise(0), className: "font-mono-label text-muted-foreground mb-5", children: "Student research prototype · Sydney, Australia · Bench testing planned for August–October 2026" }),
      /* @__PURE__ */ jsx(motion.h1, { ...rise(0.08), className: "text-4xl sm:text-5xl lg:text-[3.4rem] mb-6", children: "Control your phone with the hand you already know." }),
      /* @__PURE__ */ jsx(motion.p, { ...rise(0.16), className: "text-lg text-muted-foreground max-w-[38rem] mb-8", children: "Tactiq is a smart ring that gives blind and low-vision people a quiet, one-handed way to control their phone. Tap a point on your fingers, and VoiceOver or TalkBack carries out the command." }),
      /* @__PURE__ */ jsxs(motion.div, { ...rise(0.24), className: "flex flex-col sm:flex-row gap-3 mb-10", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "#follow",
            className: "inline-flex items-center justify-center px-6 h-12 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity",
            children: "Follow the research"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "#how-it-works",
            className: "inline-flex items-center justify-center px-6 h-12 border border-border rounded-md font-medium hover:bg-secondary transition-colors",
            children: "See how it works"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(motion.dl, { ...rise(0.32), className: "flex flex-wrap gap-x-10 gap-y-4", children: [
        { value: "9", label: "commands" },
        { value: "8", label: "contact points" },
        { value: "1", label: "hand needed" }
      ].map((s) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "sr-only", children: s.label }),
        /* @__PURE__ */ jsxs("dd", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-3xl font-semibold text-primary-strong tabular-nums", children: s.value }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: s.label })
        ] })
      ] }, s.label)) })
    ] }),
    /* @__PURE__ */ jsx(HandFigure, {})
  ] }) });
}
const WORDS = ["SQUEEZE", "TAP", "CONFIRM", "BACK", "UNDO", "NEXT", "PREVIOUS", "READ", "HOLD"];
function Row() {
  return /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center", children: WORDS.map((w) => /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
    /* @__PURE__ */ jsx("span", { className: "font-mono-label !text-[1.05rem] tracking-[0.25em] text-foreground/80 px-6", children: w }),
    /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "w-2 h-2 rounded-full bg-primary" })
  ] }, w)) });
}
function Marquee() {
  return /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "border-y border-border py-4 overflow-hidden select-none", children: /* @__PURE__ */ jsxs("div", { className: "flex w-max marquee-track", children: [
    /* @__PURE__ */ jsx(Row, {}),
    /* @__PURE__ */ jsx(Row, {})
  ] }) });
}
function CaneFigure() {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 80 80", "aria-hidden": true, className: "w-16 h-16 text-foreground/70", children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsx("circle", { cx: "34", cy: "14", r: "7" }),
    /* @__PURE__ */ jsx("path", { d: "M34 22 L34 46 M34 30 L20 42 M34 30 L50 38 M34 46 L26 68 M34 46 L44 66" }),
    /* @__PURE__ */ jsx("path", { d: "M50 38 L62 64", strokeDasharray: "3 3" }),
    /* @__PURE__ */ jsx("path", { d: "M56 64 L68 64" })
  ] }) });
}
function PhoneRingFigure() {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 80 80", "aria-hidden": true, className: "w-16 h-16 text-foreground/70", children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsx("rect", { x: "28", y: "18", width: "24", height: "42", rx: "4" }),
    /* @__PURE__ */ jsx("path", { d: "M18 26 C14 34 14 44 18 52" }),
    /* @__PURE__ */ jsx("path", { d: "M62 26 C66 34 66 44 62 52" }),
    /* @__PURE__ */ jsx("path", { d: "M36 68 h8", stroke: "var(--color-primary)", strokeWidth: "4" })
  ] }) });
}
function QuietBrowseFigure() {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 80 80", "aria-hidden": true, className: "w-16 h-16 text-foreground/70", children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsx("path", { d: "M20 58 C20 44 28 40 40 40 C52 40 60 44 60 58" }),
    /* @__PURE__ */ jsx("circle", { cx: "40", cy: "26", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M64 22 l6 -6 M66 32 l8 -2 M60 14 l3 -8", stroke: "var(--color-primary)" })
  ] }) });
}
const SCENARIOS = [
  {
    figure: /* @__PURE__ */ jsx(CaneFigure, {}),
    heading: "One hand is already busy",
    body: "A cane or a guide-dog harness occupies one hand outdoors. Tactiq puts every command on the free hand, so nothing has to be put down."
  },
  {
    figure: /* @__PURE__ */ jsx(PhoneRingFigure, {}),
    heading: "A call in a loud place",
    body: "On a train platform, voice control fails and a touchscreen demands attention. A tap on the index finger answers the call; a tap below it declines."
  },
  {
    figure: /* @__PURE__ */ jsx(QuietBrowseFigure, {}),
    heading: "Moving through a screen reader, silently",
    body: "Next, previous, read again, confirm — the four moves screen-reader users repeat hundreds of times a day, without speaking aloud or finding a spot on glass."
  }
];
function Scenarios() {
  return /* @__PURE__ */ jsx("section", { "aria-labelledby": "everyday-heading", className: "px-4 sm:px-6 lg:px-8 py-16 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsx("h2", { id: "everyday-heading", className: "text-3xl sm:text-4xl mb-3", children: "Where it fits in a day" }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-[42rem] mb-12", children: "Not a new way to live — a quieter way to do the small things a phone already does." }),
    /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-3 gap-x-10 gap-y-10", children: SCENARIOS.map((s) => /* @__PURE__ */ jsxs("div", { className: "max-w-[24rem]", children: [
      s.figure,
      /* @__PURE__ */ jsx("h3", { className: "mt-4 mb-2", children: s.heading }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: s.body })
    ] }, s.heading)) })
  ] }) });
}
function Reveal({
  children,
  delay = 0,
  className
}) {
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className,
      initial: { y: 18 },
      whileInView: { y: 0 },
      viewport: { once: true, margin: "-40px" },
      transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
      children
    }
  );
}
const STEPS = [
  { verb: "Squeeze", body: "A deliberate squeeze of the ring body wakes it and opens a short command window." },
  { verb: "Tap", body: "Your thumb taps one of eight contact points on the tips and bases of your fingers." },
  { verb: "Detect", body: "The ring senses which point was touched, on-device — no camera, no microphone." },
  { verb: "Act", body: "Your phone runs the command through VoiceOver or TalkBack over Bluetooth." },
  { verb: "Confirm", body: "A distinct vibration pattern tells your hand which command the ring heard." }
];
function Sequence() {
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "how-it-works",
      "aria-labelledby": "how-heading",
      className: "px-4 sm:px-6 lg:px-8 py-16 border-t border-border",
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
        /* @__PURE__ */ jsx("h2", { id: "how-heading", className: "text-3xl sm:text-4xl mb-3", children: "How it works" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-[42rem] mb-12", children: "One continuous movement of the hand, from intention to confirmation. The design target is at most one false activation per hour — the squeeze is what stops taps from firing accidentally." }),
        /* @__PURE__ */ jsxs("ol", { className: "relative grid gap-10 md:grid-cols-5 md:gap-6 list-none", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              "aria-hidden": true,
              className: "absolute left-[1.05rem] top-2 bottom-2 w-px bg-border md:left-0 md:right-0 md:top-[1.05rem] md:bottom-auto md:w-auto md:h-px"
            }
          ),
          STEPS.map((step, i) => /* @__PURE__ */ jsxs("li", { className: "relative pl-12 md:pl-0 md:pt-12", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `absolute left-0 top-0 md:top-0 md:left-0 w-[2.1rem] h-[2.1rem] rounded-full flex items-center justify-center text-sm font-semibold tabular-nums ${i === STEPS.length - 1 ? "bg-primary text-primary-foreground haptic-pulse" : "bg-foreground text-background"}`,
                children: i + 1
              }
            ),
            /* @__PURE__ */ jsxs(Reveal, { delay: i * 0.09, children: [
              /* @__PURE__ */ jsx("h3", { className: "mb-1.5", children: step.verb }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-[0.95rem]", children: step.body })
            ] })
          ] }, step.verb))
        ] })
      ] })
    }
  );
}
function kindOf(p) {
  if (p.id === "pinky-tip") return "emergency";
  return p.editable ? "shortcut" : "fixed";
}
const KIND_STYLE = {
  fixed: { dot: "bg-foreground text-background", label: "Fixed command" },
  shortcut: { dot: "bg-primary text-primary-foreground", label: "Personal shortcut" },
  emergency: {
    dot: "bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary ring-offset-background",
    label: "Shortcut + emergency hold"
  }
};
function CommandList() {
  const fixed = gesturePoints.filter((p) => kindOf(p) === "fixed");
  const personal = gesturePoints.filter((p) => kindOf(p) !== "fixed");
  return /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h4", { className: "mb-3", children: "Seven fixed commands" }),
      /* @__PURE__ */ jsxs("ol", { className: "space-y-2 list-decimal list-inside", children: [
        fixed.map((p) => {
          var _a, _b;
          return /* @__PURE__ */ jsxs("li", { className: "text-[0.95rem]", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: ((_b = (_a = p.gestures) == null ? void 0 : _a[0]) == null ? void 0 : _b.split(": ")[1]) ?? p.label }),
            /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
              " — ",
              p.finger.toLowerCase(),
              " ",
              p.position.toLowerCase()
            ] })
          ] }, p.id);
        }),
        /* @__PURE__ */ jsxs("li", { className: "text-[0.95rem]", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Emergency" }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            " ",
            "— pinky tip, sustained five-second hold. Never a tap count, so it cannot fire by accident."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h4", { className: "mb-3", children: "Two personal shortcuts" }),
      /* @__PURE__ */ jsx("ol", { className: "space-y-2 list-decimal list-inside", children: personal.map((p) => /* @__PURE__ */ jsxs("li", { className: "text-[0.95rem]", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium", children: p.id === "pinky-tip" ? "Shortcut 2" : "Shortcut 1" }),
        /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          " ",
          "— ",
          p.finger.toLowerCase(),
          " ",
          p.position.toLowerCase(),
          ", a brief tap runs a command you choose: speak the time, call a favourite, share your location…"
        ] })
      ] }, p.id)) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-4", children: "The seven fixed commands never move — reliable use depends on muscle memory. Only the two shortcut points can be remapped." })
    ] })
  ] });
}
function HandMap() {
  const [selectedId, setSelectedId] = useState(gesturePoints[0].id);
  const [showList, setShowList] = useState(false);
  const buttonsRef = useRef([]);
  const selected = gesturePoints.find((p) => p.id === selectedId) ?? gesturePoints[0];
  const selectedIndex = gesturePoints.findIndex((p) => p.id === selectedId);
  const moveFocus = (from, delta) => {
    var _a;
    const next = (from + delta + gesturePoints.length) % gesturePoints.length;
    (_a = buttonsRef.current[next]) == null ? void 0 : _a.focus();
  };
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "command-map",
      "aria-labelledby": "handmap-heading",
      className: "px-4 sm:px-6 lg:px-8 py-16 border-t border-border",
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 mb-3", children: [
          /* @__PURE__ */ jsx("h2", { id: "handmap-heading", className: "text-3xl sm:text-4xl", children: "The hand is the interface" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowList((v) => !v),
              "aria-pressed": showList,
              className: "inline-flex items-center gap-2 h-11 px-4 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors",
              children: [
                showList ? /* @__PURE__ */ jsx(Hand, { className: "w-4 h-4", "aria-hidden": true }) : /* @__PURE__ */ jsx(List, { className: "w-4 h-4", "aria-hidden": true }),
                showList ? "View the hand map" : "View all commands as a list"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-[42rem] mb-10", children: "Every command lives on skin you can feel without looking. Seven fixed commands, two personal shortcuts, and one emergency hold — separated by position and, for the emergency, by duration." }),
        showList ? /* @__PURE__ */ jsx(CommandList, {}) : /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-10 items-start", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              role: "group",
              "aria-label": "Command map: eight contact points on the hand. Use arrow keys to move between points.",
              className: "relative max-w-md",
              children: [
                /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 300 400", "aria-hidden": true, className: "w-full h-auto text-foreground", children: [
                  /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeOpacity: "0.4", strokeWidth: "2", children: [
                    /* @__PURE__ */ jsx("rect", { x: "112", y: "325", width: "96", height: "72", rx: "26" }),
                    /* @__PURE__ */ jsx("rect", { x: "80", y: "198", width: "162", height: "148", rx: "46" }),
                    /* @__PURE__ */ jsx("rect", { x: "92", y: "100", width: "33", height: "148", rx: "16.5" }),
                    /* @__PURE__ */ jsx("rect", { x: "134", y: "80", width: "33", height: "168", rx: "16.5" }),
                    /* @__PURE__ */ jsx("rect", { x: "176", y: "100", width: "33", height: "148", rx: "16.5" }),
                    /* @__PURE__ */ jsx("rect", { x: "214", y: "130", width: "31", height: "120", rx: "15.5" }),
                    /* @__PURE__ */ jsx("rect", { x: "80", y: "193", width: "31", height: "104", rx: "15.5", transform: "rotate(-35 95 290)" })
                  ] }),
                  /* @__PURE__ */ jsxs("g", { stroke: "var(--color-primary)", strokeWidth: "5", fill: "none", strokeOpacity: "0.9", children: [
                    /* @__PURE__ */ jsx("line", { x1: "90", y1: "196", x2: "127", y2: "196" }),
                    /* @__PURE__ */ jsx("line", { x1: "90", y1: "206", x2: "127", y2: "206" })
                  ] })
                ] }),
                gesturePoints.map((point, i) => {
                  const kind = kindOf(point);
                  const isSelected = selectedId === point.id;
                  return /* @__PURE__ */ jsx(
                    "button",
                    {
                      ref: (el) => {
                        buttonsRef.current[i] = el;
                      },
                      tabIndex: i === selectedIndex ? 0 : -1,
                      "aria-pressed": isSelected,
                      "aria-label": `${point.finger} ${point.position.toLowerCase()}: ${point.description.split("—")[0].trim()}. ${KIND_STYLE[kind].label}.`,
                      onClick: () => setSelectedId(point.id),
                      onKeyDown: (e) => {
                        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                          e.preventDefault();
                          moveFocus(i, 1);
                        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                          e.preventDefault();
                          moveFocus(i, -1);
                        }
                      },
                      style: { position: "absolute", left: point.x, top: point.y },
                      className: `w-11 h-11 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[0.65rem] font-semibold transition-transform ${KIND_STYLE[kind].dot} ${isSelected ? "scale-110 outline outline-2 outline-offset-4 outline-primary-strong" : "hover:scale-105"}`,
                      children: point.label
                    },
                    point.id
                  );
                })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { y: 10 },
              animate: { y: 0 },
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              "aria-live": "polite",
              className: "md:sticky md:top-24",
              children: [
                /* @__PURE__ */ jsxs("p", { className: "font-mono-label text-muted-foreground mb-2", children: [
                  selected.finger,
                  " · ",
                  selected.position.toLowerCase(),
                  " · ",
                  KIND_STYLE[kindOf(selected)].label
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "text-2xl mb-3 font-serif-display font-semibold", children: selected.description.split("—")[0].trim() }),
                /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-5", children: selected.description }),
                selected.gestures && /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: selected.gestures.map((g) => /* @__PURE__ */ jsxs("li", { className: "text-[0.95rem] flex gap-2", children: [
                  /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-primary-strong", children: "—" }),
                  g
                ] }, g)) })
              ]
            },
            selected.id
          )
        ] }),
        !showList && /* @__PURE__ */ jsxs("ul", { className: "mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "w-3.5 h-3.5 rounded-full bg-foreground inline-block" }),
            "Fixed command (7) — never moves"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "w-3.5 h-3.5 rounded-full bg-primary inline-block" }),
            "Personal shortcut (2) — yours to map"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                "aria-hidden": true,
                className: "w-3.5 h-3.5 rounded-full bg-primary inline-block ring-2 ring-primary ring-offset-2 ring-offset-background"
              }
            ),
            "Emergency — five-second hold on the pinky tip"
          ] })
        ] })
      ] })
    }
  );
}
const KINDS = {
  confirmed: { label: "Confirmed fact", color: "text-status-confirmed", Icon: CheckCircle2 },
  simulation: { label: "Simulation result", color: "text-status-simulation", Icon: FlaskConical },
  target: { label: "Design target", color: "text-status-target", Icon: Target },
  future: { label: "Planned — not yet measured", color: "text-status-future", Icon: CalendarClock }
};
function EvidenceStatus({
  kind,
  children
}) {
  const { label, color, Icon } = KINDS[kind];
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 font-mono-label ${color}`, children: [
    /* @__PURE__ */ jsx(Icon, { className: "w-3.5 h-3.5 shrink-0", "aria-hidden": true }),
    children ?? label
  ] });
}
const V1_POINTS = [
  { x: 42, y: 212, label: "Shf", tone: "var(--color-foreground)" },
  { x: 69, y: 252, label: "Lng", tone: "var(--color-foreground)" },
  { x: 108, y: 136, label: ".?!", tone: "var(--color-status-simulation)" },
  { x: 150, y: 120, label: "ABC", tone: "var(--color-status-simulation)" },
  { x: 192, y: 136, label: "DEF", tone: "var(--color-status-simulation)" },
  { x: 108, y: 168, label: "GHI", tone: "var(--color-status-simulation)" },
  { x: 150, y: 160, label: "JKL", tone: "var(--color-status-simulation)" },
  { x: 192, y: 168, label: "MNO", tone: "var(--color-status-simulation)" },
  { x: 108, y: 204, label: "PQR", tone: "var(--color-status-simulation)" },
  { x: 150, y: 200, label: "TUV", tone: "var(--color-status-simulation)" },
  { x: 192, y: 204, label: "WXY", tone: "var(--color-status-simulation)" },
  { x: 228, y: 160, label: "Del", tone: "var(--color-destructive)" },
  { x: 228, y: 190, label: "C1", tone: "var(--color-primary)" },
  { x: 228, y: 218, label: "C2", tone: "var(--color-primary)" },
  { x: 210, y: 296, label: "Ret", tone: "var(--color-foreground)" }
];
const V2_POINTS = [
  { x: 108, y: 112, kind: "fixed" },
  { x: 108, y: 224, kind: "fixed" },
  { x: 150, y: 96, kind: "fixed" },
  { x: 150, y: 220, kind: "fixed" },
  { x: 192, y: 112, kind: "fixed" },
  { x: 192, y: 224, kind: "fixed" },
  { x: 228, y: 232, kind: "shortcut" },
  { x: 228, y: 140, kind: "emergency" }
];
function HandOutline() {
  return /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeOpacity: "0.35", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("rect", { x: "112", y: "325", width: "96", height: "72", rx: "26" }),
    /* @__PURE__ */ jsx("rect", { x: "80", y: "198", width: "162", height: "148", rx: "46" }),
    /* @__PURE__ */ jsx("rect", { x: "92", y: "100", width: "33", height: "148", rx: "16.5" }),
    /* @__PURE__ */ jsx("rect", { x: "134", y: "80", width: "33", height: "168", rx: "16.5" }),
    /* @__PURE__ */ jsx("rect", { x: "176", y: "100", width: "33", height: "148", rx: "16.5" }),
    /* @__PURE__ */ jsx("rect", { x: "214", y: "130", width: "31", height: "120", rx: "15.5" }),
    /* @__PURE__ */ jsx("rect", { x: "80", y: "193", width: "31", height: "104", rx: "15.5", transform: "rotate(-35 95 290)" })
  ] });
}
function DesignEvolution() {
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "evolution",
      "aria-labelledby": "evolution-heading",
      className: "px-4 sm:px-6 lg:px-8 py-16 border-t border-border",
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
        /* @__PURE__ */ jsxs(Reveal, { children: [
          /* @__PURE__ */ jsx("h2", { id: "evolution-heading", className: "text-3xl sm:text-4xl mb-3", children: "How the design evolved" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-[42rem] mb-12", children: "The first concept could type. The current one can be trusted. Both hands below are real stages of this project." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-12 lg:gap-16", children: [
          /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsxs("figure", { children: [
            /* @__PURE__ */ jsxs(
              "svg",
              {
                viewBox: "0 0 300 400",
                role: "img",
                "aria-label": "Concept v1: a hand mapped with fifteen contact points — a nine-key phone-keypad alphabet across the index, middle and ring knuckles, shift and language modifiers on the thumb, a delete cluster and two custom slots on the pinky, and a return tap on the palm.",
                className: "w-full max-w-sm h-auto text-foreground",
                children: [
                  /* @__PURE__ */ jsx(HandOutline, {}),
                  /* @__PURE__ */ jsx("rect", { x: "102", y: "244", width: "135", height: "16", rx: "8", fill: "currentColor", opacity: "0.25" }),
                  /* @__PURE__ */ jsx("text", { x: "169", y: "256", textAnchor: "middle", fontSize: "9", fill: "currentColor", opacity: "0.8", fontFamily: "var(--font-mono)", children: "SPACE" }),
                  V1_POINTS.map((p, i) => /* @__PURE__ */ jsxs("g", { className: "point-pop", style: { animationDelay: `${i * 0.05}s` }, children: [
                    /* @__PURE__ */ jsx("circle", { cx: p.x, cy: p.y, r: "12", fill: p.tone, opacity: "0.85" }),
                    /* @__PURE__ */ jsx(
                      "text",
                      {
                        x: p.x,
                        y: p.y + 2.5,
                        textAnchor: "middle",
                        fontSize: "7",
                        fill: "var(--color-background)",
                        fontFamily: "var(--font-mono)",
                        fontWeight: "600",
                        children: p.label
                      }
                    )
                  ] }, i))
                ]
              }
            ),
            /* @__PURE__ */ jsxs("figcaption", { className: "mt-3 text-sm text-muted-foreground max-w-[46ch]", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono-label text-foreground block mb-1", children: "Concept v1 · 2025 · superseded" }),
              "Sixty-plus gestures on fifteen points: a full phone-keypad alphabet, thumb modifiers, a palm space bar. It typed English — and demanded pinpoint thumb accuracy on targets barely 8 mm apart."
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Reveal, { delay: 0.12, children: /* @__PURE__ */ jsxs("figure", { children: [
            /* @__PURE__ */ jsxs(
              "svg",
              {
                viewBox: "0 0 300 400",
                role: "img",
                "aria-label": "Current design: the same hand with eight well-spaced contact points on the tips and bases of the four fingers, wearing the ring on the index finger.",
                className: "w-full max-w-sm h-auto text-foreground",
                children: [
                  /* @__PURE__ */ jsx(HandOutline, {}),
                  /* @__PURE__ */ jsxs("g", { stroke: "var(--color-primary)", strokeWidth: "5", fill: "none", children: [
                    /* @__PURE__ */ jsx("line", { x1: "90", y1: "196", x2: "127", y2: "196" }),
                    /* @__PURE__ */ jsx("line", { x1: "90", y1: "206", x2: "127", y2: "206" })
                  ] }),
                  V2_POINTS.map((p, i) => /* @__PURE__ */ jsxs("g", { className: "point-pop", style: { animationDelay: `${0.3 + i * 0.07}s` }, children: [
                    p.kind === "emergency" && /* @__PURE__ */ jsx("circle", { cx: p.x, cy: p.y, r: "14", fill: "none", stroke: "var(--color-primary)", strokeWidth: "2", strokeDasharray: "3 3" }),
                    /* @__PURE__ */ jsx(
                      "circle",
                      {
                        cx: p.x,
                        cy: p.y,
                        r: "8",
                        fill: p.kind === "fixed" ? "currentColor" : "var(--color-primary)",
                        fillOpacity: p.kind === "fixed" ? 0.85 : 1
                      }
                    )
                  ] }, i))
                ]
              }
            ),
            /* @__PURE__ */ jsxs("figcaption", { className: "mt-3 text-sm text-muted-foreground max-w-[46ch]", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono-label text-foreground block mb-1", children: "Current design · 9 commands on 8 points" }),
              "The capacity analysis found the knee: pushing past eight points adds almost no usable information while the worst command's accuracy collapses from 87% to roughly 50%. Typing moved out; trust moved in."
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-10", children: /* @__PURE__ */ jsx(EvidenceStatus, { kind: "simulation", children: "Capacity analysis — Tactiq paper 1" }) })
      ] })
    }
  );
}
const ProductViewer = lazy(() => import("./ProductViewer-DFqRW3Gn.js"));
const RING_MODEL = "/models/ring.glb";
const RING_POSTER = "/models/ring-poster.svg";
const PARTS = [
  { n: 1, name: "Ring shell", note: "3D-printed for the bench prototype; soft-touch polymer is the long-term aim." },
  { n: 2, name: "Three magnetometers", note: "Low-cost sensors spaced around the band to localise the thumb magnet." },
  { n: 3, name: "Squeeze input", note: "A deliberate squeeze of the band wakes the ring and opens the command window." },
  { n: 4, name: "Haptic motor", note: "Plays a distinct confirmation pattern for each command." },
  { n: 5, name: "Bluetooth LE module", note: "Talks to VoiceOver and TalkBack on the paired phone." },
  { n: 6, name: "Passive thumb magnet", note: "Worn on the thumb; it has no battery and emits nothing." }
];
const CLAIMS = [
  { text: "Prototype component cost under $60, built from off-the-shelf parts", kind: "confirmed", label: "Prototype component cost" },
  { text: "Thumb localised to ~1.65 mm at the array centre, ~4.4 mm off-centre — against 20–25 mm between contact points", kind: "simulation" },
  { text: "At least 95% per-contact accuracy", kind: "target" },
  { text: "At most one false activation per hour", kind: "target" },
  { text: "Physical dimensions and weight", kind: "future", label: "Not yet measured" },
  { text: "Bench experiment with real thumbs, August–October 2026", kind: "future", label: "Planned bench test" }
];
function RingDiagram() {
  return /* @__PURE__ */ jsxs("figure", { children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        viewBox: "0 0 360 300",
        role: "img",
        "aria-label": "Technical diagram of the ring prototype: a cross-section of the band showing three magnetometers spaced around it, the squeeze zone, the haptic motor and the Bluetooth module, with the passive magnet drawn separately on the thumb.",
        className: "w-full h-auto text-foreground",
        children: [
          /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
            /* @__PURE__ */ jsx("circle", { cx: "150", cy: "150", r: "95" }),
            /* @__PURE__ */ jsx("circle", { cx: "150", cy: "150", r: "68" })
          ] }),
          [90, 210, 330].map((deg) => {
            const rad = deg * Math.PI / 180;
            const x = 150 + Math.cos(rad) * 81.5;
            const y = 150 + Math.sin(rad) * 81.5;
            return /* @__PURE__ */ jsx("rect", { x: x - 7, y: y - 7, width: "14", height: "14", fill: "var(--color-status-simulation)", transform: `rotate(${deg + 90} ${x} ${y})` }, deg);
          }),
          /* @__PURE__ */ jsx("path", { d: "M 62 120 A 95 95 0 0 1 92 74", fill: "none", stroke: "var(--color-primary)", strokeWidth: "8", strokeLinecap: "round" }),
          /* @__PURE__ */ jsx("circle", { cx: "205", cy: "215", r: "11", fill: "currentColor" }),
          /* @__PURE__ */ jsx("rect", { x: "130", y: "52", width: "40", height: "14", rx: "3", fill: "currentColor", opacity: "0.75" }),
          /* @__PURE__ */ jsxs("g", { transform: "translate(285 60)", children: [
            /* @__PURE__ */ jsx("rect", { x: "0", y: "0", width: "44", height: "140", rx: "22", fill: "none", stroke: "currentColor", strokeOpacity: "0.45", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("rect", { x: "12", y: "24", width: "20", height: "10", rx: "2", fill: "var(--color-primary)" })
          ] }),
          /* @__PURE__ */ jsxs("g", { className: "font-mono-label", fill: "currentColor", fontSize: "12", children: [
            /* @__PURE__ */ jsx("text", { x: "42", y: "160", children: "1" }),
            /* @__PURE__ */ jsx("text", { x: "240", y: "155", children: "2" }),
            /* @__PURE__ */ jsx("text", { x: "58", y: "80", children: "3" }),
            /* @__PURE__ */ jsx("text", { x: "222", y: "240", children: "4" }),
            /* @__PURE__ */ jsx("text", { x: "145", y: "42", children: "5" }),
            /* @__PURE__ */ jsx("text", { x: "300", y: "48", children: "6" })
          ] }),
          /* @__PURE__ */ jsxs("g", { stroke: "currentColor", strokeOpacity: "0.35", strokeWidth: "1", children: [
            /* @__PURE__ */ jsx("line", { x1: "50", y1: "155", x2: "66", y2: "152" }),
            /* @__PURE__ */ jsx("line", { x1: "238", y1: "150", x2: "228", y2: "150" }),
            /* @__PURE__ */ jsx("line", { x1: "66", y1: "84", x2: "76", y2: "92" }),
            /* @__PURE__ */ jsx("line", { x1: "218", y1: "232", x2: "211", y2: "223" }),
            /* @__PURE__ */ jsx("line", { x1: "150", y1: "46", x2: "150", y2: "52" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("figcaption", { className: "mt-3 text-sm text-muted-foreground", children: "Concept drawing of the bench prototype's layout — part positions are indicative, not final." })
  ] });
}
function Prototype() {
  const [show3d, setShow3d] = useState(false);
  return /* @__PURE__ */ jsx("section", { id: "the-ring", "aria-labelledby": "proto-heading", className: "px-4 sm:px-6 lg:px-8 py-16 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsx("h2", { id: "proto-heading", className: "text-3xl sm:text-4xl mb-3", children: "Meet the prototype" }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-[42rem] mb-12", children: "Everything below is labelled the way a lab notebook would label it: what is measured, what is simulated, what is a target, and what is still a plan." }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-10 lg:gap-16 items-start", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(RingDiagram, {}),
        /* @__PURE__ */ jsx("div", { className: "mt-6", children: show3d ? /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "relative rounded-lg overflow-hidden bg-card aspect-square max-w-sm", children: /* @__PURE__ */ jsx(
            Suspense,
            {
              fallback: /* @__PURE__ */ jsx("img", { src: RING_POSTER, alt: "Static concept image of the Tactiq smart ring", className: "w-full h-full object-contain" }),
              children: /* @__PURE__ */ jsx(
                ProductViewer,
                {
                  src: RING_MODEL,
                  poster: RING_POSTER,
                  alt: "Interactive 3D concept model of the Tactiq smart ring. Drag or use arrow keys to rotate.",
                  cameraControls: true,
                  exposure: 1.1,
                  className: "w-full h-full",
                  children: /* @__PURE__ */ jsx("img", { src: RING_POSTER, alt: "Static concept image of the Tactiq smart ring", className: "w-full h-full object-contain" })
                }
              )
            }
          ) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Concept model — not a finished production device. Drag with a pointer or focus the model and use arrow keys to rotate; it never rotates on its own." })
        ] }) : /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShow3d(true),
            className: "inline-flex items-center gap-2 h-11 px-4 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors",
            children: [
              /* @__PURE__ */ jsx(Box, { className: "w-4 h-4", "aria-hidden": true }),
              "Load the interactive 3D concept model"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-4", children: "Parts" }),
        /* @__PURE__ */ jsx("ol", { className: "space-y-3 mb-10", children: PARTS.map((p) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "font-mono-label text-muted-foreground w-5 shrink-0 pt-0.5", children: p.n }),
          /* @__PURE__ */ jsxs("p", { className: "text-[0.95rem]", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              p.name,
              "."
            ] }),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: p.note })
          ] })
        ] }, p.n)) }),
        /* @__PURE__ */ jsx("h3", { className: "mb-4", children: "What we claim, and how sure we are" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: CLAIMS.map((c) => /* @__PURE__ */ jsxs("li", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsx(EvidenceStatus, { kind: c.kind, children: c.label }),
          /* @__PURE__ */ jsx("p", { className: "text-[0.95rem] text-muted-foreground", children: c.text })
        ] }, c.text)) })
      ] })
    ] })
  ] }) });
}
const DETAILS = [
  {
    summary: "Why eight physical contact points, not more",
    body: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { children: "The capacity analysis treats the hand as a channel: each extra contact point adds information but shrinks the landing zone a thumb has to hit. The analysis finds a knee at eight points — going to sixteen adds only about +0.31 bits of capacity while the worst command's accuracy collapses from 87% to roughly 50%." }),
      /* @__PURE__ */ jsx("p", { className: "mt-3", children: "For context: Apple's AssistiveTouch ships 4 gestures, Meta's sEMG wristband handles roughly 9, and EFRing reached 89.5% accuracy on 9. Nine commands is where reliable sits." })
    ] })
  },
  {
    summary: "How magnetic localisation is expected to work",
    body: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { children: "A passive magnet on the thumb creates a field that falls off with the cube of distance. Three magnetometers in the ring each read that field; solving the inverse problem gives the thumb's position. In simulation this resolves the thumb to about 1.65 mm at the array centre and about 4.4 mm off-centre — an order of magnitude finer than the 20–25 mm spacing between contact points." }),
      /* @__PURE__ */ jsx("p", { className: "mt-3", children: "The simulation assumes magnet tilt under ~12°, per-sensor gain calibration, and a minimum sensor standoff. Outside those conditions the error grows." })
    ] })
  },
  {
    summary: "What the bench experiment will test",
    body: /* @__PURE__ */ jsx("p", { children: "The honest risk in the design is not sensor noise — it is thumb aim. The bench experiment (August–October 2026) therefore measures real thumbs first: per-contact accuracy across repeated prompted trials, false activations per hour of ordinary wear, and how quickly the squeeze-wake window feels natural. The protocol and targets were written down before the experiment, so results cannot quietly become claims." })
  },
  {
    summary: "What remains uncertain",
    body: /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-1.5", children: [
      /* @__PURE__ */ jsx("li", { children: "Whether per-contact accuracy holds across different hand sizes and nail lengths." }),
      /* @__PURE__ */ jsx("li", { children: "How often everyday movement squeezes the ring by accident." }),
      /* @__PURE__ */ jsx("li", { children: "Battery life under realistic duty cycles — not yet measured." }),
      /* @__PURE__ */ jsx("li", { children: "Comfort of all-day wear with the thumb magnet." })
    ] })
  }
];
const SOURCES = [
  { label: "WebAIM Screen Reader Survey #10 (2024) — mobile screen-reader and braille usage", href: "https://webaim.org/projects/screenreadersurvey10/" },
  { label: 'Ballati et al. (2018), "Hey Siri, do you understand me?" — voice assistants and dysarthric speech' },
  { label: "Journal of Speech, Language, and Hearing Research (2024) — word error rates of unadapted ASR on disordered speech" },
  { label: "Tactiq paper 1 — design principles and contact-point capacity analysis (available on request)" },
  { label: "Tactiq paper 2 — magnet trilateration simulation (available on request)" }
];
function Research() {
  return /* @__PURE__ */ jsx("section", { id: "research", "aria-labelledby": "research-heading", className: "px-4 sm:px-6 lg:px-8 py-16 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsx("h2", { id: "research-heading", className: "text-3xl sm:text-4xl mb-6", children: "Why nine commands?" }),
    /* @__PURE__ */ jsx("p", { className: "text-lg mb-4", children: "Because the evidence says fewer, better-spaced targets beat many crowded ones." }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "91.3% of blind and low-vision screen-reader users rely on one on mobile, yet only 38% use braille output at all — and refreshable braille hardware runs from $799 to $15,500. Voice control is conditionally reliable: it fails in noise, broadcasts your business, and for atypical speech mainstream assistants have measured accuracy around 50–60%." }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-10", children: "Tactiq's answer is deliberately small: nine commands on eight contact points, driven by the screen reader you already use. Text entry is excluded on purpose, and every command is recoverable — Undo has its own dedicated point instead of any delete gesture." }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-border border-y border-border mb-10", children: DETAILS.map((d) => /* @__PURE__ */ jsxs("details", { className: "group py-1", children: [
      /* @__PURE__ */ jsxs("summary", { className: "flex items-center justify-between gap-4 cursor-pointer list-none py-3.5 font-medium hover:text-primary-strong [&::-webkit-details-marker]:hidden", children: [
        d.summary,
        /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-muted-foreground text-xl leading-none group-open:hidden", children: "+" }),
        /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-muted-foreground text-xl leading-none hidden group-open:inline", children: "−" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pb-5 text-[0.95rem] text-muted-foreground max-w-[65ch]", children: d.body })
    ] }, d.summary)) }),
    /* @__PURE__ */ jsx("h3", { className: "mb-3", children: "Sources" }),
    /* @__PURE__ */ jsx("ul", { className: "space-y-2 mb-8", children: SOURCES.map((s) => /* @__PURE__ */ jsx("li", { className: "text-sm text-muted-foreground", children: s.href ? /* @__PURE__ */ jsx("a", { href: s.href, target: "_blank", rel: "noopener noreferrer", className: "underline underline-offset-4 hover:text-primary-strong", children: s.label }) : s.label }, s.label)) }),
    /* @__PURE__ */ jsx("p", { className: "flex items-start gap-2", children: /* @__PURE__ */ jsx(EvidenceStatus, { kind: "target" }) }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "All ring performance figures on this site are pre-registered targets or simulation results, not achieved results. The bench experiment is what turns them into data." })
  ] }) });
}
const STAGES = [
  { name: "Design study", when: "completed", state: "done", note: "Nine design principles; capacity analysis found the knee at eight contact points." },
  { name: "Physics simulation", when: "completed", state: "done", note: "Magnet trilateration simulated: ~1.65 mm localisation at the array centre." },
  { name: "Prototype construction", when: "now", state: "current", note: "Bench hardware built from off-the-shelf parts — under $60 in components." },
  { name: "Bench experiment", when: "Aug–Oct 2026", state: "future", note: "Real thumbs, prompted trials, pre-registered accuracy and false-activation targets." },
  { name: "Analysis & write-up", when: "Oct–Nov 2026", state: "future", note: "Results against the pre-registered targets, whatever they turn out to be." },
  { name: "AUSSEF submission", when: "11 Nov 2026", state: "future", note: "Australian Science and Engineering Fair entry; a possible ISEF 2027 pathway follows." }
];
const STATE_META = {
  done: { Icon: CheckCircle2, label: "Completed", cls: "text-status-confirmed" },
  current: { Icon: CircleDot, label: "In progress", cls: "text-status-target" },
  future: { Icon: Circle, label: "Planned", cls: "text-status-future" }
};
function Timeline() {
  return /* @__PURE__ */ jsx("section", { id: "status", "aria-labelledby": "status-heading", className: "px-4 sm:px-6 lg:px-8 py-16 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsx("h2", { id: "status-heading", className: "text-3xl sm:text-4xl mb-10", children: "Project status" }),
    /* @__PURE__ */ jsxs("ol", { className: "relative space-y-8 list-none", children: [
      /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "absolute left-[0.72rem] top-2 bottom-2 w-px bg-border" }),
      STAGES.map((s) => {
        const { Icon, label, cls } = STATE_META[s.state];
        return /* @__PURE__ */ jsxs("li", { className: "relative pl-10", children: [
          /* @__PURE__ */ jsx(Icon, { "aria-hidden": true, className: `absolute left-0 top-0.5 w-6 h-6 bg-background ${cls}` }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline gap-x-3 gap-y-0.5", children: [
            /* @__PURE__ */ jsx("h3", { className: s.state === "future" ? "text-muted-foreground" : "", children: s.name }),
            /* @__PURE__ */ jsxs("span", { className: "font-mono-label text-muted-foreground", children: [
              label,
              " · ",
              s.when
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[0.95rem] text-muted-foreground mt-1 max-w-[60ch]", children: s.note })
        ] }, s.name);
      })
    ] })
  ] }) });
}
const RELATIONSHIPS = [
  { value: "", label: "Prefer not to say" },
  { value: "blind_accessibility", label: "Blind or low-vision phone user" },
  { value: "carer", label: "Family member, carer or O&M professional" },
  { value: "elderly", label: "Older or motor-impaired phone user" },
  { value: "developer", label: "Accessibility researcher or developer" },
  { value: "student", label: "Student or educator" },
  { value: "general", label: "Interested observer" }
];
function FollowForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const validate = () => {
    const next = {};
    if (!fullName.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = email.trim() ? "That doesn’t look like a valid email address." : "Please enter your email address.";
    }
    return next;
  };
  const onSubmit = async (e) => {
    var _a;
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (v.name || v.email) {
      (_a = document.getElementById(v.name ? "ff-name" : "ff-email")) == null ? void 0 : _a.focus();
      return;
    }
    setStatus("submitting");
    const result = await joinWaitlist({
      fullName,
      email,
      userCategory: relationship,
      country: "AU"
    });
    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("idle");
      setErrors({ form: result.error || "Something went wrong — please try again." });
    }
  };
  const fieldCls = "w-full h-12 px-3.5 rounded-md border border-input bg-input-background focus:outline-none focus-visible:outline-2 focus-visible:outline-ring";
  return /* @__PURE__ */ jsx("section", { id: "follow", "aria-labelledby": "follow-heading", className: "px-4 sm:px-6 lg:px-8 py-16 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl mb-4", children: "Designed around ordinary components" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4 max-w-[42rem]", children: "The bench prototype is built from off-the-shelf parts for under $60 — three magnetometers, a small magnet, a haptic motor and a Bluetooth module. That is the point of the design: nothing in it requires exotic hardware." }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4 max-w-[42rem]", children: "The long-term aim is consumer-electronics pricing — the kind of money people spend on earbuds, not the $799–$15,500 of refreshable braille hardware. No retail price or release date has been confirmed, and there is nothing to buy today." }),
      /* @__PURE__ */ jsx("p", { className: "mb-2", children: /* @__PURE__ */ jsx(EvidenceStatus, { kind: "confirmed", children: "Prototype component cost — under $60" }) }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx(EvidenceStatus, { kind: "future", children: "Retail pricing — no confirmed price or date" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { id: "follow-heading", className: "text-3xl sm:text-4xl mb-3", children: "Follow the project" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-8", children: "Receive occasional updates about testing, results and opportunities to give feedback." }),
      status === "success" ? /* @__PURE__ */ jsxs("div", { role: "status", className: "flex items-start gap-3 p-5 rounded-md bg-card border border-border", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-status-confirmed shrink-0 mt-0.5", "aria-hidden": true }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium mb-1", children: "You're on the list." }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-[0.95rem]", children: [
            "Thanks",
            fullName ? `, ${fullName.trim().split(" ")[0]}` : "",
            " — we'll email",
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: email }),
            " when there is something real to report: bench results first."
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs("form", { onSubmit, noValidate: true, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "ff-name", className: "block font-medium mb-1.5", children: "Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "ff-name",
              type: "text",
              autoComplete: "name",
              value: fullName,
              onChange: (e) => setFullName(e.target.value),
              "aria-invalid": !!errors.name,
              "aria-describedby": errors.name ? "ff-name-error" : void 0,
              className: `${fieldCls} ${errors.name ? "border-destructive" : ""}`,
              disabled: status === "submitting"
            }
          ),
          errors.name && /* @__PURE__ */ jsxs("p", { id: "ff-name-error", className: "mt-1.5 text-sm text-destructive flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 shrink-0", "aria-hidden": true }),
            errors.name
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "ff-email", className: "block font-medium mb-1.5", children: "Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "ff-email",
              type: "email",
              autoComplete: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              "aria-invalid": !!errors.email,
              "aria-describedby": errors.email ? "ff-email-error" : void 0,
              className: `${fieldCls} ${errors.email ? "border-destructive" : ""}`,
              disabled: status === "submitting"
            }
          ),
          errors.email && /* @__PURE__ */ jsxs("p", { id: "ff-email-error", className: "mt-1.5 text-sm text-destructive flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 shrink-0", "aria-hidden": true }),
            errors.email
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "ff-relationship", className: "block font-medium mb-1.5", children: [
            "Your relationship to the project ",
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-normal", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsx(
            "select",
            {
              id: "ff-relationship",
              value: relationship,
              onChange: (e) => setRelationship(e.target.value),
              className: fieldCls,
              disabled: status === "submitting",
              children: RELATIONSHIPS.map((r) => /* @__PURE__ */ jsx("option", { value: r.value, children: r.label }, r.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { "aria-live": "polite", children: errors.form && /* @__PURE__ */ jsx("p", { role: "alert", className: "text-sm text-destructive mb-3", children: errors.form }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: status === "submitting",
            className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed",
            children: status === "submitting" ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin", "aria-hidden": true }),
              "Joining…"
            ] }) : "Follow the project"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground max-w-[48ch]", children: [
          "We store only what you enter here, use it only for project updates, and delete it on request — see the ",
          /* @__PURE__ */ jsx("a", { href: "/privacy", className: "underline underline-offset-4 hover:text-primary-strong", children: "privacy policy" }),
          ". No spam, no sharing, roughly one email a month at most."
        ] })
      ] })
    ] })
  ] }) });
}
const FAQS = [
  {
    q: "How does the ring know which point I tapped?",
    a: "A passive magnet and three low-cost magnetometers in the ring localize the thumb using the inverse-cube law. In simulation that resolves position to about 1.65 mm at the array centre — against 20–25 mm between contact points. It all happens on-device: no camera, no microphone, no cloud round-trip. These are simulation results; the bench experiment (August–October 2026) measures real thumbs."
  },
  {
    q: "Do I need to look at my phone to use it?",
    a: "No — that’s the whole point. Nine fixed commands on the fingers you can always feel drive VoiceOver or TalkBack, and a distinct haptic pattern confirms each one. An optional single earbud (one ear only — ambient sound is how blind users read the street) adds spoken detail when you want it."
  },
  {
    q: "What stops it firing in my pocket or mid-conversation?",
    a: "The ring is idle until you deliberately squeeze the ring body, which opens a short command window. The pre-registered design target is at most one false activation per hour. Emergency is stricter still: a sustained 5-second hold on the pinky tip — never a tap count — so it cannot fire by accident."
  },
  {
    q: "Why only nine commands? Can it type?",
    a: "Deliberately not. Our capacity analysis found a knee at eight contact points — going to sixteen adds only ~0.31 bits of information but collapses worst-command accuracy from 87% to roughly 50%. Text entry and any delete or clear-field gesture are excluded by design: every Tactiq command is recoverable, and Undo has its own dedicated point."
  },
  {
    q: "Does it replace VoiceOver or TalkBack?",
    a: "Never — it augments them over Bluetooth. Your screen reader stays exactly as you configured it; Tactiq just gives its most-used actions a physical home on one hand, so the other hand is free for a cane or a guide-dog harness."
  },
  {
    q: "When does it ship and how much does it cost?",
    a: "It doesn’t — yet. Tactiq is a student research project: the bench experiment runs August–October 2026, the AUSSEF submission is due 11 November 2026, and ISEF 2027 is the pathway after that. The bench prototype costs under $60 in parts, and the positioning aim is consumer-electronics pricing — there is deliberately no firm retail price to promise."
  },
  {
    q: "Is Tactiq only for blind or low-vision users?",
    a: "Blind and low-vision users are who we design for first — one-handed, silent, eyes-free control is the core requirement. The same properties help older and motor-impaired users, and anyone whose eyes and hands are busy."
  },
  {
    q: "Is my data private?",
    a: "Yes. Tap detection runs on the ring itself, so your movements never leave your hand unless you choose to sync shortcut layouts. We collect the minimum needed to run your account, and never sell your data."
  }
];
function FaqSection() {
  return /* @__PURE__ */ jsx("section", { id: "faq", "aria-labelledby": "faq-heading", className: "px-4 sm:px-6 lg:px-8 py-16 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsx("h2", { id: "faq-heading", className: "text-3xl sm:text-4xl mb-10", children: "Questions people actually ask" }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-border border-y border-border", children: FAQS.map((faq) => /* @__PURE__ */ jsxs("details", { className: "group py-1", children: [
      /* @__PURE__ */ jsxs("summary", { className: "flex items-center justify-between gap-4 cursor-pointer list-none py-4 font-medium hover:text-primary-strong [&::-webkit-details-marker]:hidden", children: [
        faq.q,
        /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-muted-foreground text-xl leading-none group-open:hidden", children: "+" }),
        /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-muted-foreground text-xl leading-none hidden group-open:inline", children: "−" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "pb-5 text-[0.95rem] text-muted-foreground max-w-[65ch]", children: faq.a })
    ] }, faq.q)) }),
    /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-8 text-[0.95rem]", children: [
      "Something else?",
      " ",
      /* @__PURE__ */ jsx("a", { href: "mailto:hello@tactiq.app", className: "underline underline-offset-4 hover:text-primary-strong", children: "Email the project" }),
      "."
    ] })
  ] }) });
}
function LandingPage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxs("main", { id: "main-content", tabIndex: -1, className: "focus:outline-none", children: [
      /* @__PURE__ */ jsx(Hero, {}),
      /* @__PURE__ */ jsx(Marquee, {}),
      /* @__PURE__ */ jsx(Scenarios, {}),
      /* @__PURE__ */ jsx(Sequence, {}),
      /* @__PURE__ */ jsx(HandMap, {}),
      /* @__PURE__ */ jsx(DesignEvolution, {}),
      /* @__PURE__ */ jsx(Prototype, {}),
      /* @__PURE__ */ jsx(Research, {}),
      /* @__PURE__ */ jsx(Timeline, {}),
      /* @__PURE__ */ jsx(FaqSection, {}),
      /* @__PURE__ */ jsx(FollowForm, {})
    ] }),
    /* @__PURE__ */ jsx(SiteFooter, {})
  ] });
}
export {
  LandingPage as default
};
