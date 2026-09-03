import { POEM_CATEGORIES, FORMAT_OPTIONS, PRICING } from "../src/data/poems.js";

const form = document.getElementById("order-form");
const categorySelect = document.getElementById("category");
const formatSelect = document.getElementById("format");
const themeToggle = document.getElementById("theme-toggle");
const themeInput = document.getElementById("theme");
const phoneOptionInput = document.getElementById("phone-option");
const carteBlancheInput = document.getElementById("carte-blanche");
const messageField = document.getElementById("message-field");
const messageInput = document.getElementById("message");
const photoInput = document.getElementById("photo");
const photoStatus = document.getElementById("photo-status");
const svgInput = document.getElementById("svg-file");
const svgStatus = document.getElementById("svg-status");
const formError = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");

// --- Catégories ---
categorySelect.innerHTML = POEM_CATEGORIES.map(
  (c) => `<option value="${c.id}">${c.name}</option>`
).join("");

// --- Formats ---
formatSelect.innerHTML = FORMAT_OPTIONS.map(
  (f) => `<option value="${f.id}">${f.label}</option>`
).join("");

// --- Thème (boutons) ---
themeToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".theme-btn");
  if (!btn) return;
  themeToggle.querySelectorAll(".theme-btn").forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  themeInput.value = btn.dataset.theme;
});

// --- Prix dynamique ---
function updatePrice() {
  const total = PRICING.base.price + (phoneOptionInput.checked ? PRICING.phoneOption.price : 0);
  submitBtn.textContent = `Payer et envoyer ma commande — ${total}€`;
}
phoneOptionInput.addEventListener("change", updatePrice);
updatePrice();

// --- Carte blanche : désactive le message libre ---
carteBlancheInput.addEventListener("change", () => {
  const blanche = carteBlancheInput.checked;
  messageInput.required = !blanche;
  messageInput.disabled = blanche;
  messageField.style.opacity = blanche ? 0.5 : 1;
  if (blanche) messageInput.value = "";
});

// --- Compression photo côté client (max 1600px, JPEG q=0.82) ---
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
let photoBase64 = null;
let photoMime = null;
let photoName = null;

photoInput.addEventListener("change", async () => {
  const file = photoInput.files[0];
  photoBase64 = null;
  photoStatus.hidden = true;
  if (!file) return;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    photoBase64 = dataUrl.split(",")[1];
    photoMime = "image/jpeg";
    photoName = file.name.replace(/\.[^.]+$/, "") + ".jpg";

    const sizeKb = Math.round((photoBase64.length * 0.75) / 1024);
    photoStatus.textContent = `Photo prête (${sizeKb} Ko après compression).`;
    photoStatus.hidden = false;
  } catch (err) {
    photoStatus.textContent = "Cette image n'a pas pu être lue, réessayez avec un autre fichier.";
    photoStatus.hidden = false;
  }
});

// --- Upload SVG (fichier léger, lu tel quel en base64) ---
let svgBase64 = null;
let svgName = null;

svgInput.addEventListener("change", () => {
  const file = svgInput.files[0];
  svgBase64 = null;
  svgStatus.hidden = true;
  if (!file) return;

  if (file.size > 1024 * 1024) {
    svgStatus.textContent = "Ce fichier dépasse 1 Mo, merci d'en choisir un plus léger.";
    svgStatus.hidden = false;
    svgInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    svgBase64 = reader.result.split(",")[1];
    svgName = file.name;
    svgStatus.textContent = `Fichier "${file.name}" prêt à être joint.`;
    svgStatus.hidden = false;
  };
  reader.readAsDataURL(file);
});

// --- Soumission ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;

  submitBtn.disabled = true;
  submitBtn.textContent = "Redirection…";

  const orderDetails = {
    categoryId: categorySelect.value,
    theme: themeInput.value,
    format: formatSelect.value,
    phoneOption: phoneOptionInput.checked,
    recipient: document.getElementById("recipient").value.trim(),
    carteBlanche: carteBlancheInput.checked,
    message: carteBlancheInput.checked ? "" : messageInput.value.trim(),
    email: document.getElementById("email").value.trim(),
    photoBase64,
    photoMime,
    photoName,
    svgBase64,
    svgName,
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
    updatePrice();
    formError.textContent = "Le paiement n'a pas pu démarrer. Réessayez dans un instant.";
    formError.hidden = false;
  }
});
