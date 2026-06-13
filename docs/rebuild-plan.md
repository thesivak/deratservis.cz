# DERATservis Rebuild Plan

## Goal

Rebuild `deratservis.cz` in this repository as a static, markdown-driven website while preserving the existing landing page design from `thesivak/deratservis` as closely as possible.

The new site must:

- Match the current landing page visually, section by section.
- Serve editable landing-page copy, references, services, and blog posts from markdown files committed to GitHub.
- Publish new blog posts by merging new markdown files into the repository.
- Have no admin area, no database-backed content editing, and no traditional PHP/Laravel runtime.
- Preserve or improve SEO for local pest-control search intent.
- Include a secure inquiry form for customer requests.

## Agent Execution Contract

A future implementation agent should treat this document as the execution contract for the rebuild. Do not replace the visual design with a new design system. The existing Laravel/Blade site is the design source of truth.

Before coding, the agent must:

- Clone or inspect `https://github.com/thesivak/deratservis`.
- Identify all Blade components used by `resources/views/home.blade.php`.
- Inspect the current assets under `public/`.
- Inspect `routes/web.php`, blog routes, inquiry routes, and export/admin routes.
- Inspect models and migrations for `LandingPage`, `Reference`, `Service`, `BlogPost`, and `Inquiry`.
- Capture or generate screenshots of the old homepage at desktop and mobile widths if the old app can be run.

Definition of done:

- The Astro site builds from a clean checkout.
- The homepage is visually matched against the old landing page.
- Markdown/frontmatter controls all intended editable content.
- References, services, and blog posts publish from markdown files.
- Inquiry form works through Cloudflare Pages Functions and Resend.
- The old admin/export/database model is intentionally removed.
- SEO, security headers, sitemap, robots, and structured data are implemented.
- Cloudflare Pages deployment configuration is documented and ready.

## Recommended Stack

- Framework: Astro
- Styling: Tailwind CSS
- Content: Astro Content Collections with Markdown or MDX
- Language: TypeScript
- Hosting: Cloudflare Pages
- Contact form runtime: Cloudflare Pages Functions
- Bot protection: Cloudflare Turnstile
- Email delivery: Resend
- Deployment trigger: GitHub merge to the production branch

Astro is the best fit because this is primarily a static local-business and content site. It supports markdown natively, renders static HTML, keeps client JavaScript minimal, and maps well from the current Blade component structure.

## Source Site

The existing GitHub project is a Laravel application using:

- Blade views and Blade components for the landing page.
- Vite, Tailwind CSS, Alpine.js, and Gumshoe for frontend behavior.
- Database-backed landing-page content through a `LandingPage` model.
- Database-backed references through a `Reference` model.
- Database-backed blog posts through a `BlogPost` model.
- Database-backed inquiries through an `Inquiry` model.
- Admin/export features for inquiries and landing-page management.
- A server-side inquiry form protected by Laravel honeypot middleware.

The rebuild should use the existing rendered design, Blade component structure, Tailwind classes, JavaScript behavior, and public assets as the migration source of truth.

Current homepage composition:

- Hero
- About
- References
- Latest blog preview
- Contact form

## Content Model

All editable website content should live in markdown files under `src/content`.

Suggested structure:

```txt
src/
  content/
    pages/
      home.md
    services/
      deratizace.md
      dezinfekce.md
      dezinsekce.md
    references/
      example-reference.md
    blog/
      example-post.md
```

Landing-page content should use structured frontmatter instead of fully free-form markdown. This keeps the design tightly controlled while still allowing copy changes through GitHub.

Example `src/content/pages/home.md`:

```md
---
seo:
  title: "DERATservis | Profesionální deratizace v Olomouckém kraji"
  description: "..."
hero:
  headline: "..."
  subheadline: "..."
  primaryCta: "..."
  secondaryCta: "..."
about:
  title: "..."
  subtitle: "..."
  body: "..."
references:
  heading: "..."
blogPreview:
  heading: "..."
contact:
  heading: "..."
  description: "..."
---
```

Example reference:

```md
---
title: "Bytový dům v Olomouci"
location: "Olomouc"
service: "Deratizace"
sortOrder: 10
image: "/images/references/bytovy-dum-olomouc.jpg"
imageAlt: "Deratizace bytového domu v Olomouci"
---

Krátký popis realizace nebo reference.
```

Example blog post:

```md
---
title: "Jak poznat výskyt hlodavců v domě"
slug: "jak-poznat-vyskyt-hlodavcu-v-dome"
excerpt: "Praktické příznaky, kterých si všimnout před objednáním deratizace."
publishedAt: 2026-06-13
updatedAt: 2026-06-13
featuredImage: "/images/blog/hlodavci-v-dome.jpg"
featuredImageAlt: "Stopy hlodavců v domě"
category: "Deratizace"
tags:
  - deratizace
  - hlodavci
  - prevence
seo:
  title: "Jak poznat výskyt hlodavců v domě | DERATservis"
  description: "..."
---

Obsah článku...
```

## Proposed Project Structure

```txt
src/
  components/
    Navbar.astro
    Hero.astro
    About.astro
    References.astro
    BlogPreview.astro
    BlogCard.astro
    ContactForm.astro
    Footer.astro
    Seo.astro
    JsonLd.astro

  content/
    config.ts
    pages/
      home.md
    services/
    references/
    blog/

  layouts/
    BaseLayout.astro
    BlogLayout.astro

  pages/
    index.astro
    blog/
      index.astro
      [slug].astro
    api/
      contact.ts

public/
  images/
  favicon.ico
  robots.txt
```

## SEO Requirements

The rebuilt site must be statically rendered and crawlable without JavaScript.

Required SEO features:

- Static HTML for homepage, blog index, blog posts, and any service pages.
- Unique title and meta description per page.
- Canonical URL per page.
- Open Graph metadata.
- Twitter/X card metadata.
- Generated `sitemap.xml`.
- `robots.txt`.
- `<html lang="cs">`.
- Proper heading hierarchy with one logical `h1` per page.
- Blog publish and modified dates from markdown frontmatter.
- JSON-LD structured data:
  - `Organization`
  - `LocalBusiness`
  - `WebSite`
  - `BlogPosting`
  - `Service`
  - `FAQPage` where useful
- Optimized images with explicit dimensions.
- Descriptive image alt text.
- Clean URLs with trailing slashes, for example `/blog/jak-poznat-vyskyt-hlodavcu-v-dome/`.
- Local SEO copy for served areas, especially Olomouc and the Olomoucký kraj if those remain target locations.
- Internal links from service sections to relevant blog posts.
- No client-side-only rendering for important content.

## Hosting Plan

Host the site on Cloudflare Pages.

Reasons:

- Very low cost for a static business website.
- Global CDN included.
- GitHub-based deployments.
- Static asset hosting without a traditional server.
- Cloudflare DNS, WAF, and rate limiting can protect the site.
- Pages Functions can handle the inquiry form without introducing a full backend.

Expected initial monthly hosting cost: `0 USD`, excluding the domain name.

## Inquiry Form Plan

The inquiry form should be implemented as a Cloudflare Pages Function, not as a PHP endpoint or exposed client-side email call.

Flow:

1. Visitor submits the inquiry form.
2. Browser sends `POST /api/contact`.
3. Cloudflare Pages Function validates the request.
4. Function verifies the Cloudflare Turnstile token.
5. Function rate-limits or rejects suspicious submissions.
6. Function sends a notification email through Resend.
7. Function returns a generic success or failure response.

The Resend API key must only exist as a Cloudflare environment secret. It must never be exposed in browser JavaScript or committed to Git.

Form validation requirements:

- Required fields: name, email or phone, message.
- Optional fields: service type, location, preferred contact method.
- Reject unexpected fields.
- Enforce maximum lengths on every field.
- Validate email format when email is provided.
- Strip control characters.
- Escape all user-provided values in email templates.
- Do not accept file uploads.
- Include a hidden honeypot field.
- Require Cloudflare Turnstile.
- Return generic errors to users.
- Log minimal operational metadata only.

## Security Requirements

The static rebuild should remove the main risks of the old server model.

Security principles:

- No Laravel/PHP runtime in production.
- No database.
- No admin area or export route.
- No server-side file uploads.
- No writable webroot.
- No SSH-exposed shared hosting surface for the application.
- No secrets in GitHub or client-side bundles.
- Cloudflare Pages environment variables for secrets.
- Cloudflare Turnstile on inquiry form.
- Rate limiting on `POST /api/contact`.
- Strict Content Security Policy where practical.
- Security headers:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Strict-Transport-Security`
- Dependency updates through normal GitHub PR flow.

## Migration Phases

### Phase 1: Baseline Project

- Initialize Astro with TypeScript.
- Add Tailwind CSS.
- Configure formatting and linting.
- Add content collections.
- Add base layout and SEO component.
- Configure static output.
- Add README instructions for local development, content editing, build, and deployment.

### Phase 2: Asset and Design Port

- Copy current public images and favicon assets.
- Port Blade components into Astro components:
  - navbar
  - hero
  - about
  - references
  - blog preview
  - contact form
  - footer
- Preserve Tailwind classes and section ordering.
- Recreate any needed Alpine/Gumshoe behavior with minimal plain JavaScript or Astro islands.
- Verify desktop and mobile screenshots against the old site.

### Phase 3: Markdown Content

- Create `home.md` for editable landing-page copy.
- Create schemas for services, references, and blog posts.
- Convert existing database/seed content into markdown files where source content is available.
- Build blog index and detail pages.
- Add service pages only if useful for SEO and conversion.

### Phase 4: SEO

- Add per-page metadata.
- Generate sitemap.
- Add robots file.
- Add JSON-LD structured data.
- Add canonical URLs.
- Verify heading structure.
- Verify image alt text.
- Run Lighthouse checks.

### Phase 5: Inquiry Form

- Add inquiry form UI matching the old design.
- Add Cloudflare Pages Function at `/api/contact`.
- Add Resend integration.
- Add Turnstile verification.
- Add validation, honeypot, and rate limiting.
- Test spam rejection and successful email delivery.

### Phase 6: Deployment

- Connect GitHub repository to Cloudflare Pages.
- Configure build command and output directory.
- Add environment secrets:
  - `RESEND_API_KEY`
  - `CONTACT_TO_EMAIL`
  - `CONTACT_FROM_EMAIL`
  - `TURNSTILE_SECRET_KEY`
- Configure production domain.
- Enable HTTPS.
- Add security headers.
- Run final production smoke test.

## Verification Checklist

Run these checks before marking the project complete:

- `npm install`
- `npm run build`
- Local preview of the built site.
- Homepage desktop visual check.
- Homepage mobile visual check.
- References render in the intended order.
- Blog index renders.
- Blog detail page renders.
- Latest blog posts appear on homepage when posts exist.
- Sitemap includes homepage and blog pages.
- `robots.txt` is present.
- Page source contains rendered content without requiring JavaScript.
- Page source contains canonical, Open Graph, and JSON-LD metadata.
- Inquiry form rejects missing required fields.
- Inquiry form rejects invalid email when email is provided.
- Inquiry form rejects failed Turnstile verification.
- Inquiry form sends a test email through Resend in a non-production environment.
- No API keys or secrets appear in the built client bundle.
- No admin or export route exists in the final production app.
- Cloudflare environment variables are documented.
- Security headers are configured.

## Acceptance Criteria

The rebuild is complete when:

- Homepage visually matches the old landing page on desktop and mobile.
- All editable homepage copy, references, services, and blog content are controlled by markdown/frontmatter.
- New blog posts can be published by adding a markdown file and merging to GitHub.
- Blog posts render as static pages with correct metadata.
- Sitemap includes homepage and blog pages.
- Inquiry form sends emails through Resend.
- Inquiry form rejects invalid, automated, or Turnstile-failing submissions.
- No Resend or Turnstile secret is visible in client-side code.
- No production database, admin area, or export route exists.
- Lighthouse SEO score is high, with any remaining issues documented.
- Cloudflare Pages production deployment works from a clean GitHub merge.

## Open Decisions

- Confirm the final production domain and canonical host.
- Confirm recipient email address for inquiries.
- Confirm sender domain to verify in Resend.
- Decide whether blog URLs should stay `/blog/{slug}/` or use Czech paths such as `/clanky/{slug}/`.
- Decide whether dedicated service pages are required.
- Decide whether inquiry submissions should only be emailed or also stored somewhere external.
