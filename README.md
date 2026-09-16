# My Munch

A social platform where people can share food recipes.

Built with [Next.js](https://nextjs.org) (bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)) and [Supabase](https://supabase.com) auth (email magic link sign-in).

## Supabase auth setup

Email sign-in uses Supabase's built-in Email provider, which is enabled by default — no Google Cloud Console or third-party OAuth setup required.

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project (free tier is fine), or use an existing one.
2. In the dashboard, go to **Project Settings → API** and copy the **Project URL** and **Publishable (anon) key**.
3. Paste them into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
   ```
4. In the Supabase dashboard, go to **Authentication → URL Configuration** and set the **Site URL** to `http://localhost:3000` for local dev (add your production domain later, and add `http://localhost:3000/**` / your production `/**` to **Redirect URLs**).

Once that's done, `npm run dev` and visiting `/login` will let you request a sign-in link by email — clicking the emailed link redirects to `/dashboard`.

### Adding Google sign-in later
If you want a "Continue with Google" button too, Supabase supports enabling it as an additional provider under **Authentication → Sign In / Providers → Google** once you've created a Google OAuth client in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Ask and I'll wire it back in alongside email.

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
