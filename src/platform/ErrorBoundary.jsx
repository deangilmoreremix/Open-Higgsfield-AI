import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('App Error Boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      
      return (
        <div className="h-screen bg-[#030303] flex items-center justify-center p-6">
          <div 
            className="max-w-md w-full p-6 rounded-xl border text-center"
            style={{ 
              backgroundColor: 'oklch(10% 0.005 270deg)',
              borderColor: 'oklch(35% 18% 300deg / 0.2)'
            }}
          >
            <AlertTriangle 
              className="w-12 h-12 mx-auto mb-4" 
              style={{ color: 'oklch(35% 18% 300deg)' }}
            />
            <h3 className="text-lg font-semibold text-white mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-white/60 mb-4">
              {error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                style={{ 
                  backgroundColor: 'oklch(35% 18% 300deg)',
                  color: 'oklch(98% 0.005 270deg)'
                }}
              >
                <RefreshCw className="w-3 h-3" />
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                style={{ 
                  backgroundColor: 'oklch(18% 0.005 270deg)',
                  color: 'oklch(78% 0.01 270deg)',
                  border: '1px solid oklch(35% 18% 300deg / 0.2)'
                }}
              >
                <Home className="w-3 h-3" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error) => {
    console.error('Handled error:', error);
    throw error;
  };
}

export default AppErrorBoundary;