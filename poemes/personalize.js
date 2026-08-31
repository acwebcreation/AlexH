import { getPoem } from "../src/data/poems.js";
import { renderPoemCard } from "../src/data/renderPoemCard.js";

// Après paiement, le client est redirigé ici avec un token de session en query string.
// Ce token est vérifié côté serveur (fonction verify-session-poem) et renvoie :
// { categoryId, poemId, theme }.

const params = new URLSearchParams(window.location.search);
const sessionToken = params.get("session");
const isTestMode = params.get("test") === "1";

const form = document.getElementById("personalize-form");
const themeSelect = document.getElementById("theme");
const recipientInput = document.getElementById("recipient");
const dateInput = document.getElementById("date");
const dedicationInput = document.getElementById("dedication");
const emailInput = document.getElementById("email");
const formError = document.getElementById("form-error");
const previewFrame = document.getElementById("preview-frame");
const downloadBtn = document.getElementById("download-btn");

let purchasedPoem = null; // { categoryId, poemId, title, text }

dateInput.value = new Date().toISOString().slice(0, 10);

function updatePreview() {
  if (!purchasedPoem) return;
  const content = {
    title: purchasedPoem.title,
    text: purchasedPoem.text,
    recipient: recipientInput.value.trim() || "Votre prénom",
    date: dateInput.value,
    dedication: dedicationInput.value.trim(),
  };
  previewFrame.innerHTML = renderPoemCard(content, themeSelect.value);
}

[themeSelect, recipientInput, dateInput, dedicationInput].forEach((el) =>
  el.addEventListener("input", updatePreview)
);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;

  if (!recipientInput.value.trim()) {
    formError.textContent = "Entrez un destinataire avant de continuer.";
    formError.hidden = false;
    return;
  }
  if (!dateInput.value) {
    formError.textContent = "Choisissez une date avant de continuer.";
    formError.hidden = false;
    return;
  }

  if (isTestMode) {
    downloadBtn.textContent = "✓ Parcours test terminé (aucun PDF réel généré)";
    downloadBtn.disabled = true;
    return;
  }

  downloadBtn.disabled = true;
  downloadBtn.textContent = "Génération du PDF…";
  try {
    const res = await fetch("/.netlify/functions/generate-poem-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionToken,
        email: emailInput.value.trim() || null,
        recipient: recipientInput.value.trim(),
        date: dateInput.value,
        dedication: dedicationInput.value.trim(),
        theme: themeSelect.value,
      }),
    });
    if (!res.ok) throw new Error("generate_failed");
    const { downloadUrl } = await res.json();
    window.location.href = downloadUrl;
  } catch (err) {
    formError.textContent = "La génération du PDF a échoué. Réessayez dans un instant.";
    formError.hidden = false;
    downloadBtn.disabled = false;
    downloadBtn.textContent = "Télécharger le PDF";
  }
});

async function init() {
  if (isTestMode) {
    purchasedPoem = {
      categoryId: "mariage",
      poemId: "demo",
      title: "Titre de démonstration",
      text: "Ceci est un texte de démonstration\npour vérifier la mise en page,\nen attendant qu'un vrai poème\nsoit ajouté à cette catégorie.",
    };
    updatePreview();
    return;
  }

  if (!sessionToken) {
    formError.textContent = "Session de paiement introuvable. Retournez à la page d'accueil.";
    formError.hidden = false;
    form.querySelectorAll("input, select, button").forEach((el) => (el.disabled = true));
    return;
  }

  try {
    const res = await fetch(`/.netlify/functions/verify-session-poem?session=${encodeURIComponent(sessionToken)}`);
    if (!res.ok) throw new Error("invalid_session");
    const data = await res.json(); // { categoryId, poemId, theme }
    const poem = getPoem(data.categoryId, data.poemId);
    if (!poem) throw new Error("poem_not_found");
    purchasedPoem = { categoryId: data.categoryId, poemId: data.poemId, title: poem.title, text: poem.text };
    if (data.theme === "light" || data.theme === "dark") {
      themeSelect.value = data.theme;
    }
  } catch (err) {
    formError.textContent = "Paiement introuvable, expiré, ou poème indisponible. Retournez à la page d'accueil.";
    formError.hidden = false;
    form.querySelectorAll("input, select, button").forEach((el) => (el.disabled = true));
    return;
  }

  updatePreview();
}

init();
