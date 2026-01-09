import { createContext } from "react";

interface DateContextType {
  date: Date;
  setDate: (date: Date) => void;
}

export const DateContext = createContext<DateContextType | undefined>(
  undefined,
);
