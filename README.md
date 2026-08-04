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
  }
}
```

This lets anyone read published tours (for the public site), but only your
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

## 4. Contact form (Resend)

You already use Resend elsewhere, so this reuses that pattern. In Netlify →
Site settings → Environment variables, add:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL` — where enquiries should land
- `CONTACT_FROM_EMAIL` — e.g. `Mongol.Tours <hello@yourdomain.com>` (must be a
  verified domain in Resend, or use `onboarding@resend.dev` for testing)

## 5. Deploy

Push this folder to a GitHub repo, then in Netlify: Add new site → Import
from Git → pick the repo. Netlify will read `netlify.toml` automatically
(publish dir `public`, functions dir `netlify/functions`). No build command
needed — it's all static files.

## 6. Using the admin panel

Go to `yoursite.com/admin`, sign in with the email/password you created in
step 1.4. From there you can:

- Edit any of the 10 seeded tours (fill in the `[TO FILL]` placeholders as
  you get real numbers)
- Create new tours
- Toggle Draft / Published — drafts never show on the public site
- Delete tours

## Still needed from you

- Real photos → upload to your GitHub image-storage repo (your usual
  pattern) and paste the raw URL into each tour's "Hero image URL" field in
  `/admin`
- Copy for About, FAQ, and Destinations pages (currently placeholder text)
- All the `[TO FILL]` fields per tour: pickup times, single-supplement
  amounts, dietary/alcohol confirmation at the MCP restaurant, fitness/age
  requirements for the two Strenuous tours
