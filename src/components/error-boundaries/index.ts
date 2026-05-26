// Main error boundary components
export { ErrorBoundary, ErrorFallback } from './ErrorBoundary';
export { ModalErrorBoundary } from './ModalErrorBoundary';
export { EditorErrorBoundary } from './EditorErrorBoundary';
export { DashboardErrorBoundary } from './DashboardErrorBoundary';

// Error recovery and logging utilities
export type {
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
  ErrorRecoveryOptions,
  ErrorReportingConfig
} from './ErrorRecovery';
export {
  errorRecoveryManager,
  errorLogger,
  classifyError,
  getErrorSeverity,
} from './ErrorRecovery';

// Export HOC from ReactIntegration (supports multiple overloads used across the app)
export { withErrorBoundary } from './ReactIntegration';

// Specialized fallback UI components
export {
  LoadingSpinner,
  RetryButton,
  NetworkErrorFallback,
  DataErrorFallback,
  ComponentErrorFallback,
  EmptyStateFallback,
  PermissionErrorFallback,
  TimeoutErrorFallback
} from './ErrorFallbacks';

// React integration utilities
export {
  renderReactComponent,
  unmountReactComponent,
  createReactContainer
} from './ReactIntegration';
