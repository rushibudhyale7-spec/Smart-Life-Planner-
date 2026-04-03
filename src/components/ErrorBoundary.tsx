import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = (this as any).state;
    const { children } = (this as any).props;

    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 gradient-bg">
          <div className="glass-card p-8 max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh App
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="text-left text-[10px] bg-black/40 p-4 rounded-xl overflow-auto max-h-40 text-red-400">
                {error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}
