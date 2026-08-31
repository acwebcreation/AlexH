import { getCategory, getPoemsByCategory, PRICING } from "../src/data/poems.js";
import { renderPoemCard, THEME_IDS, THEME_LABELS } from "../src/data/renderPoemCard.js";

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("cat");

const categoryHero = document.getElementById("category-hero");
const poemList = document.getElementById("poem-list");
const selectionBar = document.getElementById("selection-bar");
const selectionLabel = document.getElementById("selection-label");
const checkoutBtn = document.getElementById("checkout-btn");

const category = getCategory(categoryId);

if (!category) {
  categoryHero.innerHTML = `<h1>Catégorie introuvable</h1><p><a href="index.html">Retour à l'accueil</a></p>`;
  throw new Error("unknown_category");
}

document.title = `${category.name} — Alex Harper`;

const poems = getPoemsByCategory(categoryId);

// Contenu factice utilisé uniquement pour l'aperçu (avant achat), avec un
// extrait raccourci du poème pour donner le ton sans tout dévoiler.
function previewContentFor(poem) {
  return {
    title: poem.title,
    text: poem.excerpt || "Aperçu à venir…",
    recipient: "Votre prénom",
    date: new Date().toISOString().slice(0, 10),
  };
}

let selectedPoemId = null;
let selectedTheme = "dark";

categoryHero.innerHTML = `
  <h1>${category.name}</h1>
  <p>${category.description}</p>
  <div class="theme-toggle" id="theme-toggle" role="group" aria-label="Choisir le thème visuel">
    ${THEME_IDS.map(
      (id) =>
        `<button type="button" class="theme-btn ${id === selectedTheme ? "selected" : ""}" data-theme="${id}">${THEME_LABELS[id]}</button>`
    ).join("")}
  </div>
`;

function renderPoemList() {
  if (poems.length === 0) {
    poemList.innerHTML = `
      <p class="empty-state">
        Les poèmes de cette catégorie arrivent bientôt.
        En attendant, vous pouvez commander un
        <a href="commande-sur-mesure.html">poème sur-mesure</a>.
      </p>
    `;
    return;
  }

  poemList.innerHTML = poems
    .map(
      (poem) => `
    <button type="button" class="poem-card" data-poem-id="${poem.id}">
      <div class="poem-card-thumb">${renderPoemCard(previewContentFor(poem), selectedTheme)}</div>
      <span class="poem-card-title">${poem.title}</span>
    </button>
  `
    )
    .join("");

  poemList.querySelectorAll(".poem-card").forEach((card) => {
    card.addEventListener("click", () => {
      poemList.querySelectorAll(".poem-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedPoemId = card.dataset.poemId;
      selectionBar.hidden = false;
      selectionLabel.textContent = `« ${card.querySelector(".poem-card-title").textContent} » — ${THEME_LABELS[selectedTheme]}`;
      checkoutBtn.disabled = false;
    });
  });
}

document.getElementById("theme-toggle").querySelectorAll(".theme-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedTheme = btn.dataset.theme;
    document.querySelectorAll(".theme-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    renderPoemList(); // régénère tous les aperçus dans le nouveau thème
    // Réapplique la sélection du poème si elle existait déjà, dans le nouveau thème
    if (selectedPoemId) {
      const card = poemList.querySelector(`[data-poem-id="${selectedPoemId}"]`);
      if (card) {
        card.classList.add("selected");
        selectionLabel.textContent = `« ${card.querySelector(".poem-card-title").textContent} » — ${THEME_LABELS[selectedTheme]}`;
      }
    }
  });
});

renderPoemList();

checkoutBtn.addEventListener("click", async () => {
  if (!selectedPoemId) return;
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Redirection…";
  try {
    const res = await fetch("/.netlify/functions/create-checkout-poem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, poemId: selectedPoemId, theme: selectedTheme }),
    });
    if (!res.ok) throw new Error("checkout_failed");
    const { url } = await res.json();
    window.location.href = url;
  } catch (err) {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = `Payer et personnaliser — ${PRICING.existing.price}€`;
    alert("Le paiement n'a pas pu démarrer. Réessayez dans un instant.");
  }
});
