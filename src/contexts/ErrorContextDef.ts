import { createContext } from "react";

interface ErrorContextType {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(
  undefined,
);
