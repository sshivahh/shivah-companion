# Shivah Companion

Personal companion web app, built mobile-first for iPhone. Next.js 16 (App Router, Server Actions) + Prisma 7 + Postgres + Tailwind 4. Deployed on Vercel with Neon.

## Features

- **Home** (`/`): on phones, a hub with one card per feature. On desktop (≥1024px) the app switches to an admin layout: sidebar for features, top bar with a global "Log a lesson" button, and a dashboard with stats, recent lessons, and per-student counts.
- **Lessons** (`/lessons`)
  - **Log**: "Log a lesson" opens a dialog with an always-visible calendar (days with lessons are marked), an hour/minute wheel, and the student list. Lessons are listed newest first; tap one to edit or delete it.
  - **Calendar**: month grid with a mark per student. Filter to one student or show everyone. Tap a day to see its lessons or log one on that day. Each student gets a list in WhatsApp format (`Gwen November: 1. Selasa, 3 Nov …`) with a Copy button.
  - **Students**: add, rename, recolor, archive, or delete students.

A group lesson is stored as one row per student (same date and time), so per-student counts and lists stay simple.

## Run locally

```bash
npm install                                # also generates the Prisma client
npx prisma dev --name companion --detach   # local Postgres; put its URL in .env as DATABASE_URL
npm run db:deploy                          # create the tables
npm run set-password -- "<password>"       # or copy data: npm run copy-from-sqlite
npm run dev                                # http://localhost:3000 (also on your LAN)
```

Instead of `prisma dev`, you can point `DATABASE_URL` at a Neon dev branch.

To use it on your phone over the same Wi-Fi, open `http://<your-mac-ip>:3000`. In Safari, Share → **Add to Home Screen** makes it open full-screen like an app.

## Sign-in

The app has one password and no username. It's stored in the database as a scrypt hash.

- Set or reset it from the command line: `npm run set-password -- "<new password>"` (signs out every device).
- Change it in the app under **Settings**. That signs out your other devices; the one you're using stays signed in.
- Sessions are a signed cookie that lasts a year per device.

## Env

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (pooled on Vercel) |
| `DATABASE_URL_UNPOOLED` | Optional direct connection used for migrations. Vercel's Neon integration sets it. |
| `AUTH_SECRET` | Long random string used to sign login cookies. Changing it signs every device out. **Set a new one when deploying.** |
| `APP_INITIAL_PASSWORD` | Optional. On a brand-new database with no password yet, this password is accepted once and saved (hashed). Leave empty after that. |
| `APP_TIMEZONE` | Timezone used for "today" (default `Asia/Jakarta`) |

## Deploying (Vercel + Neon)

1. Import the GitHub repo in Vercel (preset: Next.js).
2. In the project, **Storage → Create Database → Neon**, and connect it. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
3. Add `AUTH_SECRET` (new random string) and `APP_TIMEZONE` under **Settings → Environment Variables**.
4. Deploy. The `vercel-build` script runs `prisma migrate deploy` before `next build`, so the tables are created and kept up to date automatically.
5. Put data in: `DATABASE_URL="<neon url>" npm run copy-from-sqlite` copies students, lessons and the password from an old `dev.db`. Or set a fresh password with `DATABASE_URL="<neon url>" npm run set-password -- "<password>"`.
