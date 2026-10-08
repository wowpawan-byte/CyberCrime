import {mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
process.chdir(new URL('../',import.meta.url).pathname);
await mkdir('releases',{recursive:true});
for(const name of ['shopcheck','shopcheck-demo'])execFileSync('zip',['-q','-r',`../../releases/${name.replace('shopcheck','meadow')}-1.1.0.zip`,'.'],{cwd:`dist/${name}`});
execFileSync('zip',['-q','-r','releases/meadow-project-1.1.0.zip','extension','demo','scripts','tests','dist','evaluation','docs','README.md','PLAN.md','package.json','package-lock.json','.gitignore']);
console.log('Packaged live/demo extension ZIPs and complete project source in releases/.');
