(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.case-card')];
  const count = document.querySelector('#results-count');
  const motion = window.LumenMotion;
  const english = document.documentElement.lang === 'en';
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
    const shown = cards.filter(card => !card.hidden).length;
    cards.filter(card => !card.hidden).forEach((card, index) => motion?.enter(card, {delay: Math.min(index * 55, 165), distance: 12, duration: 350}));
    count.textContent = `${shown} ${english ? (shown === 1 ? 'demonstration case' : 'demonstration cases') : (shown === 1 ? 'caz demonstrativ' : 'cazuri demonstrative')}`;
  }));
  const dialog = document.querySelector('#case-dialog');
  if (!dialog) return;
  let opener = null;
  document.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => {
    const item = (window.LUMEN_CASES || []).find(entry => entry.id === button.dataset.case);
    if (!item) return;
    opener = button;
    const content = {'case-dialog-id':`${english ? 'CASE' : 'CAZ'} ${item.id} · ${english ? 'DEMONSTRATION SCENARIO' : 'SCENARIU DEMONSTRATIV'}`,'case-dialog-title':item.title,'case-dialog-meta':`${item.tags} · ${item.duration} — ${english ? 'illustrative timeline' : 'durată ilustrativă'}`,'case-problem':item.problem,'case-approach':item.approach,'case-result':item.result};
    Object.entries(content).forEach(([id, value]) => { document.getElementById(id).textContent = value; });
    const card = button.closest('.case-card');
    const beforeImage = dialog.querySelector('.compare-image.before img');
    const afterImage = dialog.querySelector('.compare-image.after img');
    const setComparisonImage = (image, source) => {
      if (!image || !source) return;
      image.src = source;
      image.srcset = `${source.replace('.webp', '-small.webp')} 840w, ${source} 1600w`;
    };
    setComparisonImage(beforeImage, card?.dataset.before);
    setComparisonImage(afterImage, card?.dataset.after);
    const range = dialog.querySelector('.compare-range');
    range.value = 50;
    range.dispatchEvent(new Event('input'));
    dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector('.dialog-close').focus();
    motion?.enter(dialog, {distance: 16, scale: true, duration: 300});
  }));
  dialog.addEventListener('close', () => { opener?.focus({preventScroll: true}); });
})();
