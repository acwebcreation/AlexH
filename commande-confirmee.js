const params = new URLSearchParams(window.location.search);
const sessionToken = params.get("session");

const confirmation = document.getElementById("confirmation");

async function init() {
  if (!sessionToken) {
    confirmation.innerHTML = `<h1>Session introuvable</h1><p>Si vous venez de payer, contactez-nous directement.</p>`;
    return;
  }

  try {
    const res = await fetch("/.netlify/functions/notify-custom-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken }),
    });
    if (!res.ok) throw new Error("notify_failed");

    confirmation.innerHTML = `
      <h1>Merci, votre commande est confirmée</h1>
      <p>
        Votre demande de poème sur-mesure a bien été reçue et payée.
        Vous recevrez votre poème par email sous 2 à 3 jours.
      </p>
      <p><a class="btn btn-secondary" href="index.html">Retour à l'accueil</a></p>
    `;
  } catch (err) {
    confirmation.innerHTML = `
      <h1>Paiement reçu, confirmation en attente</h1>
      <p>
        Votre paiement a bien été effectué, mais nous n'avons pas pu confirmer
        automatiquement la réception de votre commande. Pas d'inquiétude :
        contactez-nous avec votre email pour vérification si vous n'avez pas
        de nouvelles sous 3 jours.
      </p>
    `;
  }
}

init();
