const config = {
  APP_STORE_URL: import.meta.env.VITE_APP_STORE_URL || '',
  GOOGLE_PLAY_URL: import.meta.env.VITE_GOOGLE_PLAY_URL || '',
  PRODUCER_SIGNUP_URL: import.meta.env.VITE_PRODUCER_SIGNUP_URL || '',
  EVENTS_API_URL: import.meta.env.VITE_EVENTS_API_URL || '/api/events',
  CONTACT_TOKEN_URL: import.meta.env.VITE_CONTACT_TOKEN_URL || '/api/contact-token',
  CONTACT_URL: import.meta.env.VITE_CONTACT_URL || '/api/contact',
  GA4_MEASUREMENT_ID: import.meta.env.VITE_GA4_MEASUREMENT_ID || '',
  GTM_ID: import.meta.env.VITE_GTM_ID || '',
  META_PIXEL_ID: import.meta.env.VITE_META_PIXEL_ID || ''
};

export default config;
