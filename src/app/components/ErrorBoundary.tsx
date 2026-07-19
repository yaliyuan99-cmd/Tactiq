import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * App-wide error boundary. A render error anywhere below this component shows a
 * calm recovery screen instead of React unmounting the tree to a blank page.
 * Class component because `getDerivedStateFromError` / `componentDidCatch` have
 * no hook equivalent.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the crash in dev; in production this is where a real app would
    // forward to an error-reporting service (Sentry, etc.).
    if (import.meta.env.DEV) {
      console.error('[Tactiq] Uncaught render error:', error, info.componentStack);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </span>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
            An unexpected error interrupted this page. Reloading usually clears it — your
            account and settings are safe.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-5 max-h-40 overflow-auto rounded-lg border border-border bg-card px-4 py-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reload page
            </button>
            <a
              href="/"
              className="inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card sm:w-auto"
            >
              Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
