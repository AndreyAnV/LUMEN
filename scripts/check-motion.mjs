import {readFile, appendFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import vm from 'node:vm';

// Controlled animation/observer doubles verify cancellation and accessibility state,
// not rendered animation quality. No browser or external requests are involved.
const root = resolve(import.meta.dirname, '..');
let checks = 0;
const check = (condition, description) => {assert.ok(condition, description); checks++;};
const windows = [];
async function setup(page, {reduced = false, animationAPI = true, compact = false} = {}) {
  const window = new Window({url:`http://localhost/${page}`, settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableIframePageLoading:true,enableJavaScriptEvaluation:true}});
  windows.push(window);
  window.document.write(await readFile(resolve(root,page),'utf8'));
  const animations = [];
  const observers = [];
  const listeners = [];
  const preference = {matches:reduced,addEventListener:(_,listener)=>listeners.push(listener)};
  window.matchMedia = query => query.includes('prefers-reduced-motion') ? preference : {matches:compact && query.includes('max-width'),addEventListener(){}};
  window.requestIdleCallback = () => 0;
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    const offscreen = this.matches('.team-card, .technology-card, .section-heading');
    const height = this.tagName === 'DETAILS' ? (parseFloat(this.style.height) || (this.open ? 200 : 80)) : this.tagName === 'SUMMARY' ? 80 : 120;
    return {top:offscreen?1200:0,bottom:(offscreen?1200:0)+height,left:0,right:400,width:400,height};
  };
  window.IntersectionObserver = class {
    constructor(callback) {this.callback=callback;this.observed=new Set();observers.push(this);}
    observe(element) {this.observed.add(element);}
    unobserve(element) {this.observed.delete(element);}
    disconnect() {this.observed.clear();}
  };
  if (animationAPI) window.Element.prototype.animate = function (frames, options) {
    let finish, cancel;
    const finished = new Promise((resolve,reject)=>{finish=resolve;cancel=reject;});
    const animation = {element:this,frames,options,finished,cancelled:false,completed:false,finish(){this.completed=true;finish();},cancel(){this.cancelled=true;cancel(new Error('Cancelled'));}};
    animations.push(animation);
    return animation;
  };
  else window.Element.prototype.animate = undefined;
  for (const file of ['page-entry.js','config.js','motion.js','main.js','cases-data.js','results.js']) window.eval(await readFile(resolve(root,'assets/js',file),'utf8'));
  const latest = selector => animations.filter(animation=>animation.element.matches(selector)).at(-1);
  const reduceNow = () => {preference.matches=true;listeners.forEach(listener=>listener({matches:true}));};
  return {window,doc:window.document,animations,observers,latest,reduceNow};
}
const tick = async () => {await Promise.resolve();await Promise.resolve();};

const normal = await setup('index.html');
check(normal.animations.some(animation=>animation.element.matches('.hero-copy h1')), 'Hero has entrance animation');
const revealObserver = normal.observers.find(observer=>[...observer.observed].some(element=>element.matches('.team-card')));
const cards = [...normal.doc.querySelectorAll('.team-card')].slice(0,3);
check(cards.every(card=>card.classList.contains('motion-pending')), 'Offscreen cards wait for reveal');
revealObserver.callback(cards.map(target=>({target,isIntersecting:true})));
check(cards.every(card=>!card.classList.contains('motion-pending')), 'Intersecting cards become visible');
check(normal.animations.filter(animation=>cards.includes(animation.element)).map(animation=>animation.options.delay).join(',')==='0,70,140', 'Sibling reveals receive capped stagger');
check(cards.every(card=>!revealObserver.observed.has(card)), 'Revealed cards unobserved');
const pendingCard = normal.doc.querySelectorAll('.team-card')[3];
pendingCard.querySelector('a').focus();
check(!pendingCard.classList.contains('motion-pending'), 'Keyboard focus reveals pending ancestor immediately');

normal.doc.querySelector('.menu-toggle').click();
const menu = normal.doc.querySelector('#mobile-menu');
check(menu.open && !normal.latest('#mobile-menu').cancelled, 'Menu entrance survives initial focus');
normal.doc.querySelector('.menu-close').click();
check(menu.open, 'Menu remains modal during exit');
const exit = normal.latest('#mobile-menu');
exit.finish();
await tick();
check(!menu.open, 'Menu closes after exit finishes');
normal.doc.querySelector('.menu-toggle').click();
const escape = new normal.window.Event('cancel',{cancelable:true});
menu.dispatchEvent(escape);
check(escape.defaultPrevented, 'Escape follows the animated close path');
normal.latest('#mobile-menu').finish();
await tick();
check(!menu.open, 'Escape exit completes');
normal.reduceNow();
await tick();
check(normal.doc.querySelectorAll('.motion-pending').length===0, 'Changing to reduced motion reveals all pending content');
check(normal.animations.every(animation=>animation.cancelled || animation.completed), 'Reduced motion cancels active animations');
const count = normal.animations.length;
normal.doc.querySelector('.testimonial-next').click();
check(normal.animations.length===count, 'Reduced motion does not schedule new animation');
normal.doc.querySelector('.menu-toggle').click();
normal.doc.querySelector('.menu-close').click();
check(!menu.open, 'Reduced-motion menu closes immediately');

const prices = await setup('tarife.html');
const details = prices.doc.querySelectorAll('details')[1];
const summary = details.querySelector('summary');
summary.click();
const opening = prices.latest('details');
check(details.open, 'Accordion opens before measurement');
summary.click();
const closing = prices.latest('details');
check(opening.cancelled && closing!==opening, 'Rapid accordion reversal cancels previous expansion');
opening.finish();
closing.finish();
await tick();
check(!details.open && !details.style.height && !details.style.overflow, 'Accordion settles in latest requested state without inline sizing');
summary.click();
prices.reduceNow();
await tick();
check(details.open && !details.style.height, 'Reduced-motion change safely completes active expansion');

const noAPI = await setup('echipa.html',{animationAPI:false});
check(noAPI.doc.querySelectorAll('.motion-pending').length===0, 'Missing animation API never hides content');
noAPI.doc.querySelector('.menu-toggle').click();
noAPI.doc.querySelector('.menu-close').click();
check(!noAPI.doc.querySelector('#mobile-menu').open, 'Missing animation API preserves menu behavior');

const restored = await setup('despre-noi.html');
check(restored.doc.querySelectorAll('.motion-pending').length>0, 'History fixture includes pending reveals');
restored.window.dispatchEvent(new restored.window.Event('pagehide'));
await tick();
check(restored.doc.querySelectorAll('.motion-pending').length===0, 'Page cache never retains invisible pending content');

const mobile = await setup('index.html',{compact:true});
const mobileObserver = mobile.observers.find(observer=>[...observer.observed].some(element=>element.matches('.team-card')));
const mobileCard = mobile.doc.querySelector('.team-card');
mobileObserver.callback([{target:mobileCard,isIntersecting:true}]);
const mobileReveal = mobile.animations.find(animation=>animation.element===mobileCard);
check(mobileReveal.frames[0].opacity===0 && mobileReveal.frames[1].opacity===1, 'Mobile scroll reveal fades from transparent to visible');
check(mobileReveal.frames[0].filter==='blur(4px)' && mobileReveal.frames[1].filter==='blur(0px)', 'Mobile scroll reveal animates blur to clear');

const navigation = await setup('index.html');
const contactLink = navigation.doc.querySelector('a[href="contact.html"]');
contactLink.click();
check(navigation.doc.body.classList.contains('is-transitioning'), 'Internal navigation starts diagonal curtain');
check(navigation.window.sessionStorage.getItem('lumen_page_transition')==='active', 'Internal navigation prepares covered destination');
const external = navigation.doc.querySelector('a[href^="https://wa.me"]');
external.click();
check(navigation.doc.body.classList.contains('is-transitioning'), 'External links do not disturb current transition');

async function pageEntryFixture(type, {hash = '', transition = false} = {}) {
  const classes = new Set();
  const storage = new Map(transition ? [['lumen_page_transition','active']] : []);
  const scrollCalls = [];
  const context = {
    performance:{getEntriesByType:()=>[{type}]},
    matchMedia:()=>({matches:false}),
    document:{documentElement:{classList:{add:name=>classes.add(name)}},addEventListener(){}},
    history:{scrollRestoration:'auto',state:null,replaceState(){context.location.hash='';}},
    location:{pathname:'/index.html',search:'',hash},
    sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
    scrollTo:options=>scrollCalls.push(options),
    addEventListener(){},requestAnimationFrame:callback=>callback()
  };
  context.window=context;
  vm.runInNewContext(await readFile(resolve(root,'assets/js/page-entry.js'),'utf8'),context);
  return {window:context,classes,storage,scrollCalls};
}
const reloadEntry = await pageEntryFixture('reload',{hash:'#descopera',transition:true});
check(reloadEntry.window.LUMEN_PAGE_ENTRY.reload && reloadEntry.scrollCalls.length>0, 'Reload requests the top before page paint');
check(reloadEntry.window.location.hash==='', 'Reload removes a stale fragment target');
check(!reloadEntry.storage.has('lumen_page_transition'), 'Reload clears stale page transition state');
const coveredEntry = await pageEntryFixture('navigate',{transition:true});
check(coveredEntry.classes.has('transition-covered'), 'Destination begins behind the diagonal curtain');
check(!coveredEntry.window.LUMEN_PAGE_ENTRY.reload, 'Normal page navigation is not treated as refresh');

for (const window of windows) await window.happyDOM.close();
await appendFile(resolve(root,'docs/validation.md'),`\nMotion update: ${checks} additional lifecycle assertions passed, covering staggered reveals, keyboard visibility, menu entrance/exit and Escape, runtime reduced-motion changes, reversible accordions, missing animation APIs and page-cache restoration. Controlled animation/observer doubles were used; visual browser testing was not performed.\n`);
console.log(`${checks} motion lifecycle checks passed (simulated DOM, not visual browser tests).`);
