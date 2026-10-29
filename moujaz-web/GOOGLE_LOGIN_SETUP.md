# Google Login Setup — MOUJAZ Web V1.2

1. Copy `.env.example` to `.env.local` and replace `PASTE_YOUR_PUBLISHABLE_KEY_HERE` with the publishable key from your Supabase dashboard.
2. In Supabase > Authentication > Providers > Google, enable Google and save the Google OAuth client ID and secret.
3. In Supabase > Authentication > URL Configuration, set Site URL to `http://localhost:3000` and add `http://localhost:3000/**` to Redirect URLs for local development.
4. In Google Cloud OAuth Client, add the Supabase callback URL shown in the Supabase Google provider settings to Authorized redirect URIs.
5. Run `npm install` then `npm run dev` and visit `http://localhost:3000`.
6. Click **دخول**, choose a Google account, and verify **حسابي** shows your email.

Important: Google login is live, but orders are still stored locally in `localStorage` and do not reach administration. Do not accept real paid orders until a database, RLS policies and admin workflow are implemented.
Never commit `.env.local`, a service-role key, or the Google OAuth client secret.
