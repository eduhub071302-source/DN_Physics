// 🔐 Supabase Client Setup

const SUPABASE_URL = "https://aqhktwashmnqkgvmauxv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxaGt0d2FzaG1ucWtndm1hdXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODczNTUsImV4cCI6MjA5MDk2MzM1NX0.ru9UUC917SwYXGh-uKuWWmifQqFbbEuG_edI4GHh5iE";

// ✅ IMPORTANT: use global from CDN
window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);