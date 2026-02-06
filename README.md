**Lunchboxd** — Log restaurants you've been to, like [Letterboxd](https://letterboxd.com) for food. Built with Next.js and [Supabase](https://supabase.com) for auth and data.

## Supabase setup

1. **Create a project** at [supabase.com](https://supabase.com) and get your project URL and anon key from **Project Settings → API**.

2. **Environment variables** — Create `.env.local` in the project root:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Database** — In the Supabase dashboard, open **SQL Editor** and run the migration in `supabase/migrations/20250206000000_restaurant_logs.sql`. This creates the `restaurant_logs` table and Row Level Security so users only see their own logs.

4. **Auth** — Email sign-up is enabled by default. Users can sign up with email/password; Supabase sends a confirmation email unless you disable it in **Authentication → Providers → Email**.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
