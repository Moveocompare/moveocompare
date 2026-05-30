/**
 * MOVÉOCOMPARE — Script principal
 *  1.  Header condensé au scroll
 *  2.  Menu mobile hamburger
 *  3.  Animations scroll (IntersectionObserver fade-up)
 *  4.  Compteurs animés (stats)
 *  5.  Carrousel de devis hero (2400ms, pause survol, prefers-reduced-motion)
 *  6.  Slider volume formulaire
 *  7.  Formulaire multi-étapes (navigation + validation + focus a11y)
 *  8.  Champ Étage conditionnel (T2/T3/T4)
 *  9.  Autocomplétion adresses via api-adresse.data.gouv.fr (position:fixed)
 * 10.  Soumission Web3Forms (fetch JSON, labels français)
 * 11.  CTA flottant mobile (IntersectionObserver)
 * 12.  FAQ accordéon accessible
 * 13.  Navigation douce
 * 14.  Date minimum
 * 15.  Accessibilité — aria-live sur les erreurs
 */


/* ============================================================
   1. HEADER — Transparent → opaque au scroll
              Hide on scroll down, show on scroll up
============================================================ */
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const OPAQUE_AT = 80;   /* px → fond blanc */
  const HIDE_AT   = 200;  /* px → masque au scroll vers le bas */
  let lastScrollY = window.scrollY;
  let ticking     = false;

  const update = () => {
    const y    = window.scrollY;
    const down = y > lastScrollY;

    /* Fond blanc dès 80px */
    header.classList.toggle('scrolled', y > OPAQUE_AT);

    /* Toujours visible en haut */
    if (y <= OPAQUE_AT) {
      header.classList.remove('hidden');
    } else if (down && y > HIDE_AT) {
      /* Masque en descendant (après 200px) */
      header.classList.add('hidden');
    } else if (!down) {
      /* Réapparaît en remontant */
      header.classList.remove('hidden');
    }

    lastScrollY = y;
    ticking     = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  update();
})();


/* ============================================================
   2. MENU MOBILE
============================================================ */
(function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav    = document.getElementById('nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  /* Cible tous les liens de la nav (desktop + overlay mobile) */
  nav.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
    nav.classList.remove('nav--open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));
})();


/* ============================================================
   3. ANIMATIONS SCROLL — fade-up en cascade
============================================================ */
(function initScrollAnimations() {
  const targets = document.querySelectorAll('[data-fade]');
  if (!targets.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => obs.observe(el));
})();


/* ============================================================
   4. COMPTEURS ANIMÉS
============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.js-counter');
  if (!counters.length) return;

  /* Sur mobile : pas d'animation incrémentale (évite le tremblement
     dû au reflow pendant le scroll). On affiche directement la valeur. */
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const setFinal = (el) => {
    const target = +el.dataset.target, suffix = el.dataset.suffix || '';
    el.textContent = target.toLocaleString('fr-FR') + suffix;
  };

  const animate = (el) => {
    const target = +el.dataset.target, suffix = el.dataset.suffix || '', dur = 1800, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(easeOut(p) * target).toLocaleString('fr-FR') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.done) {
        e.target.dataset.done = '1';        /* déclenchement unique */
        if (isMobile) setFinal(e.target);
        else          animate(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
})();


/* ============================================================
   5. CARROUSEL DE DEVIS HERO — 2400ms, pause survol
============================================================ */
(function initDevisCarousel() {
  const front = document.getElementById('devisFront');
  const stack = document.getElementById('devisStack');
  if (!front || !stack) return;

  const DEVIS = [
    { initials:'DP', name:'DéménaPro',      rating:'4.9', price:'780 €', save:'Économisez 320€', badge:'MEILLEUR PRIX', badgeClass:'badge--green',  route:'Toulon → Bordeaux',    features:['Emballage inclus','Assurance tous risques','Monte-meuble si nécessaire'] },
    { initials:'RE', name:'Rapide Express', rating:'4.8', price:'890 €', save:'Économisez 210€', badge:'PLUS RAPIDE',   badgeClass:'badge--blue',   route:'Paris → Lyon',         features:['Livraison sous 48h','Démontage/remontage meubles','Cartons fournis'] },
    { initials:'FM', name:'France Mobilité',rating:'4.7', price:'720 €', save:'Économisez 380€', badge:'ÉCONOMIQUE',    badgeClass:'badge--teal',   route:'Marseille → Lille',    features:['Formule économique','Camion 20m³ dédié','Devis gratuit sans engagement'] },
    { initials:'AM', name:'AllôMove',        rating:'4.9', price:'950 €', save:'Économisez 150€', badge:'PREMIUM',      badgeClass:'badge--purple', route:'Nice → Nantes',        features:['Garde-meuble 1 mois offert','Assurance valeur déclarée','Chef d\'équipe dédié'] },
    { initials:'TD', name:'TransDéménage',  rating:'4.6', price:'650 €', save:'Économisez 450€', badge:'PETIT BUDGET',  badgeClass:'badge--orange', route:'Strasbourg → Toulouse',features:['Formule essentielle','Camion 12m³','Devis gratuit en ligne'] }
  ];

  const renderCard = (d) => `
    <div class="devis-card__header">
      <div class="devis-card__logo-placeholder">${d.initials}</div>
      <div class="devis-card__info">
        <strong>${d.name}</strong>
        <div class="devis-card__route">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          ${d.route}
        </div>
        <div class="devis-card__stars">★★★★★ <span>${d.rating}</span></div>
      </div>
      <div class="devis-card__badge ${d.badgeClass}">${d.badge}</div>
    </div>
    <div class="devis-card__price-row">
      <span class="devis-card__price">${d.price}</span>
      <span class="devis-card__savings">${d.save}</span>
    </div>
    <div class="devis-card__details">
      ${d.features.map(f => `<span>✓ ${f}</span>`).join('')}
    </div>
    <div class="devis-card__cta">Choisir cette offre →</div>
  `;

  const dots = stack.querySelectorAll('[data-dot]');
  let idx = 0;
  const setDot = (i) => dots.forEach((d, j) => d.classList.toggle('active', j === i));
  front.innerHTML = renderCard(DEVIS[0]);
  setDot(0);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const swap = () => {
    front.classList.add('is-swapping');
    setTimeout(() => {
      idx = (idx + 1) % DEVIS.length;
      front.innerHTML = renderCard(DEVIS[idx]);
      setDot(idx);
      front.classList.remove('is-swapping');
    }, 450);
  };

  let timer = setInterval(swap, 2400);
  stack.addEventListener('mouseenter', () => clearInterval(timer));
  stack.addEventListener('mouseleave', () => { timer = setInterval(swap, 2400); });
})();


/* ============================================================
   6. SLIDER VOLUME
============================================================ */
(function initVolumeSlider() {
  const slider  = document.getElementById('volume');
  const display = document.getElementById('volumeVal');
  const hint    = document.getElementById('volumeHint');
  if (!slider || !display) return;

  const getHint = (v) => {
    if (v <= 10) return 'Studio ou petit T1';
    if (v <= 20) return 'Environ 2 pièces (T2)';
    if (v <= 35) return 'Environ 3 pièces (T3)';
    if (v <= 55) return 'Grand appartement (T4+)';
    if (v <= 70) return 'Maison moyenne';
    return 'Grande maison ou villa';
  };

  const update = () => {
    const val = +slider.value;
    const pct = ((val - +slider.min) / (+slider.max - +slider.min)) * 100;
    display.textContent = val;
    if (hint) hint.textContent = getHint(val);
    slider.style.background =
      `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${pct}%, var(--color-border) ${pct}%, var(--color-border) 100%)`;
  };

  slider.addEventListener('input', update);
  update();
})();


/* ============================================================
   7. FORMULAIRE MULTI-ÉTAPES
============================================================ */

let currentStep = 1;
const STEP_LABELS = ['', 'Votre logement', 'Votre déménagement', 'Vos coordonnées'];

/**
 * Valide les champs d'une étape.
 * BUG 2 FIX : étape 2 ne vérifie plus villeDepart/villeArrivee/cpDepart/cpArrivee
 * (champs supprimés), seulement adresseDepart, adresseArrivee, dateDemo.
 */
function validateStep(step) {
  let ok = true;

  const err = (inputEl, errId, show) => {
    const el = document.getElementById(errId);
    if (el) el.classList.toggle('hidden', !show);
    if (inputEl) inputEl.classList.toggle('is-error', show);
    if (show) ok = false;
  };

  if (step === 1) {
    const checked = document.querySelector('input[name="logement"]:checked');
    const errEl   = document.getElementById('err-logement');
    if (errEl) errEl.classList.toggle('hidden', !!checked);
    if (!checked) ok = false;
  }

  if (step === 2) {
    /* Adresse de départ — min 5 caractères */
    const ad = document.getElementById('adresseDepart');
    const adVal = ad?.value.trim() ?? '';
    err(ad, 'err-adresseDepart', adVal.length < 5);

    /* Adresse d'arrivée — min 5 caractères */
    const aa = document.getElementById('adresseArrivee');
    const aaVal = aa?.value.trim() ?? '';
    err(aa, 'err-adresseArrivee', aaVal.length < 5);

    /* Date souhaitée */
    const dt = document.getElementById('dateDemo');
    err(dt, 'err-dateDemo', !dt.value);
  }

  if (step === 3) {
    const pr = document.getElementById('prenom');
    err(pr, 'err-prenom', !pr.value.trim());

    const nm = document.getElementById('nom');
    err(nm, 'err-nom', !nm.value.trim());

    const em  = document.getElementById('email');
    err(em, 'err-email', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim()));

    const tel   = document.getElementById('telephone');
    const telOk = /^(\+33|0033|0)[1-9](\s?[\d]{2}){4}$/.test(tel.value.replace(/[\s\-\.]/g, ''));
    err(tel, 'err-telephone', !telOk);

    const cgv    = document.getElementById('cgv');
    const errCgv = document.getElementById('err-cgv');
    if (errCgv) errCgv.classList.toggle('hidden', cgv.checked);
    if (!cgv.checked) ok = false;

    const rgpd    = document.getElementById('rgpd');
    const errRgpd = document.getElementById('err-rgpd');
    if (errRgpd) errRgpd.classList.toggle('hidden', rgpd.checked);
    if (!rgpd.checked) ok = false;
  }

  return ok;
}

/** Met à jour la barre de progression (bulles, lignes, aria). */
function updateProgressBar(newStep) {
  document.querySelectorAll('[data-step-indicator]').forEach(el => {
    const n = +el.dataset.stepIndicator;
    el.classList.remove('active', 'done');
    if (n === newStep) el.classList.add('active');
    if (n < newStep)   el.classList.add('done');
  });
  document.querySelectorAll('.progress-step__line').forEach((line, i) => {
    line.style.background = i < newStep - 1 ? 'var(--color-success)' : '';
  });
  const bar = document.getElementById('progressStepsBar');
  if (bar) {
    bar.setAttribute('aria-valuenow', newStep);
    bar.setAttribute('aria-label', `Étape ${newStep} sur 3 — ${STEP_LABELS[newStep]}`);
  }
}

/** Navigue vers une étape et déplace le focus sur le premier champ. */
function goToStep(target) {
  if (target > currentStep && !validateStep(currentStep)) return;

  document.getElementById('step' + currentStep)?.classList.remove('form-step--active');
  const newStepEl = document.getElementById('step' + target);
  if (newStepEl) {
    newStepEl.classList.add('form-step--active');
    setTimeout(() => {
      const first = newStepEl.querySelector(
        'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([readonly]), select, textarea'
      );
      if (first) first.focus({ preventScroll: true });
    }, 150);
  }

  currentStep = target;
  updateProgressBar(currentStep);
  document.getElementById('comparateur')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.goToStep = goToStep;


/* ============================================================
   8. CHAMP ÉTAGE — Conditionnel (T2/T3/T4)
============================================================ */
(function initEtageField() {
  const radios = document.querySelectorAll('input[name="logement"]');
  const group  = document.getElementById('etageGroup');
  if (!radios.length || !group) return;

  const update = () => {
    const val  = document.querySelector('input[name="logement"]:checked')?.value;
    const show = ['t2', 't3', 't4'].includes(val);
    group.classList.toggle('hidden', !show);
    if (!show) {
      const sel = document.getElementById('etage');
      if (sel) sel.value = 'rdc';
    }
  };

  radios.forEach(r => r.addEventListener('change', update));
  update();
})();


/* ============================================================
   9. AUTOCOMPLÉTION ADRESSES
   API : api-adresse.data.gouv.fr/search/?q=QUERY&limit=5
   Positionnement : position:absolute dans .input-icon-wrap
   (position:relative) — fiable sur mobile et desktop
============================================================ */
(function initAddressAutocomplete() {

  function setupAutocomplete(inputId, dropdownId) {
    const input    = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;
    let timer = null;

    /* Sélection d'une suggestion (réutilisé pour mousedown + touchstart) */
    const makeSelectHandler = (item) => (e) => {
      e.preventDefault();
      input.value = item.dataset.label;
      input.classList.remove('is-error');
      const errEl = document.getElementById('err-' + inputId);
      if (errEl) errEl.classList.add('hidden');
      dropdown.innerHTML = '';
      dropdown.style.display = 'none';
    };

    input.addEventListener('input', () => {
      const q = input.value.trim();
      clearTimeout(timer);
      if (q.length < 3) { dropdown.innerHTML = ''; dropdown.style.display = 'none'; return; }
      timer = setTimeout(async () => {
        try {
          const res  = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`);
          const data = await res.json();
          if (!data.features || data.features.length === 0) {
            dropdown.innerHTML = '<div class="ac-empty">Aucune adresse trouvée</div>';
            dropdown.style.display = 'block';
            return;
          }
          dropdown.innerHTML = data.features.map(f =>
            `<div class="ac-item" data-label="${f.properties.label}">${f.properties.label}</div>`
          ).join('');
          dropdown.style.display = 'block';
          dropdown.querySelectorAll('.ac-item').forEach(item => {
            const handler = makeSelectHandler(item);
            item.addEventListener('mousedown', handler);
            item.addEventListener('touchstart', handler, { passive: false });
          });
        } catch (err) {
          console.error('Autocomplete error:', err);
        }
      }, 300);
    });

    /* Ferme au clic en dehors */
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }

  setupAutocomplete('adresseDepart', 'dropdownDepart');
  setupAutocomplete('adresseArrivee', 'dropdownArrivee');
})();


/* ============================================================
   10. SOUMISSION WEB3FORMS — fetch JSON, labels français
   BUG 2 FIX : payload simplifié (plus de ville/CP séparés)
============================================================ */
(function initFormSubmit() {
  const form      = document.getElementById('comparateurForm');
  const submitBtn = document.getElementById('submitBtn');
  const spinner   = document.getElementById('submitSpinner');
  const arrow     = document.getElementById('submitArrow');
  const confDiv   = document.getElementById('formConfirmation');
  const progressW = document.getElementById('progressWrap');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    submitBtn.disabled = true;
    if (spinner) spinner.classList.remove('hidden');
    if (arrow)   arrow.classList.add('hidden');
    document.getElementById('submitText').textContent = 'Envoi en cours…';

    const errSubmit = document.getElementById('err-submit');
    if (errSubmit) errSubmit.classList.add('hidden');

    const get  = id => document.getElementById(id)?.value?.trim() ?? '';
    const pick = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value ?? '';
    const services = [...document.querySelectorAll('input[name="services[]"]:checked')]
                       .map(el => el.value).join(', ') || 'Aucun';
    const email = get('email');

    const payload = {
      /* Paramètres Web3Forms */
      access_key: '359a5eac-9efd-40db-8161-8afedf4d0d2b',
      subject:    'Nouveau lead Moveocompare',
      from_name:  'Moveocompare',
      botcheck:   false,
      replyto:    email,
      // Pour activer l'auto-réponse au client, activer Autorespond dans le
      // dashboard Web3Forms (plan Pro) ou brancher un webhook Zapier/Make.

      /* Étape 1 — Logement */
      'Type de logement': pick('logement'),
      'Volume estimé':    `${get('volume')} m³`,
      'Ascenseur':        pick('ascenseur') || 'non',
      'Étage':            get('etage') || 'N/A',

      /* Étape 2 — Adresses et dates (simplifié BUG 2 FIX) */
      'Adresse de départ':  get('adresseDepart'),
      "Adresse d'arrivée":  get('adresseArrivee'),
      'Date souhaitée':     get('dateDemo'),
      'Flexibilité':        get('flexibilite'),
      'Services supplémentaires': services,

      /* Étape 3 — Coordonnées */
      'Prénom':    get('prenom'),
      'Nom':       get('nom'),
      'Email':     email,
      'Téléphone': get('telephone')
    };

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        form.classList.add('hidden');
        if (progressW) progressW.classList.add('hidden');
        if (confDiv) {
          confDiv.classList.remove('hidden');
          document.getElementById('confPrenom').textContent = payload['Prénom'];
        }
        document.getElementById('comparateur')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        throw new Error(data.message || 'Réponse inattendue');
      }
    } catch {
      if (errSubmit) errSubmit.classList.remove('hidden');
      submitBtn.disabled = false;
      if (spinner) spinner.classList.add('hidden');
      if (arrow)   arrow.classList.remove('hidden');
      document.getElementById('submitText').textContent = 'Recevoir mes devis gratuits';
    }
  });
})();


/** Réinitialise le formulaire depuis l'écran de confirmation. */
window.resetForm = function () {
  const form      = document.getElementById('comparateurForm');
  const confDiv   = document.getElementById('formConfirmation');
  const progressW = document.getElementById('progressWrap');
  const submitBtn = document.getElementById('submitBtn');
  const spinner   = document.getElementById('submitSpinner');
  const arrow     = document.getElementById('submitArrow');

  if (form)  { form.reset(); form.classList.remove('hidden'); }
  if (confDiv)   confDiv.classList.add('hidden');
  if (progressW) progressW.classList.remove('hidden');
  if (submitBtn) submitBtn.disabled = false;
  if (spinner)   spinner.classList.add('hidden');
  if (arrow)     arrow.classList.remove('hidden');
  document.getElementById('submitText').textContent = 'Recevoir mes devis gratuits';

  document.querySelectorAll('.field-error').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));

  const slider = document.getElementById('volume');
  if (slider) { slider.value = 15; slider.dispatchEvent(new Event('input')); }

  const etageGroup = document.getElementById('etageGroup');
  if (etageGroup) etageGroup.classList.add('hidden');

  document.querySelector('.form-step--active')?.classList.remove('form-step--active');
  document.getElementById('step1')?.classList.add('form-step--active');
  currentStep = 1;
  updateProgressBar(1);

  document.getElementById('comparateur')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};


/* ============================================================
   11. CTA FLOTTANT MOBILE
   - Apparaît quand le hero sort du viewport
   - Se cache quand la section formulaire est visible (évite
     de chevaucher les boutons du formulaire)
============================================================ */
(function initMobileCta() {
  const cta  = document.getElementById('mobileCta');
  const hero = document.getElementById('accueil');
  const form = document.getElementById('comparateur');
  if (!cta || !hero) return;

  let pastHero   = false;
  let inForm     = false;

  const updateCta = () => {
    const show = pastHero && !inForm;
    cta.classList.toggle('is-visible', show);
    cta.setAttribute('aria-hidden', !show);
    /* Désactive le pointer-events quand masqué (évite les clics involontaires) */
    cta.style.pointerEvents = show ? '' : 'none';
  };

  /* Passe à visible après le hero */
  const heroObs = new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting;
    updateCta();
  }, { threshold: 0 });

  /* Se cache dès que le formulaire est visible à 20% */
  if (form) {
    const formObs = new IntersectionObserver(([entry]) => {
      inForm = entry.isIntersecting;
      updateCta();
    }, { threshold: 0.2 });
    formObs.observe(form);
  }

  heroObs.observe(hero);
})();


/* ============================================================
   12. FAQ — Accordéon accessible
============================================================ */
(function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn    = item.querySelector('.faq-item__q');
    const answer = item.querySelector('.faq-item__a');
    if (!btn || !answer) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-item').forEach(other => {
        const ob = other.querySelector('.faq-item__q');
        const oa = other.querySelector('.faq-item__a');
        if (ob !== btn) { ob.setAttribute('aria-expanded', 'false'); oa.hidden = true; }
      });
      btn.setAttribute('aria-expanded', !open);
      answer.hidden = open;
    });
  });
})();


/* ============================================================
   13. NAVIGATION DOUCE
============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'smooth'
      });
    });
  });
})();


/* ============================================================
   14. DATE MINIMUM — empêche une date passée
============================================================ */
(function initDateMin() {
  const dt = document.getElementById('dateDemo');
  if (dt) dt.setAttribute('min', new Date().toISOString().split('T')[0]);
})();


/* ============================================================
   15. ACCESSIBILITÉ — aria-live sur les messages d'erreur
============================================================ */
(function initA11yErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
  });
})();
