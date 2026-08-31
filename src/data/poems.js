// poems.js
// Source unique de vérité pour les poèmes personnalisables du site Alex Harper.
//
// STRUCTURE À REMPLIR : chaque catégorie a un tableau `poems` actuellement
// vide. Pour ajouter un poème existant, ajoute un objet de cette forme :
//
//   {
//     id: "identifiant-unique-slug",      // utilisé dans les URLs, jamais changé après publication
//     title: "Titre du poème",
//     excerpt: "Une ligne d'accroche courte, sans tout dévoiler avant achat",
//     text: `Le texte complet du poème,
//   sur plusieurs lignes,
//   exactement comme il doit apparaître sur la carte.`,
//   }
//
// `text` peut contenir des sauts de ligne (\n) et des strophes séparées par
// une ligne vide — le rendu (renderPoemCard.js) les respecte telles quelles.

export const POEM_CATEGORIES = [
  {
    id: "mariage",
    name: "Mariage",
    description: "Poèmes sur l'union, la promesse, le engagement à deux",
  },
  {
    id: "bapteme-naissance",
    name: "Baptême / Naissance",
    description: "Poèmes sur l'arrivée d'un enfant, l'émerveillement, la promesse",
  },
  {
    id: "deuil",
    name: "Deuil",
    description: "Poèmes de mémoire et d'hommage, pour dire au revoir avec justesse",
  },
  {
    id: "anniversaire-mariage",
    name: "Anniversaire de mariage",
    description: "Poèmes sur la durée, le temps traversé ensemble",
  },
  {
    id: "remerciements",
    name: "Remerciements",
    description: "Poèmes pour dire merci à quelqu'un qui compte",
  },
  {
    id: "depart-retraite",
    name: "Départ à la retraite",
    description: "Poèmes sur une page qui se tourne, un chapitre qui commence",
  },
  {
    id: "amour",
    name: "Amour",
    description: "Poèmes sur le sentiment amoureux, sans occasion particulière",
  },
];

export const POEMS = {
  "mariage": [
    {
      id: "deux-chemins-un-seul-pas",
      title: "Deux chemins, un seul pas",
      excerpt: "Ce jour où deux vies décident de n'en faire qu'une",
      text: `On ne choisit pas un jour,
on choisit tous les jours qui suivent.
Ce matin-là, rien ne change vraiment —
sauf que désormais, on le dit tout haut.

Deux chemins qui se croisaient
n'en font plus qu'un, à partir d'ici.
Pas parce que le hasard l'a voulu,
mais parce qu'on l'a choisi, ensemble.

Que ce jour ne soit qu'un début,
le premier d'une longue série
de jours ordinaires
rendus extraordinaires à deux.`,
    },
    {
      id: "ce-que-je-promets",
      title: "Ce que je promets",
      excerpt: "Une promesse simple, dite avec les mots de tous les jours",
      text: `Je ne promets pas la perfection,
ni des jours sans nuages.
Je promets d'être là
quand le ciel se couvre.

Je promets les gestes du quotidien,
plus que les grands serments.
Un café préparé sans qu'on le demande,
une main qui cherche l'autre dans le noir.

Ce que je promets aujourd'hui,
c'est de choisir encore,
demain, et le jour d'après,
la même personne qu'aujourd'hui.`,
    },
  ],
  "bapteme-naissance": [
    {
      id: "bienvenue-petit-coeur",
      title: "Bienvenue, petit cœur",
      excerpt: "Pour celui ou celle qui vient d'arriver dans nos vies",
      text: `Tu es arrivé sans un mot,
et pourtant, tout a changé.
La maison a trouvé un nouveau centre,
et ce centre, c'est toi.

On ne savait pas qu'on pouvait
aimer aussi fort, aussi vite.
Tu n'as encore rien fait,
et déjà, tu as tout donné.

Grandis à ton rythme,
tombe, puis relève-toi.
On sera là, à chaque pas,
même ceux qu'on ne voit pas venir.`,
    },
    {
      id: "la-promesse-dun-prenom",
      title: "La promesse d'un prénom",
      excerpt: "Ce qu'on offre à un enfant le jour où on lui donne son prénom",
      text: `Un prénom, c'est une promesse
qu'on te fait avant de te connaître.
On l'a choisi avec soin,
en pensant à qui tu deviendrais.

Aujourd'hui, on te l'offre,
avec tout ce qu'il porte :
nos espoirs les plus doux,
nos vœux les plus sincères.

Porte-le comme tu voudras,
fais-en ce que tu voudras.
Nous, on continuera
à t'aimer, quoi qu'il arrive.`,
    },
  ],
  "deuil": [
    {
      id: "ce-qui-reste",
      title: "Ce qui reste",
      excerpt: "Pour dire au revoir sans jamais vraiment se dire adieu",
      text: `Tu n'es plus là où on te cherche,
mais tu es partout où on regarde.
Dans une chanson, un geste,
une manière de rire aux éclats.

Le vide que tu laisses
a la forme exacte de ta présence.
On ne le remplira pas,
on apprendra à vivre avec.

Ce qui reste, ce n'est pas l'absence,
c'est tout ce que tu as donné.
Et ça, aucun départ
ne pourra jamais nous le reprendre.`,
    },
    {
      id: "tu-restes-la-lumiere-allumee",
      title: "Tu restes la lumière allumée",
      excerpt: "Un hommage doux, pour garder une présence malgré l'absence",
      text: `On dit que le temps efface,
mais ce n'est pas tout à fait vrai.
Il change la douleur de forme,
il ne l'efface jamais vraiment.

Tu restes la lumière allumée
dans une pièce qu'on visite encore.
On y entre doucement,
on y trouve toujours ta trace.

Merci pour ce que tu as été,
pour ce que tu nous as appris.
Tu pars, mais une part de toi
reste, et restera toujours.`,
    },
  ],
  "anniversaire-mariage": [
    {
      id: "encore-toi-encore-nous",
      title: "Encore toi, encore nous",
      excerpt: "Pour celles et ceux qui choisissent de continuer, année après année",
      text: `Les années ont passé,
et pourtant, rien n'a vraiment changé :
je te choisis encore,
comme au premier jour.

On a traversé des saisons,
certaines douces, d'autres plus dures.
Et à chaque fois, on est resté,
l'un à côté de l'autre.

Ce n'est pas la durée qui compte,
c'est ce qu'on en a fait.
Et ce qu'on en a fait,
c'est simplement continuer à s'aimer.`,
    },
    {
      id: "le-temps-na-rien-use",
      title: "Le temps n'a rien usé",
      excerpt: "Un poème sur la durée, et sur ce qui ne s'use jamais",
      text: `On nous avait prévenus :
le temps use tout, disait-on.
Mais le temps n'a fait
qu'ajouter des couches à ce qu'on est.

Ton rire n'a pas changé,
seulement le contexte autour.
Et moi, je continue
à le chercher, chaque jour.

Alors on souffle une bougie de plus,
sur un gâteau qu'on partage encore.
Le temps n'a rien usé,
il a juste tout approfondi.`,
    },
  ],
  "remerciements": [
    {
      id: "merci-simplement",
      title: "Merci, simplement",
      excerpt: "Pour dire merci à quelqu'un qui a compté, sans grands mots",
      text: `Il y a des mercis qu'on dit vite,
en passant, presque par habitude.
Et il y a celui-ci,
que je prends le temps d'écrire.

Merci pour ce que tu as fait
sans jamais le faire remarquer.
Pour ta présence discrète,
qui a pourtant tout changé.

Je ne sais pas si tu mesures
à quel point ça a compté.
Alors je te le dis, simplement :
merci, du fond du cœur.`,
    },
    {
      id: "ce-que-tu-as-donne-sans-compter",
      title: "Ce que tu as donné sans compter",
      excerpt: "Un hommage à la générosité discrète de quelqu'un qui donne sans attendre",
      text: `Tu n'as jamais demandé
qu'on te rende la pareille.
Tu as donné ton temps,
ton attention, ta patience.

Ce genre de générosité
ne se voit pas toujours,
mais elle se ressent
dans chaque moment plus léger.

Aujourd'hui, je veux que tu saches
que rien de tout ça n'est passé inaperçu.
Merci d'avoir été là,
sans jamais rien attendre en retour.`,
    },
  ],
  "depart-retraite": [
    {
      id: "la-page-qui-se-tourne",
      title: "La page qui se tourne",
      excerpt: "Pour celles et ceux qui referment un chapitre professionnel avec fierté",
      text: `Tant d'années à se lever tôt,
à donner, encore et encore.
Aujourd'hui, une page se tourne,
et une autre commence.

Ce que tu as construit
ne disparaît pas avec toi.
Il reste dans ce que tu as transmis,
dans ce que les autres ont appris.

Maintenant, le temps t'appartient.
Prends-le, savoure-le.
Tu l'as amplement mérité,
après tant d'années données.`,
    },
    {
      id: "ce-que-le-temps-a-construit",
      title: "Ce que le temps a construit",
      excerpt: "Sur une carrière qui se termine, et sur tout ce qu'elle laisse derrière elle",
      text: `On mesure une carrière
en années, en dossiers, en réunions.
Mais la vraie mesure,
c'est ce qu'elle laisse derrière elle.

Des collègues devenus amis,
des habitudes qu'on regrettera,
et cette fierté tranquille
d'avoir bien fait ce qu'on faisait.

Aujourd'hui commence
un temps rien qu'à toi.
Profites-en pleinement,
tu as tout le temps, maintenant.`,
    },
  ],
  "amour": [
    {
      id: "ce-que-tu-es-pour-moi",
      title: "Ce que tu es pour moi",
      excerpt: "Une déclaration simple, sans grandiloquence, juste sincère",
      text: `Tu es le café du matin
qui a meilleur goût quand tu es là.
Tu es la phrase qu'on garde
pour te la dire ce soir.

Tu n'es pas parfait,
et c'est très bien ainsi.
C'est dans tes imperfections
que je reconnais les miennes.

Je ne cherche pas les grands mots,
juste ceux qui disent le vrai :
tu es ce que je choisis,
chaque jour, sans hésiter.`,
    },
    {
      id: "sans-raison-sans-mesure",
      title: "Sans raison, sans mesure",
      excerpt: "Un poème sur un amour qui ne cherche pas à se justifier",
      text: `On me demande parfois pourquoi.
Je n'ai pas de bonne réponse.
Je t'aime sans raison précise,
et c'est peut-être ça, la vraie raison.

Ce n'est pas une liste de qualités,
ni une addition de moments parfaits.
C'est quelque chose de plus simple,
et de bien plus grand que ça.

Alors je n'essaie plus d'expliquer,
je me contente de le vivre.
Sans raison, sans mesure,
juste toi, et ça me suffit.`,
    },
  ],
};

export function getCategory(id) {
  return POEM_CATEGORIES.find((c) => c.id === id);
}

export function getPoemsByCategory(categoryId) {
  return POEMS[categoryId] || [];
}

export function getPoem(categoryId, poemId) {
  return getPoemsByCategory(categoryId).find((p) => p.id === poemId);
}

export const PRICING = {
  existing: { price: 7, label: "Poème existant, personnalisé" },
  custom: { price: 20, label: "Poème 100% sur-mesure, écrit pour vous" },
};
