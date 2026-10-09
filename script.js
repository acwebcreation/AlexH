document.addEventListener("DOMContentLoaded", function () {
  // Menu mobile
  var toggle = document.querySelector(".nav-toggle");
  var liens = document.querySelector(".nav-liens");
  if (toggle && liens) {
    toggle.addEventListener("click", function () {
      var ouvert = liens.classList.toggle("ouvert");
      toggle.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
  }

  // Apparition douce des blocs
  var blocs = document.querySelectorAll(".apparait");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    blocs.forEach(function (b) { obs.observe(b); });
  } else {
    blocs.forEach(function (b) { b.classList.add("visible"); });
  }

  // Liens pas encore renseignés : on les désactive proprement
  document.querySelectorAll('a[href="#"]').forEach(function (a) {
    a.setAttribute("aria-disabled", "true");
    a.setAttribute("title", "Bientôt disponible");
  });

  // Année du pied de page
  var an = document.getElementById("annee");
  if (an) an.textContent = new Date().getFullYear();
});
