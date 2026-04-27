# ReviewMagic 🌟

> Turn happy customers into 5-star Google reviews — in under 10 seconds.

---

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** (utility styling)
- **Supabase** (database — client profiles)
- **Groq + Llama 3** (AI review generation)
- **Framer Motion** (animations)
- **qrcode.react** (QR generation)

---

## Setup Guide

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd reviewmagic
npm install
```

### 2. Create `.env.local`

Copy the example file:

```bash
cp .env.example .env.local
```

Then fill in your values:

```env
# Supabase — from supabase.com → Your Project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Groq — from console.groq.com/keys
GROQ_API_KEY=your_groq_api_key

# Admin password for /admin dashboard
ADMIN_PASSWORD=your_secure_password
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Open **SQL Editor** → New Query
3. Paste the contents of `supabase-schema.sql` and run it
4. Copy your **Project URL** and **anon key** into `.env.local`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/admin` | Admin dashboard (password protected) |
| `/review/[slug]` | Customer review journey (mobile-first) |
| `/review/demo` | Public demo — no Supabase needed |

---

## Deploying to Vercel

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo

3. Add environment variables in **Vercel Dashboard → Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
   - `ADMIN_PASSWORD`

4. Deploy! Your app will be live at `https://your-project.vercel.app`

---

## Where API Keys Go

| Key | Where to Get It | Where to Set It |
|-----|----------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → Project → Settings → API | `.env.local` + Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → Project → Settings → API | `.env.local` + Vercel |
| `GROQ_API_KEY` | console.groq.com/keys | `.env.local` + Vercel (server-side only) |
| `ADMIN_PASSWORD` | You choose this | `.env.local` + Vercel |

> **Important:** `GROQ_API_KEY` starts with `gsk_` and is only used server-side in `/app/api/generate/route.ts`. It is never exposed to the browser.

---

## How to Add a Client

1. Go to `/admin`
2. Enter the business password
3. Fill in: Business Name + Google Place ID + Focus Tags
4. Click **Add Client**
5. Click the QR icon to download the QR code
6. Print and place at the business location

### Finding a Google Place ID
Go to: [developers.google.com/maps/documentation/places/web-service/place-id](https://developers.google.com/maps/documentation/places/web-service/place-id)

Or use the Place ID Finder tool on that page — just search the business name.

---

## Hinglish Support

The AI automatically writes in Hinglish if the business name sounds Indian (detected from keywords like "dhaba", "chai", "sharma", "biryani", etc.). You can extend the `isIndianBusiness()` function in `/app/api/generate/route.ts`.

---

## License

MIT
