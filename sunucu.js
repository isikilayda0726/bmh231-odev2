const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {

  console.log(`[ISTEK] ${req.method} ${req.url}`);

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET' });
    return res.end('405 Yalnizca GET yontemi desteklenir.');
  }

  if (pathname === '/api/etkinlikler') {
    const turFiltresi = parsedUrl.query.tur;
    fs.readFile(path.join(__dirname, 'etkinlikler.json'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ hata: 'Sunucu hatasi' }));
      }
      let etkinlikler = JSON.parse(data);
      if (turFiltresi) {
        etkinlikler = etkinlikler.filter(e => e.tur === turFiltresi);
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(etkinlikler));
    });
    return;
  }

  const etkinlikMatch = pathname.match(/^\/api\/etkinlikler\/(\d+)$/);
  if (etkinlikMatch) {
    const id = parseInt(etkinlikMatch[1]);
    fs.readFile(path.join(__dirname, 'etkinlikler.json'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ hata: 'Sunucu hatasi' }));
      }
      const etkinlikler = JSON.parse(data);
      const etkinlik = etkinlikler.find(e => e.id === id);
      if (etkinlik) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(etkinlik));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ hata: 'Etkinlik bulunamadi' }));
      }
    });
    return;
  }

  let filePath = pathname === '/' ? 'public/index.html' : path.join('public', pathname);
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve('public'))) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Yasakli erisim');
  }

  const extname = path.extname(filePath);
  let contentType = 'text/html; charset=utf-8';
  if (extname === '.css') contentType = 'text/css; charset=utf-8';
  if (extname === '.js') contentType = 'text/javascript; charset=utf-8';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Sayfa Bulunamadi');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde calisiyor.`);
});
