# Mongol.Tours

Static site (vanilla HTML/CSS/JS, no build step) + Firestore for tour data +
a password-gated admin panel to edit tours + a Netlify Function for the
contact form. Same stack pattern as your other sites.

## What's here

```
public/               ← this whole folder is what deploys to Netlify
  index.html           Home
  tours.html            Tours listing (Day / Multi-Day tabs)
  tour.html              Shared tour detail template (?slug=...)
  destinations.html    Destinations hub incl. Mongol Culture Park
  about.html            Placeholder — needs real copy
  faq.html               Placeholder — needs real copy
  contact.html          Working contact form → Netlify Function → email
  admin/index.html    Login-gated tour editor
  assets/css/style.css
  assets/js/            firebase-init.js, tours-data.js, render.js
netlify/functions/contact.js   Sends form submissions via Resend
data/tours-seed.json           All 10 tours from your content doc, structured
scripts/seed.js                 One-time script to load tours-seed.json into Firestore
netlify.toml
```

## 1. Create the Firebase project

1. https://console.firebase.google.com → Add project → name it (e.g. `mongol-tours`).
2. Build → Firestore Database → Create database → production mode → pick a region.
3. Build → Authentication → Sign-in method → enable **Email/Password**.
4. Authentication → Users → Add user → this is your admin login (your email + a password).
5. Project settings (gear icon) → General → scroll to "Your apps" → Add app → Web (</>) →
   register it → copy the `firebaseConfig` object it gives you.
6. Paste those values into `public/assets/js/firebase-config.js`.

## 2. Firestore security rules

Firestore Database → Rules → replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tours/{tourId} {
      allow read: if resource.data.published == true;
      allow read, write: if request.auth != null;
    }
    match /destinations/{id} {
      allow read: if resource.data.published == true;
      allow read, write: if request.auth != null;
    }
    match /testimonials/{id} {
      allow read: if resource.data.published == true;
      allow read, write: if request.auth != null;
    }
    match /siteContent/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

This lets anyone read published tours/destinations/testimonials (for the
public site) and the About/FAQ content (always public), but only your
logged-in admin account can read drafts or write/edit/delete anything.

## 3. Seed the 10 tours

```
npm install
```

Then get a service account key: Project settings → Service accounts →
Generate new private key → save the downloaded file as `scripts/service-account.json`
(this file is already gitignored — never commit it).

```
npm run seed
```

This loads all 10 tours from `data/tours-seed.json` into Firestore. Every
`[TO FILL]` placeholder from your content doc is preserved as literal text
in the relevant fields — edit those in `/admin` once you have the real
numbers, or edit `data/tours-seed.json` and re-run `npm run seed`.

## 4. Image uploads from the admin panel

Photos uploaded from `/admin` go straight to a GitHub repo (your usual
image-storage pattern) via a Netlify Function — no manual URL copying.

1. Pick (or create) a GitHub repo to hold tour images — can be this same
   repo or a separate one, like your other projects.
2. GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate
   new token → scope it to just that repo → permission **Contents: Read and
   write**.
3. In Netlify → Site settings → Environment variables, add:
   - `GITHUB_TOKEN` — the token from step 2
   - `GITHUB_REPO` — `yourusername/your-repo-name`
   - `GITHUB_BRANCH` — optional, defaults to `main`
   - `GITHUB_IMAGE_PATH` — optional, defaults to `images/tours`
4. Redeploy the site so the function picks up the new env vars.

In `/admin`, the hero image field now has a file picker + Upload button —
it resizes/compresses the photo client-side, uploads it via the function,
and fills in the URL automatically. You can still paste a URL manually if
the image is already hosted elsewhere.

## 5. Contact form (Resend)

You already use Resend elsewhere, so this reuses that pattern. In Netlify →
Site settings → Environment variables, add:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL` — where enquiries should land
- `CONTACT_FROM_EMAIL` — e.g. `Mongol.Tours <hello@yourdomain.com>` (must be a
  verified domain in Resend, or use `onboarding@resend.dev` for testing)

## 6. Deploy

Push this folder to a GitHub repo, then in Netlify: Add new site → Import
from Git → pick the repo. Netlify will read `netlify.toml` automatically
(publish dir `public`, functions dir `netlify/functions`). No build command
needed — it's all static files.

## 7. Using the admin panel

Go to `yoursite.com/admin`, sign in with the email/password you created in
step 1.4. The admin has four sections, switchable via the tabs at the top:

- **Tours** — edit any of the 10 seeded tours, create new ones, toggle
  Draft/Published, delete. Same as before.
- **Destinations** — add/edit the regions shown on the Destinations page.
  Mark one as "Featured" (use slug `mongol-culture-park` to match the page
  anchor) to give it the large spotlight layout; the rest render as cards.
  Each supports photo upload the same way tours do.
- **Testimonials** — add/edit traveler quotes shown on the homepage. Each
  row has Name, Trip (optional), Quote, and a Published toggle.
- **About & FAQ** — two free-text fields for the About page (Mongolia intro
  and company story — blank lines start a new paragraph), plus a FAQ list
  shared by the FAQ page.

All three of these were placeholder/"[TO FILL]" sections before — they're
now empty until you fill them in from `/admin`, and the public pages show a
quiet "not added yet" message until you do.

## Still needed from you

- Real tour photos → upload straight from `/admin` (Tours or Destinations
  section), no manual URL copying needed
- Copy for About, FAQ, Destinations, and Testimonials — all editable from
  `/admin` now, just empty until filled in
- All the `[TO FILL]` fields per tour: pickup times, single-supplement
  amounts, dietary/alcohol confirmation at the MCP restaurant, fitness/age
  requirements for the two Strenuous tours
