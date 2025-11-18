import { createContext, useContext, useState, ReactNode } from "react";

interface DateContextType {
  date: Date;
  setDate: (date: Date) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState<Date>(new Date());
  return <DateContext.Provider value={{ date, setDate }}>{children}</DateContext.Provider>;
}

export function useDate() {
  const context = useContext(DateContext);
  if (!context) throw new Error("useDate must be used within DateProvider");
  return context;
}
