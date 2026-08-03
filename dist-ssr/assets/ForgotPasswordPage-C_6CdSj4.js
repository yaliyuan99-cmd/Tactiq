import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router";
import { MailCheck, Loader2 } from "lucide-react";
import { r as resetPassword } from "../prerender-entry.js";
import { A as AuthLayout, f as fieldClass } from "./AuthLayout-RShcSXXr.js";
import "react-dom/server";
import "node:stream";
import "motion/react";
import "@supabase/supabase-js";
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [localMode, setLocalMode] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await resetPassword(email);
      setLocalMode(Boolean(res.local));
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset link.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(
    AuthLayout,
    {
      title: "Reset your password",
      subtitle: sent ? void 0 : "Enter your email and we'll send you a reset link.",
      footer: /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Back to sign in" }),
      children: sent ? /* @__PURE__ */ jsxs("div", { className: "text-center py-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-accent/15 text-accent rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(MailCheck, { className: "w-7 h-7" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-2", children: "Check your inbox" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm", children: [
          "If an account exists for ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: email }),
          ", a password-reset link is on its way."
        ] }),
        localMode && /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-left text-sm", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mb-3", children: [
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Dev mode:" }),
            " no email backend is connected, so use this direct link to set a new password."
          ] }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: `/reset-password?email=${encodeURIComponent(email)}`,
              className: "inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity",
              children: "Set a new password"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "fp-email", className: "block text-sm mb-1.5", children: "Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "fp-email",
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
        error && /* @__PURE__ */ jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:shadow-lg transition-shadow font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed",
            children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }),
              "Sending…"
            ] }) : "Send reset link"
          }
        )
      ] })
    }
  );
}
export {
  ForgotPasswordPage as default
};
