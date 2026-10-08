import {parse} from 'tldts';
export function domainInfo(input) {
 try {
  const url = new URL(input);
  const host = url.hostname.toLowerCase().replace(/\.$/,'');
  const parsed = parse(host,{allowPrivateDomains:true});
  const local = host==='localhost'||host.endsWith('.localhost')||host==='127.0.0.1'||host==='[::1]';
  const registrationDomain=parse(host,{allowPrivateDomains:false}).domain;
  return {host,domain:parsed.domain||host,registrationDomain,isPublic:!!(parsed.isIcann||parsed.isPrivate),suffix:parsed.publicSuffix||'',isIp:parsed.isIp||host.startsWith('['),local,protocol:url.protocol,port:url.port};
 } catch {return null;}
}
export function sameSite(a,b) {const x=domainInfo(a),y=domainInfo(b);return !!x&&!!y&&x.domain===y.domain;}
export function editDistance(a,b) {
 const row=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){let last=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,last+(a[i-1]===b[j-1]?0:1));last=old;}}
 return row[b.length];
}
