(W=>{
const CK='wbsgantt.gas';let cfg={url:'',token:''},timer,state='off';
try{cfg=Object.assign(cfg,JSON.parse(localStorage.getItem(CK)))}catch(e){}
if(cfg.url)state='unsynced';
const st=s=>{state=s;G.onState&&G.onState(s)};
async function call(p){const r=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({token:cfg.token},p))});
 if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(j.error)throw new Error(j.error);return j}
const G=W.gas={onState:null,onConflict:null,err:'',cfg:()=>cfg,state:()=>cfg.url?state:'off',
 setCfg(c){if(c.url&&!/^https:\/\//.test(c.url))throw new Error('URLは https:// で始めてください');cfg={url:c.url||'',token:c.token||''};
  try{localStorage.setItem(CK,JSON.stringify(cfg))}catch(e){}st(cfg.url?'unsynced':'off')},
 async test(){return call({action:'ping'})},
 schedule(){if(!cfg.url)return;st(navigator.onLine?'unsynced':'offline');clearTimeout(timer);timer=setTimeout(()=>G.push(),1500)},
 async push(force){if(!cfg.url)return;if(!navigator.onLine)return st('offline');st('syncing');const S=W.S;
  try{const j=await call({action:'push',force:!!force,meta:S.meta,tasks:S.tasks.map(t=>Object.assign({},t,{baseRevision:S.base[t.id]||0})),deleted:Object.keys(S.base).filter(id=>!W.get(id))});
   if(j.conflicts&&j.conflicts.length){st('conflict');G.onConflict&&G.onConflict(j);return}
   j.tasks.forEach(s=>{const l=W.get(s.id);if(!l){if(!(s.id in S.base))S.tasks.push(s)}else if(s.revision>l.revision)Object.assign(l,s)});
   S.base={};S.tasks.forEach(t=>{const r=j.revs[t.id];if(r){t.revision=Math.max(t.revision,r);S.base[t.id]=t.revision}});
   W.commit(true);st('synced')}catch(e){G.err=e.message;st(navigator.onLine?'unsynced':'offline')}}};
})(window.W=window.W||{});
