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


  // Extraits audio (accueil) : une pochette = un extrait, un seul à la fois
  var courant = null, boutonCourant = null;
  document.querySelectorAll("button.extrait").forEach(function (b) {
    var a = new Audio();
    a.preload = "none";
    a.src = b.getAttribute("data-audio");
    a.addEventListener("error", function () { b.classList.add("sans-extrait"); b.classList.remove("joue"); b.disabled = true; });
    a.addEventListener("ended", function () { b.classList.remove("joue"); });
    b.addEventListener("click", function () {
      if (courant && courant !== a) { courant.pause(); boutonCourant.classList.remove("joue"); }
      if (a.paused) { a.play().catch(function () {}); b.classList.add("joue"); courant = a; boutonCourant = b; }
      else { a.pause(); b.classList.remove("joue"); }
    });
  });
  // Lecteurs de la page Musique : cachés si le MP3 n'est pas encore en ligne, un seul à la fois
  document.querySelectorAll("audio.extrait-lecteur").forEach(function (a) {
    a.addEventListener("error", function () { a.classList.add("absent"); }, true);
    a.addEventListener("play", function () {
      document.querySelectorAll("audio.extrait-lecteur").forEach(function (o) { if (o !== a) o.pause(); });
    });
  });
  // Vérifie tout de suite si chaque extrait existe (sans le télécharger en entier)
  document.querySelectorAll("button.extrait, audio.extrait-lecteur").forEach(function (el) {
    var src = el.getAttribute("data-audio") || el.getAttribute("src");
    if (!src || location.protocol === "file:") return;
    fetch(src, { method: "HEAD" }).then(function (r) {
      if (!r.ok) { if (el.tagName === "AUDIO") el.classList.add("absent"); else { el.classList.add("sans-extrait"); el.disabled = true; } }
    }).catch(function () {});
  });

  // Année du pied de page
  var an = document.getElementById("annee");
  if (an) an.textContent = new Date().getFullYear();
});
