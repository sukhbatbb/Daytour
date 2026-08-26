export function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function formatPrice(n) {
  if (n === null || n === undefined) return "Price on request";
  return `From $${Number(n).toLocaleString("en-US")}`;
}

export function tourCardHTML(tour) {
  const img = tour.heroImage
    ? `<img src="${escapeHtml(tour.heroImage)}" alt="${escapeHtml(tour.title)}">`
    : "";
  const tag = tour.category === "day" ? "Day Tour" : "Multi-Day";
  return `
    <article class="tour-card">
      <a class="cover" href="/tour.html?slug=${encodeURIComponent(tour.slug)}" aria-label="${escapeHtml(tour.title)}"></a>
      <div class="media">${img}<span class="tag">${tag} · ${escapeHtml(tour.quickFacts?.duration || "")}</span></div>
      <div class="body">
        <h3>${escapeHtml(tour.title)}</h3>
        <div class="facts">
          <span>${escapeHtml(tour.quickFacts?.difficulty || "")}</span>
          <span>${escapeHtml(tour.quickFacts?.groupSize || "")}</span>
        </div>
        <p class="muted" style="font-size:.92rem;">${escapeHtml((tour.overview || "").slice(0, 110))}${(tour.overview || "").length > 110 ? "…" : ""}</p>
        <div class="price">${formatPrice(tour.quickFacts?.priceFrom)}</div>
      </div>
    </article>
  `;
}

function plainSnippet(text = "", len = 110) {
  const plain = text.replace(/\s+/g, " ").trim();
  return plain.length > len ? plain.slice(0, len) + "…" : plain;
}

/** A destination's photos as one ordered array — photos[0] is always the cover.
 *  Falls back to the older separate image/gallery fields for docs saved before
 *  they were merged into a single list. */
export function destinationPhotos(d) {
  if (Array.isArray(d.photos) && d.photos.length) return d.photos;
  return [d.image, ...(d.gallery || [])].filter(Boolean);
}

export function destinationCardHTML(d) {
  const photos = destinationPhotos(d);
  const img = photos[0]
    ? `<img src="${escapeHtml(photos[0])}" alt="${escapeHtml(d.title)}">`
    : "";
  const summary = d.summary || plainSnippet(d.description || "");
  return `
    <article class="tour-card">
      <a class="cover" href="/destination.html?slug=${encodeURIComponent(d.slug)}" aria-label="${escapeHtml(d.title)}"></a>
      <div class="media">${img}</div>
      <div class="body">
        <h3>${escapeHtml(d.title)}</h3>
        <p class="muted" style="font-size:.92rem;">${escapeHtml(summary)}</p>
      </div>
    </article>
  `;
}

export function emptyStateHTML(msg) {
  return `<div class="empty-state">${escapeHtml(msg)}</div>`;
}

/** Renders blog-style text: blank lines start a new paragraph. */
export function richTextHTML(text = "") {
  return text
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** Renders a TripAdvisor-style photo header: one big cover photo plus up to
 *  two smaller photos beside it, with a "+N" badge if there are more. */
export function destinationPhotosHeaderHTML(photos, alt) {
  if (!photos.length) return "";
  if (photos.length === 1) {
    return `<div class="dest-photos one"><img src="${escapeHtml(photos[0])}" alt="${escapeHtml(alt)}" loading="lazy" class="lightbox-trigger" data-lightbox="${escapeHtml(photos[0])}"></div>`;
  }
  const side = photos.slice(1, 3);
  const extra = photos.length - 3;
  return `
    <div class="dest-photos">
      <img class="main lightbox-trigger" src="${escapeHtml(photos[0])}" alt="${escapeHtml(alt)}" loading="lazy" data-lightbox="${escapeHtml(photos[0])}">
      <div class="side">
        ${side.map((url, i) => `
          <div class="side-photo">
            <img class="lightbox-trigger" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" data-lightbox="${escapeHtml(url)}">
            ${i === side.length - 1 && extra > 0 ? `<span class="more-badge">+${extra}</span>` : ""}
          </div>`).join("")}
      </div>
    </div>`;
}
