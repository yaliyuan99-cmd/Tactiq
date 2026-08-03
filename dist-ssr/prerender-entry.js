var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs } from "react/jsx-runtime";
import { Component, createContext, useContext, useState, useEffect, useMemo, useRef, lazy, Suspense, StrictMode } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";
import { useLocation, Navigate, Outlet, Link, Routes, Route, StaticRouter } from "react-router";
import { motion, useReducedMotion, MotionConfig } from "motion/react";
import { AlertTriangle, RotateCcw, Loader2, ArrowUpRight, Fingerprint, Hand, ShieldCheck } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
class ErrorBoundary extends Component {
  constructor() {
    super(...arguments);
    __publicField(this, "state", { hasError: false, error: null });
    __publicField(this, "handleReload", () => {
      window.location.reload();
    });
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-6 py-16", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md text-center", children: [
      /* @__PURE__ */ jsx("span", { className: "mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-7 w-7", "aria-hidden": "true" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight text-foreground text-balance", children: "Something went wrong" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-muted-foreground text-pretty", children: "An unexpected error interrupted this page. Reloading usually clears it — your account and settings are safe." }),
      false,
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: this.handleReload,
            className: "inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto",
            children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4", "aria-hidden": "true" }),
              "Reload page"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/",
            className: "inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card sm:w-auto",
            children: "Back to home"
          }
        )
      ] })
    ] }) });
  }
}
const url = void 0;
const anonKey = void 0;
const isSupabaseConfigured = Boolean(
  url
);
const supabase = isSupabaseConfigured ? createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}) : null;
const WAITLIST_LS_KEY = "tactiq_waitlist";
async function joinWaitlist(input) {
  const entry = {
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    user_category: input.userCategory ?? null,
    country: input.country ?? null
  };
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("waitlist").insert(entry);
    if (error) {
      if (error.code === "23505") return { ok: true, duplicate: true };
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }
  try {
    const saved = JSON.parse(
      localStorage.getItem(WAITLIST_LS_KEY) ?? "[]"
    );
    if (saved.some((s) => s.email === entry.email)) {
      return { ok: true, duplicate: true, local: true };
    }
    saved.push({ ...entry, joined_at: (/* @__PURE__ */ new Date()).toISOString() });
    localStorage.setItem(WAITLIST_LS_KEY, JSON.stringify(saved));
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true, local: true };
  } catch {
    return { ok: false, error: "Could not save your signup. Please try again." };
  }
}
const AUTH_USERS_KEY = "tactiq_auth_users";
const AUTH_SESSION_KEY = "tactiq_auth_session";
const AUTH_EVENT = "tactiq-auth-change";
function readLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeLocalUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}
function setLocalSession(userId) {
  if (userId) localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ userId }));
  else localStorage.removeItem(AUTH_SESSION_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}
function getLocalSessionUser() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    return readLocalUsers().find((u) => u.id === userId) ?? null;
  } catch {
    return null;
  }
}
function toAuthUser(u) {
  return { id: u.id, email: u.email, fullName: u.fullName };
}
function assertLocalAuthAllowed() {
  {
    throw new Error(
      "Sign-in is unavailable: this deployment is missing its Supabase configuration (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY). The insecure local auth fallback is disabled outside development."
    );
  }
}
async function signUp(params) {
  var _a, _b, _c;
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: { full_name: params.fullName, user_category: params.userCategory }
      }
    });
    if (error) throw error;
    return {
      id: ((_a = data.user) == null ? void 0 : _a.id) ?? "",
      email: ((_b = data.user) == null ? void 0 : _b.email) ?? null,
      fullName: params.fullName ?? null
    };
  }
  assertLocalAuthAllowed();
  const email = params.email.trim().toLowerCase();
  const users = readLocalUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error("An account with this email already exists. Try signing in instead.");
  }
  const user = {
    id: crypto.randomUUID(),
    email,
    password: params.password,
    fullName: ((_c = params.fullName) == null ? void 0 : _c.trim()) || null,
    userCategory: params.userCategory ?? null,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  users.push(user);
  writeLocalUsers(users);
  setLocalSession(user.id);
  return toAuthUser(user);
}
async function signIn(email, password) {
  var _a;
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return {
      id: data.user.id,
      email: data.user.email ?? null,
      fullName: ((_a = data.user.user_metadata) == null ? void 0 : _a.full_name) ?? null
    };
  }
  assertLocalAuthAllowed();
  const normalized = email.trim().toLowerCase();
  const user = readLocalUsers().find((u) => u.email === normalized);
  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }
  if (user.banned) {
    throw new Error(
      user.bannedReason ? `This account has been suspended: ${user.bannedReason}` : "This account has been suspended. Contact support if you think this is a mistake."
    );
  }
  setLocalSession(user.id);
  return toAuthUser(user);
}
async function signOut() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
    return;
  }
  setLocalSession(null);
}
async function getCurrentUser() {
  var _a;
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? null,
      fullName: ((_a = data.user.user_metadata) == null ? void 0 : _a.full_name) ?? null
    };
  }
  const u = getLocalSessionUser();
  return u ? toAuthUser(u) : null;
}
function onAuthChange(cb) {
  if (isSupabaseConfigured && supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      var _a;
      cb(
        (session == null ? void 0 : session.user) ? {
          id: session.user.id,
          email: session.user.email ?? null,
          fullName: ((_a = session.user.user_metadata) == null ? void 0 : _a.full_name) ?? null
        } : null
      );
    });
    return () => data.subscription.unsubscribe();
  }
  const handler = () => {
    const u = getLocalSessionUser();
    cb(u ? toAuthUser(u) : null);
  };
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
async function resetPassword(email) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    return { ok: true };
  }
  return { ok: true, local: true };
}
async function updatePassword(newPassword, opts) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return;
  }
  assertLocalAuthAllowed();
  const users = readLocalUsers();
  const target = (opts == null ? void 0 : opts.email) ? users.find((u) => u.email === opts.email.trim().toLowerCase()) : getLocalSessionUser() ?? void 0;
  if (!target) {
    throw new Error("No account found for that email. Please sign up first.");
  }
  target.password = newPassword;
  writeLocalUsers(users);
}
async function updateProfile(params) {
  var _a, _b;
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: params.fullName, user_category: params.userCategory }
    });
    if (error) throw error;
    if (data.user) {
      await supabase.from("profiles").update({
        full_name: params.fullName ?? null,
        user_category: params.userCategory ?? null
      }).eq("id", data.user.id);
    }
    return {
      id: ((_a = data.user) == null ? void 0 : _a.id) ?? "",
      email: ((_b = data.user) == null ? void 0 : _b.email) ?? null,
      fullName: params.fullName ?? null
    };
  }
  const session = getLocalSessionUser();
  if (!session) throw new Error("Please sign in first.");
  const users = readLocalUsers();
  const target = users.find((u) => u.id === session.id);
  if (params.fullName !== void 0) target.fullName = params.fullName.trim() || null;
  if (params.userCategory !== void 0) target.userCategory = params.userCategory;
  writeLocalUsers(users);
  setLocalSession(target.id);
  return toAuthUser(target);
}
const GESTURE_LS_KEY = "tactiq_gesture_configs";
async function listGestureConfigs() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("gesture_configs").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return JSON.parse(localStorage.getItem(GESTURE_LS_KEY) ?? "[]");
}
async function saveGestureConfig(params) {
  if (isSupabaseConfigured && supabase) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Please sign in to save a layout.");
    const row = {
      ...params.id ? { id: params.id } : {},
      user_id: user.id,
      name: params.name,
      layout: params.layout,
      is_active: params.isActive ?? false
    };
    const { data, error } = await supabase.from("gesture_configs").upsert(row).select().single();
    if (error) throw error;
    return data;
  }
  const configs = JSON.parse(
    localStorage.getItem(GESTURE_LS_KEY) ?? "[]"
  );
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existingIdx = params.id ? configs.findIndex((c) => c.id === params.id) : -1;
  const record = {
    id: params.id ?? crypto.randomUUID(),
    user_id: "local",
    name: params.name,
    layout: params.layout,
    is_active: params.isActive ?? false,
    created_at: existingIdx >= 0 ? configs[existingIdx].created_at : now,
    updated_at: now
  };
  if (existingIdx >= 0) configs[existingIdx] = record;
  else configs.push(record);
  localStorage.setItem(GESTURE_LS_KEY, JSON.stringify(configs));
  return record;
}
async function deleteGestureConfig(id) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("gesture_configs").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const configs = JSON.parse(
    localStorage.getItem(GESTURE_LS_KEY) ?? "[]"
  );
  localStorage.setItem(
    GESTURE_LS_KEY,
    JSON.stringify(configs.filter((c) => c.id !== id))
  );
}
async function listWaitlist() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("waitlist").select("*").order("joined_at", { ascending: false });
    if (error) {
      return {
        ok: false,
        error: "The public key can’t read the waitlist (row-level security blocks it by design). View signups in your Supabase dashboard, or build a server endpoint with the service_role key."
      };
    }
    return { ok: true, entries: data ?? [] };
  }
  try {
    const saved = JSON.parse(localStorage.getItem(WAITLIST_LS_KEY) ?? "[]");
    const entries = saved.map((s, i) => ({
      id: `local-${i}`,
      full_name: s.full_name,
      email: s.email,
      user_category: s.user_category,
      country: s.country,
      joined_at: s.joined_at
    })).sort((a, b) => b.joined_at.localeCompare(a.joined_at));
    return { ok: true, entries, local: true };
  } catch {
    return { ok: false, error: "Could not read local waitlist data." };
  }
}
function seedFromString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}
function getDeviceTelemetry(seedKey = "demo") {
  const s = seedFromString(seedKey);
  const jitter = (range) => (Math.random() - 0.5) * range;
  const batteryBase = 58 + Math.floor(s * 36);
  const restingHr = 60 + Math.floor(s * 18);
  const heartRate = Math.max(48, Math.round(restingHr + jitter(8)));
  const rssi = -52 - Math.floor(s * 18) + Math.round(jitter(6));
  const quality = rssi > -60 ? "excellent" : rssi > -68 ? "good" : rssi > -74 ? "fair" : "weak";
  const lat = -33.8688 + (s - 0.5) * 0.06 + jitter(4e-4);
  const lng = 151.2093 + (s - 0.5) * 0.06 + jitter(4e-4);
  return {
    deviceName: "Tactiq Pro",
    serial: "TQ-" + Math.floor(s * 9e3 + 1e3) + "-" + Math.floor(s * 9e3 + 1e3),
    connected: true,
    firmware: "2.4.1",
    lastSync: new Date(Date.now() - Math.floor(Math.random() * 40) * 1e3).toISOString(),
    battery: {
      level: batteryBase,
      charging: s > 0.7,
      health: 92 + Math.floor(s * 7),
      // 92–99 %
      estimatedDaysLeft: Math.max(1, Math.round(batteryBase / 100 * 7))
    },
    signal: { rssiDbm: rssi, quality },
    location: {
      label: "Sydney, NSW",
      lat,
      lng,
      accuracyM: 5 + Math.floor(Math.random() * 8)
    },
    wellness: {
      heartRate,
      steps: 3400 + Math.floor(s * 6200) + Math.floor(Math.random() * 40),
      activeMinutes: 22 + Math.floor(s * 50)
    },
    storage: { usedMb: 120 + Math.floor(s * 180), totalMb: 512 }
  };
}
function hashed(seedBase, n) {
  let h = Math.imul(seedBase ^ n + 2654435761, 2654435761);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967295;
}
function summarise(points, unit) {
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return { points, min, max, avg, unit };
}
function getDeviceHistory(seedKey = "demo") {
  const s = seedFromString(seedKey);
  const seedBase = Math.floor(s * 4294967295) >>> 0;
  const now = /* @__PURE__ */ new Date();
  const top = new Date(now);
  top.setMinutes(0, 0, 0);
  const restingHr = 60 + Math.floor(s * 18);
  const batteryNow = 58 + Math.floor(s * 36);
  const rssiBase = -52 - Math.floor(s * 18);
  const hr = [];
  const batt = [];
  const sig = [];
  const steps = [];
  const active = [];
  for (let i = 23; i >= 0; i--) {
    const when = new Date(top.getTime() - i * 36e5);
    const hourOfDay = when.getHours();
    const t = when.toISOString();
    const label = `${String(hourOfDay).padStart(2, "0")}:00`;
    const circadian = Math.sin((hourOfDay - 6) / 24 * Math.PI * 2);
    const hrVal = Math.round(
      restingHr + circadian * 9 + (hashed(seedBase, i + 1) - 0.5) * 7
    );
    hr.push({ t, label, value: Math.max(46, hrVal) });
    const drain = i * (1.6 + s * 0.8);
    let battVal = batteryNow + drain;
    if (s > 0.7 && hourOfDay >= 1 && hourOfDay <= 5) battVal -= 18;
    batt.push({ t, label, value: Math.max(5, Math.min(100, Math.round(battVal))) });
    const sigVal = Math.round(rssiBase + (hashed(seedBase, i + 100) - 0.5) * 12);
    sig.push({ t, label, value: sigVal });
    const awake = hourOfDay >= 7 && hourOfDay <= 22;
    const hourSteps = awake ? Math.round(120 + hashed(seedBase, i + 200) * 850 * (0.6 + s)) : Math.round(hashed(seedBase, i + 200) * 40);
    steps.push({ t, label, value: hourSteps });
    const actVal = awake ? Math.round(hashed(seedBase, i + 300) * 12 * (0.5 + s)) : 0;
    active.push({ t, label, value: actVal });
  }
  return {
    heartRate: summarise(hr, "bpm"),
    battery: summarise(batt, "%"),
    signal: summarise(sig, "dBm"),
    steps: summarise(steps, "steps/h"),
    activeMinutes: summarise(active, "min/h")
  };
}
const ORDERS_LS_KEY = "tactiq_orders";
function readLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeLocalOrders(orders) {
  localStorage.setItem(ORDERS_LS_KEY, JSON.stringify(orders));
}
async function createOrder(params) {
  const currency = params.currency ?? "AUD";
  if (isSupabaseConfigured && supabase) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Please sign in to place an order.");
    const { data, error } = await supabase.from("orders").insert({
      user_id: user.id,
      plan: params.plan,
      amount_cents: params.amountCents,
      currency
    }).select().single();
    if (error) throw error;
    return data;
  }
  const session = getLocalSessionUser();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const order = {
    id: crypto.randomUUID(),
    user_id: (session == null ? void 0 : session.id) ?? "local",
    plan: params.plan,
    status: "reserved",
    amount_cents: params.amountCents,
    currency,
    created_at: now,
    updated_at: now
  };
  const orders = readLocalOrders();
  orders.push(order);
  writeLocalOrders(orders);
  await new Promise((r) => setTimeout(r, 400));
  return order;
}
async function listOrders() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  const session = getLocalSessionUser();
  return readLocalOrders().filter((o) => !session || o.user_id === session.id || o.user_id === "local").sort((a, b) => b.created_at.localeCompare(a.created_at));
}
async function getLatestOrder() {
  const orders = await listOrders();
  return orders[0] ?? null;
}
const LOCAL_ADMIN_EMAILS = String("").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
async function isAdmin() {
  if (isSupabaseConfigured && supabase) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", auth.user.id).single();
    if (error) return false;
    return Boolean(data == null ? void 0 : data.is_admin);
  }
  const session = getLocalSessionUser();
  if (!session) return false;
  if (session.isAdmin) return true;
  if (LOCAL_ADMIN_EMAILS.includes(session.email)) return true;
  const users = readLocalUsers();
  return users.length > 0 && users[0].id === session.id;
}
async function listAllOrders() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return readLocalOrders().sort((a, b) => b.created_at.localeCompare(a.created_at));
}
function localUserIsAdmin(u, all) {
  if (u.isAdmin) return true;
  if (LOCAL_ADMIN_EMAILS.includes(u.email)) return true;
  return all.length > 0 && all[0].id === u.id;
}
async function listAllUsers() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const orders2 = await listAllOrders().catch(() => []);
    return (data ?? []).map((p) => ({
      id: p.id,
      // profiles doesn't store email (it lives in auth.users, which the anon key
      // can't read). Surface that honestly in the UI.
      email: null,
      fullName: p.full_name,
      userCategory: p.user_category,
      createdAt: p.created_at,
      isAdmin: Boolean(p.is_admin),
      banned: Boolean(p.is_banned),
      bannedReason: p.banned_reason ?? null,
      bannedAt: p.banned_at ?? null,
      ordersCount: orders2.filter((o) => o.user_id === p.id).length,
      layoutsCount: 0
    }));
  }
  const users = readLocalUsers();
  const orders = readLocalOrders();
  const configs = JSON.parse(
    localStorage.getItem(GESTURE_LS_KEY) ?? "[]"
  );
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    userCategory: u.userCategory,
    createdAt: u.createdAt,
    isAdmin: localUserIsAdmin(u, users),
    banned: Boolean(u.banned),
    bannedReason: u.bannedReason ?? null,
    bannedAt: u.bannedAt ?? null,
    ordersCount: orders.filter((o) => o.user_id === u.id).length,
    layoutsCount: configs.filter((c) => c.user_id === u.id || c.user_id === "local").length
  })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
async function setUserBanned(userId, banned, reason) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("profiles").update({ is_banned: banned, banned_reason: banned ? reason ?? null : null }).eq("id", userId);
    if (error) throw error;
    return;
  }
  const session = getLocalSessionUser();
  if (session && session.id === userId && banned) {
    throw new Error("You can’t suspend your own account.");
  }
  const users = readLocalUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) throw new Error("User not found.");
  target.banned = banned;
  target.bannedReason = banned ? (reason == null ? void 0 : reason.trim()) || null : null;
  target.bannedAt = banned ? (/* @__PURE__ */ new Date()).toISOString() : null;
  writeLocalUsers(users);
}
async function setUserAdmin(userId, value) {
  var _a;
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("profiles").update({ is_admin: value }).eq("id", userId);
    if (error) throw error;
    return;
  }
  const users = readLocalUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) throw new Error("User not found.");
  if (!value) {
    const admins = users.filter((u) => localUserIsAdmin(u, users));
    if (admins.length <= 1 && ((_a = admins[0]) == null ? void 0 : _a.id) === userId) {
      throw new Error("You can’t remove the only remaining admin.");
    }
  }
  target.isAdmin = value;
  writeLocalUsers(users);
}
async function updateOrderStatus(orderId, status) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) throw error;
    return;
  }
  const orders = readLocalOrders();
  const target = orders.find((o) => o.id === orderId);
  if (!target) throw new Error("Order not found.");
  target.status = status;
  target.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  writeLocalOrders(orders);
}
async function deleteOrder(orderId) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) throw error;
    return;
  }
  writeLocalOrders(readLocalOrders().filter((o) => o.id !== orderId));
}
async function deleteWaitlistEntry(id) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("waitlist").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const idx = Number(id.replace(/^local-/, ""));
  const saved = JSON.parse(localStorage.getItem(WAITLIST_LS_KEY) ?? "[]");
  if (!Number.isNaN(idx) && idx >= 0 && idx < saved.length) {
    saved.splice(idx, 1);
    localStorage.setItem(WAITLIST_LS_KEY, JSON.stringify(saved));
  }
}
async function exportUserData(userId) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (isSupabaseConfigured && supabase) {
    const [{ data: profile }, { data: orders }, { data: layouts }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("orders").select("*").eq("user_id", userId),
      supabase.from("gesture_configs").select("*").eq("user_id", userId)
    ]);
    return {
      exportedAt: now,
      profile: {
        id: userId,
        email: null,
        fullName: (profile == null ? void 0 : profile.full_name) ?? null,
        userCategory: (profile == null ? void 0 : profile.user_category) ?? null,
        createdAt: (profile == null ? void 0 : profile.created_at) ?? "",
        isAdmin: Boolean(profile == null ? void 0 : profile.is_admin),
        banned: Boolean(profile == null ? void 0 : profile.is_banned)
      },
      orders: orders ?? [],
      layouts: layouts ?? []
    };
  }
  const users = readLocalUsers();
  const u = users.find((x) => x.id === userId);
  if (!u) throw new Error("User not found.");
  const configs = JSON.parse(
    localStorage.getItem(GESTURE_LS_KEY) ?? "[]"
  );
  return {
    exportedAt: now,
    profile: {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      userCategory: u.userCategory,
      createdAt: u.createdAt,
      isAdmin: localUserIsAdmin(u, users),
      banned: Boolean(u.banned)
    },
    orders: readLocalOrders().filter((o) => o.user_id === u.id),
    layouts: configs.filter((c) => c.user_id === u.id || c.user_id === "local")
  };
}
async function eraseUserData(userId) {
  if (isSupabaseConfigured && supabase) {
    await supabase.from("orders").delete().eq("user_id", userId);
    await supabase.from("gesture_configs").delete().eq("user_id", userId);
    return;
  }
  const session = getLocalSessionUser();
  if (session && session.id === userId) {
    throw new Error("You can’t erase the account you’re signed in as.");
  }
  writeLocalOrders(readLocalOrders().filter((o) => o.user_id !== userId));
  const configs = JSON.parse(
    localStorage.getItem(GESTURE_LS_KEY) ?? "[]"
  );
  localStorage.setItem(
    GESTURE_LS_KEY,
    JSON.stringify(configs.filter((c) => c.user_id !== userId))
  );
  writeLocalUsers(readLocalUsers().filter((u) => u.id !== userId));
}
async function getAdminStats() {
  const [users, orders, waitlist] = await Promise.all([
    listAllUsers().catch(() => []),
    listAllOrders().catch(() => []),
    listWaitlist().then((r) => r.ok ? r.entries.length : 0).catch(() => 0)
  ]);
  return {
    users: users.length,
    admins: users.filter((u) => u.isAdmin).length,
    banned: users.filter((u) => u.banned).length,
    waitlist,
    orders: orders.length,
    reservedCents: orders.reduce((sum, o) => sum + o.amount_cents, 0)
  };
}
const AuthContext = createContext({ user: null, loading: true });
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => {
      if (mounted) setUser(u);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    const unsubscribe = onAuthChange((u) => {
      if (mounted) setUser(u);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, loading }, children });
}
function useAuth() {
  return useContext(AuthContext);
}
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-muted-foreground" }) });
  }
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return /* @__PURE__ */ jsx(Navigate, { to: `/login?next=${next}`, replace: true });
  }
  return /* @__PURE__ */ jsx(Outlet, {});
}
const EASE = [0.25, 0.1, 0.25, 1];
function FadeIn({
  children,
  as = "div",
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
  style
}) {
  const Motion = useMemo(() => motion.create(as), [as]);
  return /* @__PURE__ */ jsx(
    Motion,
    {
      className,
      style,
      initial: { opacity: 0, x, y },
      whileInView: { opacity: 1, x: 0, y: 0 },
      viewport: { once: true, margin: "50px", amount: 0 },
      transition: { duration, delay, ease: EASE },
      children
    }
  );
}
function Magnet({
  children,
  padding = 150,
  strength = 3,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out",
  className,
  style
}) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const within = Math.abs(dx) < r.width / 2 + padding && Math.abs(dy) < r.height / 2 + padding;
    if (within) {
      setActive(true);
      setOffset({ x: dx / strength, y: dy / strength });
    } else {
      setActive(false);
      setOffset({ x: 0, y: 0 });
    }
  };
  const onLeave = () => {
    setActive(false);
    setOffset({ x: 0, y: 0 });
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      onMouseMove: onMove,
      onMouseLeave: onLeave,
      className,
      style: {
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: active ? activeTransition : inactiveTransition,
        willChange: "transform",
        ...style
      },
      children
    }
  );
}
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/";
const VIDEO_SRC = `${CDN}hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4`;
const CAP_VIDEO = `${CDN}hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4`;
const NAV = [
  { label: "The layer", href: "#t-capabilities" },
  { label: "How it works", href: "#t-how" }
];
const MARQUEE_A = [
  "GESTURES",
  "INVISIBLE",
  "HANDS-FREE",
  "INDEPENDENCE",
  "NO SCREENS"
];
const MARQUEE_B = [
  "WEARABLE",
  "NINE COMMANDS",
  "ONE RING",
  "EYES-FREE",
  "ACCESSIBLE"
];
const STEPS = [
  {
    n: "01",
    name: "Wake",
    desc: "The ring is idle until you deliberately squeeze its body. That squeeze opens a short command window — the design target is at most one false activation per hour."
  },
  {
    n: "02",
    name: "Tap",
    desc: "Your thumb taps one of eight contact points — the tips and bases of your four fingers. Points you can always find, because they are part of your own hand."
  },
  {
    n: "03",
    name: "Detect",
    desc: "The ring senses the tap privately on-device — a passive magnet and three small magnetometers, no camera, no microphone — then speaks to your phone over Bluetooth."
  },
  {
    n: "04",
    name: "Execute",
    desc: "Your phone runs the command through VoiceOver or TalkBack — Tactiq augments the screen reader you already use, never replaces it."
  },
  {
    n: "05",
    name: "Confirm",
    desc: "A distinct haptic pattern confirms what the ring heard. Nine fixed commands, always on your hand — the interface disappears and the control stays."
  }
];
const CAPS = [
  {
    icon: Fingerprint,
    title: "Meet the ring",
    body: "One feather-light smart ring on the index finger of either hand. Your thumb taps eight contact points on your own fingers — nine fixed commands you can always feel.",
    tags: ["One ring", "Bluetooth LE", "On-device", "Haptic feedback"]
  },
  {
    icon: Hand,
    title: "Augments your screen reader",
    body: "Tactiq drives VoiceOver and TalkBack — it never replaces them. Confirm, go back, next, previous, read again, undo, two shortcuts, and a deliberate 5-second emergency hold.",
    tags: ["VoiceOver", "TalkBack", "One-handed", "Eyes-free"]
  },
  {
    icon: ShieldCheck,
    title: "Built for independence",
    body: "Positioned to be priced like earbuds, not like braille hardware — the bench prototype is under $60 in parts. A student research project, with every performance figure a pre-registered target.",
    tags: ["Priced like earbuds", "Nine commands", "Voice setup", "No screens"]
  }
];
function FadingVideo({
  src,
  className
}) {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (prefersReduced) {
      v.loop = true;
      v.style.opacity = "1";
      const play = () => void v.play().catch(() => {
      });
      v.addEventListener("loadeddata", play);
      return () => v.removeEventListener("loadeddata", play);
    }
    const FADE_MS = 500;
    const FADE_OUT_LEAD = 0.55;
    let raf = 0;
    let fadingOut = false;
    let resetTimer;
    const fadeTo = (target, duration) => {
      if (raf) cancelAnimationFrame(raf);
      const from = parseFloat(v.style.opacity || "0");
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        v.style.opacity = String(from + (target - from) * p);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const onLoaded = () => {
      void v.play().catch(() => {
      });
    };
    const onTime = () => {
      const remaining = v.duration - v.currentTime;
      if (!fadingOut && remaining <= FADE_OUT_LEAD && remaining > 0) {
        fadingOut = true;
        fadeTo(0, FADE_MS);
      }
    };
    const onEnded = () => {
      v.style.opacity = "0";
      resetTimer = setTimeout(() => {
        v.currentTime = 0;
        void v.play().catch(() => {
        });
        fadingOut = false;
        fadeTo(1, FADE_MS);
      }, 100);
    };
    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnded);
    if (v.readyState >= 2) onLoaded();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (resetTimer) clearTimeout(resetTimer);
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnded);
    };
  }, [prefersReduced, src]);
  return /* @__PURE__ */ jsx(
    "video",
    {
      ref,
      className: `t-fade-video ${className ?? ""}`,
      autoPlay: true,
      muted: true,
      playsInline: true,
      preload: "auto",
      "aria-hidden": "true",
      src
    }
  );
}
function BlurText({
  text,
  className,
  style
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const prefersReduced = useReducedMotion();
  useEffect(() => {
    if (prefersReduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        var _a;
        if ((_a = entries[0]) == null ? void 0 : _a.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);
  const words = text.split(" ");
  return /* @__PURE__ */ jsx(
    "p",
    {
      ref,
      className,
      style: {
        display: "flex",
        flexWrap: "wrap",
        rowGap: "0.1em",
        ...style
      },
      children: words.map((w, i) => /* @__PURE__ */ jsx(
        motion.span,
        {
          style: { display: "inline-block", marginRight: "0.28em" },
          initial: prefersReduced ? false : { filter: "blur(12px)", y: 24 },
          animate: shown ? { filter: "blur(0px)", y: 0 } : void 0,
          transition: {
            duration: 0.7,
            ease: "easeOut",
            delay: i * 90 / 1e3
          },
          children: w
        },
        `${w}-${i}`
      ))
    }
  );
}
function Hero() {
  const videoRef = useRef(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.autoplay = false;
      v.pause();
    }
  }, []);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "t-home",
      className: "relative flex min-h-screen w-full flex-col overflow-hidden",
      children: [
        /* @__PURE__ */ jsx(
          "video",
          {
            ref: videoRef,
            className: "absolute inset-0 z-0 h-full w-full object-cover",
            autoPlay: true,
            loop: true,
            muted: true,
            playsInline: true,
            "aria-hidden": "true",
            src: VIDEO_SRC
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 z-0",
            "aria-hidden": "true",
            style: {
              background: "linear-gradient(180deg, rgba(11,10,20,0.55) 0%, rgba(11,10,20,0.25) 38%, rgba(11,10,20,0.7) 78%, #0b0a14 100%)"
            }
          }
        ),
        /* @__PURE__ */ jsxs("nav", { className: "relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "#t-home",
              className: "t-serif inline-flex min-h-11 items-center text-3xl tracking-tight text-[var(--t-ink)]",
              children: "Tactiq"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "hidden items-center gap-7 md:flex", children: NAV.map((link) => /* @__PURE__ */ jsx(
            "a",
            {
              href: link.href,
              className: "inline-flex min-h-11 items-center text-sm text-[var(--t-muted)] transition-colors hover:text-[var(--t-ink)]",
              children: link.label
            },
            link.label
          )) }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/project#follow",
              className: "t-btn-outline inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium",
              children: "Get early access"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center", children: [
          /* @__PURE__ */ jsxs("span", { className: "t-rise mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(240,238,252,0.22)] bg-[rgba(11,10,20,0.35)] px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--t-muted)] backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "h-1.5 w-1.5 rounded-full",
                style: { background: "var(--t-green)" }
              }
            ),
            "Next-gen wearable control"
          ] }),
          /* @__PURE__ */ jsxs(
            "h1",
            {
              className: "t-serif t-legible t-rise-2 max-w-4xl font-normal leading-[0.95] tracking-[-0.02em]",
              style: { fontSize: "clamp(2.75rem, 8vw, 6rem)" },
              children: [
                "Your hands.",
                " ",
                /* @__PURE__ */ jsx("em", { className: "not-italic", style: { color: "var(--t-violet)" }, children: "Your controller." })
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "t-legible t-rise-3 mt-7 max-w-xl text-base leading-relaxed text-[var(--t-muted)] sm:text-lg", children: "Nine commands on the fingers you can always feel. Tactiq is a smart ring for silent, eyes-free phone control — built for blind users, augmenting VoiceOver and TalkBack." }),
          /* @__PURE__ */ jsxs("div", { className: "t-rise-3 mt-10 flex flex-col items-center gap-4 sm:flex-row", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: "/project#follow",
                className: "t-btn-solid inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold",
                children: [
                  "Get early access",
                  /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-5 w-5" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#t-how",
                className: "t-btn-outline inline-flex min-h-12 items-center rounded-full px-8 py-3.5 text-base font-medium",
                children: "See how it works"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "t-rise-3 mt-9 flex items-center gap-3", children: /* @__PURE__ */ jsxs("span", { className: "text-sm text-[var(--t-muted)]", children: [
            "A ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-[var(--t-ink)]", children: "student research project" }),
            " ",
            "from Sydney — all performance figures are pre-registered targets"
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "relative z-10 mx-auto grid w-full max-w-3xl grid-cols-3 gap-4 px-6 pb-12", children: [
          { v: "9", l: "Fixed commands" },
          { v: "1", l: "Ring, one hand" },
          { v: "0", l: "Screens needed" }
        ].map((s) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "t-heavy font-black tabular-nums leading-none",
              style: {
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                color: "var(--t-ink)"
              },
              children: s.v
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs uppercase tracking-widest text-[var(--t-muted)]", children: s.l })
        ] }, s.l)) })
      ]
    }
  );
}
function Marquee() {
  const sectionRef = useRef(null);
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const offset = (window.scrollY - top + window.innerHeight) * 0.22;
      if (row1Ref.current)
        row1Ref.current.style.transform = `translateX(${offset - 200}px)`;
      if (row2Ref.current)
        row2Ref.current.style.transform = `translateX(${-(offset - 200)}px)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const triple = (arr) => [...arr, ...arr, ...arr];
  const word = (w, i, filled) => /* @__PURE__ */ jsxs("span", { className: "flex flex-shrink-0 items-center gap-6 sm:gap-9", children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "t-display whitespace-nowrap",
        style: {
          fontSize: "clamp(2rem, 6vw, 4.5rem)",
          color: filled ? "var(--t-ink)" : "transparent",
          WebkitTextStroke: filled ? "0" : "1.5px var(--t-violet)"
        },
        children: w
      }
    ),
    /* @__PURE__ */ jsx(
      "span",
      {
        "aria-hidden": "true",
        className: "inline-block h-2.5 w-2.5 rotate-45",
        style: { background: "var(--t-violet)" }
      }
    )
  ] }, `${w}-${i}`);
  return /* @__PURE__ */ jsx(
    "section",
    {
      ref: sectionRef,
      "aria-hidden": "true",
      className: "overflow-hidden border-y border-[rgba(240,238,252,0.08)] bg-[var(--t-bg)] py-8 sm:py-10",
      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx("div", { ref: row1Ref, className: "flex gap-6 sm:gap-9", style: { willChange: "transform" }, children: triple(MARQUEE_A).map((w, i) => word(w, i, true)) }),
        /* @__PURE__ */ jsx("div", { ref: row2Ref, className: "flex gap-6 sm:gap-9", style: { willChange: "transform" }, children: triple(MARQUEE_B).map((w, i) => word(w, i, false)) })
      ] })
    }
  );
}
function HowItWorks() {
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "t-how",
      className: "rounded-t-[36px] bg-[#f4f2fb] px-6 py-24 text-[#14122a] sm:rounded-t-[48px] sm:py-28 md:rounded-t-[60px] md:px-10",
      children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl", children: [
        /* @__PURE__ */ jsxs(FadeIn, { y: 30, children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.2em] text-[var(--t-violet-deep)]", children: "Intention → action, in real time" }),
          /* @__PURE__ */ jsx(
            "h2",
            {
              className: "t-heavy mt-4 font-black uppercase leading-[0.95] tracking-[-0.02em]",
              style: { fontSize: "clamp(2.5rem, 8vw, 5.5rem)" },
              children: "How Tactiq works"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-14 md:mt-20", children: STEPS.map((s, i) => /* @__PURE__ */ jsxs(
          FadeIn,
          {
            delay: i * 0.06,
            className: "flex flex-col gap-4 border-t border-[rgba(20,18,42,0.14)] py-8 sm:flex-row sm:items-baseline sm:gap-10 md:py-10",
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "t-heavy flex-shrink-0 font-black leading-none tabular-nums",
                  style: {
                    fontSize: "clamp(2.5rem, 7vw, 5rem)",
                    color: "var(--t-violet-deep)"
                  },
                  children: s.n
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:pt-1", children: [
                /* @__PURE__ */ jsx(
                  "h3",
                  {
                    className: "t-heavy font-semibold uppercase tracking-tight",
                    style: { fontSize: "clamp(1.35rem, 3vw, 2.25rem)" },
                    children: s.name
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "max-w-2xl text-base leading-relaxed text-[#4a4668] sm:text-lg", children: s.desc })
              ] })
            ]
          },
          s.n
        )) })
      ] })
    }
  );
}
function GlassCapCard({
  cap,
  index
}) {
  const Icon = cap.icon;
  return /* @__PURE__ */ jsx(FadeIn, { y: 36, delay: index * 0.12, className: "h-full", children: /* @__PURE__ */ jsxs("article", { className: "t-glass t-glass-panel flex h-full flex-col rounded-[1.5rem] p-6 sm:p-7", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsx("span", { className: "t-glass flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl", children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-[var(--t-ink)]", strokeWidth: 1.75 }) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-end gap-1.5", children: cap.tags.map((t) => /* @__PURE__ */ jsx(
        "span",
        {
          className: "t-barlow t-glass rounded-full px-3 py-1 text-xs font-medium text-[rgba(240,238,252,0.85)]",
          children: t
        },
        t
      )) })
    ] }),
    /* @__PURE__ */ jsx(
      "h2",
      {
        className: "t-serif mt-16 italic leading-none text-[var(--t-ink)]",
        style: { fontSize: "clamp(1.9rem, 3vw, 2.5rem)" },
        children: cap.title
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "t-barlow mt-3 text-[15px] leading-relaxed text-[rgba(240,238,252,0.82)]", children: cap.body })
  ] }) });
}
function CinematicCapabilities() {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "t-capabilities",
      className: "relative w-full overflow-hidden bg-black",
      children: [
        /* @__PURE__ */ jsx(
          FadingVideo,
          {
            src: CAP_VIDEO,
            className: "absolute inset-0 z-0 h-full w-full object-cover"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute inset-0 z-0",
            style: {
              background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 42%, rgba(0,0,0,0.66) 100%)"
            }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 md:px-10", children: [
          /* @__PURE__ */ jsx(FadeIn, { y: 24, children: /* @__PURE__ */ jsx("p", { className: "t-barlow text-sm font-medium uppercase tracking-[0.28em] text-[rgba(240,238,252,0.7)]", children: "// The control layer" }) }),
          /* @__PURE__ */ jsx(
            BlurText,
            {
              text: "Your phone, answered by intention.",
              className: "t-serif mt-6 max-w-[15ch] italic text-[var(--t-ink)]",
              style: {
                fontSize: "clamp(2.75rem, 7vw, 6rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.03em"
              }
            }
          ),
          /* @__PURE__ */ jsx(FadeIn, { y: 20, delay: 0.15, children: /* @__PURE__ */ jsx("p", { className: "t-barlow mt-6 max-w-xl text-base leading-relaxed text-[rgba(240,238,252,0.85)] sm:text-lg", children: "No menus, no hunting for a button. A small, natural finger motion is all it takes — Tactiq reads it on your hand and your phone simply responds." }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-14 grid gap-5 md:mt-20 md:grid-cols-3", children: CAPS.map((cap, i) => /* @__PURE__ */ jsx(GlassCapCard, { cap, index: i }, cap.title)) })
        ] })
      ]
    }
  );
}
function ClosingCTA() {
  return /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden px-6 py-28 text-center sm:py-36", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": "true",
        className: "pointer-events-none absolute inset-0",
        style: {
          background: "radial-gradient(60% 60% at 50% 30%, rgba(139,108,255,0.22), transparent 70%)"
        }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 mx-auto max-w-3xl", children: [
      /* @__PURE__ */ jsx(FadeIn, { y: 30, children: /* @__PURE__ */ jsxs(
        "h2",
        {
          className: "t-serif t-legible font-normal leading-[0.98] tracking-[-0.02em]",
          style: { fontSize: "clamp(2.5rem, 7vw, 5.25rem)" },
          children: [
            "Accessibility shouldn't cost",
            " ",
            /* @__PURE__ */ jsx("em", { className: "not-italic", style: { color: "var(--t-violet)" }, children: "more than a laptop." })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(FadeIn, { y: 20, delay: 0.1, children: /* @__PURE__ */ jsx("p", { className: "mx-auto mt-7 max-w-xl text-base leading-relaxed text-[var(--t-muted)] sm:text-lg", children: "Braille displays run $799 to $15,500. Tactiq is positioned to be priced like earbuds — one ring, nine commands, and your phone back under your control. Join the waitlist to follow the research." }) }),
      /* @__PURE__ */ jsx(FadeIn, { y: 20, delay: 0.2, children: /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/project#follow",
            className: "t-btn-solid inline-flex min-h-12 items-center gap-2 rounded-full px-9 py-4 text-base font-semibold",
            children: [
              "Get early access",
              /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-5 w-5" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(Magnet, { padding: 80, strength: 4, children: /* @__PURE__ */ jsx(
          Link,
          {
            to: "/project#research",
            className: "t-btn-outline inline-flex min-h-12 items-center rounded-full px-9 py-4 text-base font-medium",
            children: "See the research"
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsxs(FadeIn, { y: 16, delay: 0.3, children: [
        /* @__PURE__ */ jsxs("div", { className: "mt-14 flex flex-col items-center gap-1 text-sm text-[var(--t-muted)] sm:flex-row sm:justify-center sm:gap-4", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/project",
              className: "inline-flex min-h-11 items-center px-2 transition-colors hover:text-[var(--t-ink)]",
              children: "Explore the research site"
            }
          ),
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "hidden sm:inline", children: "·" }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/privacy",
              className: "inline-flex min-h-11 items-center px-2 transition-colors hover:text-[var(--t-ink)]",
              children: "Privacy"
            }
          ),
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "hidden sm:inline", children: "·" }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/terms",
              className: "inline-flex min-h-11 items-center px-2 transition-colors hover:text-[var(--t-ink)]",
              children: "Terms"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-6 max-w-xl text-xs leading-relaxed text-[var(--t-muted)]", children: "Tactiq is a student research project from Sydney, Australia. “Tactiq” is a working title. All performance figures are pre-registered targets, not achieved results." })
      ] })
    ] })
  ] });
}
function TactiqIntro() {
  return /* @__PURE__ */ jsxs("div", { className: "tactiq-scope", style: { overflowX: "clip" }, children: [
    /* @__PURE__ */ jsx(Hero, {}),
    /* @__PURE__ */ jsx(Marquee, {}),
    /* @__PURE__ */ jsx(CinematicCapabilities, {}),
    /* @__PURE__ */ jsx(HowItWorks, {}),
    /* @__PURE__ */ jsx(ClosingCTA, {})
  ] });
}
function ShowcasePage() {
  useEffect(() => {
    document.title = "Tactiq — silent, eyes-free phone control for blind users";
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#0b0a14";
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);
  return /* @__PURE__ */ jsx("main", { style: { backgroundColor: "#0b0a14", overflowX: "clip" }, children: /* @__PURE__ */ jsx(TactiqIntro, {}) });
}
const LandingPage = lazy(() => import("./assets/LandingPage-BuHja2a8.js"));
const LoginPage = lazy(() => import("./assets/LoginPage-RVm8bkVr.js"));
const SignUpPage = lazy(() => import("./assets/SignUpPage-CpU8kY0A.js"));
const ForgotPasswordPage = lazy(() => import("./assets/ForgotPasswordPage-C_6CdSj4.js"));
const ResetPasswordPage = lazy(() => import("./assets/ResetPasswordPage-D9baxt04.js"));
const AccountPage = lazy(() => import("./assets/AccountPage-BGotdxEA.js"));
const CheckoutPage = lazy(() => import("./assets/CheckoutPage-pEMSrvL3.js"));
const CustomizePage = lazy(() => import("./assets/CustomizePage-FUAv36ex.js"));
const AdminPage = lazy(() => import("./assets/AdminPage-Bvds9cX4.js"));
const PrivacyPage = lazy(() => import("./assets/PrivacyPage-CYimqZu5.js"));
const TermsPage = lazy(() => import("./assets/TermsPage-BwKRbR8a.js"));
const AccessibilityPage = lazy(() => import("./assets/AccessibilityPage-By8qSOn9.js"));
const NotFoundPage = lazy(() => import("./assets/NotFoundPage-Dfla1g6g.js"));
function RouteFallback() {
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsx(
    "div",
    {
      className: "h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin",
      "aria-label": "Loading"
    }
  ) });
}
function AppRoutes() {
  return /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(RouteFallback, {}), children: /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(ShowcasePage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/project", element: /* @__PURE__ */ jsx(LandingPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/product", element: /* @__PURE__ */ jsx(Navigate, { to: "/project", replace: true }) }),
    /* @__PURE__ */ jsx(Route, { path: "/showcase", element: /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true }) }),
    /* @__PURE__ */ jsx(Route, { path: "/login", element: /* @__PURE__ */ jsx(LoginPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/signup", element: /* @__PURE__ */ jsx(SignUpPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/forgot-password", element: /* @__PURE__ */ jsx(ForgotPasswordPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/reset-password", element: /* @__PURE__ */ jsx(ResetPasswordPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/checkout", element: /* @__PURE__ */ jsx(CheckoutPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/privacy", element: /* @__PURE__ */ jsx(PrivacyPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/terms", element: /* @__PURE__ */ jsx(TermsPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/accessibility", element: /* @__PURE__ */ jsx(AccessibilityPage, {}) }),
    /* @__PURE__ */ jsxs(Route, { element: /* @__PURE__ */ jsx(ProtectedRoute, {}), children: [
      /* @__PURE__ */ jsx(Route, { path: "/account", element: /* @__PURE__ */ jsx(AccountPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/customize", element: /* @__PURE__ */ jsx(CustomizePage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/admin", element: /* @__PURE__ */ jsx(AdminPage, {}) })
    ] }),
    /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(NotFoundPage, {}) })
  ] }) }) });
}
function render(url2) {
  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk;
        callback();
      },
      final(callback) {
        callback();
        resolve(html);
      }
    });
    const stream = renderToPipeableStream(
      /* @__PURE__ */ jsx(StrictMode, { children: /* @__PURE__ */ jsx(MotionConfig, { reducedMotion: "user", children: /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(StaticRouter, { location: url2, children: /* @__PURE__ */ jsx(AppRoutes, {}) }) }) }) }),
      {
        onAllReady() {
          stream.pipe(sink);
        },
        onError(error) {
          reject(error);
        }
      }
    );
  });
}
export {
  deleteOrder as A,
  signUp as a,
  updatePassword as b,
  getDeviceHistory as c,
  getLatestOrder as d,
  signOut as e,
  updateProfile as f,
  getDeviceTelemetry as g,
  deleteGestureConfig as h,
  isAdmin as i,
  joinWaitlist as j,
  createOrder as k,
  listGestureConfigs as l,
  saveGestureConfig as m,
  getAdminStats as n,
  listAllUsers as o,
  listAllOrders as p,
  listWaitlist as q,
  resetPassword as r,
  render,
  signIn as s,
  setUserAdmin as t,
  useAuth as u,
  setUserBanned as v,
  eraseUserData as w,
  exportUserData as x,
  deleteWaitlistEntry as y,
  updateOrderStatus as z
};
