# alexharper.fr — nouvelle version (octobre 2026)

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
