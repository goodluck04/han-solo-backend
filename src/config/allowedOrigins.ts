import "dotenv/config";

export const allowedOrigins: Array<string> = [
  process.env.FRONTEND_URL as string,
  process.env.DASHBOARD_URL as string,
];


