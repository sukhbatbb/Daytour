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

export function emptyStateHTML(msg) {
  return `<div class="empty-state">${escapeHtml(msg)}</div>`;
}

/**
 * Renders blog-style text: blank lines start a new paragraph, and a line
 * containing only [image:URL] renders as an inline photo instead of text.
 */
export function richTextHTML(text = "") {
  return text
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const imgMatch = block.match(/^\[image:\s*(\S+)\s*\]$/i);
      return imgMatch
        ? `<img src="${escapeHtml(imgMatch[1])}" alt="" loading="lazy" style="width:100%; border-radius:var(--radius-sm); margin:.4em 0;">`
        : `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}
