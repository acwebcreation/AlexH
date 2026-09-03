// netlify/functions/notify-custom-order.js
// Après paiement, revérifie la session Stripe, relit la commande complète
// dans Netlify Blobs (texte + photo/svg en base64), et envoie un email
// récapitulatif à Alex via Resend — avec la photo et le SVG en pièces
// jointes s'ils ont été fournis, pour que tout arrive en une seule fois
// dans la boîte mail, prêt à composer dans Canva.

import Stripe from "stripe";
import { getStore } from "@netlify/blobs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ALEX_NOTIFICATION_EMAIL = process.env.ALEX_NOTIFICATION_EMAIL || "alex@alexharper.fr";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "commandes@alexharper.fr";

const THEME_LABELS = { clair: "Clair", fonce: "Foncé", pastel: "Pastel" };
const FORMAT_LABELS = {
  "5x7": "5×7 pouces",
  a5: "A5",
  "a4-portrait": "A4 portrait",
  "a4-paysage": "A4 paysage",
};

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

  const { sessionToken } = body;
  if (!sessionToken) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing_session" }) };
  }

  let orderId;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionToken);
    if (session.payment_status !== "paid") {
      return { statusCode: 402, body: JSON.stringify({ error: "not_paid" }) };
    }
    orderId = session.metadata.orderId;
  } catch (err) {
    return { statusCode: 404, body: JSON.stringify({ error: "session_not_found" }) };
  }

  const store = getStore("alexharper-custom-orders");
  let order;
  try {
    const raw = await store.get(orderId);
    if (!raw) throw new Error("order_not_found");
    order = JSON.parse(raw);
  } catch (err) {
    return { statusCode: 404, body: JSON.stringify({ error: "order_not_found" }) };
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY manquante — commande stockée mais email non envoyé", orderId);
    return { statusCode: 200, body: JSON.stringify({ notified: false, reason: "resend_not_configured", orderId }) };
  }

  const attachments = [];
  if (order.photoBase64) {
    attachments.push({
      filename: order.photoName || "photo.jpg",
      content: order.photoBase64,
    });
  }
  if (order.svgBase64) {
    attachments.push({
      filename: order.svgName || "motif.svg",
      content: order.svgBase64,
    });
  }

  const textBody = [
    `Nouvelle commande — ${order.categoryName}`,
    "",
    `Occasion : ${order.categoryName}`,
    `Thème : ${THEME_LABELS[order.theme] || order.theme}`,
    `Format : ${FORMAT_LABELS[order.format] || order.format}`,
    `Option smartphone : ${order.phoneOption ? "Oui (+5€)" : "Non"}`,
    `Pour : ${order.recipient}`,
    `Email client : ${order.email}`,
    "",
    order.carteBlanche
      ? "Le client laisse carte blanche à Alex pour le texte."
      : `Message du client :\n${order.message}`,
    "",
    order.photoBase64 ? "Une photo est jointe à cet email." : null,
    order.svgBase64 ? "Un fichier SVG/motif est joint à cet email." : null,
  ].filter(Boolean).join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: ALEX_NOTIFICATION_EMAIL,
        subject: `Nouvelle commande — ${order.categoryName} (${THEME_LABELS[order.theme] || order.theme})`,
        text: textBody,
        attachments,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error", res.status, errText);
      return { statusCode: 502, body: JSON.stringify({ error: "email_send_failed" }) };
    }
  } catch (err) {
    console.error("Resend fetch error", err);
    return { statusCode: 502, body: JSON.stringify({ error: "email_send_failed" }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ notified: true, orderId }),
  };
}
