export function apiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  if (process.env.NODE_ENV === "development") return "http://localhost:4000";
  if (typeof window !== "undefined") return window.location.origin;
  return `http://127.0.0.1:${process.env.PORT || 3000}`;
}
