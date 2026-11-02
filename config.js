// Public config only. The Supabase anon key is safe in the browser because RLS (supabase/schema.sql) protects writes.
// Leave empty to run in static mode (content.json + live GitHub repos; blog/orders disabled).
window.SITE_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  ADMIN_EMAIL: "raihanarifuzzaman@gmail.com"
};
