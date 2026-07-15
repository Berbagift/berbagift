"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket } from "@/lib/socket";

interface ActivityEvent {
  wallet_address: string;
  activity_type: string;
  tx_hash: string;
}

export function useActivitySocket() {
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const socket = connectSocket();

    const queryKeys = [
      "activities",
      "notifications",
      "rooms",
      "myrooms",
      "exploreRooms",
      "userProfile",
      "nfts",
      "marketplace_nfts",
    ] as const;

    const handleActivity = (data: ActivityEvent) => {
      console.log("📡 Real-time activity:", data);

      for (const key of queryKeys) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    };

    socket.on("activity:new", handleActivity);

    return () => {
      socket.off("activity:new", handleActivity);
      initialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
