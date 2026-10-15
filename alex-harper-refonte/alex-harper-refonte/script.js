const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('[data-track]').forEach(track => {
  track.addEventListener('click', () => {
    const hint = document.querySelector('#track-hint');
    hint.textContent = `« ${track.dataset.track} » — ${track.dataset.note} Un extrait audio pourra être ajouté ici.`;
    document.querySelectorAll('[data-track]').forEach(item => item.classList.remove('selected'));
    track.classList.add('selected');
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelector('#contact-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get('name');
  const email = data.get('email');
  const subject = data.get('subject');
  const message = data.get('message');
  const body = `Bonjour Alex,\n\n${message}\n\n— ${name}\nRéponse à : ${email}`;
  const mailto = `mailto:bonjour@alexharper.fr?subject=${encodeURIComponent(`[Alex Harper] ${subject}`)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
});
