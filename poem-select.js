import { getCategory, getPoemsByCategory, PRICING } from "./src/data/poems.js";

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

categoryHero.innerHTML = `
  <h1>${category.name}</h1>
  <p>${category.description}</p>
`;

let selectedPoemId = null;

if (poems.length === 0) {
  poemList.innerHTML = `
    <p class="empty-state">
      Les poèmes de cette catégorie arrivent bientôt.
      En attendant, vous pouvez commander un
      <a href="commande-sur-mesure.html">poème sur-mesure</a>.
    </p>
  `;
} else {
  poemList.innerHTML = poems
    .map(
      (poem) => `
    <button type="button" class="poem-card" data-poem-id="${poem.id}">
      <span class="poem-card-title">${poem.title}</span>
      <span class="poem-card-excerpt">${poem.excerpt || ""}</span>
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
      selectionLabel.textContent = `« ${card.querySelector(".poem-card-title").textContent} »`;
      checkoutBtn.disabled = false;
    });
  });
}

checkoutBtn.addEventListener("click", async () => {
  if (!selectedPoemId) return;
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Redirection…";
  try {
    const res = await fetch("/.netlify/functions/create-checkout-poem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, poemId: selectedPoemId }),
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
