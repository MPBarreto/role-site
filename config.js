const config = {
  APP_STORE_URL: import.meta.env.VITE_APP_STORE_URL || '',
  GOOGLE_PLAY_URL: import.meta.env.VITE_GOOGLE_PLAY_URL || '',
  PRODUCER_SIGNUP_URL: import.meta.env.VITE_PRODUCER_SIGNUP_URL || '',
  EVENTS_API_URL: import.meta.env.VITE_EVENTS_API_URL || '/api/events',
  CONTACT_TOKEN_URL: import.meta.env.VITE_CONTACT_TOKEN_URL || '/api/contact-token',
  CONTACT_URL: import.meta.env.VITE_CONTACT_URL || '/api/contact'
};

export default config;
