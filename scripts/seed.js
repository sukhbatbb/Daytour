// One-time script: pushes data/tours-seed.json into your Firestore "tours" collection.
//
// Setup:
//   1. npm install firebase-admin
//   2. In Firebase Console → Project settings → Service accounts → Generate new private key.
//      Save the downloaded file as scripts/service-account.json (do NOT commit this file).
//   3. Run: node scripts/seed.js
//
// Safe to re-run — it uses each tour's slug as the document ID, so re-running
// overwrites the same 10 documents rather than duplicating them.

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = path.join(__dirname, "service-account.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("Missing scripts/service-account.json — see the comment at the top of this file.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();
const tours = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/tours-seed.json"), "utf8"));

async function run() {
  const batch = db.batch();
  tours.forEach(tour => {
    const ref = db.collection("tours").doc(tour.slug);
    batch.set(ref, tour, { merge: true });
  });
  await batch.commit();
  console.log(`Seeded ${tours.length} tours into Firestore.`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
