import {readFile, readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {Window} from 'happy-dom';

const root = resolve(import.meta.dirname, '..');
const english = process.argv.includes('--english');
const pages = (await readdir(root)).filter(name => name.endsWith('.html') && (english ? name.endsWith('-en.html') : !name.endsWith('-en.html')));
const values = new Set();
for (const page of pages) {
  const window = new Window({settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableIframePageLoading:true}});
  window.document.write(await readFile(resolve(root,page),'utf8'));
  const {document} = window;
  const walker = document.createTreeWalker(document.documentElement, 4);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.matches('script, style')) continue;
    const value = node.textContent.replace(/\s+/g,' ').trim();
    if (value && !/^[\d\s+·/–—.,:;()*↗←→‹›★★★★★]+$/.test(value)) values.add(value);
  }
  for (const element of document.querySelectorAll('[title], [alt], [aria-label], [placeholder], [aria-valuetext], [aria-roledescription]')) {
    for (const attr of ['title','alt','aria-label','placeholder','aria-valuetext','aria-roledescription']) {
      const value = element.getAttribute(attr)?.trim();
      if (value) values.add(value);
    }
  }
  await window.happyDOM.close();
}
console.log(JSON.stringify([...values].sort((a,b)=>a.localeCompare(b,'ro')),null,2));
