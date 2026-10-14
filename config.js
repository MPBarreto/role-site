const { env } = import.meta;

export default {
  APP_STORE_URL: env.VITE_APP_STORE_URL || "",
  GOOGLE_PLAY_URL: env.VITE_GOOGLE_PLAY_URL || "",
  EVENTS_API_URL: env.VITE_EVENTS_API_URL || "/api/events",
  CONTACT_TOKEN_URL: env.VITE_CONTACT_TOKEN_URL || "/api/contact-token",
  CONTACT_URL: env.VITE_CONTACT_URL || "/api/contact"
};
