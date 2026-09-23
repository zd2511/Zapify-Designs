const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const port = Number(process.env.PORT || 8080);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf','.webmanifest':'application/manifest+json'};
function safePath(urlPath){
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const clean = decoded === '/' ? '/index.html' : decoded;
  const relative = clean.replace(/^[/\\]+/, '');
  const full = path.normalize(path.join(root, relative));
  return full.startsWith(root) ? full : null;
}
const server = http.createServer((req,res)=>{
  try {
    const file = safePath(req.url || '/');
    if (!file) return res.writeHead(403).end('Forbidden');
    fs.stat(file,(err,st)=>{
      if (err || !st.isFile()) return res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found');
      const ext=path.extname(file).toLowerCase();
      res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-cache'});
      fs.createReadStream(file).pipe(res);
    });
  } catch { res.writeHead(500).end('Server error'); }
});
server.listen(port,'127.0.0.1',()=>console.log(`Zapify running at http://127.0.0.1:${port}`));
