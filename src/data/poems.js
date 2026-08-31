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

// Un tableau vide par catégorie, prêt à être rempli. La clé doit correspondre
// exactement à l'id de la catégorie ci-dessus.
export const POEMS = {
  "mariage": [
    // { id: "...", title: "...", excerpt: "...", text: `...` },
  ],
  "bapteme-naissance": [],
  "deuil": [],
  "anniversaire-mariage": [],
  "remerciements": [],
  "depart-retraite": [],
  "amour": [],
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
