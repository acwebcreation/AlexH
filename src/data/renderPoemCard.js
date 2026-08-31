// renderPoemCard.js
// Génère la carte-poème en SVG, format 5x7 pouces (carte à imprimer), dans
// l'identité visuelle Alex Harper (Cormorant Garamond, accents or #c8a96e),
// déclinée en deux thèmes au choix du client : sombre et clair.
// Utilisé côté navigateur (aperçu live) ET côté serveur (génération PDF).
//
// Le viewBox utilise 1 unité = 1 point = 1/72 pouce, ce qui correspond
// exactement à la taille du PDF généré (5in x 7in = 360pt x 504pt) —
// aucune conversion d'échelle nécessaire entre l'aperçu et l'impression.

export const CARD_WIDTH_PT = 360;  // 5 pouces
export const CARD_HEIGHT_PT = 504; // 7 pouces

const THEMES = {
  dark: {
    bg: "#161412",
    gold: "#c8a96e",
    goldSoft: "#8a7550",
    ink: "#f1efe8",
    inkMuted: "#b8b3a6",
  },
  light: {
    bg: "#FBF8F2",
    gold: "#a8823f",
    goldSoft: "#c9ab78",
    ink: "#2b2419",
    inkMuted: "#7a7263",
  },
};

export const THEME_IDS = Object.keys(THEMES);
export const THEME_LABELS = { dark: "Foncé", light: "Clair" };

// --- Repères de mise en page (en points, cohérents avec CARD_WIDTH/HEIGHT) ---
const OUTER_MARGIN = 12;
const INNER_MARGIN = 18;
const FLOWER_Y = 30;       // petit ornement floral tout en haut
const TITLE_Y = 62;
const DIVIDER1_Y = 78;
const RECIPIENT_Y = 92;    // centré entre DIVIDER1_Y et DIVIDER2_Y
const DIVIDER2_Y = 106;
const POEM_ZONE_TOP = 124; // début de la zone où le poème peut être centré
const LINE_HEIGHT = 14;
const DEDICATION_GAP = 22; // espace entre la dernière ligne du poème et la dédicace
const DEDICATION_HEIGHT = 16; // hauteur réservée à la ligne de dédicace elle-même
// Le pied de page (date, ligne, signature) est ancré près du bas ; le poème
// et la dédicace ne doivent jamais dépasser cette limite, avec une marge de
// sécurité pour qu'il n'y ait jamais de chevauchement, quelle que soit la
// longueur du poème.
const CONTENT_BOTTOM_LIMIT = 412;
const FOOTER_DATE_Y = 458;
const FOOTER_LINE_Y = 470;
const FOOTER_BRAND_Y = 482;

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

// Petite fleur ornementale en vectoriel (5 pétales + cœur) — mariage, amour,
// anniversaire de mariage. Vectoriel plutôt qu'une image : reste net à
// n'importe quelle taille et s'adapte automatiquement au thème, sans
// fichier séparé à gérer.
function drawFlower(cx, cy, color, size = 8) {
  const petalRx = size;
  const petalRy = size * 0.5;
  let petals = "";
  for (let i = 0; i < 5; i++) {
    const angle = i * 72;
    petals += `<ellipse cx="${cx}" cy="${cy - size * 0.55}" rx="${petalRx}" ry="${petalRy}" fill="none" stroke="${color}" stroke-width="0.75" transform="rotate(${angle} ${cx} ${cy})"/>`;
  }
  return `${petals}<circle cx="${cx}" cy="${cy}" r="${size * 0.22}" fill="${color}"/>`;
}

// Petite étoile à 5 branches — baptême / naissance.
function drawStar(cx, cy, color, size = 8) {
  const outerR = size;
  const innerR = size * 0.42;
  let points = "";
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return `<path d="${points}Z" fill="none" stroke="${color}" stroke-width="0.85"/>`;
}

// Petite flamme de bougie stylisée — deuil, sobre et apaisante.
function drawFlame(cx, cy, color, size = 8) {
  const w = size * 0.55;
  const h = size * 1.15;
  const path = `M ${cx},${cy - h * 0.55}
    C ${cx + w},${cy - h * 0.1} ${cx + w * 0.55},${cy + h * 0.55} ${cx},${cy + h * 0.6}
    C ${cx - w * 0.55},${cy + h * 0.55} ${cx - w},${cy - h * 0.1} ${cx},${cy - h * 0.55}
    Z`;
  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="0.85"/><line x1="${cx}" y1="${cy + h * 0.6}" x2="${cx}" y2="${cy + h * 0.95}" stroke="${color}" stroke-width="0.85"/>`;
}

// Petit rameau de laurier — remerciements, départ à la retraite.
function drawLaurel(cx, cy, color, size = 9) {
  let leaves = "";
  const leafCount = 3;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < leafCount; i++) {
      const t = (i + 1) / (leafCount + 0.5);
      const lx = cx + side * t * size;
      const ly = cy + t * size * 0.35;
      const rot = side * (25 + i * 12);
      leaves += `<ellipse cx="${lx.toFixed(2)}" cy="${ly.toFixed(2)}" rx="${(size * 0.32).toFixed(2)}" ry="${(size * 0.14).toFixed(2)}" fill="none" stroke="${color}" stroke-width="0.75" transform="rotate(${rot} ${lx.toFixed(2)} ${ly.toFixed(2)})"/>`;
    }
  }
  return `<path d="M ${cx - size},${cy + size * 0.35} Q ${cx},${cy - size * 0.15} ${cx + size},${cy + size * 0.35}" fill="none" stroke="${color}" stroke-width="0.6"/>${leaves}`;
}

// Correspondance catégorie → ornement, choisie pour son sens plutôt que pour
// distinguer un genre : chaque occasion a son motif, valable pour tous.
const CATEGORY_ORNAMENTS = {
  "mariage": "flower",
  "amour": "flower",
  "anniversaire-mariage": "flower",
  "bapteme-naissance": "star",
  "deuil": "flame",
  "remerciements": "laurel",
  "depart-retraite": "laurel",
};

function drawOrnament(categoryId, cx, cy, color) {
  const kind = CATEGORY_ORNAMENTS[categoryId] || "flower";
  if (kind === "star") return drawStar(cx, cy, color);
  if (kind === "flame") return drawFlame(cx, cy, color);
  if (kind === "laurel") return drawLaurel(cx, cy, color);
  return drawFlower(cx, cy, color);
}

// Découpe le texte du poème en lignes qui tiennent dans `maxCharsPerLine`
// caractères (approximation raisonnable pour une police serif à taille fixe).
// Les strophes (lignes vides dans le texte d'origine) sont préservées.
function wrapPoemText(text, maxCharsPerLine = 34) {
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

// Calcule combien de lignes de poème tiennent réellement dans l'espace
// disponible, en réservant l'espace nécessaire à la dédicace (si présente)
// et en respectant toujours la limite avant le pied de page. C'est LA
// fonction utilisée à la fois pour le rendu et pour la détection de
// dépassement — les deux ne peuvent donc jamais se désynchroniser.
function computeMaxLines(hasDedication) {
  const reserved = hasDedication ? DEDICATION_GAP + DEDICATION_HEIGHT : 0;
  const available = CONTENT_BOTTOM_LIMIT - POEM_ZONE_TOP - reserved;
  return Math.max(1, Math.floor(available / LINE_HEIGHT));
}

/**
 * Génère la carte SVG complète d'un poème personnalisé.
 * @param {object} content
 * @param {string} content.title - titre du poème
 * @param {string} content.text - texte complet du poème (avec \n)
 * @param {string} content.recipient - destinataire(s) ("Julie & Marc", "petit Léo", etc.)
 * @param {string} content.date - date ISO (YYYY-MM-DD)
 * @param {string} [content.dedication] - courte dédicace optionnelle
 * @param {string} [content.categoryId] - catégorie du poème, détermine l'ornement (fleur/étoile/flamme/laurier)
 * @param {"dark"|"light"} [theme="dark"] - thème visuel choisi par le client
 * @returns {string} SVG complet, viewBox 360x504 (5x7 pouces, 1 unité = 1pt)
 */
export function renderPoemCard(content, theme = "dark") {
  const t = THEMES[theme] || THEMES.dark;
  const title = content.title || "";
  const text = content.text || "";
  const recipient = content.recipient || "Votre prénom";
  const date = content.date || "";
  const dedication = content.dedication || "";
  const categoryId = content.categoryId || "";

  const hasDedication = Boolean(dedication);
  const maxLines = computeMaxLines(hasDedication);
  const lines = wrapPoemText(text, 34);
  const visibleLines = lines.slice(0, maxLines);

  // Centre le bloc poème (+ dédicace, comme un tout) dans la zone disponible,
  // au lieu de le coller systématiquement en haut — un poème court se
  // retrouve donc visuellement centré, un poème proche de la limite occupe
  // naturellement toute la zone sans jamais déborder.
  const poemBlockHeight = visibleLines.length * LINE_HEIGHT;
  const totalBlockHeight = poemBlockHeight + (hasDedication ? DEDICATION_GAP + DEDICATION_HEIGHT : 0);
  const zoneHeight = CONTENT_BOTTOM_LIMIT - POEM_ZONE_TOP;
  const blockStartY = POEM_ZONE_TOP + Math.max(0, (zoneHeight - totalBlockHeight) / 2);

  const poemLinesSvg = visibleLines
    .map((line, i) =>
      line === ""
        ? ""
        : `<text x="${CARD_WIDTH_PT / 2}" y="${blockStartY + i * LINE_HEIGHT}" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="12.5" fill="${t.ink}">${escapeXml(line)}</text>`
    )
    .join("\n");

  const dedicationY = blockStartY + poemBlockHeight + DEDICATION_GAP;
  const dedicationSvg = hasDedication
    ? `<text x="${CARD_WIDTH_PT / 2}" y="${dedicationY}" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-size="11" fill="${t.inkMuted}">« ${escapeXml(dedication)} »</text>`
    : "";

  const cx = CARD_WIDTH_PT / 2;
  const outerX = OUTER_MARGIN;
  const outerW = CARD_WIDTH_PT - OUTER_MARGIN * 2;
  const outerH = CARD_HEIGHT_PT - OUTER_MARGIN * 2;
  const innerX = INNER_MARGIN;
  const innerW = CARD_WIDTH_PT - INNER_MARGIN * 2;
  const innerH = CARD_HEIGHT_PT - INNER_MARGIN * 2;

  return `<svg viewBox="0 0 ${CARD_WIDTH_PT} ${CARD_HEIGHT_PT}" xmlns="http://www.w3.org/2000/svg" role="img">
<title>${escapeXml(title)}</title>
<rect x="0" y="0" width="${CARD_WIDTH_PT}" height="${CARD_HEIGHT_PT}" fill="${t.bg}"/>
<rect x="${outerX}" y="${outerX}" width="${outerW}" height="${outerH}" fill="none" stroke="${t.gold}" stroke-width="1"/>
<rect x="${innerX}" y="${innerX}" width="${innerW}" height="${innerH}" fill="none" stroke="${t.goldSoft}" stroke-width="0.5"/>
${drawOrnament(categoryId, cx, FLOWER_Y, t.gold)}
<text x="${cx}" y="${TITLE_Y}" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="19" font-weight="500" fill="${t.gold}" letter-spacing="0.5">${escapeXml(title)}</text>
<line x1="${cx - 45}" y1="${DIVIDER1_Y}" x2="${cx + 45}" y2="${DIVIDER1_Y}" stroke="${t.gold}" stroke-width="1"/>
<text x="${cx}" y="${RECIPIENT_Y}" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-size="11.5" fill="${t.inkMuted}">pour ${escapeXml(recipient)}</text>
<line x1="${cx - 45}" y1="${DIVIDER2_Y}" x2="${cx + 45}" y2="${DIVIDER2_Y}" stroke="${t.goldSoft}" stroke-width="0.5"/>
${poemLinesSvg}
${dedicationSvg}
<text x="${cx}" y="${FOOTER_DATE_Y}" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="10.5" fill="${t.inkMuted}">${escapeXml(formatDate(date))}</text>
<line x1="${cx - 30}" y1="${FOOTER_LINE_Y}" x2="${cx + 30}" y2="${FOOTER_LINE_Y}" stroke="${t.goldSoft}" stroke-width="0.5"/>
<text x="${cx}" y="${FOOTER_BRAND_Y}" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="9.5" letter-spacing="2" fill="${t.goldSoft}">ALEX HARPER</text>
</svg>`;
}

// Signale si le poème, une fois découpé en lignes, dépasse ce que la carte
// peut afficher proprement — utile pour prévenir avant achat plutôt qu'après.
// Utilise EXACTEMENT le même calcul que le rendu, donc jamais désynchronisé.
export function poemExceedsCardSpace(text, hasDedication = false) {
  return wrapPoemText(text, 34).length > computeMaxLines(hasDedication);
}
