import { POEM_CATEGORIES, PRICING } from "../src/data/poems.js";

const form = document.getElementById("custom-order-form");
const categorySelect = document.getElementById("category");
const detailsInput = document.getElementById("details");
const formError = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");

categorySelect.innerHTML = POEM_CATEGORIES.map(
  (c) => `<option value="${c.id}">${c.name}</option>`
).join("");

const MAX_DETAILS_LENGTH = 3000; // large marge, stocké côté serveur (pas dans les metadata Stripe)

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;

  if (detailsInput.value.length > MAX_DETAILS_LENGTH) {
    formError.textContent = `Le texte est trop long (max ${MAX_DETAILS_LENGTH} caractères). Raccourcissez un peu, on affinera par email si besoin.`;
    formError.hidden = false;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Redirection…";

  const orderDetails = {
    categoryId: categorySelect.value,
    recipient: document.getElementById("recipient").value.trim(),
    tone: document.getElementById("tone").value,
    details: detailsInput.value.trim(),
    email: document.getElementById("email").value.trim(),
    deadline: document.getElementById("deadline").value || null,
  };

  try {
    const res = await fetch("/.netlify/functions/create-custom-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderDetails),
    });
    if (!res.ok) throw new Error("checkout_failed");
    const { url } = await res.json();
    window.location.href = url;
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = `Payer et envoyer ma demande — ${PRICING.custom.price}€`;
    formError.textContent = "Le paiement n'a pas pu démarrer. Réessayez dans un instant.";
    formError.hidden = false;
  }
});
