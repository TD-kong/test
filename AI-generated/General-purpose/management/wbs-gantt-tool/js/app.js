(W=>{
const {h,icon,S}=W,$=s=>document.querySelector(s),dlg=$('#dlg'),ui={scale:'day',nc:false};
const ST={synced:['cloud','同期済'],syncing:['sync','同期中'],unsynced:['sync','未同期（再送）'],offline:['warn','オフライン'],conflict:['warn','競合あり'],off:['cloud','連携なし']};
const toast=m=>{const t=$('#toast');t.textContent=m;clearTimeout(toast.i);toast.i=setTimeout(()=>t.textContent='',3500)};
const show=(cls,...k)=>{dlg.className=cls;dlg.replaceChildren(...k);if(!dlg.open)dlg.showModal()};
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
const head=t=>h('div',{class:'dhead'},h('strong',{},t),h('button',{class:'ib','aria-label':'閉じる',onclick:()=>dlg.close()},icon('x')));
const fld=(l,e)=>h('label',{class:'fld'},h('span',{},l),e);
const banner=(m,btn)=>{const b=$('#banner');b.replaceChildren(h('span',{},m),btn||'');b.hidden=false};
const quick=(id,p)=>W.upsert(Object.assign({},W.get(id),{progress:p,status:p===100?'done':p===0?'todo':'in_progress'}));

function sample(){const t=W.today(),d=n=>W.addDays(t,n);let o=0;
 const mk=(id,p,l,title,s,e,pr,st,a)=>({id,parentId:p,level:l,order:o++,title,startDate:d(s),endDate:d(e),progress:pr,status:st,assignee:a||'',memo:'',collapsed:false,updatedAt:new Date().toISOString(),revision:1});
 S.tasks=[mk('s1',null,1,'新サービス開発',0,0,0,'todo'),mk('s2','s1',2,'要件定義',-10,-3,0,'todo'),mk('s3','s2',3,'ヒアリング',-10,-6,100,'done','佐藤'),mk('s4','s2',3,'要件確定',-5,-3,60,'in_progress','佐藤'),
  mk('s5','s1',2,'設計・開発',-2,12,0,'todo'),mk('s6','s5',3,'基本設計',-2,3,30,'in_progress','田中'),mk('s7','s5',3,'実装',4,12,0,'todo','鈴木'),mk('s8','s1',2,'リリース判定',14,14,0,'todo')];
 S.base={};W.commit()}
const card=(t,dsc,f)=>h('button',{class:'card',onclick:f},h('b',{},t),h('small',{class:'mut'},dsc));
const onboard=()=>h('div',{class:'onb'},card('サンプルプロジェクトを読み込む','操作感をすぐ試せます',sample),card('新規プロジェクトを始める','最初のタスクを追加します',()=>openSheet()),card('GAS連携を設定する','スマホとPCでデータを共有します',settings));

function render(){
 document.documentElement.dataset.theme=S.meta.theme;$('#ptitle').textContent=S.meta.projectTitle;document.title=S.meta.projectTitle;
 const rows=W.rows(),v=document.body.dataset.view,open=id=>openSheet(id);
 W.viewWbs($('#pw'),rows,{open,quick,toggleAll(){const ps=S.tasks.filter(t=>W.hasKids(t.id)),c=ps.some(t=>!t.collapsed);ps.forEach(t=>t.collapsed=c);W.save();render()},
  empty:S.tasks.length?h('p',{class:'mut pad'},'条件に一致するタスクがありません'):onboard()});
 W.viewGantt($('#pg'),rows,{scale:ui.scale,nc:ui.nc,open,setScale(s){ui.scale=s;render()},toggleNc(){ui.nc=!ui.nc;render()}});
 document.querySelectorAll('#nav [data-v]').forEach(b=>b.setAttribute('aria-pressed',String((v==='gantt'?'gantt':'wbs')===b.dataset.v)));
 const nf=$('#nf span');if(nf)nf.textContent=W.filterActive()?'フィルタ●':'フィルタ';gsync()}
function gsync(){const s=W.gas.state(),[i,l]=ST[s],b=$('#sync');b.replaceChildren(icon(i,18),h('span',{},l));b.dataset.s=s;b.setAttribute('aria-label','同期状態: '+l)}

function openSheet(id,pid){const old=id?W.get(id):null,isP=old&&W.hasKids(id),f={};
 const t=old?Object.assign({},old):{parentId:pid||null,title:'',startDate:W.today(),endDate:W.addDays(W.today(),4),progress:0,status:'todo',assignee:'',memo:''};
 f.title=h('input',{value:t.title,maxlength:120});
 f.parent=h('select',{},h('option',{value:''},'（なし：プロジェクト階層）'),...S.tasks.filter(x=>W.canParent(old?old.id:null,x.id)).map(x=>h('option',{value:x.id},'　'.repeat(x.level-1)+x.title)));f.parent.value=t.parentId||'';
 f.s=h('input',{type:'date',value:t.startDate,disabled:isP});f.e=h('input',{type:'date',value:t.endDate,disabled:isP});
 const pv=h('b',{},t.progress+'%');f.p=h('input',{type:'range',min:0,max:100,step:5,value:t.progress,disabled:isP,oninput:()=>pv.textContent=f.p.value+'%'});
 f.st=h('select',{disabled:isP},...Object.entries(W.STATUS).map(([k,l])=>h('option',{value:k},l)));f.st.value=t.status;
 f.a=h('input',{value:t.assignee});f.m=h('textarea',{rows:3},t.memo);const err=h('div',{class:'err'});
 const go=()=>{const n=Object.assign({},t,{title:f.title.value.trim(),parentId:f.parent.value||null,startDate:f.s.value,endDate:f.e.value,progress:+f.p.value,status:f.st.value,assignee:f.a.value.trim(),memo:f.m.value});
  const e=W.check(n);if(e){err.textContent=e;return}W.upsert(n);dlg.close();toast('保存しました')};
 const grab=h('div',{class:'grab'});let y0=null;grab.onpointerdown=e=>{y0=e.clientY;grab.setPointerCapture(e.pointerId)};grab.onpointerup=e=>{if(y0!=null&&e.clientY-y0>80)dlg.close();y0=null};
 show('sheet',grab,head(old?'タスクを編集':'タスクを追加'),h('div',{class:'dbody'},
  fld('タスク名',f.title),fld('親タスク',f.parent),isP?h('p',{class:'mut'},'開始日・終了日・進捗・ステータスは子タスクから自動計算されます'):null,
  fld('開始日',f.s),fld('終了日',f.e),fld('進捗',h('div',{},pv,f.p,h('div',{class:'qs'},...[0,25,50,75,100].map(v=>h('button',{class:'btn',disabled:isP,onclick:()=>{f.p.value=v;pv.textContent=v+'%'}},v+'%'))))),
  fld('ステータス',f.st),fld('担当者',f.a),fld('メモ',f.m),err,
  h('div',{class:'acts'},h('button',{class:'btn acc',onclick:go},'保存'),
   old&&old.level<3?h('button',{class:'btn',onclick:()=>openSheet(null,old.id)},'子タスクを追加'):null,
   old?h('button',{class:'btn danger','aria-label':'削除',onclick:()=>{if(confirm('「'+old.title+'」と配下のタスクを削除します。よろしいですか？')){W.remove(old.id);dlg.close()}}},icon('trash',18),' 削除'):null)));
 f.title.focus()}

function filter(){const as=[...new Set(S.tasks.map(t=>t.assignee).filter(Boolean))];
 const st=h('select',{},h('option',{value:''},'すべて'),...Object.entries(W.STATUS).map(([k,l])=>h('option',{value:k},l)));st.value=W.F.status;
 const as_=h('select',{},h('option',{value:''},'すべて'),...as.map(a=>h('option',{value:a},a)));as_.value=W.F.assignee;
 const lt=h('input',{type:'checkbox'});lt.checked=W.F.late;
 show('sheet',h('div',{class:'grab'}),head('フィルタ'),h('div',{class:'dbody'},fld('ステータス',st),fld('担当者',as_),h('label',{class:'fld'},h('span',{},'遅延のみ'),lt),
  h('div',{class:'acts'},h('button',{class:'btn acc',onclick:()=>{Object.assign(W.F,{status:st.value,assignee:as_.value,late:lt.checked});dlg.close();render()}},'適用'),
   h('button',{class:'btn',onclick:()=>{Object.assign(W.F,{q:'',status:'',assignee:'',late:false});const q=$('#q');if(q)q.value='';dlg.close();render()}},'クリア'))))}

function settings(){const g=W.gas.cfg(),msg=h('div',{class:'err'});
 const url=h('input',{value:g.url,placeholder:'https://script.google.com/macros/s/.../exec'}),tok=h('input',{type:'password',value:g.token,autocomplete:'off'});
 const th=h('select',{},h('option',{value:'system'},'OS連動'),h('option',{value:'light'},'ライト'),h('option',{value:'dark'},'ダーク'));th.value=S.meta.theme;
 const ws=h('select',{},h('option',{value:'monday'},'月曜始まり'),h('option',{value:'sunday'},'日曜始まり'));ws.value=S.meta.weekStart;
 const ho=h('textarea',{rows:3,placeholder:'2026-12-29'},S.meta.holidays.join('\n'));
 const file=h('input',{type:'file',accept:'application/json,.json'}),mode=h('select',{},h('option',{value:'merge'},'ID照合マージ'),h('option',{value:'replace'},'全置換（リストア）'));
 const savecfg=()=>{try{W.gas.setCfg({url:url.value.trim(),token:tok.value});return true}catch(e){msg.textContent=e.message;return false}};
 show('modal',head('設定・入出力'),h('div',{class:'dbody'},
  fld('GAS WebアプリURL',url),fld('APIトークン（合言葉）',tok),
  h('div',{class:'acts'},h('button',{class:'btn',onclick:async()=>{if(!savecfg())return;msg.textContent='接続中…';try{await W.gas.test();msg.textContent='接続OK'}catch(e){msg.textContent='接続失敗: '+e.message}}},'接続テスト'),
   h('button',{class:'btn acc',onclick:()=>{if(savecfg()){W.gas.push();toast('GAS設定を保存しました');gsync()}}},'保存して同期')),
  fld('テーマ',th),fld('週の開始',ws),fld('休日（1行に1日 YYYY-MM-DD）',ho),
  h('button',{class:'btn acc',onclick:()=>{const hs=ho.value.split('\n').map(s=>s.trim()).filter(Boolean),bad=hs.find(x=>!W.validDate(x));if(bad){msg.textContent='休日の形式が不正: '+bad;return}
   Object.assign(S.meta,{theme:th.value,weekStart:ws.value,holidays:[...new Set(hs)].sort()});W.commit();toast('設定を保存しました')}},'表示設定を保存'),
  h('div',{class:'acts'},h('button',{class:'btn',onclick:W.io.exportJSON},icon('dl',18),' JSON'),h('button',{class:'btn',onclick:W.io.exportCSV},icon('dl',18),' CSV')),
  fld('JSON取り込み方式',mode),fld('JSONファイル',file),
  h('button',{class:'btn',onclick:()=>{if(!file.files[0]){msg.textContent='ファイルを選択してください';return}
   if(mode.value==='replace'&&!confirm('現在のデータを全て置き換えます。よろしいですか？'))return;
   W.io.importFile(file.files[0],mode.value,e=>{if(e)msg.textContent='取り込み拒否:\n'+e.join('\n');else{dlg.close();toast('取り込みました')}})}},icon('ul',18),' 取り込む'),
  msg));msg.style.whiteSpace='pre-line'}

function guide(){const ta=h('pre',{},W.guide.code);
 show('modal',head('使い方・GAS設定ガイド'),h('div',{class:'dbody'},h('ol',{},...W.guide.steps.map(s=>h('li',{},s))),
  h('button',{class:'btn acc',onclick:async()=>{try{await navigator.clipboard.writeText(W.guide.code)}catch(e){const r=document.createRange();r.selectNodeContents(ta);getSelection().removeAllRanges();getSelection().addRange(r);document.execCommand('copy')}toast('Code.gs をコピーしました')}},'コードをコピー'),ta))}

W.gas.onConflict=j=>{show('modal',head('競合を検知しました'),h('div',{class:'dbody'},h('p',{},'サーバー側に、より新しい更新があります。どちらを残しますか？'),
 h('button',{class:'btn',onclick:()=>{W.adopt(j.tasks,j.meta);dlg.close();W.gas.push();toast('サーバー最新を取り込みました')}},'サーバー最新を取り込む（ローカル変更を破棄）'),
 h('button',{class:'btn danger',onclick:()=>{dlg.close();W.gas.push(true)}},'ローカルでサーバーを強制上書き'),
 h('button',{class:'btn',onclick:()=>{W.io.exportJSON();W.adopt(j.tasks,j.meta);dlg.close()}},'JSONバックアップ後にサーバー最新を取り込む')))};
W.gas.onState=gsync;W.hooks.render=render;W.hooks.change=()=>W.gas.schedule();
W.hooks.quota=()=>banner('保存容量が不足しています。JSONバックアップを保存してください。',h('button',{class:'btn',onclick:W.io.exportJSON},'JSONを保存'));

W.load();W.appIcon();
const nb=(v,l,i)=>h('button',{'data-v':v,onclick:()=>{document.body.dataset.view=v;render()}},icon(i),h('span',{},l));
$('#hd').append(h('button',{class:'pt',id:'ptitle','aria-label':'プロジェクト名を編集',onclick:()=>{const n=prompt('プロジェクト名',S.meta.projectTitle);if(n&&n.trim()){S.meta.projectTitle=n.trim().slice(0,80);W.commit()}}}),
 h('input',{class:'pc',id:'q',type:'search',placeholder:'検索','aria-label':'検索',oninput:e=>{W.F.q=e.target.value;render()}}),
 h('span',{class:'pc seg'},...[['split','分割'],['wbs','WBS'],['gantt','ガント']].map(([v,l])=>h('button',{class:'btn',onclick:()=>{document.body.dataset.view=v;render()}},l))),
 h('button',{class:'ib pc','aria-label':'フィルタ',onclick:filter},icon('filter')),
 h('button',{class:'sync',id:'sync',onclick:()=>W.gas.cfg().url?W.gas.push():settings()}),
 h('button',{class:'ib pc','aria-label':'設定・入出力',onclick:settings},icon('set')),
 h('button',{class:'ib','aria-label':'使い方・GASガイド',onclick:guide},icon('help')));
$('#nav').append(nb('wbs','WBS','wbs'),nb('gantt','ガント','gantt'),h('button',{id:'nf',onclick:filter},icon('filter'),h('span',{},'フィルタ')),h('button',{onclick:settings},icon('set'),h('span',{},'設定・入出力')));
$('#fab').append(icon('plus',28));$('#fab').onclick=()=>openSheet();
$('#main').addEventListener('scroll',e=>{if(document.body.dataset.view!=='split'||!e.target.classList.contains('pscroll'))return;
 document.querySelectorAll('.pscroll').forEach(o=>{if(o!==e.target)o.scrollTop=e.target.scrollTop})},true);
addEventListener('storage',e=>{if(e.key===W.KEY){W.load();render();if(dlg.open&&dlg.classList.contains('sheet'))banner('他のタブでデータが更新されました。編集中の内容を確認してください。')}});
addEventListener('online',()=>W.gas.schedule());addEventListener('offline',gsync);
render();if(W.gas.cfg().url)W.gas.push();
})(window.W=window.W||{});
