export function corsOrigin(
  origin: string | undefined,
  callback: (error: Error | null, allow?: boolean) => void,
): void {
  if (!origin) {
    return callback(null, true);
  }

  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error('Not allowed by CORS'));
}
