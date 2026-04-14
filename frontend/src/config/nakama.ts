export const nakamaConfig = {
  host: import.meta.env.VITE_NAKAMA_HOST || 'localhost',
  port: import.meta.env.VITE_NAKAMA_PORT || 7350,
  serverKey: import.meta.env.VITE_NAKAMA_SERVER_KEY || 'defaultkey',
  useSSL: import.meta.env.VITE_NAKAMA_USE_SSL === 'true' || false
};