const DEFAULT_API_BASE_URL = "http://localhost:4000";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const API_BASE_URL = (rawApiUrl && rawApiUrl.length > 0
  ? rawApiUrl
  : DEFAULT_API_BASE_URL
).replace(/\/$/, "");
