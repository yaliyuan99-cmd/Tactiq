/**
 * Site footer — deliberately small. One sentence about the project, the
 * research status, contact, and the legal/accessibility links. No duplicated
 * navigation, no placeholder social icons. "Sign in" lives here, quietly.
 */
import { Link } from 'react-router';
import { Hand, Mail, Github } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <Hand className="w-5 h-5" aria-hidden />
              <span className="text-lg font-semibold">Tactiq</span>
            </div>
            <p className="text-[0.95rem] text-muted-foreground mb-3">
              A smart ring being designed to give blind and low-vision people quiet, one-handed
              phone control alongside VoiceOver and TalkBack.
            </p>
            <p className="font-mono-label text-muted-foreground">
              Research status: prototype construction · bench testing Aug–Oct 2026
            </p>
          </div>

          <div className="flex flex-col gap-2.5 text-[0.95rem]">
            <a
              href="mailto:hello@tactiq.app"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" aria-hidden />
              hello@tactiq.app
            </a>
            <a
              href="https://github.com/yaliyuan99-cmd/Tactiq-product"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" aria-hidden />
              Research code and bench tools
            </a>
            <Link to="/accessibility" className="text-muted-foreground hover:text-foreground transition-colors">
              Accessibility statement
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <p className="mt-10 pt-6 border-t border-border text-sm text-muted-foreground max-w-[75ch]">
          © 2026 Tactiq — a student research project from Sydney, Australia. “Tactiq” is a working
          title. All ring performance figures are pre-registered targets or simulation results,
          not achieved results.
        </p>
      </div>
    </footer>
  );
}
