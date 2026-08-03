import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Hand, ArrowLeft, Plus, RotateCcw, Check, Star, Loader2, Save, Layers, Trash2 } from "lucide-react";
import { D as DEFAULT_LAYOUT, e as editableGesturePoints, a as COMMAND_CATEGORIES, b as COMMAND_LIBRARY, d as colorMap, c as commandLabelFor } from "./gestures-_WkCo3YC.js";
import { l as listGestureConfigs, m as saveGestureConfig, h as deleteGestureConfig } from "../prerender-entry.js";
import { f as fieldClass } from "./AuthLayout-RShcSXXr.js";
import "react-dom/server";
import "node:stream";
import "@supabase/supabase-js";
function CustomizePage() {
  var _a;
  const [params] = useSearchParams();
  const [layout, setLayout] = useState({ ...DEFAULT_LAYOUT });
  const [name, setName] = useState("My Layout");
  const [configId, setConfigId] = useState();
  const [isActive, setIsActive] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(
    ((_a = editableGesturePoints[0]) == null ? void 0 : _a.id) ?? ""
  );
  const [activeCategory, setActiveCategory] = useState(COMMAND_CATEGORIES[0]);
  const [configs, setConfigs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let mounted = true;
    listGestureConfigs().then((rows) => {
      if (!mounted) return;
      setConfigs(rows);
      const id = params.get("id");
      const target = id ? rows.find((r) => r.id === id) : void 0;
      if (target) loadConfig(target);
    }).catch(() => {
    });
    return () => {
      mounted = false;
    };
  }, []);
  const loadConfig = (row) => {
    setLayout({ ...DEFAULT_LAYOUT, ...row.layout ?? {} });
    setName(row.name);
    setConfigId(row.id);
    setIsActive(row.is_active);
    setSaved(false);
  };
  const startNew = () => {
    setLayout({ ...DEFAULT_LAYOUT });
    setName("My Layout");
    setConfigId(void 0);
    setIsActive(false);
    setSaved(false);
  };
  const assignCommand = (cmdId) => {
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
    setError("");
    setSaving(true);
    try {
      const row = await saveGestureConfig({
        id: asNew ? void 0 : configId,
        name: name.trim() || "My Layout",
        layout,
        isActive
      });
      setConfigId(row.id);
      const rows = await listGestureConfigs();
      setConfigs(rows);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your layout.");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    await deleteGestureConfig(id);
    const rows = await listGestureConfigs();
    setConfigs(rows);
    if (id === configId) startNew();
  };
  const selectedPoint = editableGesturePoints.find((p) => p.id === selectedSlot);
  const filteredCommands = useMemo(
    () => COMMAND_LIBRARY.filter((c) => c.category === activeCategory),
    [activeCategory]
  );
  const slotGroups = useMemo(() => {
    const groups = [];
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 hover:opacity-80 transition-opacity", children: [
        /* @__PURE__ */ jsx(Hand, { className: "w-6 h-6" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "Tactiq" })
      ] }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/account",
          className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: "Back to dashboard"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/account",
          className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Back to dashboard"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold mb-1", children: "Customise your shortcuts" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Pick a shortcut point, assign a command, then save it as a reusable layout." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: startNew,
            className: "inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm hover:bg-secondary transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              " New layout"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-[320px_1fr] gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wide", children: "Your shortcut points" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              editableGesturePoints.length,
              " of 8 points"
            ] })
          ] }),
          slotGroups.map((group) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-medium text-muted-foreground/80 px-1", children: group.finger }),
            group.points.map((point) => {
              const colors = colorMap[point.type];
              const isSel = selectedSlot === point.id;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setSelectedSlot(point.id),
                  "aria-pressed": isSel,
                  className: `w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSel ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/40"}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `w-3 h-3 rounded-full flex-shrink-0 ${colors.bg}`,
                        "aria-hidden": "true"
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium truncate", children: point.position }),
                      /* @__PURE__ */ jsx("span", { className: "block text-xs text-muted-foreground truncate", children: commandLabelFor(layout, point.id) })
                    ] })
                  ]
                },
                point.id
              );
            })
          ] }, group.finger)),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-secondary/20 p-3 text-xs text-muted-foreground", children: [
            "Only the two pinky shortcut points are remappable — the seven core commands never move, because muscle memory depends on it. Emergency always stays on the pinky tip as a sustained 5-second hold and cannot be reassigned. Made a mess? Hit ",
            /* @__PURE__ */ jsx("strong", { children: "Reset slot" }),
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("section", { className: "bg-card border border-border rounded-2xl p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-4", children: [
              /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold", children: [
                "Assign to",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-primary", children: selectedPoint ? `${selectedPoint.finger} · ${selectedPoint.position}` : "—" })
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: resetSlot,
                  className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
                  children: [
                    /* @__PURE__ */ jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
                    " Reset slot"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-5", children: COMMAND_CATEGORIES.map((cat) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setActiveCategory(cat),
                "aria-pressed": activeCategory === cat,
                className: `px-3 py-1.5 rounded-full text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`,
                children: cat
              },
              cat
            )) }),
            /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              const assigned = selectedSlot && layout[selectedSlot] === cmd.id;
              return /* @__PURE__ */ jsxs(
                motion.button,
                {
                  whileTap: { scale: 0.97 },
                  onClick: () => assignCommand(cmd.id),
                  "aria-pressed": !!assigned,
                  className: `flex items-center gap-3 p-3 rounded-xl border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${assigned ? "border-primary bg-primary/10" : "border-border hover:bg-secondary/40"}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${assigned ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`,
                        children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" })
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium flex-1", children: cmd.label }),
                    assigned && /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-primary flex-shrink-0" })
                  ]
                },
                cmd.id
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "bg-card border border-border rounded-2xl p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-[1fr_auto] gap-4 items-end", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "layout-name", className: "block text-sm mb-1.5", children: "Layout name" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "layout-name",
                    value: name,
                    onChange: (e) => setName(e.target.value),
                    className: fieldClass,
                    placeholder: "e.g. Running, Work, Everyday"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer select-none pb-3", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: isActive,
                    onChange: (e) => setIsActive(e.target.checked),
                    className: "w-4 h-4 accent-[var(--color-primary)]"
                  }
                ),
                /* @__PURE__ */ jsx(Star, { className: `w-4 h-4 ${isActive ? "text-primary fill-primary" : "text-muted-foreground"}` }),
                "Set active"
              ] })
            ] }),
            error && /* @__PURE__ */ jsx("p", { role: "alert", className: "text-sm text-destructive mt-3", children: error }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 mt-5", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleSave(false),
                  disabled: saving,
                  className: "inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:shadow-lg transition-shadow font-medium disabled:opacity-70",
                  children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
                    " Saving…"
                  ] }) : saved ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }),
                    " Saved"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
                    " ",
                    configId ? "Save changes" : "Save layout"
                  ] })
                }
              ),
              configId && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleSave(true),
                  disabled: saving,
                  className: "inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-70",
                  children: "Save as copy"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "bg-card border border-border rounded-2xl p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsx(Layers, { className: "w-5 h-5 text-primary" }),
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Your saved layouts" })
            ] }),
            configs.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground py-2", children: "No saved layouts yet — build one above and hit save." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-border", children: /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: configs.map((c) => /* @__PURE__ */ jsxs(
              motion.li,
              {
                layout: true,
                exit: { opacity: 0, height: 0 },
                className: "flex items-center justify-between py-3 gap-3",
                children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => loadConfig(c),
                      className: "flex-1 text-left min-w-0",
                      children: [
                        /* @__PURE__ */ jsxs("span", { className: "font-medium flex items-center gap-2", children: [
                          c.name,
                          c.is_active && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-primary", children: [
                            /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-primary" }),
                            " Active"
                          ] }),
                          c.id === configId && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "· editing" })
                        ] }),
                        /* @__PURE__ */ jsxs("span", { className: "block text-xs text-muted-foreground", children: [
                          "Updated ",
                          new Date(c.updated_at).toLocaleDateString()
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => handleDelete(c.id),
                      "aria-label": `Delete ${c.name}`,
                      className: "p-2 text-muted-foreground hover:text-destructive transition-colors",
                      children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                    }
                  )
                ]
              },
              c.id
            )) }) })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  CustomizePage as default
};
