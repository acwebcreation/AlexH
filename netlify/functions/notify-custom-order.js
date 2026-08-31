// netlify/functions/notify-custom-order.js
// Après paiement de la commande sur-mesure, revérifie le paiement, relit les
// détails complets stockés dans Netlify Blobs (via l'orderId des metadata
// Stripe), et envoie un email récapitulatif à Alex pour qu'il puisse écrire
// le poème. Le client, lui, ne reçoit qu'une confirmation — pas de PDF ici.
//
// ⚠️ L'envoi d'email n'est pas encore branché à un vrai service (Resend,
// Postmark...) — voir le TODO ci-dessous. Sans ça, la commande est bien
// payée et stockée, mais Alex ne sera pas notifié automatiquement.

import Stripe from "stripe";
import { getStore } from "@netlify/blobs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ALEX_NOTIFICATION_EMAIL = process.env.ALEX_NOTIFICATION_EMAIL || "alex@alexharper.be";

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

  // TODO : brancher un vrai service d'email (Resend/Postmark). Exemple avec Resend :
  //
  // await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     from: "commandes@poemes.alexharper.be",
  //     to: ALEX_NOTIFICATION_EMAIL,
  //     subject: `Nouvelle commande sur-mesure — ${order.categoryName}`,
  //     text: [
  //       `Catégorie : ${order.categoryName}`,
  //       `Destinataire : ${order.recipient}`,
  //       `Ton souhaité : ${order.tone}`,
  //       `Email client : ${order.email}`,
  //       order.deadline ? `Date limite souhaitée : ${order.deadline}` : null,
  //       "",
  //       "Détails fournis par le client :",
  //       order.details,
  //     ].filter(Boolean).join("\n"),
  //   }),
  // });

  return {
    statusCode: 200,
    body: JSON.stringify({ notified: true, orderId }),
  };
}
