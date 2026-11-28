(W=>{
const p2=n=>String(n).padStart(2,'0');
const ts=()=>{const d=new Date();return d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())+'-'+p2(d.getHours())+p2(d.getMinutes())+p2(d.getSeconds())};
const dl=(n,b)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
const ST=['todo','in_progress','done','blocked'];
W.io={
exportJSON(){dl('wbs-gantt-'+ts()+'.json',new Blob([JSON.stringify({app:'wbs-gantt-tool',version:1,exportedAt:new Date().toISOString(),meta:W.S.meta,tasks:W.S.tasks},null,2)],{type:'application/json'}))},
exportCSV(){const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"',c=['id','parentId','level','order','title','startDate','endDate','progress','status','assignee','memo','updatedAt','revision'];
 dl('wbs-gantt-'+ts()+'.csv',new Blob(['\uFEFF'+[c.join(',')].concat(W.S.tasks.map(t=>c.map(k=>q(t[k])).join(','))).join('\r\n')],{type:'text/csv;charset=utf-8'}))},
validate(d){if(!d||typeof d!=='object'||!Array.isArray(d.tasks))return['"tasks" 配列がありません'];const e=[],m={};
 d.tasks.forEach((t,i)=>{const w='tasks['+i+']';if(!t||typeof t.id!=='string'||!t.id){e.push(w+': id が不正');return}if(m[t.id])e.push(w+': id重複 '+t.id);m[t.id]=t});
 d.tasks.forEach((t,i)=>{if(!t||!t.id)return;const w='tasks['+i+'] ('+t.id+')';
  if(typeof t.title!=='string'||!t.title||t.title.length>120)e.push(w+': title は1〜120文字');
  if(!W.validDate(t.startDate)||!W.validDate(t.endDate))e.push(w+': 日付形式が YYYY-MM-DD ではありません');else if(t.startDate>t.endDate)e.push(w+': 終了日が開始日より前');
  if(![1,2,3].includes(t.level))e.push(w+': level は1〜3');
  if(!Number.isInteger(t.progress)||t.progress<0||t.progress>100)e.push(w+': progress は0〜100の整数');
  if(!ST.includes(t.status))e.push(w+': status が不正');
  if(t.parentId){const p=m[t.parentId];if(!p)e.push(w+': 親 '+t.parentId+' が存在しません');else if(p.level+1!==t.level)e.push(w+': 階層が親と矛盾')}else if(t.level!==1)e.push(w+': 親なしは level 1');
  let n=0,q=t;while(q&&q.parentId&&n<5){q=m[q.parentId];n++;if(q===t){e.push(w+': 循環参照');break}}});
 return e.slice(0,10)},
norm(t){return Object.assign({assignee:'',memo:'',collapsed:false,order:0,revision:1,updatedAt:new Date().toISOString(),parentId:null},t,{parentId:t.parentId||null})},
apply(d,mode){const ts=d.tasks.map(W.io.norm);
 if(mode==='replace'){W.S.tasks=ts;if(d.meta)Object.assign(W.S.meta,d.meta)}
 else ts.forEach(n=>{const o=W.get(n.id);if(!o)W.S.tasks.push(n);else if(n.updatedAt>o.updatedAt)Object.assign(o,n)});
 W.commit()},
importFile(file,mode,done){const r=new FileReader();r.onload=()=>{let d;try{d=JSON.parse(r.result)}catch(x){return done(['JSONとして読み込めません: '+x.message])}const e=W.io.validate(d);if(e.length)return done(e);W.io.apply(d,mode);done(null)};r.readAsText(file)}};
})(window.W=window.W||{});
