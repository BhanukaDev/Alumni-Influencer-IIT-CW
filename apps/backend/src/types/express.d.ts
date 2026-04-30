declare namespace Express {
  interface Request {
    apiKeyId?: number;
    apiKeyPermissions?: string[];
  }
}
