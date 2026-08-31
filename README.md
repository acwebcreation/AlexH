# Alex H. — Site complet

Site principal (présentation, boutique, blog, contact) + section poèmes personnalisés.

## ⚠️ IMPORTANT avant de déployer ce zip

Ce zip contient **tout sauf deux fichiers** : `style.css` et `script.js`.
Je n'ai pas réussi à les récupérer automatiquement depuis ton dépôt GitHub
(limitation technique de mon côté). **Ne les supprime pas** de ton dépôt —
ce zip est fait pour compléter/remplacer tout le reste, en gardant ces deux
fichiers existants tels quels. Toutes les pages du site principal en
dépendent (`<link rel="stylesheet" href="style.css">` et
`<script src="script.js">`), donc le site sera visuellement cassé sans eux.

## Structure

```
index.html                  Page d'accueil (restaurée, contenu complet)
blog.html                    Blog
boutique.html                 Boutique (liens Payhip, Etsy)
contact.html                  Formulaire de contact (web3forms)
merci.html                    Page de confirmation après contact
article-*.html (x3)           Les 3 articles du blog
style.css, script.js          ⚠️ PAS DANS CE ZIP — à garder tels quels
CNAME                         Domaine personnalisé (alexharper.fr)
netlify.toml, package.json    Configuration Netlify

poemes/                       Section poèmes personnalisés (nouvelle)
  index.html                   Présentation des 2 options + catégories
  category.html?cat=xxx         Liste des poèmes d'une catégorie
  personalize.html              Personnalisation après paiement
  commande-sur-mesure.html      Formulaire de commande sur-mesure
  commande-confirmee.html       Confirmation après paiement
  *.js, styles.css              Logique et style (identité Alex Harper)

src/data/
  poems.js                      7 catégories + poèmes (VIDE, à remplir)
  renderPoemCard.js              Génère la carte SVG du poème

netlify/functions/
  create-checkout-poem.js, verify-session-poem.js,
  generate-poem-pdf.js, download-poem-pdf.js,
  create-custom-order.js, notify-custom-order.js
```

## Navigation

Un lien **"Poèmes personnalisés"** a été ajouté dans le menu de toutes les
pages du site principal (index, blog, boutique, contact), pointant vers
`/poemes/`.

## ⚠️ À FAIRE EN PRIORITÉ : remplir les poèmes

`src/data/poems.js` contient la structure des 7 catégories, avec un tableau
`poems` **vide** pour chacune. Pour chaque poème, ajoute un objet de cette
forme dans le tableau de la bonne catégorie :

```js
{
  id: "un-identifiant-unique",
  title: "Titre du poème",
  excerpt: "Une ligne d'accroche, sans tout dévoiler avant achat",
  text: `Le texte complet du poème,
sur plusieurs lignes,
exactement comme il doit apparaître sur la carte.`,
}
```

## À brancher avant mise en prod

- Variables d'environnement Netlify : `STRIPE_SECRET_KEY`, `SITE_URL`, `ALEX_NOTIFICATION_EMAIL`
- Service d'email pour `notify-custom-order.js` (TODO commenté, exemple Resend)
- Police Cormorant Garamond réelle dans `poemes/styles.css` (actuellement fallback Georgia)
- Fichier `og-image.png` : pas récupéré dans ce zip (fichier binaire), à
  reprendre depuis ton dépôt existant si besoin
- Le bouton "🧪 Tester sans payer" éventuel côté poèmes est un raccourci de
  dev — à retirer avant une vraie mise en ligne publique

## Domaine

Le fichier `CNAME` pointe vers `alexharper.fr`. Certaines balises `<link
rel="canonical">` et `og:url` dans les pages existantes référencent encore
`activityweb.be` — à corriger si `alexharper.fr` est bien le domaine final.
