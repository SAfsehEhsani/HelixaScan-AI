import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-wellness-bg flex items-center justify-center p-6">
          <div className="wellness-card p-10 max-w-md w-full text-center border-wellness-ink/5">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/10">
              <ShieldAlert size={40} />
            </div>
            <h1 className="text-2xl font-serif text-wellness-ink mb-3">Something went wrong</h1>
            <p className="text-wellness-ink/60 text-sm mb-8 leading-relaxed">
              We encountered an unexpected error. Don't worry, your data is safe. Please try refreshing the application.
            </p>
            
            {this.state.error && (
              <div className="mb-8 p-4 bg-wellness-soft rounded-2xl text-left overflow-auto max-h-32">
                <p className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest mb-1">Error Details</p>
                <code className="text-xs text-rose-600 break-all">{this.state.error.message}</code>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-wellness-ink text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-wellness-ink/90 transition-all shadow-xl shadow-wellness-ink/20"
            >
              <RefreshCcw size={20} /> Refresh App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
