import {build} from 'esbuild';
import {mkdir,cp,writeFile,readFile} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
const root=new URL('../',import.meta.url);
process.chdir(root.pathname);
const crc=buf=>{let c=0xffffffff;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xedb88320:0);}return (c^0xffffffff)>>>0;};
function png(size){const bytes=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=y*(size*4+1)+1+x*4;const edge=x<size*.15||x>size*.85||y<size*.15||y>size*.85;const check=(x>size*.26&&x<size*.45&&Math.abs(y-(x+size*.2))<size*.055)||(x>=size*.42&&x<size*.76&&Math.abs(y-(-x+size*1.07))<size*.055);const v=edge?28:check?240:53;bytes.set([v,v,v,255],i);}const chunk=(t,data)=>{const type=Buffer.from(t),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(data.length);c.writeUInt32BE(crc(Buffer.concat([type,data])));return Buffer.concat([n,type,data,c]);};const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(bytes)),chunk('IEND',Buffer.alloc(0))]);}
for(const demo of [false,true]){
 const dir=`dist/${demo?'shopcheck-demo':'shopcheck'}`;await mkdir(dir,{recursive:true});
 await build({entryPoints:['extension/background.js','extension/content.js','extension/popup.js'],outdir:dir,bundle:true,format:'esm',target:'chrome120',define:{__DEMO__:JSON.stringify(demo)},minify:false});
 for(const file of ['popup.html','ui.css','meadow.css','assets'])await cp(`extension/${file}`,`${dir}/${file}`,{recursive:true});
 await cp('node_modules/tldts/LICENSE',`${dir}/TLDTS-LICENSE.txt`);
 await cp('node_modules/tldts-core/LICENSE',`${dir}/TLDTS-CORE-LICENSE.txt`);
 const icons={};for(const size of [16,32,48,128]){const name=`icon-${size}.png`;await writeFile(`${dir}/${name}`,png(size));icons[size]=name;}
 const manifest={manifest_version:3,name:`Meadow${demo?' · Demo Lab':''}`,version:'1.1.0',description:'Seven transparent checks for online stores. Local rules, clear evidence, no AI.',minimum_chrome_version:'120',permissions:['storage'],host_permissions:['https://*/*','http://*/*'],background:{service_worker:'background.js',type:'module'},action:{default_popup:'popup.html',default_title:'Meadow',default_icon:icons},icons,content_scripts:[{matches:['https://*/*','http://*/*'],js:['content.js'],run_at:'document_idle'}],web_accessible_resources:[{resources:['assets/Rajdhani-Medium.ttf','assets/Inter-Variable.ttf'],matches:['https://*/*','http://*/*']}]};
 await writeFile(`${dir}/manifest.json`,JSON.stringify(manifest,null,2));
}
await mkdir('demo/public/built',{recursive:true});
await build({entryPoints:['demo/lab.js'],outdir:'demo/public/built',bundle:true,format:'esm',target:'chrome120'});
await cp('extension/ui.css','demo/public/built/ui.css');await cp('extension/assets','demo/public/built/assets',{recursive:true});
await cp('extension/meadow.css','demo/public/built/meadow.css');
console.log('Built live extension, isolated demo extension, and offline lab.');
