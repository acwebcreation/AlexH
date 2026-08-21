# Alex H. — Site vitrine

Site vitrine d'Alex H. (compositeur, poète et designer) référençant ses produits digitaux : recueils de poésie, papeterie d'écriture et chansons composées avec l'aide de l'IA.

Un projet **ActivityWeb Studio** — BCE 0558.805.548.

🔗 **Site en ligne :** https://acwebcreation.github.io/AlexH/
🔗 **Domaine final (à venir) :** activityweb.be

## Structure du site

| Fichier | Page |
|---|---|
| `index.html` | Accueil — présentation, univers, 3 catégories de produits |
| `boutique.html` | Boutique — redirige vers Payhip (ebooks) / Etsy (papeterie) |
| `blog.html` | Liste des articles de blog |
| `article-ecrire-des-paroles-qui-sonnent-vrai.html` | Article — écriture de paroles |
| `article-poesie-ia-musique.html` | Article — poésie et musique assistée par l'IA |
| `article-papeterie-rituel-ecriture.html` | Article — rituel du carnet |
| `contact.html` | Formulaire de contact (Web3Forms) |
| `merci.html` | Page de confirmation après envoi du formulaire |
| `style.css` | Feuille de style unique, partagée par toutes les pages |
| `script.js` | Menu mobile (toggle nav) |
| `og-image.png` | Image d'aperçu pour les réseaux sociaux (Open Graph) |

## Stack

- HTML/CSS/JS statique, sans framework
- Hébergement : GitHub Pages
- Formulaire de contact : [Web3Forms](https://web3forms.com/)
- Typographies : Fraunces (display), Literata (texte), Space Mono (labels) — via Google Fonts

## ⚠️ À faire avant mise en ligne définitive

- [ ] Remplacer le lien Payhip fictif (`index.html`, `boutique.html`) par le vrai lien
- [ ] Remplacer le lien Etsy fictif (`index.html`, `boutique.html`) par le vrai lien
- [ ] Activer le bouton "Musique" une fois les MP3 mis en ligne sur Payhip
- [ ] Ajouter un vrai portrait/photo (actuellement un cadre placeholder sur `index.html`)
- [ ] Basculer le DNS d'activityweb.be vers ce site une fois validé
- [ ] Vérifier les URLs Open Graph (`activityweb.be`) une fois le domaine actif

## Déploiement

Le site est servi directement depuis la branche `main` via GitHub Pages (Settings → Pages). Tout push sur `main` met le site à jour automatiquement.
