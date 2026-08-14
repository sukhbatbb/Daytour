import { db, doc, getDoc, collection, getDocs, query, where, orderBy } from "./firebase-init.js";

/** About page content: { mongoliaIntro, companyStory } stored at siteContent/about */
export async function getAboutContent() {
  try {
    const snap = await getDoc(doc(db, "siteContent", "about"));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error("getAboutContent failed:", err);
    return null;
  }
}

/** FAQ items: { items: [{q,a}, ...] } stored at siteContent/faq */
export async function getFaqItems() {
  try {
    const snap = await getDoc(doc(db, "siteContent", "faq"));
    return snap.exists() ? (snap.data().items || []) : [];
  } catch (err) {
    console.error("getFaqItems failed:", err);
    return [];
  }
}

/** Destinations collection — each doc: { title, description, image, slug, featured, order, published } */
export async function listDestinations({ includeUnpublished = false } = {}) {
  try {
    const col = collection(db, "destinations");
    const q = includeUnpublished ? col : query(col, where("published", "==", true));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return items;
  } catch (err) {
    console.error("listDestinations failed:", err);
    return [];
  }
}

export async function getDestinationBySlug(slug) {
  try {
    const snap = await getDocs(query(collection(db, "destinations"), where("slug", "==", slug), where("published", "==", true)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  } catch (err) {
    console.error("getDestinationBySlug failed:", err);
    return null;
  }
}

/** Testimonials collection — each doc: { name, quote, trip, order, published } */
export async function listTestimonials({ includeUnpublished = false } = {}) {
  try {
    const col = collection(db, "testimonials");
    const q = includeUnpublished ? col : query(col, where("published", "==", true));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return items;
  } catch (err) {
    console.error("listTestimonials failed:", err);
    return [];
  }
}
