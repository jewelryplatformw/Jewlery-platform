import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d0d0e] flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10">
              <AlertTriangle className="h-8 w-8 text-rose-400" />
            </div>
            <h1 className="font-display text-xl text-white mb-3">Something went wrong</h1>
            <p className="text-sm text-white/50 mb-2">
              The app encountered an unexpected error and couldn't continue.
            </p>
            {this.state.message && (
              <p className="text-xs text-white/30 mb-6 font-mono break-all">
                {this.state.message}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-lg bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#0d0d0e] transition-opacity hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
