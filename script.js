if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
  document.body.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
  document.body.classList.remove('dark');
}


const toggle = document.querySelector('.nav-toggle');
const navWrapper = document.querySelector('.nav-open-toggle');
toggle.addEventListener('click', () => {
  navWrapper.classList.toggle('nav-open');
});

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

window.addEventListener('scroll', () => {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (window.pageYOffset / docH) * 100;
  document.getElementById('scroll-progress').style.width = pct + '%';
});

const themeCheckbox = document.getElementById('theme-checkbox');
if (themeCheckbox) {
  themeCheckbox.checked = document.documentElement.classList.contains('dark');

  themeCheckbox.addEventListener('change', () => {
    const isDark = themeCheckbox.checked;
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);

    if (isDark) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.removeItem('theme');
    }
  });
}



if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeCheckbox.checked = true;
} else {
  document.body.classList.remove('dark');
  themeCheckbox.checked = false;
}

const cursor = document.getElementById('custom-cursor');
window.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});
window.addEventListener('mousedown', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

const headerEl = document.querySelector('header');
headerEl.addEventListener('mouseenter', () => cursor.classList.add('inverted'));
headerEl.addEventListener('mouseleave', () => cursor.classList.remove('inverted'));

const interactiveEls = document.querySelectorAll(
  'a, .nav-toggle, .theme-switch-container, .label'
);
interactiveEls.forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.opacity = '0'; });
  el.addEventListener('mouseleave', () => { cursor.style.opacity = '1'; });
});

VanillaTilt.init(document.querySelectorAll('.card'), {
  max: 15,
  speed: 400,
  glare: true,
  'max-glare': 0.2
});

const langChk = document.getElementById('lang-checkbox');

if (langChk) {
  const enPage = location.pathname.includes('-en.html') ||
                 location.pathname.endsWith('index-en.html');

  langChk.checked = enPage;
  document.body.classList.toggle('lang-en', enPage);
  localStorage.setItem('lang', enPage ? 'en' : 'fr');

const repoRoot = "/competences/"; 
langChk.addEventListener('change', () => {
  const en = langChk.checked;
  document.body.classList.toggle('lang-en', en);
  localStorage.setItem('lang', en ? 'en' : 'fr');

  let currentFile = location.pathname.split('/').pop();

  if (currentFile === "" || currentFile === "/") {
    currentFile = "index.html";
  }

  if (en && !currentFile.includes('-en')) {
    const enPath = currentFile === "index.html"
      ? repoRoot + "index-en.html"
      : repoRoot + currentFile.replace(".html", "-en.html");
    location.href = enPath;

  } else if (!en && currentFile.includes('-en')) {
    const frPath = currentFile === "index-en.html"
      ? repoRoot + "index.html"
      : repoRoot + currentFile.replace("-en.html", ".html");
    location.href = frPath;
  }
});

}
