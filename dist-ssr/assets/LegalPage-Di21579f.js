import { jsxs, jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { Link } from "react-router";
import { Hand, ArrowLeft } from "lucide-react";
import { S as SiteFooter } from "./SiteFooter-D-eQyLDN.js";
function LegalPage({
  title,
  updated,
  intro,
  sections
}) {
  useEffect(() => {
    document.title = `${title} · Tactiq`;
    window.scrollTo(0, 0);
  }, [title]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-border", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Hand, { className: "w-6 h-6" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "Tactiq" })
      ] }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/",
          className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Back to home"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-semibold tracking-tight", children: title }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-muted-foreground", children: [
        "Last updated: ",
        updated
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 text-base leading-relaxed text-muted-foreground", children: intro }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 space-y-10", children: sections.map((s) => /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-foreground", children: s.heading }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-base leading-relaxed text-muted-foreground space-y-3", children: s.body })
      ] }, s.heading)) }),
      /* @__PURE__ */ jsxs("p", { className: "mt-14 text-sm text-muted-foreground", children: [
        "Questions about this document? Email us at",
        " ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "mailto:hello@tactiq.app",
            className: "text-foreground underline underline-offset-4 hover:no-underline",
            children: "hello@tactiq.app"
          }
        ),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsx(SiteFooter, {})
  ] });
}
export {
  LegalPage as L
};
