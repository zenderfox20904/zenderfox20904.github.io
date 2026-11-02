# zenderfox20904.github.io
Portfolio of Arifuzzaman Raihan. Static, free (GitHub Pages + Supabase free tier).

## Deploy
1. Create public repo `zenderfox20904.github.io` on the zenderfox20904 account, push this folder to `main`. Pages serves it at https://zenderfox20904.github.io.
2. Backend (optional, enables blog/orders/admin): create a free Supabase project → SQL editor → run `supabase/schema.sql`. Authentication → Users → add user `raihanarifuzzaman@gmail.com` with a password (disable public sign-ups). Copy Project URL + anon public key into `config.js`. Never put the service_role key anywhere in this repo.
3. Admin: https://zenderfox20904.github.io/admin.html

Without Supabase the site still works (content.json + live GitHub repos; order form falls back to a prefilled email).
