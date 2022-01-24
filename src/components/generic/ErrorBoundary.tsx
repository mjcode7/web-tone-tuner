import {analytics} from 'lib/Analytics';
import * as React from 'react';
import {ErrorInfo} from 'react';

interface OwnState {
  hasError: boolean;
}

interface OwnProps {
  FallbackComponent: any;
  children: React.ReactElement;
}

export class ErrorBoundary extends React.Component<OwnProps, OwnState> {
  public constructor(props: OwnProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the Fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    analytics.logError(error, errorInfo);
  }

  public render() {
    const {
      children,
      FallbackComponent,
    } = this.props;
    if (this.state.hasError) {
      return <FallbackComponent {...this.props}/>;
    }
    return children;
  }
}