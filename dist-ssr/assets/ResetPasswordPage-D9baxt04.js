import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { b as updatePassword } from "../prerender-entry.js";
import { A as AuthLayout, f as fieldClass } from "./AuthLayout-RShcSXXr.js";
import "react-dom/server";
import "node:stream";
import "motion/react";
import "@supabase/supabase-js";
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") ?? void 0;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await updatePassword(password, email ? { email } : void 0);
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your password.");
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(
    AuthLayout,
    {
      title: "Choose a new password",
      subtitle: done ? void 0 : "Enter a new password for your account.",
      footer: /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Back to sign in" }),
      children: done ? /* @__PURE__ */ jsxs("div", { className: "text-center py-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-accent/15 text-accent rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-7 h-7" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-2", children: "Password updated" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Redirecting you to sign in…" })
      ] }) : /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "rp-password", className: "block text-sm mb-1.5", children: "New password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "rp-password",
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
          /* @__PURE__ */ jsx("label", { htmlFor: "rp-confirm", className: "block text-sm mb-1.5", children: "Confirm new password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "rp-confirm",
              type: "password",
              autoComplete: "new-password",
              value: confirm,
              onChange: (e) => setConfirm(e.target.value),
              placeholder: "Repeat password",
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
              "Updating…"
            ] }) : "Update password"
          }
        )
      ] })
    }
  );
}
export {
  ResetPasswordPage as default
};
