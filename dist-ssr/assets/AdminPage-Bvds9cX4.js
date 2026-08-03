import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Loader2, ShieldAlert, Hand, ArrowLeft, RefreshCw, AlertTriangle, LayoutDashboard, Users, Inbox, ShoppingBag, Ban, CheckCircle2, Crown, ShieldCheck, FileDown, Trash2, Download, X } from "lucide-react";
import { u as useAuth, n as getAdminStats, o as listAllUsers, p as listAllOrders, q as listWaitlist, i as isAdmin, t as setUserAdmin, v as setUserBanned, w as eraseUserData, x as exportUserData, y as deleteWaitlistEntry, z as updateOrderStatus, A as deleteOrder } from "../prerender-entry.js";
import "react-dom/server";
import "node:stream";
import "@supabase/supabase-js";
const CATEGORY_LABELS = {
  "blind-low-vision": "Blind / low-vision",
  elderly: "Elderly / motor-impaired",
  "motor-accessibility": "Accessibility",
  developer: "Developer",
  "early-adopter": "Early adopter",
  other: "Other"
};
const ORDER_STATUSES = ["reserved", "paid", "shipped", "cancelled"];
function money(cents, currency = "AUD") {
  return (cents / 100).toLocaleString(void 0, { style: "currency", currency });
}
function toCsv(rows) {
  const header = ["Name", "Email", "Category", "Country", "Joined"];
  const lines = rows.map(
    (r) => [r.full_name, r.email, r.user_category ?? "", r.country ?? "", r.joined_at].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
  );
  return [header.join(","), ...lines].join("\n");
}
function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
function AdminPage() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState(null);
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [entries, setEntries] = useState([]);
  const [isLocal, setIsLocal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [flash, setFlash] = useState("");
  const [banTarget, setBanTarget] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [eraseTarget, setEraseTarget] = useState(null);
  const showFlash = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3e3);
  };
  const loadAll = useCallback(async () => {
    setError("");
    try {
      const [s, u, o, w] = await Promise.all([
        getAdminStats(),
        listAllUsers(),
        listAllOrders(),
        listWaitlist()
      ]);
      setStats(s);
      setUsers(u);
      setOrders(o);
      if (w.ok) {
        setEntries(w.entries);
        setIsLocal(!!w.local);
      } else {
        setError(w.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admin data.");
    }
  }, []);
  useEffect(() => {
    let mounted = true;
    isAdmin().then(async (ok) => {
      if (!mounted) return;
      setAuthorized(ok);
      if (ok) await loadAll();
    }).catch(() => mounted && setAuthorized(false)).finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [loadAll]);
  const run = async (key, fn, ok) => {
    setBusy(key);
    setError("");
    try {
      await fn();
      await loadAll();
      showFlash(ok);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  };
  const confirmBan = () => banTarget && run(
    `ban-${banTarget.id}`,
    () => setUserBanned(banTarget.id, true, banReason),
    "Account suspended."
  ).then(() => {
    setBanTarget(null);
    setBanReason("");
  });
  const confirmErase = () => eraseTarget && run(`erase-${eraseTarget.id}`, () => eraseUserData(eraseTarget.id), "User data erased.").then(
    () => setEraseTarget(null)
  );
  const handleExport = async (u) => {
    setBusy(`export-${u.id}`);
    try {
      const data = await exportUserData(u.id);
      download(
        `tactiq-user-${(u.email || u.id).replace(/[^a-z0-9]+/gi, "_")}.json`,
        JSON.stringify(data, null, 2),
        "application/json"
      );
      showFlash("Data export downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy(null);
    }
  };
  const adminCount = useMemo(() => users.filter((u) => u.isAdmin).length, [users]);
  if (loading || authorized === null) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-muted-foreground" }) });
  }
  if (authorized === false) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-lg w-full text-center bg-card border border-border rounded-2xl p-10 animate-enter-rise", children: [
      /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(ShieldAlert, { className: "w-7 h-7" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold mb-2", children: "Admins only" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "Your account doesn’t have admin access. If you should be able to manage Tactiq, ask an existing admin to grant you access." }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/account",
          className: "inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium",
          children: "Back to your dashboard"
        }
      )
    ] }) });
  }
  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "waitlist", label: "Waitlist", icon: Inbox },
    { id: "orders", label: "Orders", icon: ShoppingBag }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 hover:opacity-80 transition-opacity", children: [
        /* @__PURE__ */ jsx(Hand, { className: "w-6 h-6" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "Tactiq" }),
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary", children: "Admin" })
      ] }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/account",
          className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: "Dashboard"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
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
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold mb-1", children: "Admin console" }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
            "Manage accounts, orders and signups",
            isLocal && " · local preview data",
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => run("reload", async () => {
            }, "Refreshed."),
            disabled: busy === "reload",
            className: "inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm hover:bg-secondary transition-colors disabled:opacity-60",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: `w-4 h-4 ${busy === "reload" ? "animate-spin" : ""}` }),
              " Refresh"
            ]
          }
        )
      ] }),
      isLocal && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6 text-sm", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          "You’re viewing ",
          /* @__PURE__ */ jsx("strong", { children: "local preview data" }),
          " (no backend connected). Bans, role changes and deletions here affect this browser’s storage. With Supabase configured, the same controls run against the database via admin RLS — except a hard auth ban, which needs a server-side function (see ",
          /* @__PURE__ */ jsx("code", { children: "BACKEND.md" }),
          ")."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-6", children: TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.id;
        const count = t.id === "users" ? users.length : t.id === "waitlist" ? entries.length : t.id === "orders" ? orders.length : void 0;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setTab(t.id),
            "aria-pressed": active,
            className: `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
              " ",
              t.label,
              count !== void 0 && /* @__PURE__ */ jsx(
                "span",
                {
                  className: `text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-primary-foreground/20" : "bg-secondary"}`,
                  children: count
                }
              )
            ]
          },
          t.id
        );
      }) }),
      error && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-6 text-sm", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5 text-destructive flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx("p", { className: "text-foreground", children: error })
      ] }),
      tab === "overview" && stats && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4",
          children: [
            /* @__PURE__ */ jsx(StatCard, { label: "Users", value: stats.users, sub: `${stats.admins} admin${stats.admins === 1 ? "" : "s"}`, icon: Users }),
            /* @__PURE__ */ jsx(StatCard, { label: "Suspended", value: stats.banned, sub: "banned accounts", icon: Ban, tone: stats.banned > 0 ? "warn" : void 0 }),
            /* @__PURE__ */ jsx(StatCard, { label: "Waitlist", value: stats.waitlist, sub: "signups", icon: Inbox }),
            /* @__PURE__ */ jsx(StatCard, { label: "Orders", value: stats.orders, sub: "reservations", icon: ShoppingBag }),
            /* @__PURE__ */ jsx(StatCard, { label: "Reserved value", value: money(stats.reservedCents), sub: "across all orders", icon: CheckCircle2 }),
            /* @__PURE__ */ jsx(StatCard, { label: "Admins", value: stats.admins, sub: "with full access", icon: Crown })
          ]
        }
      ),
      tab === "users" && /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: users.length === 0 ? /* @__PURE__ */ jsx(Empty, { icon: Users, text: "No accounts yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: users.map((u) => {
        const isYou = (user == null ? void 0 : user.id) === u.id;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center gap-4",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: u.fullName || "—" }),
                  isYou && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground", children: "You" }),
                  u.isAdmin && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary", children: [
                    /* @__PURE__ */ jsx(Crown, { className: "w-3 h-3" }),
                    " Admin"
                  ] }),
                  u.banned && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive", children: [
                    /* @__PURE__ */ jsx(Ban, { className: "w-3 h-3" }),
                    " Suspended"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: u.email ?? "email hidden (Supabase auth)" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                  u.userCategory ? CATEGORY_LABELS[u.userCategory] ?? u.userCategory : "No category",
                  " · ",
                  "joined ",
                  new Date(u.createdAt).toLocaleDateString(),
                  " · ",
                  u.ordersCount,
                  " order",
                  u.ordersCount === 1 ? "" : "s",
                  " · ",
                  u.layoutsCount,
                  " layout",
                  u.layoutsCount === 1 ? "" : "s",
                  u.banned && u.bannedReason ? ` · reason: ${u.bannedReason}` : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => run(
                      `admin-${u.id}`,
                      () => setUserAdmin(u.id, !u.isAdmin),
                      u.isAdmin ? "Admin access revoked." : "Admin access granted."
                    ),
                    disabled: busy === `admin-${u.id}` || u.isAdmin && adminCount <= 1,
                    title: u.isAdmin && adminCount <= 1 ? "Can’t remove the only admin" : "",
                    className: "inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary transition-colors disabled:opacity-50",
                    children: [
                      u.isAdmin ? /* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Crown, { className: "w-4 h-4" }),
                      u.isAdmin ? "Revoke admin" : "Make admin"
                    ]
                  }
                ),
                u.banned ? /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => run(
                      `ban-${u.id}`,
                      () => setUserBanned(u.id, false),
                      "Account restored."
                    ),
                    disabled: busy === `ban-${u.id}`,
                    className: "inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary transition-colors disabled:opacity-50",
                    children: [
                      /* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4" }),
                      " Unsuspend"
                    ]
                  }
                ) : /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      setBanReason("");
                      setBanTarget(u);
                    },
                    disabled: isYou || busy === `ban-${u.id}`,
                    title: isYou ? "You can’t suspend yourself" : "",
                    className: "inline-flex items-center gap-1.5 px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg text-sm hover:bg-destructive/5 transition-colors disabled:opacity-50",
                    children: [
                      /* @__PURE__ */ jsx(Ban, { className: "w-4 h-4" }),
                      " Suspend"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => handleExport(u),
                    disabled: busy === `export-${u.id}`,
                    title: "Download all data we hold on this user",
                    className: "inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary transition-colors disabled:opacity-50",
                    children: [
                      /* @__PURE__ */ jsx(FileDown, { className: "w-4 h-4" }),
                      " Export"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setEraseTarget(u),
                    disabled: isYou || busy === `erase-${u.id}`,
                    title: isYou ? "You can’t erase your own account here" : "Erase this user’s data",
                    className: "inline-flex items-center gap-1.5 px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg text-sm hover:bg-destructive/5 transition-colors disabled:opacity-50",
                    children: [
                      /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }),
                      " Erase"
                    ]
                  }
                )
              ] })
            ]
          },
          u.id
        );
      }) }) }),
      tab === "waitlist" && /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-4", children: entries.length > 0 && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => download("tactiq-waitlist.csv", toCsv(entries), "text/csv"),
            className: "inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm hover:bg-secondary transition-colors",
            children: [
              /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
              " Export CSV"
            ]
          }
        ) }),
        entries.length === 0 ? /* @__PURE__ */ jsx(Empty, { icon: Inbox, text: "No signups yet." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-2xl border border-border bg-card", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-muted-foreground", children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Name" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Email" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Category" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Country" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Joined" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium text-right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: entries.map((e) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/60 last:border-0", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium", children: e.full_name }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: e.email }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: e.user_category ? CATEGORY_LABELS[e.user_category] ?? e.user_category : "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: e.country ?? "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground whitespace-nowrap", children: new Date(e.joined_at).toLocaleDateString() }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => run(`wl-${e.id}`, () => deleteWaitlistEntry(e.id), "Signup removed."),
                disabled: busy === `wl-${e.id}`,
                "aria-label": `Remove ${e.email}`,
                className: "inline-flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50",
                children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
              }
            ) })
          ] }, e.id)) })
        ] }) })
      ] }),
      tab === "orders" && /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: orders.length === 0 ? /* @__PURE__ */ jsx(Empty, { icon: ShoppingBag, text: "No reservations yet." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-2xl border border-border bg-card", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-muted-foreground", children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Plan" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Amount" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Reserved" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: orders.map((o) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/60 last:border-0", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium", children: o.plan === "pro" ? "Tactiq Pro" : "Tactiq Essential" }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
            "select",
            {
              value: o.status,
              onChange: (ev) => run(
                `os-${o.id}`,
                () => updateOrderStatus(o.id, ev.target.value),
                "Order status updated."
              ),
              disabled: busy === `os-${o.id}`,
              className: "bg-secondary border border-border rounded-lg px-2 py-1 text-sm capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              children: ORDER_STATUSES.map((s) => /* @__PURE__ */ jsx("option", { value: s, className: "capitalize", children: s }, s))
            }
          ) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: money(o.amount_cents, o.currency) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground whitespace-nowrap", children: new Date(o.created_at).toLocaleDateString() }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => run(`od-${o.id}`, () => deleteOrder(o.id), "Order deleted."),
              disabled: busy === `od-${o.id}`,
              "aria-label": "Delete order",
              className: "inline-flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50",
              children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
            }
          ) })
        ] }, o.id)) })
      ] }) }) })
    ] }),
    flash && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        className: "fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm shadow-lg",
        children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }),
          " ",
          flash
        ]
      },
      flash
    ),
    /* @__PURE__ */ jsxs(Modal, { open: !!banTarget, onClose: () => setBanTarget(null), children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold mb-1 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Ban, { className: "w-5 h-5 text-destructive" }),
        " Suspend account"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: [
        (banTarget == null ? void 0 : banTarget.fullName) || (banTarget == null ? void 0 : banTarget.email),
        " will be blocked from signing in. You can add a reason they’ll see at login."
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: banReason,
          onChange: (e) => setBanReason(e.target.value),
          rows: 3,
          placeholder: "Reason (optional) — e.g. abuse, spam, chargeback",
          className: "w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary mb-4 resize-none"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setBanTarget(null),
            className: "px-4 py-2 rounded-xl text-sm border border-border hover:bg-secondary transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: confirmBan,
            disabled: !!banTarget && busy === `ban-${banTarget.id}`,
            className: "px-4 py-2 rounded-xl text-sm bg-destructive text-white hover:opacity-90 transition-opacity disabled:opacity-60",
            children: "Suspend account"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Modal, { open: !!eraseTarget, onClose: () => setEraseTarget(null), children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold mb-1 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5 text-destructive" }),
        " Erase user data"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: [
        "This permanently deletes ",
        /* @__PURE__ */ jsx("strong", { children: (eraseTarget == null ? void 0 : eraseTarget.fullName) || (eraseTarget == null ? void 0 : eraseTarget.email) }),
        "’s orders, saved layouts and account record",
        isLocal ? " from this browser" : "",
        ". This can’t be undone.",
        !isLocal && /* @__PURE__ */ jsxs(Fragment, { children: [
          " ",
          "Their Supabase Auth login must be removed separately with the service_role Admin API on a server."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setEraseTarget(null),
            className: "px-4 py-2 rounded-xl text-sm border border-border hover:bg-secondary transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: confirmErase,
            disabled: !!eraseTarget && busy === `erase-${eraseTarget.id}`,
            className: "px-4 py-2 rounded-xl text-sm bg-destructive text-white hover:opacity-90 transition-opacity disabled:opacity-60",
            children: "Erase everything"
          }
        )
      ] })
    ] })
  ] });
}
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone
}) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: label }),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: `w-8 h-8 rounded-lg flex items-center justify-center ${tone === "warn" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`,
          children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: value }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: sub })
  ] });
}
function Empty({ icon: Icon, text }) {
  return /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-muted-foreground rounded-2xl border border-border bg-card", children: [
    /* @__PURE__ */ jsx(Icon, { className: "w-10 h-10 mx-auto mb-3 opacity-60" }),
    /* @__PURE__ */ jsx("p", { children: text })
  ] });
}
function Modal({
  open,
  onClose,
  children
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.96, y: 8 },
          animate: { opacity: 1, scale: 1, y: 0 },
          onClick: (e) => e.stopPropagation(),
          className: "relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl",
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                "aria-label": "Close",
                className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors",
                children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
              }
            ),
            children
          ]
        }
      )
    }
  );
}
export {
  AdminPage as default
};
