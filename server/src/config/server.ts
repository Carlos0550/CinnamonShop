import dotenv from 'dotenv';

dotenv.config();

export const config = {

  nodeEnv: process.env['ENVIRONMENT'] || 'unknow',
  port: parseInt(process.env['PORT'] || '5000', 10),
  
  databaseUrl: process.env['DATABASE_URL']!,
  
  jwtSecret: process.env['JWT_SECRET']!,
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
  
  supabase: {
    api: process.env['SUPABASE_API']!,
    accessKey: process.env['SUPABASE_SECRET']!,
  },
  
  files: {
    maxSize: parseInt(process.env['MAX_FILE_SIZE'] || '5242880', 10), // 5MB
    allowedTypes: process.env['ALLOWED_FILE_TYPES']?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
  },
  
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutos
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },
  
  cors: {
    origin: process.env['CORS_ORIGIN']?.split(',') || ['*'],
  },
  
  email: {
    host: 'smtp.gmail.com',
    port: parseInt('587', 10),
    secure: 'true',
    user: process.env['EMAIL_USER'] || '',
    password: process.env['EMAIL_PASSWORD'] || '',
    fromName: process.env['EMAIL_FROM_NAME'] || 'Cinnamon Shop',
    fromEmail: process.env['EMAIL_FROM_EMAIL'] || 'noreply@cinnamonshop.com',
    loginUrl: process.env['EMAIL_LOGIN_URL'] || 'http://localhost:5173/auth',
    resetPasswordUrl: process.env['EMAIL_RESET_PASSWORD_URL'] || 'http://localhost:5173/auth/reset-password',
    supportEmail: process.env['EMAIL_FROM_EMAIL'],
  },
} as const;

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  "SUPABASE_API",
  "SUPABASE_SECRET"
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno requerida no encontrada: ${envVar}`);
  }
} 