// netlify/functions/verify-session-poem.js
// Vérifie côté serveur qu'une session Stripe (poème existant) est bien payée
// avant de débloquer la page de personnalisation.

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  const sessionId = event.queryStringParameters?.session;

  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing_session" }) };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { statusCode: 402, body: JSON.stringify({ error: "not_paid" }) };
    }

    const { categoryId, poemId, theme } = session.metadata;

    return {
      statusCode: 200,
      body: JSON.stringify({ categoryId, poemId, theme: theme === "light" ? "light" : "dark" }),
    };
  } catch (err) {
    console.error("Stripe verify error", err);
    return { statusCode: 404, body: JSON.stringify({ error: "session_not_found" }) };
  }
}
