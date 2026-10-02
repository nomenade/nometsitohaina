document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Année dans le footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');

  /* 720px = point de bascule menu tiroir / menu horizontal */
  const desktopQuery = window.matchMedia('(min-width: 721px)');

  const setMenu = (open) => {
    if (!navLinks || !navToggle) return;
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    if (navBackdrop) {
      navBackdrop.classList.toggle('open', open);
      navBackdrop.setAttribute('aria-hidden', String(!open));
    }
    document.body.classList.toggle('nav-open', open);
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      setMenu(!navLinks.classList.contains('open'));
    });

    /* fermeture au clic sur un lien */
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    /* fermeture au clic sur le voile */
    if (navBackdrop) {
      navBackdrop.addEventListener('click', () => setMenu(false));
    }

    /* fermeture avec la touche Échap */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });

    /* on remet le menu à plat quand l'écran devient assez grand */
    desktopQuery.addEventListener('change', (e) => {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Ombre de la nav au scroll ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 12) {
      nav.style.boxShadow = '0 8px 24px rgba(0,0,0,.25)';
    } else {
      nav.style.boxShadow = 'none';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal au scroll (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const skillCards = document.querySelectorAll('.skill-card');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillCards.forEach(el => skillObserver.observe(el));

  /* ---------- Lien de nav actif selon la section visible ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.style.color = '');
        link.style.color = 'var(--paper)';
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => sectionObserver.observe(sec));

  /* ---------- Formulaire de contact (envoi via Formspree) ---------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        formNote.textContent = 'Merci de remplir tous les champs.';
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      formNote.textContent = 'Envoi en cours…';
      if (submitBtn) submitBtn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then((response) => {
          if (response.ok) {
            formNote.textContent = 'Merci ! Votre message a bien été envoyé.';
            form.reset();
            return;
          }
          return response.json().then((data) => {
            const detail = data && Array.isArray(data.errors) && data.errors.length
              ? data.errors.map((err) => err.message).join(', ')
              : 'Une erreur est survenue.';
            formNote.textContent = detail;
          });
        })
        .catch(() => {
          formNote.textContent = 'Impossible d\'envoyer le message. Réessayez plus tard.';
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

});
