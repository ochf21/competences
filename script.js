// Mobile menu toggle
const toggle = document.querySelector('.nav-toggle');
const navWrapper = document.querySelector('.nav-open-toggle');
toggle.addEventListener('click', () => {
  navWrapper.classList.toggle('nav-open');
});

// Loader full-screen (3500 ms)
window.addEventListener('load', () => {
  setTimeout(() => document.body.classList.add('loaded'), 1000);
});

// Reveal animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('active');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Scroll progress bar
window.addEventListener('scroll', () => {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (window.pageYOffset / docH) * 100;
  document.getElementById('scroll-progress').style.width = pct + '%';
});

// Theme toggle via checkbox
const themeCheckbox = document.getElementById('theme-checkbox');
themeCheckbox.addEventListener('change', () => {
  const isDark = themeCheckbox.checked;
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');  // persiste le choix
  
});
/* ─── Restaure le thème stocké ─── */
const savedTheme = localStorage.getItem('theme');          // "dark" ou "light"
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
  if (themeCheckbox) themeCheckbox.checked = true;         // synchro du toggle
}

// Custom cursor
const cursor = document.getElementById('custom-cursor');
window.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});
window.addEventListener('mousedown', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// Inversion du curseur dans le header/nav
const headerEl = document.querySelector('header');
headerEl.addEventListener('mouseenter', () => cursor.classList.add('inverted'));
headerEl.addEventListener('mouseleave', () => cursor.classList.remove('inverted'));

// Cacher le custom cursor sur les éléments interactifs
const interactiveEls = document.querySelectorAll(
  'a, .nav-toggle, .theme-switch-container, .label'
);
interactiveEls.forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.opacity = '0'; });
  el.addEventListener('mouseleave', () => { cursor.style.opacity = '1'; });
});

// VanillaTilt init
VanillaTilt.init(document.querySelectorAll('.card'), {
  max: 15,
  speed: 400,
  glare: true,
  'max-glare': 0.2
});
