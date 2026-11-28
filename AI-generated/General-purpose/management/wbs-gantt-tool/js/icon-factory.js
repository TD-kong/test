(W=>{
const P={wbs:'M4 5h6M8 12h6M12 19h8M4 5v7h4M8 12v7h4',gantt:'M4 6h8M8 12h10M6 18h9',plus:'M12 5v14M5 12h14',search:'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5',filter:'M3 5h18l-7 8v6l-4-2v-4z',set:'M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2',sync:'M20 8a8 8 0 00-14-2M4 4v4h4M4 16a8 8 0 0014 2M20 20v-4h-4',cloud:'M7 18a4 4 0 010-8 5 5 0 019 1 3.5 3.5 0 010 7zM9 14l2 2 4-4',warn:'M12 3l10 18H2zM12 10v5M12 18v.5',cal:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',today:'M12 3v18M3 12h18',dl:'M12 4v11M7 11l5 5 5-5M5 20h14',ul:'M12 16V5M7 9l5-5 5 5M5 20h14',help:'M9 9a3 3 0 115 2c-1 1-2 1-2 3M12 18v.5',sun:'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2',trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',edit:'M4 20l4-1L19 8l-3-3L5 16z',chev:'M9 6l6 6-6 6',check:'M5 12l5 5 9-10',x:'M6 6l12 12M18 6L6 18'};
const NS='http://www.w3.org/2000/svg';
W.icon=(n,s=22)=>{const v=document.createElementNS(NS,'svg');v.setAttribute('viewBox','0 0 24 24');v.setAttribute('width',s);v.setAttribute('height',s);v.setAttribute('aria-hidden','true');
 ['fill:none','stroke:currentColor','stroke-width:2','stroke-linecap:round','stroke-linejoin:round'].forEach(a=>{const[k,x]=a.split(':');v.setAttribute(k,x)});
 const p=document.createElementNS(NS,'path');p.setAttribute('d',P[n]||'');v.append(p);return v};
W.h=(t,a={},...k)=>{const e=document.createElement(t);for(const[n,v]of Object.entries(a)){if(v==null||v===false)continue;if(n.slice(0,2)==='on')e.addEventListener(n.slice(2),v);else if(n==='class')e.className=v;else e.setAttribute(n,v===true?'':v)}
 k.flat().forEach(c=>c!=null&&e.append(c.nodeType?c:document.createTextNode(c)));return e};
W.appIcon=()=>{const u={};[180,192].forEach(s=>{const c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');
 const rr=(a,b,w,hh,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+hh,r);x.arcTo(a+w,b+hh,a,b+hh,r);x.arcTo(a,b+hh,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
 const g=x.createLinearGradient(0,0,s,s);g.addColorStop(0,'#0b6e66');g.addColorStop(1,'#124a63');x.fillStyle=g;rr(0,0,s,s,s*.22);x.fill();
 const k=s/10;x.fillStyle='#fff';[[2,2,3,1.5],[3.5,4.3,4.5,1.5],[5,6.6,3,1.5]].forEach(r=>{rr(r[0]*k,r[1]*k,r[2]*k,r[3]*k,k*.4);x.fill()});
 x.strokeStyle='#fff';x.lineWidth=k*.3;x.beginPath();x.moveTo(1.4*k,2.7*k);x.lineTo(1.4*k,7.3*k);x.stroke();u[s]=c.toDataURL('image/png')});
 document.querySelector('link[rel=icon]').href=u[192];document.querySelector('link[rel=apple-touch-icon]').href=u[180]};
})(window.W=window.W||{});
