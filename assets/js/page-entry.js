/* Runs before styles/paint so reload cannot restore a stale scroll position. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navigation = performance.getEntriesByType?.('navigation')[0];
  const reload = navigation?.type === 'reload' || (!navigation && performance.navigation?.type === 1);
  const transitionKey = 'lumen_page_transition';
  let userInteracted = false;
  const previousRestoration = history.scrollRestoration;
  const toTop = () => {
    if (reload && !userInteracted) window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  };
  let entering = false;
  try {
    entering = !reload && sessionStorage.getItem(transitionKey) === 'active';
    if (reload) sessionStorage.removeItem(transitionKey);
  } catch {}
  if (entering && !reduced) root.classList.add('transition-covered');
  window.LUMEN_PAGE_ENTRY = {reload, entering, transitionKey, toTop};
  if (!reduced) root.classList.add('motion-boot');
  if (!reload) return;

  history.scrollRestoration = 'manual';
  // A refreshed anchor URL should also start at the top, on the same page.
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  toTop();
  const restore = () => { history.scrollRestoration = previousRestoration || 'auto'; };
  const stopResetting = () => { userInteracted = true; restore(); };
  for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
    addEventListener(event, stopResetting, {once: true, passive: true});
  }
  document.addEventListener('DOMContentLoaded', toTop, {once: true});
  addEventListener('pageshow', () => {
    toTop();
    requestAnimationFrame(() => { toTop(); restore(); });
  }, {once: true});
})();
