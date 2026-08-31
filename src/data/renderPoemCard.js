// renderPoemCard.js
// Génère la carte-poème en SVG, dans l'identité visuelle Alex Harper
// (fond sombre, Cormorant Garamond, or #c8a96e). Utilisé côté navigateur
// (aperçu live) ET côté serveur (génération PDF finale).

const GOLD = "#c8a96e";
const GOLD_SOFT = "#8a7550";
const INK = "#f1efe8";
const INK_MUTED = "#b8b3a6";
const BG = "#161412";

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Découpe le texte du poème en lignes qui tiennent dans `maxCharsPerLine`
// caractères (approximation raisonnable pour une police serif à taille fixe,
// sans avoir besoin de mesurer le rendu réel). Les strophes (lignes vides
// dans le texte d'origine) sont préservées.
function wrapPoemText(text, maxCharsPerLine = 42) {
  const rawLines = String(text || "").split("\n");
  const wrapped = [];
  for (const rawLine of rawLines) {
    if (rawLine.trim() === "") {
      wrapped.push(""); // préserve les sauts de strophe
      continue;
    }
    const words = rawLine.split(/\s+/);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxCharsPerLine && current) {
        wrapped.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) wrapped.push(current);
  }
  return wrapped;
}

/**
 * Génère la carte SVG complète d'un poème personnalisé.
 * @param {object} content
 * @param {string} content.title - titre du poème
 * @param {string} content.text - texte complet du poème (avec \n)
 * @param {string} content.recipient - destinataire(s) ("Julie & Marc", "petit Léo", etc.)
 * @param {string} content.date - date ISO (YYYY-MM-DD)
 * @param {string} [content.dedication] - courte dédicace optionnelle
 * @returns {string} SVG complet, viewBox 420x594 (A4 portrait)
 */
export function renderPoemCard(content) {
  const title = content.title || "";
  const text = content.text || "";
  const recipient = content.recipient || "Votre prénom";
  const date = content.date || "";
  const dedication = content.dedication || "";

  const lines = wrapPoemText(text, 40);
  // Zone de texte disponible entre le titre et le pied de page.
  const lineHeight = 20;
  const startY = 210;
  const maxLines = 16; // au-delà, le texte serait tronqué visuellement — signalé au client en amont
  const visibleLines = lines.slice(0, maxLines);

  const poemLinesSvg = visibleLines
    .map((line, i) =>
      line === ""
        ? ""
        : `<text x="210" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="15" fill="${INK}">${escapeXml(line)}</text>`
    )
    .join("\n");

  const dedicationSvg = dedication
    ? `<text x="210" y="${startY + visibleLines.length * lineHeight + 30}" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-size="13" fill="${INK_MUTED}">« ${escapeXml(dedication)} »</text>`
    : "";

  return `<svg viewBox="0 0 420 594" xmlns="http://www.w3.org/2000/svg" role="img">
<title>${escapeXml(title)}</title>
<rect x="0" y="0" width="420" height="594" fill="${BG}"/>
<rect x="18" y="18" width="384" height="558" fill="none" stroke="${GOLD}" stroke-width="1"/>
<rect x="24" y="24" width="372" height="546" fill="none" stroke="${GOLD_SOFT}" stroke-width="0.5"/>
<line x1="160" y1="70" x2="260" y2="70" stroke="${GOLD}" stroke-width="1"/>
<text x="210" y="120" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="24" font-weight="500" fill="${GOLD}" letter-spacing="1">${escapeXml(title)}</text>
<text x="210" y="150" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-size="14" fill="${INK_MUTED}">pour ${escapeXml(recipient)}</text>
<line x1="160" y1="172" x2="260" y2="172" stroke="${GOLD_SOFT}" stroke-width="0.5"/>
${poemLinesSvg}
${dedicationSvg}
<text x="210" y="540" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="12" fill="${INK_MUTED}">${escapeXml(formatDate(date))}</text>
<line x1="180" y1="558" x2="240" y2="558" stroke="${GOLD_SOFT}" stroke-width="0.5"/>
<text x="210" y="575" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="11" letter-spacing="2" fill="${GOLD_SOFT}">ALEX HARPER</text>
</svg>`;
}

// Signale si le poème, une fois découpé en lignes, dépasse ce que la carte
// peut afficher proprement — utile pour prévenir avant achat plutôt qu'après.
export function poemExceedsCardSpace(text, maxLines = 16) {
  return wrapPoemText(text, 40).length > maxLines;
}
