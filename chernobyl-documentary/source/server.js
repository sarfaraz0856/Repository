// Minimal static file server for the render pages.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const TYPES = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.bin':'application/octet-stream'};
function start(port=8765){
  return new Promise(res=>{
    const srv = http.createServer((req,resp)=>{
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/web/index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT)) { resp.writeHead(403); return resp.end(); }
      fs.readFile(f, (err, data)=>{
        if (err) { resp.writeHead(404); return resp.end('nf'); }
        resp.writeHead(200, {'Content-Type': TYPES[path.extname(f)]||'application/octet-stream', 'Cache-Control':'no-store'});
        resp.end(data);
      });
    });
    srv.listen(port, ()=>res(srv));
  });
}
module.exports = {start};
