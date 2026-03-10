const DEFAULT_APP_URL = "http://localhost:3000";

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    DEFAULT_APP_URL
  ).replace(/\/$/, "");
}

