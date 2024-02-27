import "dotenv/config";

export const ALLOWED_ORIGINS: Array<string> = [
  process.env.FRONTEND_URL as string,
  process.env.DASHBOARD_URL as string,
];


