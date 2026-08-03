import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useSearchParams, Navigate, Link } from "react-router";
import { motion } from "motion/react";
import { Loader2, Hand, ArrowLeft, CheckCircle2, Check, ShieldCheck } from "lucide-react";
import { u as useAuth, k as createOrder } from "../prerender-entry.js";
import "react-dom/server";
import "node:stream";
import "@supabase/supabase-js";
const PLANS = {
  essential: {
    id: "essential",
    name: "Research Reservation",
    price: 0,
    blurb: "Register interest in the first build — one ring, nine commands.",
    features: [
      "One ring — index finger, either hand",
      "Nine fixed commands",
      "Augments VoiceOver & TalkBack"
    ]
  },
  pro: {
    id: "pro",
    name: "Reservation + Updates",
    price: 0,
    blurb: "The same reservation, plus bench-experiment updates by email.",
    features: [
      "Everything in Research Reservation",
      "Bench-experiment result emails (Aug–Oct 2026)",
      "AUSSEF / ISEF milestone news",
      "Papers available on request"
    ]
  }
};
function CheckoutPage() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const planId = params.get("plan") ?? "pro";
  const plan = PLANS[planId] ?? PLANS.pro;
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderError, setOrderError] = useState("");
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-muted-foreground" }) });
  }
  if (!user) {
    const next = encodeURIComponent(`/checkout?plan=${plan.id}`);
    return /* @__PURE__ */ jsx(Navigate, { to: `/signup?intent=buy&plan=${plan.id}&next=${next}`, replace: true });
  }
  const shipping = 0;
  const total = plan.price + shipping;
  const handlePlaceOrder = async () => {
    setOrderError("");
    setPlacing(true);
    try {
      await createOrder({
        plan: plan.id,
        amountCents: Math.round(plan.price * 100),
        currency: "AUD"
      });
      setPlaced(true);
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : "Could not reserve your order. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-border bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 hover:opacity-80 transition-opacity", children: [
      /* @__PURE__ */ jsx(Hand, { className: "w-6 h-6" }),
      /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "Tactiq" })
    ] }) }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/",
          className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Continue shopping"
          ]
        }
      ),
      placed ? /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.96 },
          animate: { opacity: 1, scale: 1 },
          className: "bg-card border border-border rounded-2xl p-10 text-center max-w-xl mx-auto",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-accent/15 text-accent rounded-full flex items-center justify-center mx-auto mb-5", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-8 h-8" }) }),
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold mb-2", children: "Reservation confirmed!" }),
            /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mb-6", children: [
              "Thanks, ",
              (user.fullName || user.email || "").split(" ")[0],
              " — your",
              " ",
              plan.name,
              " is confirmed. We'll email",
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-foreground", children: user.email }),
              " with research updates, and you'll be first to know if there is ever a build to try."
            ] }),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/account",
                className: "inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium",
                children: "Go to your account"
              }
            )
          ]
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold mb-8", children: "Checkout" }),
        /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-[1fr_360px] gap-8 items-start", children: [
          /* @__PURE__ */ jsxs("section", { className: "bg-card border border-border rounded-2xl p-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-1", children: plan.name }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mb-5", children: plan.blurb }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-2 mb-6", children: plan.features.map((f) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm", children: [
              /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-primary flex-shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: f })
            ] }, f)) }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: Object.values(PLANS).map((p) => /* @__PURE__ */ jsxs(
              Link,
              {
                to: `/checkout?plan=${p.id}`,
                className: `flex-1 text-center px-4 py-3 rounded-xl border text-sm transition-colors ${p.id === plan.id ? "border-primary bg-primary/5 font-medium" : "border-border hover:bg-secondary"}`,
                children: [
                  p.name,
                  /* @__PURE__ */ jsx("span", { className: "block text-muted-foreground", children: "Free — research interest" })
                ]
              },
              p.id
            )) })
          ] }),
          /* @__PURE__ */ jsxs("aside", { className: "bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Order summary" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-muted-foreground", children: plan.name }),
                /* @__PURE__ */ jsx("dd", { className: "text-primary", children: "Free" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-muted-foreground", children: "Payment required" }),
                /* @__PURE__ */ jsx("dd", { className: "text-primary", children: "None" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "border-t border-border my-3" }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-base font-semibold", children: [
                /* @__PURE__ */ jsx("dt", { children: "Total" }),
                /* @__PURE__ */ jsxs("dd", { children: [
                  "$",
                  total.toFixed(2),
                  " AUD"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handlePlaceOrder,
                disabled: placing,
                className: "w-full mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:shadow-lg transition-shadow font-medium flex items-center justify-center gap-2 disabled:opacity-70",
                children: placing ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }),
                  " Placing…"
                ] }) : "Reserve now"
              }
            ),
            orderError && /* @__PURE__ */ jsx("p", { role: "alert", className: "mt-3 text-sm text-destructive", children: orderError }),
            /* @__PURE__ */ jsxs("p", { className: "mt-3 flex items-start gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4 flex-shrink-0 mt-0.5" }),
              "This registers research interest only — Tactiq is a student research project. No payment is taken, now or later, and there is no product for sale."
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  CheckoutPage as default
};
