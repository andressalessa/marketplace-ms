export const serviceConfig = {
  users: {
    url: process.env.USERS_SERVICE_URL || 'http://localhost:3000',
    timeout: 10000 // 1 sec (10k milliseconds),
  },
  products: {
    url: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001',
    timeout: 10000 // 1 sec (10k milliseconds),
  },
  checkout: {
    url: process.env.CHECKOUT_SERVICE_URL || 'http://localhost:3003',
    timeout: 10000 // 1 sec (10k milliseconds),
  },
  payments: {
    url: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004',
    timeout: 10000 // 1 sec (10k milliseconds),
  },
} as const;
