import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import StatusPopup from "../components/StatusPopup.tsx";
import { IPopupStatus } from "../utils/types.ts";

interface StatusContextValue {
  showStatus: (status: IPopupStatus) => void;
}

const StatusContext = createContext<StatusContextValue | null>(null);

export function StatusProvider({children}: {children: ReactNode}) {
  const [status, setStatus] = useState<IPopupStatus | null>(null);

  const showStatus = useCallback((newStatus: IPopupStatus) => {
    setStatus(newStatus);
  }, []);

  const clearStatus = useCallback(() => {
    setStatus(null);
  }, []);

  return (
    <StatusContext.Provider value={{showStatus}}>
      {children}
      <StatusPopup status={status} onClearStatus={clearStatus} />
    </StatusContext.Provider>
  );
}

export function useStatus() {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error("useStatus must be used within a StatusProvider!");
  }
  
  return context;
}