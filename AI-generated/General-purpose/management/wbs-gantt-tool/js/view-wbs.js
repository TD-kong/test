(W=>{
const {h,icon}=W,L={todo:'未着手',in_progress:'進行中',done:'完了',blocked:'保留'};W.STATUS=L;
W.viewWbs=(el,rows,o)=>{const old=el.querySelector('.pscroll'),pos=old?[old.scrollTop,old.scrollLeft]:[0,0];
 const list=h('div',{class:'pscroll'},h('div',{class:'lhead'},'タスク'));rows.forEach(t=>list.append(row(t,o)));if(!rows.length)list.append(o.empty);
 el.replaceChildren(h('div',{class:'ptool'},h('strong',{},'WBS'),h('span',{class:'mut sp'},rows.length+'件'),h('button',{class:'btn',onclick:o.toggleAll},'全て開閉')),list);
 list.scrollTop=pos[0];list.scrollLeft=pos[1]};
function row(t,o){const p=W.hasKids(t.id),late=W.isLate(t);
 return h('div',{class:'row l'+t.level+' st-'+t.status,style:'padding-left:'+((t.level-1)*12)+'px'},
  p?h('button',{class:'ib tg','aria-label':t.title+'を'+(t.collapsed?'展開':'折りたたむ'),'aria-expanded':String(!t.collapsed),onclick:()=>W.toggle(t.id)},icon('chev')):h('span',{class:'sp'}),
  h('button',{class:'rt',onclick:()=>o.open(t.id)},h('b',{},W.num(t)+' '+t.title),
   h('small',{class:late?'warn':''},(late?'⚠ 遅延 '+W.lateDays(t)+'日 / ':'')+L[t.status]+' '+t.progress+'% / '+t.startDate.slice(5)+'〜'+t.endDate.slice(5)+(t.assignee?' / '+t.assignee:''))),
  p?null:[h('button',{class:'ib','aria-label':t.title+'の完了を切替',onclick:()=>o.quick(t.id,t.progress===100?0:100)},icon('check')),
   h('button',{class:'ib','aria-label':t.title+'を10%進める',onclick:()=>o.quick(t.id,Math.min(100,t.progress+10))},'+10')])}
})(window.W=window.W||{});
