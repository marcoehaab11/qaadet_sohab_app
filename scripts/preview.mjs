import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.wav': 'audio/wav',
  '.svg': 'image/svg+xml',
};
http
  .createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let file =
        pathname === '/prototype'
          ? path.resolve('prototype/qaadet-sohab-demo.html')
          : path.resolve(root, '.' + pathname);
      if (pathname !== '/prototype' && file !== root && !file.startsWith(root + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory())
        file = path.join(root, 'index.html');
      if (!fs.existsSync(file)) {
        response.writeHead(503).end('Build the preview first.');
        return;
      }
      response.writeHead(200, {
        'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(file)
        .on('error', () => response.end())
        .pipe(response);
    } catch {
      response.writeHead(404).end();
    }
  })
  .listen(4173, '127.0.0.1', () =>
    console.log('Preview: http://127.0.0.1:4173; original: /prototype'),
  );
