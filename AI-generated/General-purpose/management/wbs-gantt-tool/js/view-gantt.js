(W=>{
const {h,icon}=W,PX={day:28,week:10,month:3.5};
W.viewGantt=(el,rows,o)=>{const old=el.querySelector('.pscroll'),pos=old?[old.scrollTop,old.scrollLeft]:null;
 const all=W.S.tasks,t0=W.today();let a=[t0].concat(all.map(t=>t.startDate)).sort()[0],b=[t0].concat(all.map(t=>t.endDate)).sort().pop();
 a=W.addDays(a,-3);b=W.addDays(b,14);const n=W.days(a,b)+1,px=PX[o.scale],tw=n*px,x=d=>W.days(a,d)*px,ws=W.S.meta.weekStart==='monday'?1:0;
 const hd=h('div',{class:'ghead'},h('button',{class:'gname','aria-label':'名称列の幅を切替',onclick:o.toggleNc},'タスク'),h('div',{class:'gtl',style:'width:'+tw+'px'}));
 const tl=hd.lastChild,lay=h('div',{class:'glayer',style:'width:'+tw+'px'});
 for(let i=0;i<n;i++){const d=W.addDays(a,i),dt=W.parse(d),g=dt.getDay();
  const lb=o.scale==='day'?(dt.getDate()===1||i===0?(dt.getMonth()+1)+'/'+dt.getDate():dt.getDate()):o.scale==='week'?(g===ws?(dt.getMonth()+1)+'/'+dt.getDate():''):(dt.getDate()===1||i===0?dt.getFullYear()+'/'+(dt.getMonth()+1):'');
  if(lb!=='')tl.append(h('span',{style:'left:'+(i*px+2)+'px'},lb));
  if(g===0||g===6||W.S.meta.holidays.includes(d))lay.append(h('i',{class:'hol',style:'left:'+i*px+'px;width:'+px+'px'}))}
 if(t0>=a&&t0<=b)lay.append(h('i',{class:'today',style:'left:'+(x(t0)+px/2-1)+'px'}));
 const body=h('div',{class:'gbody'},lay);
 rows.forEach(t=>{const p=W.hasKids(t.id),ms=!p&&t.startDate===t.endDate,late=W.isLate(t),w=(W.days(t.startDate,t.endDate)+1)*px,l=x(t.startDate);
  const lab=h('span',{},t.progress+'%'+(late?' ⚠遅延'+W.lateDays(t)+'日':''));
  const bt=h('button',{class:'gb '+(ms?'ms ':'')+(p?'sum ':'')+'st-'+t.status+(late?' late':''),style:'left:'+(ms?l+px/2-22:l)+'px','aria-label':t.title+' '+t.progress+'%',onclick:()=>o.open(t.id)},
   ms?h('i',{class:'dia'}):h('i',{class:'bar',style:'width:'+w+'px'},h('i',{class:'fill',style:'width:'+t.progress+'%'})),lab);
  body.append(h('div',{class:'grow'},h('button',{class:'gname',onclick:()=>o.open(t.id)},o.nc?W.num(t):W.num(t)+' '+t.title),h('div',{class:'gtl',style:'width:'+tw+'px'},bt)))});
 const sc=h('div',{class:'pscroll'},hd,body);
 const tool=h('div',{class:'ptool'},h('strong',{},'ガント'),...[['day','日'],['week','週'],['month','月']].map(([s,l])=>h('button',{class:'btn','aria-pressed':String(o.scale===s),onclick:()=>o.setScale(s)},l)),h('span',{class:'sp'}),h('button',{class:'btn',onclick:()=>W.gToday()},icon('today',16),' 今日'));
 el.classList.toggle('nc',!!o.nc);el.classList.add('gantt');el.replaceChildren(tool,sc);
 W.gToday=()=>sc.scrollTo({left:Math.max(0,x(t0)-60),behavior:'smooth'});
 if(pos){sc.scrollTop=pos[0];sc.scrollLeft=pos[1]}else sc.scrollLeft=Math.max(0,x(t0)-60)};
})(window.W=window.W||{});
