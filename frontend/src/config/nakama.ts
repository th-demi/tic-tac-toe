const rawSSL = import.meta.env.VITE_NAKAMA_USE_SSL;
console.log(
  "[nakamaConfig] raw VITE_NAKAMA_USE_SSL:",
  rawSSL,
  "type:",
  typeof rawSSL
);

export const nakamaConfig = {
  host: (() => {
    const host = import.meta.env.VITE_NAKAMA_HOST || "localhost";
    return host.replace(/^https?:\/\//, "").replace(/\/$/, "");
  })(),
  port: import.meta.env.VITE_NAKAMA_PORT || "7350",
  serverKey: import.meta.env.VITE_NAKAMA_SERVER_KEY || "defaultkey",
  useSSL:
    rawSSL === "true" || rawSSL === true || rawSSL === "1" || rawSSL === 1,
};

console.log("[nakamaConfig] Final config:", nakamaConfig);
