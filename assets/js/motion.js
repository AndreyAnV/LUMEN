/* Progressive motion: content and native navigation remain usable without animation. */
(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 767px)');
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const curtainTravel = compact.matches ? 460 : 580;
  const curtainHold = 500;
  const running = new Map();
  const pending = new Set();
  const revealing = new Set();
  let observer;

  function animate(element, frames, options = {}) {
    if (!element) return null;
    running.get(element)?.cancel();
    if (preference.matches || !element.animate) return null;
    const animation = element.animate(frames, {duration: 440, easing, fill: 'backwards', ...options});
    running.set(element, animation);
    const release = () => { if (running.get(element) === animation) running.delete(element); };
    animation.finished.then(release, release);
    return animation;
  }

  function enter(element, {delay = 0, distance = 16, blur = false, scale = false, duration = 700} = {}) {
    if (!element) return;
    const start = {opacity: 0, transform: `translateY(${distance}px) scale(${scale ? 0.985 : 1})`};
    const end = {opacity: 1, transform: 'translateY(0) scale(1)'};
    if (blur) { start.filter = `blur(${compact.matches ? 4 : 6}px)`; end.filter = 'blur(0px)'; }
    return animate(element, [start, end], {delay, duration});
  }

  function reveal(element, delay = 0) {
    if (!pending.has(element)) return;
    pending.delete(element);
    observer?.unobserve(element);
    element.classList.remove('motion-pending');
    revealing.add(element);
    const animation = enter(element, {delay, blur: true, duration: 850, scale: element.matches('.service-card, .technology-card')});
    const finish = () => revealing.delete(element);
    if (animation) animation.finished.then(finish, finish);
    else finish();
  }

  function reset() {
    document.documentElement.classList.remove('motion-boot');
    pending.forEach(element => element.classList.remove('motion-pending'));
    pending.clear();
    revealing.clear();
    observer?.disconnect();
    running.forEach(animation => animation.cancel());
    running.clear();
  }

  window.LumenMotion = {animate, enter, get reduced() { return preference.matches; }};
  preference.addEventListener('change', event => { if (event.matches) reset(); });
  addEventListener('pagehide', reset);
  addEventListener('pageshow', event => { if (event.persisted) reset(); });

  const curtain = document.querySelector('.page-transition');
  const entry = window.LUMEN_PAGE_ENTRY;
  function clearTransitionState() {
    document.documentElement.classList.remove('transition-covered');
    document.body.classList.remove('is-entering', 'is-transitioning');
    try { if (entry?.transitionKey) sessionStorage.removeItem(entry.transitionKey); } catch {}
  }
  if (entry?.entering && curtain && !preference.matches) {
    document.body.classList.add('is-entering');
    const ready = document.fonts?.ready || Promise.resolve();
    Promise.race([ready, new Promise(resolve => setTimeout(resolve, 300))]).then(() => {
      setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(clearTransitionState)), curtainHold);
    });
    setTimeout(clearTransitionState, 2600);
  } else clearTransitionState();

  let navigationPending = false;
  document.addEventListener('click', event => {
    if (!curtain || preference.matches || navigationPending || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('javascript:')) return;
    const target = new URL(anchor.href, location.href);
    if (target.origin !== location.origin || (target.pathname === location.pathname && target.search === location.search)) return;
    event.preventDefault();
    navigationPending = true;
    try { if (entry?.transitionKey) sessionStorage.setItem(entry.transitionKey, 'active'); } catch {}
    document.body.classList.add('is-transitioning');
    setTimeout(() => location.assign(target.href), curtainTravel + curtainHold);
    setTimeout(() => {
      navigationPending = false;
      clearTransitionState();
    }, 3600);
  });

  if (!preference.matches && Element.prototype.animate && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      const groups = new Map();
      entries.filter(entry => entry.isIntersecting).forEach(({target}) => {
        const index = groups.get(target.parentElement) || 0;
        groups.set(target.parentElement, index + 1);
        reveal(target, Math.min(index * (compact.matches ? 45 : 70), 210));
      });
    }, {threshold: 0.08, rootMargin: '0px 0px -20px 0px'});
    document.querySelectorAll([
      '.section-heading', '.trust-strip > div', '.service-card', '.more-services > a', '.feature-copy',
      '.comparison:not(dialog .comparison)', '.team-card', '.technology-card',
      '.service-row-copy', '.process-grid > li', '.values-grid > div', '.timeline > article',
      '.clinic-gallery > img', '.story-grid > div', '.contact-details', '.map-column',
      '.booking-aside', '.simple-cta > div'
    ].join(',')).forEach(element => {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < innerHeight || element.closest('dialog')) return;
      pending.add(element);
      element.classList.add('motion-pending');
      observer.observe(element);
    });
    // Keyboard users should never focus a control inside an invisible reveal.
    document.addEventListener('focusin', event => {
      let element = event.target;
      while (element instanceof Element) {
        if (pending.has(element)) {
          pending.delete(element);
          observer.unobserve(element);
          element.classList.remove('motion-pending');
        }
        if (revealing.has(element)) running.get(element)?.cancel();
        element = element.parentElement;
      }
    });
  }

  function startIntro() {
    window.LUMEN_PAGE_ENTRY?.toTop();
    document.documentElement.classList.remove('motion-boot');
    if (preference.matches || (scrollY >= 20 && !window.LUMEN_PAGE_ENTRY?.reload) || location.hash) return;
    const intro = document.querySelector('.hero-copy, .page-hero');
    if (intro) [...intro.children].forEach((element, index) => {
      enter(element, {delay: 20 + Math.min(index * 35, 105), distance: 14, blur: true, duration: 420});
    });
    enter(document.querySelector('.hero-media'), {distance: 0, duration: 1000});
    enter(document.querySelector('.hero-info'), {delay: 150, distance: 10, blur: true, duration: 450});
  }
  // Begin after the first layout/fonts, not while the browser is still preparing its first paint.
  const fontsReady = document.fonts?.ready || Promise.resolve();
  Promise.race([fontsReady, new Promise(resolve => setTimeout(resolve, 300))])
    .then(() => requestAnimationFrame(() => requestAnimationFrame(startIntro)));

  // Keep <details>/<summary> semantics and allow reversals during an expansion.
  const accordions = [];
  document.querySelectorAll('details').forEach(details => {
    const summary = details.querySelector('summary');
    const content = details.querySelector('.accordion-content');
    if (!summary || !content) return;
    let expansion = null;
    let desiredOpen = details.open;
    const clearSizing = () => {
      details.style.removeProperty('height');
      details.style.removeProperty('overflow');
    };
    summary.addEventListener('click', event => {
      if (event.defaultPrevented || event.target.closest('a, button, input') || preference.matches || !details.animate) return;
      event.preventDefault();
      desiredOpen = expansion ? !desiredOpen : !details.open;
      const start = details.getBoundingClientRect().height;
      const previous = expansion;
      expansion = null;
      previous?.cancel();
      details.style.height = `${start}px`;
      details.style.overflow = 'hidden';
      details.open = true;
      const end = summary.getBoundingClientRect().height + (desiredOpen ? content.getBoundingClientRect().height : 0) + 1;
      expansion = animate(details, [{height: `${start}px`}, {height: `${end}px`}], {duration: 300});
      const current = expansion;
      const settle = () => {
        if (expansion !== current) return;
        details.open = desiredOpen;
        expansion = null;
        clearSizing();
      };
      if (current) current.finished.then(settle, settle);
      else settle();
      if (desiredOpen) enter(content, {distance: 5, duration: 260, delay: 35});
    });
    // A viewport change can alter wrapped text; finish the current state immediately.
    accordions.push(() => expansion?.cancel());
  });
  if (accordions.length) addEventListener('resize', () => accordions.forEach(cancel => cancel()), {passive: true});
})();
