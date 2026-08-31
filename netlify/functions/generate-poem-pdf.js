// netlify/functions/generate-poem-pdf.js
// Revérifie le paiement, récupère le texte du poème depuis la source de
// vérité (poems.js — jamais depuis ce que le client enverrait), régénère la
// carte SVG avec les infos de personnalisation, exporte en PDF au format
// carte 5x7 pouces via Puppeteer.

import Stripe from "stripe";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { getPoem } from "../../src/data/poems.js";
import { renderPoemCard } from "../../src/data/renderPoemCard.js";
import { getStore } from "@netlify/blobs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SITE_URL = process.env.SITE_URL || "https://poemes.alexharper.be";

function buildPrintableHtml(svgMarkup) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  @page { size: 5in 7in; margin: 0; }
  html, body { margin: 0; padding: 0; }
  svg { width: 5in; height: 7in; display: block; }
</style>
</head>
<body>${svgMarkup}</body>
</html>`;
}

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

  const { sessionToken, recipient, date, dedication, email, theme } = body;
  const safeTheme = theme === "light" ? "light" : "dark"; // choix purement visuel, pas de risque de sécurité

  if (!sessionToken || !recipient || !date) {
    return { statusCode: 400, body: JSON.stringify({ error: "invalid_payload" }) };
  }

  // 1. Re-vérifier le paiement et récupérer le poème réellement acheté.
  let poem;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionToken);
    if (session.payment_status !== "paid") {
      return { statusCode: 402, body: JSON.stringify({ error: "not_paid" }) };
    }
    const { categoryId, poemId } = session.metadata;
    poem = getPoem(categoryId, poemId);
    if (!poem) {
      return { statusCode: 404, body: JSON.stringify({ error: "poem_not_found" }) };
    }
  } catch (err) {
    return { statusCode: 404, body: JSON.stringify({ error: "session_not_found" }) };
  }

  // 2. Régénérer la carte SVG côté serveur (texte du poème = source de vérité,
  //    seuls destinataire/date/dédicace/thème viennent du client).
  const svg = renderPoemCard(
    {
      title: poem.title,
      text: poem.text,
      recipient,
      date,
      dedication: dedication || "",
    },
    safeTheme
  );
  const html = buildPrintableHtml(svg);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    // "load" suffit ici : le HTML n'a aucune ressource externe à charger
    // (SVG autonome, pas d'image distante ni de police en ligne) —
    // "networkidle0" attendrait inutilement, ce qui coûte des précieuses
    // secondes sur la limite de 10s des fonctions Netlify en plan gratuit.
    await page.setContent(html, { waitUntil: "load" });
    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true, // laisse le @page CSS (5in x 7in) définir le format
    });

    await browser.close();

    const store = getStore("alexharper-poemes-pdfs");
    const fileId = `${sessionToken}-${Date.now()}.pdf`;
    await store.set(fileId, pdfBuffer, {
      metadata: { expiresAt: Date.now() + 24 * 60 * 60 * 1000 },
    });

    const downloadUrl = `${SITE_URL}/.netlify/functions/download-poem-pdf?file=${encodeURIComponent(fileId)}`;

    if (email) {
      // await sendPdfByEmail(email, pdfBuffer); // à brancher (Resend/Postmark)
    }

    return { statusCode: 200, body: JSON.stringify({ downloadUrl }) };
  } catch (err) {
    console.error("PDF generation error", err);
    if (browser) await browser.close();
    return { statusCode: 500, body: JSON.stringify({ error: "pdf_generation_failed" }) };
  }
}
