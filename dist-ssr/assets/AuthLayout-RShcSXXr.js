import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "react-router";
import { Hand } from "lucide-react";
const fieldClass = "w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";
function AuthLayout({
  title,
  subtitle,
  banner,
  children,
  footer
}) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ jsx("header", { className: "px-4 sm:px-6 lg:px-8 py-5", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 hover:opacity-80 transition-opacity", children: [
      /* @__PURE__ */ jsx(Hand, { className: "w-6 h-6" }),
      /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "Tactiq" })
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 flex items-center justify-center px-4 py-10", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md animate-enter-rise", children: [
      banner,
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border/60 rounded-2xl p-8 shadow-2xl backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold mb-2", children: title }),
          subtitle && /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: subtitle })
        ] }),
        children
      ] }),
      footer && /* @__PURE__ */ jsx("div", { className: "mt-6 text-center text-sm text-muted-foreground", children: footer })
    ] }) })
  ] });
}
export {
  AuthLayout as A,
  fieldClass as f
};
