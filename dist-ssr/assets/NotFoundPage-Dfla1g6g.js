import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "react-router";
import { Hand, Compass } from "lucide-react";
function NotFoundPage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ jsx("header", { className: "px-4 sm:px-6 lg:px-8 py-5", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 hover:opacity-80 transition-opacity", children: [
      /* @__PURE__ */ jsx(Hand, { className: "w-6 h-6" }),
      /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "Tactiq" })
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 flex items-center justify-center px-4 py-10", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md text-center bg-card border border-border/60 rounded-2xl p-10 shadow-2xl", children: [
      /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-5", children: /* @__PURE__ */ jsx(Compass, { className: "w-7 h-7", "aria-hidden": true }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold mb-2", children: "Page not found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-8", children: "That address doesn't exist on this site. Tactiq is small — everything lives on the homepage and the product page." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/",
            className: "px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium",
            children: "Back to home"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/project#how-it-works",
            className: "px-6 py-3 border border-border rounded-xl hover:bg-secondary transition-colors font-medium",
            children: "See how the ring works"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  NotFoundPage as default
};
