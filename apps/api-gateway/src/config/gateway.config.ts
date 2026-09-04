export const serviceConfig = {
  users: {
    url: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
    timeout: 10000, // 1seconds
  },
  products: {
    url: process.env.WALLET_SERVICE_URL || 'http://localhost:3002',
    timeout: 10000, // 10 seconds
  },
} as const
