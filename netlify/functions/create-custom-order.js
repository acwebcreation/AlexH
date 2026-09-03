// netlify/functions/create-custom-order.js
// Commande unique de poème personnalisé (15€, +5€ option smartphone).
// Composition manuelle par Alex — ce endpoint ne génère aucun PDF. Il stocke
// la commande (texte + photo/svg en base64) dans Netlify Blobs, crée la
// session Stripe, puis notify-custom-order.js enverra un email récapitulatif
// (avec pièces jointes) une fois le paiement confirmé.

import Stripe from "stripe";
import { randomUUID } from "crypto";
import { getStore } from "@netlify/blobs";
import { getCategory } from "../../src/data/poems.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SITE_URL = process.env.SITE_URL || "https://alexharper.fr";
const BASE_PRICE_CENTS = 1500; // 15,00 €
const PHONE_OPTION_CENTS = 500; // 5,00 €
const MAX_MESSAGE_LENGTH = 3000;
// ~4 Mo de base64 ≈ 3 Mo de fichier réel : marge confortable sous la limite
// de payload des fonctions Netlify (6 Mo) tout en couvrant les deux fichiers.
const MAX_BASE64_LENGTH = 4 * 1024 * 1024;

const VALID_THEMES = new Set(["clair", "fonce", "pastel"]);
const VALID_FORMATS = new Set(["5x7", "a5", "a4-portrait", "a4-paysage"]);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "invalid_json" }) };
  }

  const {
    categoryId,
    theme,
    format,
    phoneOption,
    recipient,
    carteBlanche,
    message,
    email,
    photoBase64,
    photoMime,
    photoName,
    svgBase64,
    svgName,
  } = body;

  const category = getCategory(categoryId);

  if (!category || !recipient || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing_fields" }) };
  }
  if (!VALID_THEMES.has(theme) || !VALID_FORMATS.has(format)) {
    return { statusCode: 400, body: JSON.stringify({ error: "invalid_theme_or_format" }) };
  }
  if (!carteBlanche && !message) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing_message" }) };
  }
  if (message && message.length > MAX_MESSAGE_LENGTH) {
    return { statusCode: 400, body: JSON.stringify({ error: "message_too_long" }) };
  }
  if ((photoBase64 && photoBase64.length > MAX_BASE64_LENGTH) ||
      (svgBase64 && svgBase64.length > MAX_BASE64_LENGTH)) {
    return { statusCode: 400, body: JSON.stringify({ error: "file_too_large" }) };
  }

  const orderId = randomUUID();
  const priceCents = BASE_PRICE_CENTS + (phoneOption ? PHONE_OPTION_CENTS : 0);

  try {
    const store = getStore("alexharper-custom-orders");
    await store.set(
      orderId,
      JSON.stringify({
        categoryId,
        categoryName: category.name,
        theme,
        format,
        phoneOption: !!phoneOption,
        recipient,
        carteBlanche: !!carteBlanche,
        message: carteBlanche ? null : message,
        email,
        photoBase64: photoBase64 || null,
        photoMime: photoMime || null,
        photoName: photoName || null,
        svgBase64: svgBase64 || null,
        svgName: svgName || null,
        createdAt: new Date().toISOString(),
      })
    );

    const productName = `Poème personnalisé — ${category.name}${phoneOption ? " + fichier smartphone" : ""}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: productName },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId },
      success_url: `${SITE_URL}/poemes/commande-confirmee.html?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/poemes/`,
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error("Custom order checkout error", err);
    return { statusCode: 500, body: JSON.stringify({ error: "stripe_error" }) };
  }
}
