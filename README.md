# Alex H. — Site complet

Site principal (présentation, boutique, blog, contact) + section poèmes personnalisés.


## Structure

```
index.html                  Page d'accueil (restaurée, contenu complet)
blog.html                    Blog
boutique.html                 Boutique (liens Payhip, Etsy)
contact.html                  Formulaire de contact (web3forms)
merci.html                    Page de confirmation après contact
article-*.html (x3)           Les 3 articles du blog
style.css, script.js          
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
  poems.js                      7 catégories + 14 poèmes (2 par catégorie, déjà remplis)
  renderPoemCard.js              Génère la carte SVG du poème, format 5x7 pouces

netlify/functions/
  create-checkout-poem.js, verify-session-poem.js,
  generate-poem-pdf.js, download-poem-pdf.js,
  create-custom-order.js, notify-custom-order.js
```

## Navigation

Un lien **"Poèmes personnalisés"** a été ajouté dans le menu de toutes les
pages du site principal (index, blog, boutique, contact), pointant vers
`/poemes/`.

## Les poèmes

`src/data/poems.js` contient 14 poèmes originaux (2 par catégorie), déjà
prêts à la vente. Pour en ajouter d'autres, un objet de cette forme dans le
tableau de la catégorie concernée :

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

**Format des cartes** : 5x7 pouces (360x504pt), pas A4. Le rendu
(`renderPoemCard.js`) calcule dynamiquement le nombre de lignes qui tiennent
sur la carte selon l'espace réellement disponible (en réservant toujours la
place pour la dédicace et le pied de page) — donc jamais de chevauchement,
même avec un poème long + une dédicace. Si un poème est trop long pour
tenir, la dernière ligne est simplement coupée plutôt que de déborder, et un
avertissement s'affiche côté client sur la page de personnalisation.

**Thèmes visuels** : chaque poème peut être généré en thème « Foncé » ou
« Clair » (voir `THEME_IDS`/`THEME_LABELS` dans `renderPoemCard.js`), choisi
par le client sur la page catégorie (avec aperçu visuel en direct) et
modifiable jusqu'à la page de personnalisation.

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
