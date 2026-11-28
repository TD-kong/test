(function(){
const DATA_KEY='hierarchical_todo_v1_data', PREF_KEY='hierarchical_todo_v1_prefs';
const now=()=>new Date().toISOString(), uid=()=>('t'+Date.now().toString(36)+Math.random().toString(36).slice(2,8));
function demo(){let a=uid(),b=uid(),c=uid(),d=uid(),e=uid(),f=uid();return [
{id:a,parentId:null,title:'今週のやること',completed:false,notes:'大きな目標を小さなタスクに分けて管理します。',dueDate:null,priority:'high',tags:['サンプル'],collapsed:false,order:0,createdAt:now(),updatedAt:now()},
{id:b,parentId:a,title:'仕事の準備',completed:false,notes:'',dueDate:null,priority:'medium',tags:['仕事'],collapsed:false,order:0,createdAt:now(),updatedAt:now()},
{id:c,parentId:b,title:'資料を確認する',completed:false,notes:'必要な資料を集めて内容を確認する',dueDate:null,priority:'medium',tags:[],collapsed:false,order:0,createdAt:now(),updatedAt:now()},
{id:d,parentId:b,title:'作業計画を作る',completed:false,notes:'',dueDate:null,priority:'low',tags:[],collapsed:false,order:1,createdAt:now(),updatedAt:now()},
{id:e,parentId:a,title:'個人のタスク',completed:false,notes:'',dueDate:null,priority:'low',tags:['個人'],collapsed:false,order:1,createdAt:now(),updatedAt:now()},
{id:f,parentId:e,title:'アプリの使い方を試す',completed:false,notes:'Enterで追加、Tabで階層を変更できます。',dueDate:null,priority:'low',tags:[],collapsed:false,order:0,createdAt:now(),updatedAt:now()}];}
let tasks=[], prefs={view:'tree',theme:'system'};
function load(){let raw=localStorage.getItem(DATA_KEY);if(raw===null){tasks=demo();save();}else{try{let v=JSON.parse(raw);tasks=Array.isArray(v)?v:demo();}catch(e){tasks=demo();}}try{prefs=Object.assign(prefs,JSON.parse(localStorage.getItem(PREF_KEY)||'{}'));}catch(e){}}
function save(){try{localStorage.setItem(DATA_KEY,JSON.stringify(tasks));localStorage.setItem(PREF_KEY,JSON.stringify(prefs));return true;}catch(e){document.dispatchEvent(new CustomEvent('todo:quota'));return false;}}
function get(id){return tasks.find(t=>t.id===id)||null}
function children(id){return tasks.filter(t=>t.parentId===id).sort((a,b)=>a.order-b.order)}
function descendants(id){let out=[];function walk(x){children(x).forEach(t=>{out.push(t);walk(t.id);});}walk(id);return out;}
function allChildrenDone(id){let c=children(id);return c.length>0&&c.every(t=>t.completed);}
function updateAncestors(id){let p=get(id);while(p&&p.parentId){p=get(p.parentId);if(p){p.completed=allChildrenDone(p.id);p.updatedAt=now();}}}
function setDone(id,value){let t=get(id);if(!t)return;if(value){t.completed=true;descendants(id).forEach(x=>{x.completed=true;x.updatedAt=now();});}else{t.completed=false;}t.updatedAt=now();updateAncestors(id);save();}
function add(title,parentId){title=String(title||'').trim();if(!title)return null;let sib=children(parentId),t={id:uid(),parentId:parentId||null,title,completed:false,notes:'',dueDate:null,priority:'medium',tags:[],collapsed:false,order:sib.length,createdAt:now(),updatedAt:now()};tasks.push(t);updateAncestors(parentId);save();return t;}
function normalizeOrder(parentId){children(parentId).forEach((t,i)=>t.order=i);}
function move(id,newParentId,index){let t=get(id);if(!t||id===newParentId||descendants(id).some(x=>x.id===newParentId))return false;let old=t.parentId;t.parentId=newParentId||null;t.updatedAt=now();let sib=children(newParentId).filter(x=>x.id!==id);index=Math.max(0,Math.min(index,sib.length));sib.splice(index,0,t);sib.forEach((x,i)=>x.order=i);normalizeOrder(old);updateAncestors(old);updateAncestors(newParentId);save();return true;}
function remove(id){let t=get(id);if(!t)return null;let bundle=[t].concat(descendants(id));let ids=new Set(bundle.map(x=>x.id));tasks=tasks.filter(x=>!ids.has(x.id));normalizeOrder(t.parentId);updateAncestors(t.parentId);save();return {bundle,parentId:t.parentId};}
function restore(bundle,parentId){bundle.forEach(t=>tasks.push(t));normalizeOrder(parentId);save();}
function progress(id){let ds=descendants(id);let count=ds.filter(x=>x.completed).length;return {done:count,total:ds.length,pct:ds.length?Math.round(count/ds.length*100):0};}
function count(id){return descendants(id).length}
function validImport(obj){if(!obj||!Array.isArray(obj.tasks))throw Error('tasks配列がありません');let a=obj.tasks,ids=new Set();a.forEach(t=>{if(!t||typeof t.id!=='string'||!t.id||typeof t.title!=='string'||!t.title.trim())throw Error('id/titleが不正なタスクがあります');if(ids.has(t.id))throw Error('IDが重複しています');ids.add(t.id);if(t.parentId!==null&&t.parentId!==undefined&&typeof t.parentId!=='string')throw Error('parentIdの型が不正です');});a.forEach(t=>{if(t.parentId&&!ids.has(t.parentId))throw Error('親タスクが見つかりません: '+t.title);let seen=new Set([t.id]),p=t.parentId;while(p){if(seen.has(p))throw Error('親子の循環参照があります');seen.add(p);let q=a.find(x=>x.id===p);p=q?q.parentId:null;}});return a;}
function importData(obj,mode){let a=validImport(obj).map(t=>Object.assign({completed:false,notes:'',dueDate:null,priority:'medium',tags:[],collapsed:false,order:0,createdAt:now(),updatedAt:now()},t));if(mode==='merge'){let map={};a.forEach(t=>map[t.id]=uid());a.forEach(t=>{t.id=map[t.id];t.parentId=t.parentId?map[t.parentId]:null;t.order=children(t.parentId).length;});tasks=tasks.concat(a);}else tasks=a;save();}
load();
window.TodoStore={get tasks(){return tasks;},get prefs(){return prefs;},setPref(k,v){prefs[k]=v;save();},save,load,get,children,descendants,add,setDone,move,remove,restore,progress,count,importData,validImport,reset(){tasks=demo();save();},clear(){tasks=[];save();}};
})();