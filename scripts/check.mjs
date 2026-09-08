import {readFile, readdir, stat, writeFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {Window} from 'happy-dom';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const pages = (await readdir(root)).filter(name => name.endsWith('.html'));
let assertions = 0;
const check = (condition, message) => {assert.ok(condition, message); assertions++;};
const documents = new Map();
const titles = new Set();
const descriptions = new Set();
for (const name of pages) {
  const html = await readFile(resolve(root, name), 'utf8');
  const english = name.endsWith('-en.html');
  check(!/\S<br>|<br>\S/.test(html), `${name}: responsive line breaks preserve word spacing`);
  const window = new Window({settings: {disableCSSFileLoading:true,disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:false,disableIframePageLoading:true}});
  window.document.write(html);
  const doc = window.document;
  documents.set(name, {doc,window,html});
  check(doc.documentElement.lang === (english ? 'en' : 'ro'), `${name}: correct document language`);
  check(doc.querySelectorAll('h1').length === 1, `${name}: exactly one h1`);
  check(doc.querySelectorAll('main').length === 1, `${name}: one main landmark`);
  check(!titles.has(doc.title) && doc.title.length > 10, `${name}: unique title`);
  titles.add(doc.title);
  const description = doc.querySelector('meta[name=description]')?.content;
  check(description && !descriptions.has(description), `${name}: unique meta description`);
  descriptions.add(description);
  check(doc.querySelector('meta[name=robots]')?.content === 'noindex, nofollow', `${name}: fictional business not indexed`);
  check(doc.querySelector('meta[property="og:locale"]')?.content === (english ? 'en_GB' : 'ro_RO'), `${name}: correct Open Graph locale`);
  const switcher = doc.querySelector('.header-actions > .language-switch');
  check(switcher && doc.querySelector('.header-actions > .menu-toggle'), `${name}: language switch shares the header actions with the menu button`);
  const counterpart = english ? name.replace('-en.html','.html') : name.replace('.html','-en.html');
  check(switcher.querySelector(`a[href="${counterpart}"]`) && switcher.querySelector('[aria-current="true"]')?.textContent.trim() === (english ? 'EN' : 'RO'), `${name}: reciprocal language switch`);
  check(JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@type'] === 'Dentist', `${name}: valid structured data`);
  const ids = new Set();
  for (const element of doc.querySelectorAll('[id]')) {
    check(!ids.has(element.id), `${name}: no duplicate ID ${element.id}`);
    ids.add(element.id);
  }
  for (const img of doc.querySelectorAll('img')) {
    check(img.hasAttribute('alt') && img.hasAttribute('width') && img.hasAttribute('height'), `${name}: image alt and dimensions`);
  }
  for (const input of doc.querySelectorAll('input, select, textarea')) {
    check(input.id && doc.querySelector(`label[for="${input.id}"]`), `${name}: visible or accessible input label ${input.id}`);
  }
  for (const button of doc.querySelectorAll('button')) {
    check(button.textContent.trim() || button.getAttribute('aria-label'), `${name}: named button`);
  }
  for (const script of doc.querySelectorAll('script[src]')) {
    new vm.Script(await readFile(resolve(root,script.getAttribute('src')), 'utf8'));
    assertions++;
  }
}
const homeHeadings = [...documents.get('index.html').doc.querySelectorAll('main h1, main h2')]
  .map(heading => heading.textContent.replace(/\s+/g, ' ').trim());
for (const expected of [
  'Un zâmbet care se simte la fel de bine cum arată.',
  'Tot ce îi trebuie zâmbetului tău.',
  'Transformări care se văd. Încredere care se simte.',
  'Oameni în care poți avea încredere.'
]) check(homeHeadings.includes(expected), `Homepage Romanian heading: ${expected}`);
const englishHomeHeadings = [...documents.get('index-en.html').doc.querySelectorAll('main h1, main h2')]
  .map(heading => heading.textContent.replace(/\s+/g, ' ').trim());
for (const expected of [
  'A smile that feels as good as it looks.',
  'Everything your smile needs.',
  'Visible transformations. Confidence you can feel.',
  'People you can trust.'
]) check(englishHomeHeadings.includes(expected), `Homepage English heading: ${expected}`);
for (const name of ['index.html', 'index-en.html']) {
  const {doc} = documents.get(name);
  const hero = doc.querySelector('.hero');
  check(hero, `${name}: hero exists`);
  const heroPoster = hero.querySelector('.hero-poster');
  const heroVideo = hero.querySelector('#hero-video');
  const heroSource = heroVideo?.querySelector('source');
  check(!heroPoster, `${name}: hero safety poster is temporarily disabled`);
  check(!heroVideo?.hasAttribute('poster'), `${name}: video poster attribute is temporarily disabled`);
  check(!heroVideo?.hasAttribute('data-src-webm'), `${name}: no longer references WebM`);
  check(!heroVideo?.hasAttribute('data-src-mp4'), `${name}: MP4 is no longer delayed behind JavaScript`);
  check(heroSource?.getAttribute('src') === 'assets/images/hero/hero-video.mp4' && heroSource?.getAttribute('type') === 'video/mp4', `${name}: loads the optimized Safari-compatible MP4 natively`);
  check(hero.querySelector('.hero-media') && hero.querySelector('.hero-shade'), `${name}: hero media and contrast layers exist`);
}
for (const [name, {doc}] of documents) {
  for (const element of doc.querySelectorAll('[href], [src], [poster]')) {
    const value = element.getAttribute('href') ?? element.getAttribute('src') ?? element.getAttribute('poster');
    if (!value || /^(https?:|tel:|mailto:|data:)/.test(value)) continue;
    const [relative, hash] = value.split('#');
    const path = relative.split('?')[0] || name;
    check((await stat(resolve(root,path))).isFile(), `${name}: local reference exists: ${value}`);
    if (hash && path.endsWith('.html')) check(documents.get(path)?.doc.getElementById(hash), `${name}: target anchor exists: ${value}`);
  }
  for (const img of doc.querySelectorAll('[srcset]')) {
    for (const entry of img.getAttribute('srcset').split(',')) {
      const path = entry.trim().split(' ')[0];
      check((await stat(resolve(root,path))).isFile(), `${name}: responsive image exists: ${path}`);
    }
  }
}
const css = await readFile(resolve(root,'assets/css/styles.css'),'utf8');
const motionCss = await readFile(resolve(root,'assets/css/motion.css'),'utf8');
const mainJs = await readFile(resolve(root,'assets/js/main.js'),'utf8');
check(/\.hero\{[^}]*background:#252d26[^}]*isolation/s.test(css), 'Hero keeps the site-theme dark-green fallback behind its media');
check(css.includes('.hero-media,.hero-shade{position:absolute;inset:0;z-index:-1;overflow:hidden}'), 'Hero media layers cover the hero');
check(mainJs.includes('showHeroPoster') && mainJs.includes("heroMedia.prepend(poster)"), 'Blocked hero autoplay loads the safety poster dynamically');
check(!mainJs.includes('hero-play-control'), 'Blocked hero autoplay adds no playback button');
check(motionCss.includes('.hero-media:not(.video-ready) .hero-poster.hero-poster-fallback.is-visible'), 'Fallback hero poster fades in after loading');
for (const [,path] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
  check((await stat(resolve(root,'assets/css',path))).isFile(), `CSS asset exists: ${path}`);
}
check(css.includes('env(safe-area-inset-bottom)'), 'Safe-area treatment');
check(css.includes('prefers-reduced-motion'), 'Reduced-motion treatment');
check(css.includes('@media(max-width:359px)'), '320px layout refinement');

// DOM-level behavior tests, without a browser or network. Native rendering is not simulated.
async function interactive(name) {
  const win = new Window({url:`http://127.0.0.1:4173/${name}`,settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableIframePageLoading:true,enableJavaScriptEvaluation:true}});
  win.document.write(await readFile(resolve(root,name),'utf8'));
  win.matchMedia = () => ({matches:true,addEventListener(){},removeEventListener(){}});
  win.scrollTo = () => {};
  win.HTMLElement.prototype.scrollIntoView = () => {};
  const casesFile = name.endsWith('-en.html') ? 'cases-data-en.js' : 'cases-data.js';
  for(const script of ['config.js','motion.js','main.js',casesFile,'results.js']) win.eval(await readFile(resolve(root,'assets/js',script),'utf8'));
  return win;
}
const home = await interactive('index.html');
const homeDoc = home.document;
check(homeDoc.querySelector('.hero-poster')?.getAttribute('src') === 'assets/images/hero/hero-poster.jpg', 'Reduced or blocked hero motion displays the safety poster');
check(!homeDoc.querySelector('.hero button, .hero-play-control'), 'Hero fallback adds no playback control');
const quick = homeDoc.querySelector('[data-form]');
const submit = form => form.dispatchEvent(new form.ownerDocument.defaultView.Event('submit',{bubbles:true,cancelable:true}));
submit(quick);
check(quick.querySelectorAll('[aria-invalid=true]').length === 4, 'Empty quick form flags name, phone, service, consent');
quick.querySelector('[name=name]').value='  ';
quick.querySelector('[name=phone]').value='abc123';
submit(quick);
check(quick.querySelector('[name=name]').getAttribute('aria-invalid')==='true', 'Whitespace name rejected');
check(quick.querySelector('[name=phone]').getAttribute('aria-invalid')==='true', 'Malformed telephone rejected');
quick.querySelector('[name=name]').value='Persoană Demo';
quick.querySelector('[name=phone]').value='+40 712 345 678';
quick.querySelector('[name=service]').value='Implantologie';
quick.querySelector('[name=consent]').checked=true;
submit(quick);
check(quick.querySelector('.form-success'), 'Valid quick form shows success');
check(quick.querySelector('.form-success').textContent.includes('nu au fost trimise'), 'Success does not imply real transmission');
quick.querySelector('[data-reset-form]').click();
check(!quick.querySelector('.form-success') && quick.querySelector('[name=name]').value==='', 'Quick form resets cleanly');
const range=homeDoc.querySelector('.compare-range');
range.value=73;
range.dispatchEvent(new home.Event('input'));
check(range.closest('.comparison').style.getPropertyValue('--position')==='73%', 'Before/after slider position updates');
check(range.getAttribute('aria-valuetext').includes('73%'), 'Before/after accessible value updates');
homeDoc.querySelector('.testimonial-next').click();
check(homeDoc.querySelector('.testimonial-count').textContent==='02 / 03', 'Testimonial next');
homeDoc.querySelector('.testimonial-prev').click();
homeDoc.querySelector('.testimonial-prev').click();
check(homeDoc.querySelector('.testimonial-count').textContent==='03 / 03', 'Testimonial wraps backwards');
homeDoc.querySelector('.menu-toggle').click();
check(homeDoc.querySelector('#mobile-menu').open, 'Mobile menu opens');
check(homeDoc.querySelector('.menu-toggle').getAttribute('aria-expanded')==='true', 'Mobile menu expanded state');
homeDoc.querySelector('.menu-close').click();
check(!homeDoc.querySelector('#mobile-menu').open, 'Mobile menu closes');

const booking = await interactive('programare.html');
const bookingDoc=booking.document;
const form=bookingDoc.querySelector('[data-form]');
form.querySelector('[data-next]').click();
check(!form.querySelector('[data-step="0"]').hidden, 'Booking cannot skip invalid contact information');
form.querySelector('[name=name]').value='Persoană Demo';
form.querySelector('[name=phone]').value='0712345678';
form.querySelector('[name=email]').value='invalid';
form.querySelector('[data-next]').click();
check(form.querySelector('[name=email]').getAttribute('aria-invalid')==='true', 'Optional email validated when provided');
form.querySelector('[name=email]').value='';
form.querySelector('[data-next]').click();
check(!form.querySelector('[data-step="1"]').hidden, 'Booking advances to treatment');
form.querySelector('[data-next]').click();
check(!form.querySelector('[data-step="1"]').hidden, 'Booking requires treatment selection');
form.querySelector('[name=service]').value='Ortodonție';
form.querySelector('[data-next]').click();
check(!form.querySelector('[data-step="2"]').hidden, 'Booking advances to preferences');
form.querySelector('[data-back]').click();
check(form.querySelector('[name=service]').value==='Ortodonție', 'Back preserves treatment choice');
form.querySelector('[data-next]').click();
form.querySelector('[name=day]').value='2020-01-01';
submit(form);
check(form.querySelector('[name=day]').getAttribute('aria-invalid')==='true', 'Past appointment date rejected');
form.querySelector('[name=day]').value='';
form.querySelector('[name=consent]').checked=true;
submit(form);
check(form.querySelector('.form-success'), 'Booking success after valid three-step flow');
form.querySelector('[data-reset-form]').click();
check(!form.querySelector('[data-step="0"]').hidden && form.querySelector('[data-step="1"]').disabled, 'Booking reset returns to first step and disables later fields');

const results=await interactive('rezultate.html');
const resultsDoc=results.document;
resultsDoc.querySelector('[data-filter="ortodontie"]').click();
check([...resultsDoc.querySelectorAll('.case-card')].filter(card=>!card.hidden).length===1,'Results category filter');
check(resultsDoc.querySelector('#results-count').textContent==='1 caz demonstrativ','Result count announcement');
resultsDoc.querySelector('[data-case="03"]').click();
check(resultsDoc.querySelector('#case-dialog').open,'Case modal opens');
check(resultsDoc.querySelector('#case-dialog-title').textContent==='Un zâmbet în echilibru','Case modal displays selected case');
check(resultsDoc.querySelector('#case-approach').textContent.length>20,'Case approach is populated');
resultsDoc.querySelector('#case-dialog .dialog-close').click();
check(!resultsDoc.querySelector('#case-dialog').open,'Case modal closes');
resultsDoc.querySelector('[data-filter="all"]').click();
check([...resultsDoc.querySelectorAll('.case-card')].every(card=>!card.hidden),'All cases filter restores portfolio');

const englishHome = await interactive('index-en.html');
const englishQuick = englishHome.document.querySelector('[data-form]');
submit(englishQuick);
check(englishQuick.querySelector('.field-error').textContent === 'Complete this field.', 'English form validation copy');
englishQuick.querySelector('[name=name]').value='Demo Person';
englishQuick.querySelector('[name=phone]').value='+40 712 345 678';
englishQuick.querySelector('[name=service]').value='Endodontics';
englishQuick.querySelector('[name=consent]').checked=true;
submit(englishQuick);
check(englishQuick.querySelector('.form-success')?.textContent.includes('no real appointment was created'), 'English form confirmation copy');
const englishResults = await interactive('rezultate-en.html');
englishResults.document.querySelector('[data-filter="ortodontie"]').click();
check(englishResults.document.querySelector('#results-count').textContent === '1 demonstration case', 'English results count announcement');

for (const {window} of documents.values()) await window.happyDOM.close();
for (const window of [home,booking,results,englishHome,englishResults]) await window.happyDOM.close();
const report=`# Validation\n\n${pages.length} HTML pages checked. ${assertions} assertions passed.\n\nVerified paired Romanian and English pages, reciprocal language switches, local links and anchors, assets and responsive sources, localized document metadata, unique page titles and descriptions, structured data, input labels, JavaScript syntax, localized form validation, form reset, the three-step booking flow, comparison values, testimonial navigation, mobile menu states, result filters and case modal content. Homepage checks enforce the optimized Safari-compatible MP4, contrast layer and dark-green background fallback, and reject WebM references. The safety poster is temporarily disabled.\n\nTests use Node and Happy DOM. They do not evaluate browser rendering, pixel layout, native keyboard focus containment, actual touch scrolling or Google Maps availability. Responsive layouts were reviewed in source for 320–1920px; actual browser/device visual testing remains a launch check.\n\nThe MP4 hero video uses two synchronized layers for a blurred crossfade at each loop boundary. No form backend is connected.\n`;
await writeFile(resolve(root,'docs/validation.md'),report);
console.log(`${pages.length} pages; ${assertions} assertions passed. See docs/validation.md.`);
