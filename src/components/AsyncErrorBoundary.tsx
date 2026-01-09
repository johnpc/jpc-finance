import { Component, ReactNode, ErrorInfo } from "react";
import {
  Alert,
  Button,
  Card,
  Flex,
  Heading,
  Text,
} from "@aws-amplify/ui-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AsyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AsyncErrorBoundary caught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener("unhandledrejection", this.handlePromiseRejection);
  }

  componentWillUnmount() {
    window.removeEventListener(
      "unhandledrejection",
      this.handlePromiseRejection,
    );
  }

  handlePromiseRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    this.setState({
      hasError: true,
      error: new Error(event.reason?.message || "Async operation failed"),
    });
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card variation="outlined" padding="2rem">
          <Flex direction="column" gap="1rem" alignItems="center">
            <Alert variation="error" isDismissible={false}>
              <Heading level={5}>Something went wrong</Heading>
            </Alert>
            <Text color="font.secondary">
              {this.state.error?.message || "An unexpected error occurred"}
            </Text>
            <Button onClick={this.handleReset} variation="primary">
              Try Again
            </Button>
          </Flex>
        </Card>
      );
    }

    return this.props.children;
  }
}
