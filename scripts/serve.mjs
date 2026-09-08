import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
const root = resolve(import.meta.dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.woff2':'font/woff2','.json':'application/json'};
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (!file.startsWith(root + sep) || /(?:^|[\\/])(?:\.|node_modules)/.test(file.slice(root.length + 1))) {res.writeHead(403);res.end();return;}
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});
    res.end(data);
  } catch {res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});res.end('Pagina nu a fost găsită.');}
}).listen(4173, '127.0.0.1', () => console.log('LUMEN Dental: http://127.0.0.1:4173'));
