import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

export const CorsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)

    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*']

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'X-Requested-With',
    'Authorization',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  credentials: true,
  maxAge: 86400,
}
