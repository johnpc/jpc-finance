import { useState, ReactNode } from "react";
import { DateContext } from "../contexts/DateContext";

export function DateProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState<Date>(new Date());
  return (
    <DateContext.Provider value={{ date, setDate }}>
      {children}
    </DateContext.Provider>
  );
}
