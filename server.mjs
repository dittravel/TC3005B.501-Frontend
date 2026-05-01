import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { handler } from './dist/server/entry.mjs';

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 4321);
const keyPath = process.env.HTTPS_KEY_PATH || './certs/server.key';
const certPath = process.env.HTTPS_CERT_PATH || './certs/server.crt';
const caPath = process.env.HTTPS_CA_PATH || './certs/ca.crt';

const tlsOptions = {
  key: fs.readFileSync(keyPath, 'utf8'),
  cert: fs.readFileSync(certPath, 'utf8'),
};

const clientDir = path.resolve('./dist/client');

const MIME_TYPES = {
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

function serveStaticFile(req, res) {
  if (!req.url) return false;

  const requestUrl = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  let pathname;

  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    res.statusCode = 400;
    res.end('Bad Request');
    return true;
  }

  const relativePath = pathname.replace(/^\//, '');
  const candidatePath = path.resolve(clientDir, relativePath);

  if (!candidatePath.startsWith(clientDir)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return true;
  }

  if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isFile()) {
    return false;
  }

  const ext = path.extname(candidatePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', mimeType);
  if (pathname.startsWith('/_astro/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  fs.createReadStream(candidatePath).pipe(res);
  return true;
}

if (fs.existsSync(caPath)) {
  tlsOptions.ca = fs.readFileSync(caPath, 'utf8');
}

const server = https.createServer(tlsOptions, (req, res) => {
  if (serveStaticFile(req, res)) {
    return;
  }

  handler(req, res, () => {
    res.statusCode = 404;
    res.end('Not Found');
  });
});

server.listen(port, host, () => {
  console.log(`Frontend HTTPS server listening on https://${host}:${port}`);
});
