# Cloudflare Pages deployment

## Build settings

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: the repository branch used for production deploys
- Node version: 20 or newer

## Required environment variables

- `RESEND_API_KEY`: Resend API key used by `functions/api/contact.ts`
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key
- `PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key rendered in the static form
- `CONTACT_TO_EMAIL`: Optional recipient override, defaults to `info@deratservis.cz`
- `CONTACT_FROM_EMAIL`: Optional verified sender, defaults to `DERATservis <web@deratservis.cz>`

## Turnstile

Set both `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Cloudflare Pages. The widget is hidden during local builds unless a public site key is configured.

## Content publishing

Blog posts, services, references, and homepage copy are edited through markdown files in `src/content`. A new blog post is published by merging a new markdown file into `src/content/blog`.
