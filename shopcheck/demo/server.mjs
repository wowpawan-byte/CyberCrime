import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('public/',import.meta.url));
const hosts=new Set(['localhost','127.0.0.1','honest-store.localhost','flipkart-clearance.localhost','new-store.localhost','checkout-store.localhost','unavailable-store.localhost']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.ttf':'font/ttf','.txt':'text/plain'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,`http://${req.headers.host}`);
  if(!hosts.has(url.hostname)||req.method!=='GET'){res.writeHead(403);res.end('Local demo requests only.');return;}
  let pathname=decodeURIComponent(url.pathname);if(pathname==='/')pathname=url.hostname==='localhost'||url.hostname==='127.0.0.1'?'/index.html':'/store.html';
  const file=resolve(root,`.${pathname}`);
  if(!file.startsWith(root)||pathname.includes('..')){res.writeHead(403);res.end();return;}
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(8765,'127.0.0.1',()=>console.log('Meadow Demo Lab → http://localhost:8765\nLoopback only. Offline. No forms can submit. Ctrl+C to stop.'));
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port 8765 is occupied. Stop the previous demo process and retry.':e);process.exitCode=1;});
