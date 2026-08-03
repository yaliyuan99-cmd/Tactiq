import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { L as LegalPage } from "./LegalPage-Di21579f.js";
import "react";
import "react-router";
import "lucide-react";
import "./SiteFooter-D-eQyLDN.js";
function PrivacyPage() {
  return /* @__PURE__ */ jsx(
    LegalPage,
    {
      title: "Privacy Policy",
      updated: "16 July 2026",
      intro: /* @__PURE__ */ jsx("p", { children: "This Privacy Policy explains what information Tactiq collects, why we collect it, and the choices you have. Tactiq is a wearable device that lets you control your phone from your body, so protecting the data that flows between your ring, your phone, and our services is central to how we build the product." }),
      sections: [
        {
          heading: "Information we collect",
          body: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Account information." }),
              " ",
              "When you create an account we store your name, email address, and an encrypted representation of your password."
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Device data." }),
              " To make gesture control work we process motion and interaction signals from your ring. Where possible this processing happens on your device; only the data needed to sync settings and provide support reaches our servers."
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Usage data." }),
              " We collect basic diagnostics — app version, crash reports, and aggregate feature usage — to keep the product reliable."
            ] })
          ] })
        },
        {
          heading: "How we use information",
          body: /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-5 space-y-2", children: [
            /* @__PURE__ */ jsx("li", { children: "To provide, maintain, and improve Tactiq." }),
            /* @__PURE__ */ jsx("li", { children: "To personalise your gestures, themes, and device settings." }),
            /* @__PURE__ */ jsx("li", { children: "To respond to support requests and send service notices." }),
            /* @__PURE__ */ jsx("li", { children: "To detect, prevent, and address security or technical issues." })
          ] })
        },
        {
          heading: "How we share information",
          body: /* @__PURE__ */ jsx("p", { children: "We do not sell your personal information. We share data only with service providers who help us operate Tactiq (for example hosting and authentication), and only to the extent needed to perform those services, or where required by law." })
        },
        {
          heading: "Data retention",
          body: /* @__PURE__ */ jsx("p", { children: "We keep your information for as long as your account is active. You can ask us to delete your account and associated data at any time, after which we remove it except where we are legally required to retain certain records." })
        },
        {
          heading: "Your choices and rights",
          body: /* @__PURE__ */ jsx("p", { children: "Depending on where you live, you may have the right to access, correct, export, or delete your personal information, and to object to certain processing. To exercise any of these rights, contact us using the email below and we will respond within a reasonable time." })
        },
        {
          heading: "Security",
          body: /* @__PURE__ */ jsx("p", { children: "We use encryption in transit, access controls, and regular reviews to protect your data. No method of transmission or storage is perfectly secure, but we work continuously to safeguard your information." })
        },
        {
          heading: "Children's privacy",
          body: /* @__PURE__ */ jsx("p", { children: "Tactiq is not directed to children under 13, and we do not knowingly collect personal information from them." })
        },
        {
          heading: "Changes to this policy",
          body: /* @__PURE__ */ jsx("p", { children: "We may update this Privacy Policy from time to time. When we make material changes we will update the date above and, where appropriate, notify you in the app." })
        }
      ]
    }
  );
}
export {
  PrivacyPage as default
};
