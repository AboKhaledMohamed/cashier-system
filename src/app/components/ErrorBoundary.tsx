import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#161B2E] flex items-center justify-center p-4">
          <div className="bg-[#1E2640] rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#E74C3C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[#E74C3C]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-[#7A8CA0] mb-6">
              نعتذر، حدث خطأ في التطبيق. يمكنك إعادة تحميل الصفحة أو المحاولة مرة أخرى.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={this.handleReload}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                إعادة تحميل
              </Button>
              <Button variant="primary" onClick={this.handleReset}>
                المحاولة مرة أخرى
              </Button>
            </div>
            {this.state.error && (
              <div className="mt-4 p-3 bg-[#161B2E] rounded text-left">
                <p className="text-[12px] text-[#E74C3C] font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
