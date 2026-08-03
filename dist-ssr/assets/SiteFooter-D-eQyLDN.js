import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router";
import { Hand, Mail, Github } from "lucide-react";
function SiteFooter() {
  return /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-background px-4 sm:px-6 lg:px-8 py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-start md:justify-between gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-md", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(Hand, { className: "w-5 h-5", "aria-hidden": true }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: "Tactiq" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[0.95rem] text-muted-foreground mb-3", children: "A smart ring being designed to give blind and low-vision people quiet, one-handed phone control alongside VoiceOver and TalkBack." }),
        /* @__PURE__ */ jsx("p", { className: "font-mono-label text-muted-foreground", children: "Research status: prototype construction · bench testing Aug–Oct 2026" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2.5 text-[0.95rem]", children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "mailto:hello@tactiq.app",
            className: "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
            children: [
              /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4", "aria-hidden": true }),
              "hello@tactiq.app"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "https://github.com/yaliyuan99-cmd/Tactiq-product",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
            children: [
              /* @__PURE__ */ jsx(Github, { className: "w-4 h-4", "aria-hidden": true }),
              "Research code and bench tools"
            ]
          }
        ),
        /* @__PURE__ */ jsx(Link, { to: "/accessibility", className: "text-muted-foreground hover:text-foreground transition-colors", children: "Accessibility statement" }),
        /* @__PURE__ */ jsx(Link, { to: "/privacy", className: "text-muted-foreground hover:text-foreground transition-colors", children: "Privacy" }),
        /* @__PURE__ */ jsx(Link, { to: "/terms", className: "text-muted-foreground hover:text-foreground transition-colors", children: "Terms" }),
        /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-muted-foreground hover:text-foreground transition-colors", children: "Sign in" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-10 pt-6 border-t border-border text-sm text-muted-foreground max-w-[75ch]", children: "© 2026 Tactiq — a student research project from Sydney, Australia. “Tactiq” is a working title. All ring performance figures are pre-registered targets or simulation results, not achieved results." })
  ] }) });
}
export {
  SiteFooter as S
};
