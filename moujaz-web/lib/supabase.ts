import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase public environment variables. Configure .env.local first.");
}

let validUrl = false;
try { const parsed = new URL(url); validUrl = parsed.protocol === "https:" || parsed.hostname === "localhost"; } catch { /* invalid configuration */ }
if (!validUrl) throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL: use your Supabase project URL, e.g. https://project.supabase.co");
export const supabase = createClient(url, key);
