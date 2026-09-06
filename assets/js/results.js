(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.case-card')];
  const count = document.querySelector('#results-count');
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
    const shown = cards.filter(card => !card.hidden).length;
    count.textContent = `${shown} ${shown === 1 ? 'caz demonstrativ' : 'cazuri demonstrative'}`;
  }));
  const dialog = document.querySelector('#case-dialog');
  if (!dialog) return;
  let opener = null;
  document.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => {
    const item = (window.LUMEN_CASES || []).find(entry => entry.id === button.dataset.case);
    if (!item) return;
    opener = button;
    const content = {'case-dialog-id':`CAZ ${item.id} · SCENARIU DEMONSTRATIV`,'case-dialog-title':item.title,'case-dialog-meta':`${item.tags} · ${item.duration} — durată ilustrativă`,'case-problem':item.problem,'case-approach':item.approach,'case-result':item.result};
    Object.entries(content).forEach(([id, value]) => { document.getElementById(id).textContent = value; });
    const range = dialog.querySelector('.compare-range');
    range.value = 50;
    range.dispatchEvent(new Event('input'));
    dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector('.dialog-close').focus();
  }));
  dialog.addEventListener('close', () => { opener?.focus({preventScroll: true}); });
})();
