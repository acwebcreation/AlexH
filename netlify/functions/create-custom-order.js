// netlify/functions/create-custom-order.js
// Commande de poème sur-mesure (20€). Les détails du formulaire (récit,
// anecdotes...) peuvent dépasser la limite de 500 caractères des metadata
// Stripe, donc on les stocke dans Netlify Blobs sous un identifiant de
// commande, et seul cet identifiant part dans les metadata Stripe. Après
// paiement, notify-custom-order.js relit ces détails pour l'email.

import Stripe from "stripe";
import { randomUUID } from "crypto";
import { getStore } from "@netlify/blobs";
import { getCategory } from "../../src/data/poems.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SITE_URL = process.env.SITE_URL || "https://alexharper.fr";
const PRICE_CENTS = 2000; // 20,00 €
const MAX_DETAILS_LENGTH = 3000;

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

  const { categoryId, recipient, tone, details, email, deadline } = body;
  const category = getCategory(categoryId);

  if (!category || !recipient || !tone || !details || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing_fields" }) };
  }
  if (details.length > MAX_DETAILS_LENGTH) {
    return { statusCode: 400, body: JSON.stringify({ error: "details_too_long" }) };
  }

  const orderId = randomUUID();

  try {
    const store = getStore("alexharper-custom-orders");
    await store.set(
      orderId,
      JSON.stringify({
        categoryId,
        categoryName: category.name,
        recipient,
        tone,
        details,
        email,
        deadline: deadline || null,
        createdAt: new Date().toISOString(),
      })
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Poème sur-mesure — ${category.name}` },
            unit_amount: PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId },
      success_url: `${SITE_URL}/poemes/commande-confirmee.html?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/poemes/commande-sur-mesure.html`,
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error("Custom order checkout error", err);
    return { statusCode: 500, body: JSON.stringify({ error: "stripe_error" }) };
  }
}
