"use client";

import { useEffect } from "react";

interface MarkViewedProps {
  accessToken: string;
  status: string;
  viewedAt: string | null;
}

export function MarkViewed({ accessToken, status, viewedAt }: MarkViewedProps) {
  useEffect(() => {
    // Only mark as viewed if status is "sent" and not already viewed
    if (status === "sent" && !viewedAt) {
      fetch("/api/quotes/mark-viewed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: accessToken }),
      }).catch((error) => {
        // Silently fail - this is not critical for the user experience
        console.error("Failed to mark quote as viewed:", error);
      });
    }
  }, [accessToken, status, viewedAt]);

  return null;
}
