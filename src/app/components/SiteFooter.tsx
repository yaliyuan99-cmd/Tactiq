import { Link } from 'react-router';
import { Hand, ArrowUp, Mail, Github, Twitter, Linkedin } from 'lucide-react';

const PRODUCT_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Hardware', href: '#hardware' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
];

const COMPANY_LINKS = [
  { label: "Who it's for", href: '#for-who' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Join the waitlist', href: '#waitlist' },
];

export default function SiteFooter() {
  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Hand className="w-6 h-6" />
              <span className="text-xl font-semibold">Tactiq</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Phone control that lives on your body, not in your pocket. Wearable,
              invisible, fully personal.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tactiq on X / Twitter"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tactiq on GitHub"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tactiq on LinkedIn"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product">
            <h3 className="text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Get in touch</h3>
            <a
              href="mailto:hello@tactiq.app"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <Mail className="w-4 h-4" />
              hello@tactiq.app
            </a>
            <button
              onClick={scrollTop}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
              Back to top
            </button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Tactiq. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a
              href="mailto:hello@tactiq.app"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
