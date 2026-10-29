# MOUJAZ Web V1.7 — Google login gate + PWA

1. Keep your existing `.env.local` (do not share secrets).
2. Run `npm install` and `npm run dev`.
3. Logged-out visitors see the Google sign-in screen; authenticated visitors go directly to the site.
4. After login, an install suggestion appears; the Account page also has an install action.
5. Android Chrome: use install prompt or Chrome menu. iPhone Safari: Share → Add to Home Screen.
6. For production PWA and service worker, deploy on HTTPS. Test OAuth redirect URLs in Supabase and Google.
7. This PWA intentionally does not cache private pages or files offline.
8. UI gate is not authorization: keep Supabase RLS and secure API endpoints enabled.
9. Google sign-in in an in-app browser (Telegram etc.) may be blocked; open in Chrome or Safari.
