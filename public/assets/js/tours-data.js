import { db, collection, doc, getDoc, getDocs, query, where, orderBy } from "./firebase-init.js";

const COLLECTION = "tours";

/**
 * Get all published tours, optionally filtered by category ('day' | 'multi').
 * Falls back gracefully to an empty array if Firestore isn't reachable yet
 * (e.g. before firebase-config.js has real keys), so pages don't hard-crash.
 */
export async function listTours({ category = null, includeUnpublished = false } = {}) {
  try {
    const col = collection(db, COLLECTION);
    let q = col;
    const clauses = [];
    if (category) clauses.push(where("category", "==", category));
    if (!includeUnpublished) clauses.push(where("published", "==", true));
    if (clauses.length) q = query(col, ...clauses);
    const snap = await getDocs(q);
    const tours = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    tours.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return tours;
  } catch (err) {
    console.error("listTours failed — check firebase-config.js keys and Firestore rules:", err);
    return [];
  }
}

export async function getTourBySlug(slug) {
  try {
    const snap = await getDocs(query(collection(db, COLLECTION), where("slug", "==", slug)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  } catch (err) {
    console.error("getTourBySlug failed:", err);
    return null;
  }
}

export async function getTourById(id) {
  try {
    const d = await getDoc(doc(db, COLLECTION, id));
    return d.exists() ? { id: d.id, ...d.data() } : null;
  } catch (err) {
    console.error("getTourById failed:", err);
    return null;
  }
}
