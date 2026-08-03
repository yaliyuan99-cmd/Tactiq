import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useSearchParams, Navigate, Link } from "react-router";
import { Loader2, ShoppingBag } from "lucide-react";
import { u as useAuth, s as signIn } from "../prerender-entry.js";
import { A as AuthLayout, f as fieldClass } from "./AuthLayout-RShcSXXr.js";
import "react-dom/server";
import "node:stream";
import "motion/react";
import "@supabase/supabase-js";
function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const next = params.get("next") || "/account";
  const intent = params.get("intent");
  const isBuyIntent = intent === "buy";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (user) {
    return /* @__PURE__ */ jsx(Navigate, { to: next, replace: true });
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
      setLoading(false);
    }
  };
  const signUpHref = `/signup${params.toString() ? `?${params.toString()}` : ""}`;
  return /* @__PURE__ */ jsx(
    AuthLayout,
    {
      title: "Welcome back",
      subtitle: "Sign in to manage your account and gesture layouts.",
      banner: isBuyIntent ? /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm", children: [
        /* @__PURE__ */ jsx(ShoppingBag, { className: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx("span", { children: "Sign in to continue your purchase — your cart is waiting." })
      ] }) : null,
      footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        "New to Tactiq?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: signUpHref, className: "text-primary hover:underline", children: "Create an account" })
      ] }),
      children: /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "login-email", className: "block text-sm mb-1.5", children: "Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "login-email",
              type: "email",
              autoComplete: "email",
              required: true,
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "you@example.com",
              className: fieldClass
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "login-password", className: "text-sm", children: "Password" }),
            /* @__PURE__ */ jsx(Link, { to: "/forgot-password", className: "text-xs text-primary hover:underline", children: "Forgot password?" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "login-password",
              type: "password",
              autoComplete: "current-password",
              required: true,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "••••••••",
              className: fieldClass
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
              "Signing in…"
            ] }) : "Sign in"
          }
        )
      ] })
    }
  );
}
export {
  LoginPage as default
};
