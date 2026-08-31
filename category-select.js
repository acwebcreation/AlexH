import { POEM_CATEGORIES, getPoemsByCategory } from "./src/data/poems.js";

const grid = document.getElementById("category-grid");

grid.innerHTML = POEM_CATEGORIES.map((cat) => {
  const count = getPoemsByCategory(cat.id).length;
  const availability =
    count === 0
      ? `<span class="category-card-soon">Bientôt disponible</span>`
      : `<span class="category-card-count">${count} poème${count > 1 ? "s" : ""}</span>`;
  return `
    <a class="category-card ${count === 0 ? "category-card-empty" : ""}" href="category.html?cat=${encodeURIComponent(cat.id)}">
      <span class="category-card-name">${cat.name}</span>
      <span class="category-card-desc">${cat.description}</span>
      ${availability}
    </a>
  `;
}).join("");
