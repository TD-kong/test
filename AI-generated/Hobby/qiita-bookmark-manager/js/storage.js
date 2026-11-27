(function(g){'use strict';
 const KEY='qiitaBookmarkManager', VERSION=2;
 function blank(){return {schemaVersion:VERSION,items:[],view:'card',theme:'dark',tutorialDone:false,updatedAt:new Date().toISOString()};}
 function migrate(raw){let d=raw||blank();if(Array.isArray(d))d={items:d};if(!d||typeof d!=='object')d=blank();let items=Array.isArray(d.items)?d.items:[];items=items.map(function(x){x=x||{};return {id:String(x.id||makeId()),itemId:String(x.itemId||extractId(x.url)||''),url:String(x.url||''),title:String(x.title||'（タイトル未設定）').slice(0,300),tags:Array.isArray(x.tags)?x.tags.map(String).slice(0,20):[],category:String(x.category||''),status:['unread','reading','done'].indexOf(x.status)>=0?x.status:'unread',pinned:!!x.pinned,memo:String(x.memo||'').slice(0,10000),likesCount:Number.isFinite(Number(x.likesCount))?Number(x.likesCount):null,author:String(x.author||''),createdAt:x.createdAt||new Date().toISOString(),updatedAt:x.updatedAt||x.createdAt||new Date().toISOString()};});
 return {schemaVersion:VERSION,items:items,view:d.view==='list'?'list':'card',theme:d.theme==='light'?'light':'dark',tutorialDone:!!d.tutorialDone,updatedAt:d.updatedAt||new Date().toISOString()};}
 function extractId(url){let m=String(url||'').match(/\/items\/([0-9a-f-]{20,})/i);return m?m[1]:'';}
 function makeId(){return 'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,9);}
 function load(){try{return migrate(JSON.parse(localStorage.getItem(KEY)||'null'));}catch(e){return blank();}}
 let data=load();
 function save(){data.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch(e){return false;}}
 function get(){return data;} function replace(d){data=migrate(d);return save();}
 function exportData(){return JSON.stringify({schemaVersion:VERSION,exportedAt:new Date().toISOString(),items:data.items},null,2);}
 function importData(obj,mode){let incoming=migrate(obj).items;if(mode==='replace'){data.items=incoming;return save();}
 let map={};data.items.forEach(x=>map[x.itemId||x.url]=x);incoming.forEach(x=>{let k=x.itemId||x.url,old=map[k];if(!old||new Date(x.updatedAt)>new Date(old.updatedAt))map[k]=x;});data.items=Object.keys(map).map(k=>map[k]);return save();}
 function bytes(){try{return new Blob([localStorage.getItem(KEY)||'']).size;}catch(e){return 0;}}
 g.QBStore={KEY:KEY,VERSION:VERSION,get:get,save:save,replace:replace,exportData:exportData,importData:importData,bytes:bytes,makeId:makeId,extractId:extractId,migrate:migrate};
})(window);