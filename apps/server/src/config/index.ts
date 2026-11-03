import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  wsPort: parseInt(process.env.WS_PORT || '4001', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'wac_super_secure_enterprise_jwt_secret_2026_xyz!',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'wac_refresh_token_secret_key_2026_abc!',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
  },
};
