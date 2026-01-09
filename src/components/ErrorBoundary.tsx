import React, { ReactNode } from "react";
import { Button, Card, Flex, Heading, Text } from "@aws-amplify/ui-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="center"
          padding="2rem"
          minHeight="400px"
        >
          <Card variation="outlined" padding="2rem">
            <Flex direction="column" gap="1rem" alignItems="center">
              <Heading level={3}>Something went wrong</Heading>
              <Text textAlign="center">
                We encountered an error while loading this section.
              </Text>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <Card backgroundColor="red.10" padding="1rem">
                  <Text fontSize="small" fontFamily="monospace">
                    {this.state.error.message}
                  </Text>
                </Card>
              )}
              <Button
                variation="primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Reload Page
              </Button>
            </Flex>
          </Card>
        </Flex>
      );
    }

    return this.props.children;
  }
}
