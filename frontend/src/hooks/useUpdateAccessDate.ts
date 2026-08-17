import { useCallback } from "react";
import { API_BASE } from "../utils/types.ts";
import { useStatus } from "../context/StatusContext.tsx";

export function useUpdateAccessDate() {
  const { showStatus } = useStatus();

  const updateAccessDate = useCallback(async (deckId: string): Promise<boolean> => {
    try {
      const dateBody = {
        "last_accessed": new Date()
      }

      const response = await fetch(`${API_BASE}/decks/${deckId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dateBody),
      });

      const data = await response.json();

      if (response.ok) {
        return true;
      } else {
        showStatus({text: "Failed to update deck date!", type: "error"});
        console.error("Error: Failed to update deck date!", data);
        return false;
      }
    } catch (err) {
      showStatus({text: "Could not connect to the backend!", type: "error"});
      console.error("Error: Could not connect to backend!", err);
      return false;
    }
  }, [showStatus]);

  return updateAccessDate;
}