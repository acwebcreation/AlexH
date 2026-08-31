# Alex Harper — Poèmes personnalisés

Section "poèmes personnalisés" du site Alex Harper : deux façons de commander.

## Les deux options

**Option 1 — Poème existant (7€)** : le client choisit une catégorie, puis un
poème dans la liste, le personnalise (destinataire, date, dédicace courte),
et télécharge un PDF A4 immédiatement. Entièrement automatisé, même mécanique
que CrazyCertif (paiement avant accès au contenu, génération PDF serveur).

**Option 2 — Poème sur-mesure (20€)** : le client remplit un formulaire
(occasion, destinataire, ton, détails/anecdotes), paie, et reçoit son poème
par email sous 2 à 3 jours. **Pas de génération automatique** — la commande
est stockée puis doit déclencher une notification email vers toi (voir
"À brancher" ci-dessous) pour que tu écrives le poème et l'envoies toi-même.

## ⚠️ À FAIRE EN PRIORITÉ : remplir les poèmes

`src/data/poems.js` contient la structure des 7 catégories, avec un tableau
`poems` **vide** pour chacune. Rien n'apparaîtra sur le site tant que tu n'y
as pas ajouté de poèmes. Pour chaque poème, ajoute un objet de cette forme
dans le tableau de la bonne catégorie :

```js
{
  id: "un-identifiant-unique",       // slug, ne change jamais après publication
  title: "Titre du poème",
  excerpt: "Une ligne d'accroche, sans tout dévoiler avant achat",
  text: `Le texte complet du poème,
sur plusieurs lignes,
exactement comme il doit apparaître sur la carte.`,
}
```

Tant qu'une catégorie n'a aucun poème, elle s'affiche sur le site avec
"Bientôt disponible" et un lien vers l'option sur-mesure — rien ne casse,
mais rien n'est vendable non plus pour cette catégorie.

## Structure

```
index.html                  Accueil : présentation des 2 options + catégories
category.html?cat=xxx        Liste des poèmes d'une catégorie (option 1)
personalize.html             Personnalisation après paiement (option 1)
commande-sur-mesure.html     Formulaire de commande (option 2)
commande-confirmee.html      Confirmation après paiement (option 2)
category-select.js / poem-select.js / personalize.js / commande-sur-mesure.js / commande-confirmee.js
styles.css                   Identité Alex Harper (fond sombre, or, Cormorant Garamond)

src/data/
  poems.js                    7 catégories + poèmes (à remplir), pricing
  renderPoemCard.js            Génère la carte SVG, avec retour à la ligne
                               automatique pour poèmes de longueur variable

netlify/functions/
  create-checkout-poem.js      Paiement option 1 (7€)
  verify-session-poem.js       Vérifie le paiement, renvoie le poème acheté
  generate-poem-pdf.js          Revérifie le paiement, génère le PDF final
  download-poem-pdf.js          Sert le PDF (24h)
  create-custom-order.js        Paiement option 2 (20€), stocke les détails
  notify-custom-order.js        Vérifie le paiement, doit notifier Alex par email
```

## À brancher avant mise en prod

- Variables d'environnement : `STRIPE_SECRET_KEY`, `SITE_URL`, `ALEX_NOTIFICATION_EMAIL`
- **Email pour la commande sur-mesure** : `notify-custom-order.js` a un bloc
  TODO commenté (exemple avec Resend) — sans ça, les commandes sur-mesure
  sont payées et stockées mais tu ne seras jamais notifié automatiquement.
  Vérifie aussi manuellement `alexharper-custom-orders` dans Netlify Blobs
  en attendant.
- Email de confirmation au client pour l'option 1 (PDF par email en plus du
  téléchargement) — même TODO que sur CrazyCertif.
- **Hébergement** : ce système a besoin de fonctions serverless (Stripe,
  génération PDF) — incompatible avec GitHub Pages. Prévoir soit un
  sous-domaine Netlify séparé (ex. `poemes.alexharper.be`), soit migrer le
  site principal.
- Police Cormorant Garamond : actuellement en fallback système/Georgia dans
  le CSS — importer la vraie police (Google Fonts ou fichier local) pour un
  rendu fidèle, y compris dans le PDF généré par Puppeteer.

## Étendre

Ajouter une catégorie → nouvel objet dans `POEM_CATEGORIES` + une entrée
correspondante (même id) dans `POEMS`. Rien d'autre à toucher.
