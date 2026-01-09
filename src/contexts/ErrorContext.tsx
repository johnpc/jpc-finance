import { Alert, Flex } from "@aws-amplify/ui-react";
import { useState, ReactNode, useCallback } from "react";
import { ErrorContext } from "./ErrorContextDef";

interface Toast {
  id: string;
  message: string;
  type: "error" | "success" | "info";
}

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const showError = useCallback(
    (message: string) => {
      console.error(message);
      addToast(message, "error");
    },
    [addToast],
  );

  const showSuccess = useCallback(
    (message: string) => {
      addToast(message, "success");
    },
    [addToast],
  );

  const showInfo = useCallback(
    (message: string) => {
      addToast(message, "info");
    },
    [addToast],
  );

  return (
    <ErrorContext.Provider value={{ showError, showSuccess, showInfo }}>
      {children}
      <Flex
        position="fixed"
        bottom="1rem"
        right="1rem"
        direction="column"
        gap="0.5rem"
        style={{ zIndex: 9999 }}
      >
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            variation={
              toast.type === "error"
                ? "error"
                : toast.type === "success"
                  ? "success"
                  : "info"
            }
            isDismissible
            onDismiss={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          >
            {toast.message}
          </Alert>
        ))}
      </Flex>
    </ErrorContext.Provider>
  );
}
