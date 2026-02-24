"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-GB">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "2rem", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
            A critical error occurred. Please try again or refresh the page.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#fff",
              background: "#22c55e",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: "1.5rem" }}>
            {/* Full page navigation intentional: global-error renders outside app tree */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ color: "#22c55e", textDecoration: "underline" }}>
              Go to home
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
