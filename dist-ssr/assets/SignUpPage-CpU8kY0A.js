import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useSearchParams, Navigate, Link } from "react-router";
import { Loader2, ShoppingBag } from "lucide-react";
import { u as useAuth, a as signUp } from "../prerender-entry.js";
import { A as AuthLayout, f as fieldClass } from "./AuthLayout-RShcSXXr.js";
import "react-dom/server";
import "node:stream";
import "motion/react";
import "@supabase/supabase-js";
const PLAN_LABELS = {
  essential: "a Research Reservation",
  pro: "a Reservation + Updates"
};
function SignUpPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const next = params.get("next") || "/account";
  const intent = params.get("intent");
  const plan = params.get("plan");
  const isBuyIntent = intent === "buy";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [userCategory, setUserCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (user) {
    return /* @__PURE__ */ jsx(Navigate, { to: next, replace: true });
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signUp({ email, password, fullName, userCategory });
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
      setLoading(false);
    }
  };
  const signInHref = `/login${params.toString() ? `?${params.toString()}` : ""}`;
  const planLabel = plan ? PLAN_LABELS[plan] : null;
  return /* @__PURE__ */ jsx(
    AuthLayout,
    {
      title: isBuyIntent ? "Create an account to reserve" : "Create your account",
      subtitle: isBuyIntent ? "Sign up first — then we’ll take you straight to your reservation." : "Join Tactiq to save shortcut layouts and follow the research.",
      banner: isBuyIntent ? /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm", children: [
        /* @__PURE__ */ jsx(ShoppingBag, { className: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("strong", { className: "font-medium", children: "Sign up, then reserve." }),
          " You need a free account to register",
          planLabel ? /* @__PURE__ */ jsxs(Fragment, { children: [
            " ",
            planLabel
          ] }) : /* @__PURE__ */ jsx(Fragment, { children: " your research reservation" }),
          " — no payment, ever. We’ll send you right there afterwards."
        ] })
      ] }) : null,
      footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: signInHref, className: "text-primary hover:underline", children: "Sign in" })
      ] }),
      children: /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "su-name", className: "block text-sm mb-1.5", children: "Full name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "su-name",
              type: "text",
              autoComplete: "name",
              value: fullName,
              onChange: (e) => setFullName(e.target.value),
              placeholder: "Ada Lovelace",
              className: fieldClass
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "su-email", className: "block text-sm mb-1.5", children: "Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "su-email",
              type: "email",
              autoComplete: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "you@example.com",
              className: fieldClass
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "su-password", className: "block text-sm mb-1.5", children: "Password" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "su-password",
                type: "password",
                autoComplete: "new-password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: "6+ characters",
                className: fieldClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "su-confirm", className: "block text-sm mb-1.5", children: "Confirm" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "su-confirm",
                type: "password",
                autoComplete: "new-password",
                value: confirm,
                onChange: (e) => setConfirm(e.target.value),
                placeholder: "Repeat password",
                className: fieldClass
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "su-category", className: "block text-sm mb-1.5", children: [
            "I'm joining as… ",
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "su-category",
              value: userCategory,
              onChange: (e) => setUserCategory(e.target.value),
              className: `${fieldClass} text-muted-foreground`,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select one…" }),
                /* @__PURE__ */ jsx("option", { value: "blind-low-vision", children: "Blind or low-vision user" }),
                /* @__PURE__ */ jsx("option", { value: "elderly", children: "Elderly or motor-impaired user" }),
                /* @__PURE__ */ jsx("option", { value: "motor-accessibility", children: "Accessibility user" }),
                /* @__PURE__ */ jsx("option", { value: "developer", children: "Developer / Tech enthusiast" }),
                /* @__PURE__ */ jsx("option", { value: "early-adopter", children: "Early adopter" }),
                /* @__PURE__ */ jsx("option", { value: "other", children: "Other" })
              ]
            }
          )
        ] }),
        error && /* @__PURE__ */ jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:shadow-lg transition-shadow font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed",
            children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }),
              "Creating account…"
            ] }) : isBuyIntent ? "Sign up & continue to checkout" : "Create account"
          }
        )
      ] })
    }
  );
}
export {
  SignUpPage as default
};
