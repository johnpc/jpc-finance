import { useError } from "../hooks/useErrorHook";

export function useErrorHandler() {
  const { showError } = useError();

  const handleError = (
    error: unknown,
    fallbackMessage = "An error occurred",
  ) => {
    if (error instanceof Error) {
      showError(error.message);
    } else if (typeof error === "string") {
      showError(error);
    } else {
      showError(fallbackMessage);
    }
  };

  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    errorMessage?: string,
  ): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      handleError(error, errorMessage);
      return null;
    }
  };

  const withRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    errorMessage?: string,
  ): Promise<T | null> => {
    let lastError: unknown;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.min(1000 * 2 ** i, 5000)),
          );
        }
      }
    }

    handleError(lastError, errorMessage);
    return null;
  };

  return { handleError, withErrorHandling, withRetry };
}
