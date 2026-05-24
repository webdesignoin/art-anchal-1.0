/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * React Error Boundary — catches unhandled render exceptions and shows
 * a branded fallback UI instead of a blank white screen.
 *
 * Note: useDefineForClassFields:false in tsconfig + React.Component generics
 * causes issues with the TS checker in this project. Using a wrapper function
 * component with a class inside to satisfy the React API requirement.
 */

import React from "react";

// Inner class kept minimal — only what React requires for Error Boundaries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ErrorBoundaryInner extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
    }
  }

  render() {
    const s = (this as any).state;
    const p = (this as any).props;

    if (s.hasError) {
      return (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "#1C050E",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "#F9F5F0",
            padding: "2rem",
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          {/* Inject keyframes since we can't rely on index.css being loaded if the crash happens early */}
          <style>
            {`
              @keyframes eb-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
              @keyframes eb-fade-up {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
          
          <div style={{ maxWidth: 440, display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center", animation: "eb-fade-up 0.5s ease-out forwards" }}>
            {/* Logo */}
            <h1 style={{ fontFamily: "serif", fontSize: "2.25rem", fontWeight: 300, letterSpacing: "0.2em", margin: 0, animation: "eb-float 6s ease-in-out infinite" }}>
              Art<span style={{ fontStyle: "italic", color: "#C5A028" }}>&amp;</span>Anchal
            </h1>

            {/* Warning icon */}
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(197,160,40,0.3)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(197,160,40,0.05)" }}>
              <svg width="32" height="32" fill="none" stroke="#C5A028" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            {/* Message */}
            <div>
              <h2 style={{ fontFamily: "serif", fontWeight: 300, color: "#F9F5F0", marginBottom: "0.5rem" }}>We will be back soon</h2>
              <p style={{ fontSize: "0.875rem", color: "rgba(249,245,240,0.6)", lineHeight: 1.6, margin: 0 }}>
                Our systems are currently experiencing a brief hiccup. Please try refreshing the page, or check back in a few minutes.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => { window.location.href = "/"; }}
              style={{
                padding: "0.75rem 2rem",
                border: "1px solid #C5A028",
                background: "transparent",
                color: "#C5A028",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#C5A028"; (e.target as HTMLButtonElement).style.color = "#1C050E"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "transparent"; (e.target as HTMLButtonElement).style.color = "#C5A028"; }}
            >
              Return to Homepage
            </button>

            {/* Dev-only error detail */}
            {import.meta.env.DEV && s.error && (
              <pre style={{ textAlign: "left", fontSize: "10px", color: "#f87171", background: "rgba(0,0,0,0.4)", padding: "1rem", borderRadius: 4, overflow: "auto", maxHeight: 180, fontFamily: "monospace", whiteSpace: "pre-wrap", width: "100%" }}>
                {s.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return p.children;
  }
}

// Public wrapper with typed props
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return <ErrorBoundaryInner>{children}</ErrorBoundaryInner>;
}
