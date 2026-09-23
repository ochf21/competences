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

// ============================================================
// Aperçu d'images façon macOS
// Cliquez sur n'importe quelle image .card-image.
// ============================================================
(() => {
  const images = Array.from(document.querySelectorAll('.card-image'));
  if (!images.length) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'mac-preview-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');

  backdrop.innerHTML = `
    <div class="mac-preview-window" role="dialog" aria-modal="true" aria-label="Aperçu de l'image">
      <div class="mac-preview-titlebar">
        <div class="mac-preview-controls" aria-label="Contrôles de la fenêtre">
          <button class="mac-preview-control close" type="button" aria-label="Fermer"></button>
          <button class="mac-preview-control minimize" type="button" aria-label="Réduire"></button>
          <button class="mac-preview-control maximize" type="button" aria-label="Agrandir"></button>
        </div>
        <div class="mac-preview-title"></div>
      </div>
      <div class="mac-preview-content">
        <img class="mac-preview-image" alt="">
      </div>
    </div>`;

  const dock = document.createElement('div');
  dock.className = 'mac-preview-dock';
  dock.setAttribute('role', 'button');
  dock.setAttribute('tabindex', '0');
  dock.setAttribute('aria-label', 'Restaurer la fenêtre d’aperçu');
  dock.innerHTML = '<img alt=""><span></span>';

  document.body.append(backdrop, dock);

  const win = backdrop.querySelector('.mac-preview-window');
  const titlebar = backdrop.querySelector('.mac-preview-titlebar');
  const title = backdrop.querySelector('.mac-preview-title');
  const preview = backdrop.querySelector('.mac-preview-image');
  const closeBtn = backdrop.querySelector('.close');
  const minBtn = backdrop.querySelector('.minimize');
  const maxBtn = backdrop.querySelector('.maximize');
  const dockImg = dock.querySelector('img');
  const dockTitle = dock.querySelector('span');

  let isOpen = false;
  let isMaximized = false;
  let isMinimized = false;
  let previousBounds = null;
  let drag = null;

  const getImageTitle = (img) => {
    const cardTitle = img.closest('.card')?.querySelector('h3')?.textContent?.trim();
    return cardTitle || img.alt || 'Aperçu';
  };

  const resetWindowPosition = () => {
    win.classList.remove('is-dragged', 'is-maximized', 'is-minimizing');
    win.style.left = '';
    win.style.top = '';
    win.style.width = '';
    win.style.height = '';
    previousBounds = null;
    isMaximized = false;
  };

  const openPreview = (img) => {
    const imageTitle = getImageTitle(img);
    preview.src = img.currentSrc || img.src;
    preview.alt = img.alt || imageTitle;
    title.textContent = imageTitle;
    dockImg.src = img.currentSrc || img.src;
    dockImg.alt = '';
    dockTitle.textContent = imageTitle;

    resetWindowPosition();
    isOpen = true;
    isMinimized = false;
    backdrop.classList.remove('is-minimized');
    dock.classList.remove('is-visible');
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('mac-preview-open');
    document.body.classList.remove('mac-preview-minimized');
  };

  const closePreview = () => {
    if (!isOpen && !isMinimized) return;
    backdrop.classList.remove('is-open', 'is-minimized');
    dock.classList.remove('is-visible');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mac-preview-open', 'mac-preview-minimized');
    isOpen = false;
    isMinimized = false;
    isMaximized = false;
    drag = null;
    setTimeout(() => {
      if (!isOpen && !isMinimized) {
        preview.removeAttribute('src');
        dockImg.removeAttribute('src');
        resetWindowPosition();
      }
    }, 230);
  };

  const minimizePreview = () => {
    if (!isOpen) return;
    win.classList.add('is-minimizing');
    setTimeout(() => {
      isOpen = false;
      isMinimized = true;
      backdrop.classList.add('is-minimized');
      win.classList.remove('is-minimizing');
      dock.classList.add('is-visible');
      document.body.classList.remove('mac-preview-open');
      document.body.classList.add('mac-preview-minimized');
    }, 190);
  };

  const restorePreview = () => {
    if (!isMinimized) return;
    isMinimized = false;
    isOpen = true;
    backdrop.classList.remove('is-minimized');
    dock.classList.remove('is-visible');
    document.body.classList.add('mac-preview-open');
    document.body.classList.remove('mac-preview-minimized');
  };

  const maximizePreview = () => {
    if (!isOpen) return;

    if (!isMaximized) {
      const rect = win.getBoundingClientRect();
      previousBounds = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        dragged: win.classList.contains('is-dragged')
      };
      win.classList.add('is-maximized');
      win.classList.remove('is-dragged');
      isMaximized = true;
    } else {
      win.classList.remove('is-maximized');
      isMaximized = false;

      if (previousBounds?.dragged) {
        win.classList.add('is-dragged');
        win.style.left = previousBounds.left + 'px';
        win.style.top = previousBounds.top + 'px';
        win.style.width = previousBounds.width + 'px';
        win.style.height = previousBounds.height + 'px';
      } else {
        win.classList.remove('is-dragged');
        win.style.left = '';
        win.style.top = '';
        win.style.width = '';
        win.style.height = '';
      }
    }
  };

  images.forEach((img) => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `${img.alt || 'Image'} — ouvrir l’aperçu`);

    img.addEventListener('click', (e) => {
      e.preventDefault();
      openPreview(img);
    });

    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPreview(img);
      }
    });
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closePreview();
  });

  minBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    minimizePreview();
  });

  maxBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    maximizePreview();
  });

  dock.addEventListener('click', restorePreview);
  dock.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      restorePreview();
    }
  });

  // Clic sur le fond = fermer, clic dans la fenêtre = ne rien faire.
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closePreview();
  });
  win.addEventListener('click', (e) => e.stopPropagation());

  // Double-clic sur la barre de titre = agrandir/restaurer.
  titlebar.addEventListener('dblclick', (e) => {
    if (!e.target.closest('.mac-preview-controls')) maximizePreview();
  });

  // Déplacement de la fenêtre à la souris / au stylet.
  titlebar.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('.mac-preview-controls') || isMaximized) return;

    const rect = win.getBoundingClientRect();
    drag = {
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height
    };

    win.classList.add('is-dragged');
    win.style.left = rect.left + 'px';
    win.style.top = rect.top + 'px';
    win.style.width = rect.width + 'px';
    win.style.height = rect.height + 'px';
    titlebar.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });

  titlebar.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.pointerId) return;

    const margin = 8;
    const maxLeft = Math.max(margin, window.innerWidth - drag.width - margin);
    const maxTop = Math.max(margin, window.innerHeight - 48);
    const left = Math.min(Math.max(margin, e.clientX - drag.offsetX), maxLeft);
    const top = Math.min(Math.max(margin, e.clientY - drag.offsetY), maxTop);

    win.style.left = left + 'px';
    win.style.top = top + 'px';
  });

  const stopDrag = (e) => {
    if (!drag || (e.pointerId != null && e.pointerId !== drag.pointerId)) return;
    try { titlebar.releasePointerCapture?.(drag.pointerId); } catch (_) {}
    drag = null;
  };

  titlebar.addEventListener('pointerup', stopDrag);
  titlebar.addEventListener('pointercancel', stopDrag);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (isOpen || isMinimized)) closePreview();
  });

  window.addEventListener('resize', () => {
    if (!isOpen || isMaximized || !win.classList.contains('is-dragged')) return;
    const rect = win.getBoundingClientRect();
    const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - rect.width - 8));
    const top = Math.min(Math.max(8, rect.top), Math.max(8, window.innerHeight - 48));
    win.style.left = left + 'px';
    win.style.top = top + 'px';
  });
})();
