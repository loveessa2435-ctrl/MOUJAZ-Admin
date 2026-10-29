# MOUJAZ V1.3 — Real Orders

1. Keep your existing `.env.local` in the project root. Do not share it or put it in ZIP.
2. In Supabase SQL Editor run `supabase/01_secure_orders.sql` **after** creating the original `orders` table.
3. Run `npm install` and `npm run dev`.
4. Log in with Google; place a test report order; check Table Editor → orders.
5. Open another browser/device, sign in with the same Google account, and verify `طلباتي`.
6. Sign in with a different Google account and verify the other user's orders are invisible.

The `/api/orders` route validates the bearer token, then calls a PostgreSQL SECURITY DEFINER function that checks auth.uid(), service status, inputs and calculates prices server-side. There are no direct INSERT/UPDATE/DELETE RLS policies for students. The SQL function must be installed before placing orders.

Admin dashboard and real payment confirmation are not yet implemented. No payment is automatically collected. File delivery remains via Telegram. Existing browser-only demo orders are not migrated.
