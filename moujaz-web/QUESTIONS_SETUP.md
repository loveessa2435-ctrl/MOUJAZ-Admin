# MOUJAZ Question Generator — V1.5 fix

- **2 attempts per rolling 24 hours per Google account**. Window starts at first attempt, not midnight.
- Execute `supabase/03_questions_quota.sql` in Supabase SQL Editor **even if you ran the old file before**. It creates a new rolling-window table and replaces the RPC. Existing daily records remain but are not counted.
- Put valid `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and **server-only** `OPENAI_API_KEY` in `.env.local`. The OpenAI API key requires separate API billing; ChatGPT Plus alone does not include it.
- Restart `npm run dev` after changing `.env.local`. Open the website and test with 100+ characters of lecture text.
- If you see `The string did not match the expected pattern`, verify the exact Supabase URL (must start with `https://`) and the URL from which the page is served. Inspect browser console and server terminal if it persists.
- API failures now return more descriptive errors; invalid URLs are checked before Supabase initialization on the server.
- A quota attempt is currently counted once the AI request is started, even if the provider fails. Do not publish without confirming OpenAI billing, keys, and an end-to-end generation test.
- No scanned PDF OCR. PDF text is sent to the configured AI provider.
