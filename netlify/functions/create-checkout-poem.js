// netlify/functions/create-checkout-poem.js
// Crée une session Stripe Checkout pour l'achat d'un poème existant (7€).
// Le poème choisi (catégorie + id) est stocké dans les metadata Stripe —
// petit et fixe, pas de souci de taille contrairement à la commande sur-mesure.

import Stripe from "stripe";
import { getPoem } from "../../src/data/poems.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SITE_URL = process.env.SITE_URL || "https://poemes.alexharper.be";
const PRICE_CENTS = 700; // 7,00 €

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

  const { categoryId, poemId } = body;
  const poem = getPoem(categoryId, poemId);

  if (!poem) {
    return { statusCode: 400, body: JSON.stringify({ error: "poem_not_found" }) };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Poème personnalisé — ${poem.title}` },
            unit_amount: PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: { categoryId, poemId },
      success_url: `${SITE_URL}/personalize.html?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/category.html?cat=${encodeURIComponent(categoryId)}`,
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error("Stripe checkout error", err);
    return { statusCode: 500, body: JSON.stringify({ error: "stripe_error" }) };
  }
}
