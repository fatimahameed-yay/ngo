# Omer-e-Rawan Foundation website

Static website. It doesn't need a build step, a database or WordPress.

## Preview locally

```
python -m http.server 8000
```

Then open http://localhost:8000. The links are root-relative (`/about-us/`), so the site needs to be served by a web server. Opening the files directly from disk won't work.

## Deploy on Vercel (recommended)

The site is ready for Vercel as-is. There is no build step.

1. Push this folder to a GitHub repository (or run `npx vercel` from this folder).
2. In Vercel, choose **Add New → Project** and import the repository.
3. Set **Framework Preset** to **Other**. Leave the Build Command empty and the Output Directory as the project root.
4. Deploy, then add `omererawan.org` under **Settings → Domains**. Set `www.omererawan.org` to redirect to it.

`vercel.json` already handles:
- clean URLs with trailing slashes, matching the old WordPress URLs (`/about-us/`, `/donate-now/` and so on), so existing Google rankings carry over
- 301 redirects from the old `/cmsms_doctor/...` profile links, the old PDF links and the WordPress feed URLs
- long-term caching for CSS, JS and images, plus security headers (HSTS, nosniff, frame protection)
- the custom `404.html` page, which Vercel serves automatically

After going live, submit `https://omererawan.org/sitemap.xml` in Google Search Console.

`.htaccess` is only for Apache/cPanel hosting and is excluded from Vercel deployments by `.vercelignore`.

## Structure

```
index.html              Home
about-us/               About, mission & vision, board, timeline
team/<name>/            Individual board member profiles
our-projects/           Programmes
events/                 Events (upcoming + 2026 USA tour)
previous-events/        Filterable photo gallery
partners/  publications/  career/  contact-us/  donate-now/
assets/css/style.css    All styles (brand colours are at the top as CSS variables)
assets/js/main.js       Menu, counters, gallery filters, lightbox, copy buttons, forms
assets/img/             Optimised WebP images (plus *-800.webp mobile versions)
assets/docs/            Newsletter, audited accounts, case study (PDF)
```

## Forms

The Contact and Donor Information forms currently open the visitor's email app with the message pre-filled, addressed to `ayema@omererawan.org`. To receive submissions directly instead, add an `action="https://..."` endpoint (for example Formspree or your own backend) and `method="post"` to the `<form>` tag. The script will then submit the form normally.
