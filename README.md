# Arifuzzaman Raihan · Portfolio

Live: **https://zenderfox20904.github.io**

Personal portfolio of Arifuzzaman Raihan, Full Stack Developer & AI Engineer. Experience-first, data-driven and fully responsive, with a built-in blog and client project ordering.

## Features
- Experience timeline, projects linked to roles, grouped skills, all rendered from `content.json` (editable from the dashboard)
- Live GitHub repositories (stars, language, last update) via the GitHub REST API
- Blog with Markdown posts and cover images
- "Order a project" form; dashboard to confirm/reject orders, auto-generated invoices (print / PDF), project milestones and clients
- Solid light and dark themes (system default, persisted), scroll and micro-animations that respect `prefers-reduced-motion`
- Animated SVG logo and inline illustrations, no build step

## Tech stack
HTML, CSS, vanilla JavaScript · Supabase (Postgres with Row Level Security, Auth, Storage, Realtime) · GitHub Pages · marked + DOMPurify · html2pdf.js

## Setup
1. Create a Supabase project and run `supabase/schema.sql`.
2. Add one owner user in Supabase Auth and disable public sign-ups.
3. Put the project URL and **anon** key in `config.js` (safe in the browser; RLS protects data). Never commit a service_role key.
4. Push to `main`; GitHub Pages serves the repo root.
