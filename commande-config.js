/* ============================================================
   RÉGLAGES DES COMMANDES — chansons personnalisées
   C'est le seul fichier à modifier pour changer un lien Stripe.
   ============================================================ */
window.AH_COMMANDE = {
  // Livraison standard (7 jours) — 29 €
  lienStandard: "https://buy.stripe.com/eVqcN6fl1dLJ6xTcSt83C0e",
  prixStandard: "29 €",

  // Livraison express (48 h) — 39 €
  // Crée un 2e lien de paiement Stripe à 39 € et colle-le entre les guillemets.
  // Tant que c'est vide, l'option express n'apparaît nulle part sur le site.
  lienExpress: "",
  prixExpress: "39 €"
};

/* Masque tout ce qui parle de l'express tant que le lien n'est pas renseigné */
(function () {
  function masquer() {
    if (window.AH_COMMANDE.lienExpress) return;
    document.querySelectorAll("[data-express]").forEach(function (el) { el.remove(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", masquer);
  else masquer();
})();
