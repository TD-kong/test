(W=>{
const KEY='wbsgantt.v1',S={tasks:[],meta:{projectTitle:'新規プロジェクト WBS',weekStart:'monday',holidays:[],theme:'system'},base:{}};
const F={q:'',status:'',assignee:'',late:false};
const p2=n=>String(n).padStart(2,'0');
const fmt=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const days=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return fmt(d)};
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&fmt(parse(s))===s;
const today=()=>fmt(new Date());
const get=id=>S.tasks.find(t=>t.id===id);
const kids=id=>S.tasks.filter(t=>t.parentId===id).sort((a,b)=>a.order-b.order);
const hasKids=id=>S.tasks.some(t=>t.parentId===id);
const height=id=>1+Math.max(0,...kids(id).map(c=>height(c.id)));
const hooks={render(){},change(){},quota(){}};
function save(){try{localStorage.setItem(KEY,JSON.stringify({tasks:S.tasks,meta:S.meta,base:S.base}));return true}catch(e){hooks.quota(e);return false}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d){S.tasks=d.tasks||[];Object.assign(S.meta,d.meta);S.base=d.base||{}}}catch(e){}rollup()}
function rollup(){const calc=t=>{const k=kids(t.id);if(!k.length)return;k.forEach(calc);
 t.startDate=k.map(x=>x.startDate).sort()[0];t.endDate=k.map(x=>x.endDate).sort().pop();
 let w=0,p=0;k.forEach(x=>{const d=days(x.startDate,x.endDate)+1;w+=d;p+=d*x.progress});t.progress=Math.round(p/w);
 const st=k.map(x=>x.status);t.status=st.every(s=>s==='done')?'done':st.includes('blocked')?'blocked':st.every(s=>s==='todo')?'todo':'in_progress'};
 S.tasks.filter(t=>!t.parentId).forEach(calc)}
function commit(quiet){rollup();save();hooks.render();if(!quiet)hooks.change()}
function check(t){if(!t.title||t.title.length>120)return'タイトルは1〜120文字で入力してください';if(!validDate(t.startDate)||!validDate(t.endDate))return'日付の形式が不正です';if(t.startDate>t.endDate)return'終了日は開始日以降にしてください';return null}
function canParent(id,pid){const p=get(pid);if(!p)return false;if(id){for(let q=p;q;q=get(q.parentId))if(q.id===id)return false;return p.level+height(id)<=3}return p.level<3}
function relevel(t){kids(t.id).forEach(c=>{c.level=t.level+1;relevel(c)})}
function upsert(n){let t=n.id&&get(n.id);const p=get(n.parentId);n.level=p?p.level+1:1;
 const nextOrder=()=>Math.max(-1,...kids(n.parentId||null).map(x=>x.order))+1;
 if(!t){n.id='task_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);n.order=nextOrder();n.collapsed=false;n.revision=0;S.tasks.push(n);t=n}
 else if(t.parentId!==n.parentId)n.order=nextOrder();
 Object.assign(t,n);t.revision=(t.revision||0)+1;t.updatedAt=new Date().toISOString();relevel(t);commit()}
function remove(id){const ids=new Set([id]);let c=1;while(c){c=0;S.tasks.forEach(t=>{if(ids.has(t.parentId)&&!ids.has(t.id)){ids.add(t.id);c=1}})}S.tasks=S.tasks.filter(t=>!ids.has(t.id));commit()}
function toggle(id){const t=get(id);t.collapsed=!t.collapsed;save();hooks.render()}
const isLate=t=>t.endDate<today()&&t.progress<100;
const lateDays=t=>days(t.endDate,today());
const match=t=>(!F.q||(t.title+t.assignee+t.memo).toLowerCase().includes(F.q.toLowerCase()))&&(!F.status||t.status===F.status)&&(!F.assignee||t.assignee===F.assignee)&&(!F.late||isLate(t));
const filterActive=()=>!!(F.q||F.status||F.assignee||F.late);
const deep=t=>match(t)||kids(t.id).some(deep);
function rows(){const out=[],fa=filterActive();const w=t=>{if(fa&&!deep(t))return;out.push(t);if(fa||!t.collapsed)kids(t.id).forEach(w)};kids(null).forEach(w);return out}
const num=t=>(t.parentId&&get(t.parentId)?num(get(t.parentId))+'.':'')+(kids(t.parentId||null).indexOf(t)+1);
function adopt(tasks,meta){S.tasks=tasks;if(meta)Object.assign(S.meta,meta);S.base={};tasks.forEach(t=>S.base[t.id]=t.revision);commit(true)}
Object.assign(W,{S,F,fmt,parse,days,addDays,validDate,today,get,kids,hasKids,height,hooks,save,load,rollup,commit,check,canParent,upsert,remove,toggle,isLate,lateDays,filterActive,rows,num,adopt,KEY});
})(window.W=window.W||{});
