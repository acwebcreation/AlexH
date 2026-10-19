# Mise à jour du 19 octobre 2026 — chansons personnalisées + paiement

- chansons.html : nouveaux onglets « Noël & fêtes » (affiché en premier pour la saison) et « Diplôme ».
  Extraits audio : voir audio/LISEZMOI.txt. Délai affiché sous chaque prix.
- chanson-sur-mesure.html :
  · nouvelle occasion « Saint-Nicolas, Noël ou fête de classe » (?occasion=fetes), avec ses questions ;
    pour cette occasion, les parties « La personne » et « Les souvenirs » deviennent facultatives
  · nouvelle couleur « Festif » (drôle et décalée), proposée seulement dans le formulaire
  · choix de livraison : standard 7 jours (29,99 €) / express 48 h (39,99 €)
  · après l'envoi : redirection automatique vers le paiement Stripe, avec un numéro de commande
    (AH-AAMMJJ-XXXX) présent à la fois dans l'e-mail reçu et dans le paiement Stripe
- commande-config.js : les liens Stripe (seul fichier à modifier pour les prix/liens)
- commande-confirmee.html : page affichée après le paiement
- TikTok retiré de toutes les pages

## À faire dans Stripe
1. Lien de paiement 29,99 € → Modifier → « Après le paiement » → « Ne pas afficher de page de confirmation »,
   rediriger vers : https://alexharper.fr/commande-confirmee.html
2. Pour l'express : créer un 2e lien à 39,99 € (même réglage de redirection), puis coller son adresse
   dans commande-config.js (lienExpress). Tant que c'est vide, l'express n'apparaît pas sur le site.

---

# alexharper.fr — version artiste (octobre 2026)

Site recentré sur la musique uniquement : plus de poèmes, plus de livres.
- index.html — page d'artiste : dernière sortie, titres, thèmes, albums, chanson personnalisée, vidéos, l'artiste
- musique.html — remplace boutique.html (singles + albums). boutique.html redirige vers musique.html.
- Liens « Bientôt » à compléter : chercher « LIEN À RENSEIGNER » dans index.html et musique.html.

---

# Version précédente (octobre 2026)

Site recentré sur les chansons personnalisées + boutique (albums et livres).
Tout ce qui concernait les poèmes personnalisés, le blog et « Recevoir 5 poèmes » a été retiré.

## Pages
- index.html — Accueil
- chansons.html — Chansons personnalisées, avec onglets : Amoureux, Maman, Papa, Enfants, Anniversaire, Mariage, Rupture, Deuil
- chanson-sur-mesure.html — Questionnaire de commande (Netlify Forms, inchangé côté envoi)
  · le lien chansons.html → chanson-sur-mesure.html?occasion=maman présélectionne l'occasion
  · nouvelles occasions dans le formulaire : amoureux, maman, papa, enfant
- boutique.html — Ma boutique : albums + livres
- contact.html / merci.html — Contact (web3forms, même clé qu'avant)

## Déploiement sur GitHub
1. Dans le dépôt acwebcreation/AlexH, SUPPRIME : le dossier poemes/, commandes/, src/, netlify/,
   les anciens fichiers outils/generer_carte.py et outils/modele_carte.html (garde le dossier outils/ : le zip en contient un nouveau),
   ainsi que blog.html, article-*.html, package.json et README.md.
2. Dépose tous les fichiers de ce zip à la racine (ils remplacent les anciens).
3. Netlify redéploie tout seul. Les anciennes adresses (/poemes/, /blog.html, /article-...) redirigent vers le nouveau site.

## À compléter
- Les liens marqués <!-- LIENS À RENSEIGNER --> (Spotify, YouTube, Apple Music, Deezer, Amazon, réseaux) :
  remplace les href="#" par tes vraies adresses. Tant qu'ils sont en "#", les boutons apparaissent grisés.
- Pochettes : dossier images/ (3 singles déjà intégrés). Pour les autres, décommente la ligne <!-- IMAGE : ... --> dans boutique.html.
- Extraits audio : dans chansons.html, décommente <audio ... src="audio/maman.mp3"> et ajoute tes mp3 dans un dossier audio/.

## Atelier paroles (outil privé)
- Adresse : https://alexharper.fr/outils/paroles.html (non indexé, pas de lien dans le menu)
- Colle les paroles, choisis Classique / Cœur / Vinyle / Fleurs / Enfantin et le fond, puis « Télécharger le PDF » (A4, 300 dpi).
- Refrain : commence le bloc par [Refrain] la première fois, puis [Refrain] seul quand il revient.
- Le dernier travail est gardé sur l'appareil.
