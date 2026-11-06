(function(){
'use strict';
var KEY='huaxia_baokuan_h5_edits_v1', HKEY='huaxia_baokuan_h5_hero_v1', T='【待确认】';
var BASE=(window.BAOKUAN_DATA||[]).map(function(x){return Object.assign({},x)});
var saved={}; try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){saved={}}
var draft=JSON.parse(JSON.stringify(saved)); var dirty=false, editing=false, filter='全部';
var byId={}; BASE.forEach(function(x){byId[x.id]=x});
function get(id){return Object.assign({},byId[id],draft[id]||{})}
function all(){return BASE.map(function(x){return get(x.id)})}
function $(s){return document.querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove('on')},1800)}
function F(id,f,val,tag,cls){tag=tag||'span';var c=(cls||'')+(String(val).indexOf('待确认')>=0?' tbc':'');var ed=draft[id]&&f in draft[id];
  return '<'+tag+' class="'+c+'" data-id="'+id+'" data-f="'+f+'"'+(editing?' contenteditable="plaintext-only"':'')+'>'+esc(val)+'</'+tag+'>'+(ed&&editing?'<i class="edited-dot"></i>':'')}
function hasPhone(p){return /\d{6,}/.test(p||'')}
function initial(b){return (b||'?').replace(/[（(].*$/,'').charAt(0)}
function imgTag(x){return x.img?'<img loading="lazy" src="'+esc(x.img)+'" alt="'+esc(x.name)+'">':'<div class="ph-img">'+esc(initial(x.brand))+'</div>'}
function hallOf(x){return /建材馆/.test(x.guide)?'建材馆':/家具馆/.test(x.guide)?'家具馆':'铺位待确认'}
// ---------- 总览 ----------
function renderList(){
  var L=all(); $('#cnt').textContent=L.length+' 款';
  var cats=['全部','建材馆','家具馆','铺位待确认'];
  $('#chips').innerHTML=cats.map(function(c){var n=c==='全部'?L.length:L.filter(function(x){return hallOf(x)===c}).length;return n?'<button class="chip'+(c===filter?' on':'')+'" data-c="'+c+'">'+c+' '+n+'</button>':''}).join('');
  var S=L.filter(function(x){return filter==='全部'||hallOf(x)===filter});
  $('#grid').innerHTML=S.map(function(x){var i=BASE.findIndex(function(b){return b.id===x.id})+1;
    return '<div class="tofu" data-go="'+x.id+'"><div class="pic">'+imgTag(x)+'</div><span class="no">'+String(i).padStart(2,'0')+'</span><div class="bd">'+
      '<div class="br">'+F(x.id,'brand',x.brand)+'</div><div class="nm">'+F(x.id,'short',x.short)+'</div>'+
      '<div class="pr">¥'+F(x.id,'expo',x.expo)+'<small>/'+esc(x.unit)+'</small></div>'+
      '<div class="lc">📍 '+esc(x.guide)+'</div><div class="go" data-open="'+x.id+'">进详情 ›</div></div></div>'}).join('')||'<div class="empty">无</div>';
}
// ---------- 详情 ----------
function renderDetail(id){
  var x=get(id); if(!byId[id]){location.hash='';return}
  var idx=BASE.findIndex(function(b){return b.id===id});
  $('#dTitle').textContent=(idx+1)+'/'+BASE.length+' · '+x.brand;
  $('#dPrev').onclick=function(){location.hash='#d-'+BASE[(idx-1+BASE.length)%BASE.length].id};
  $('#dNext').onclick=function(){location.hash='#d-'+BASE[(idx+1)%BASE.length].id};
  var tel=hasPhone(x.phone)?x.phone.replace(/[^\d+-]/g,''):'';
  $('#dBox').innerHTML=
   '<div class="d-hero"><div class="frame">'+imgTag(x)+'<span class="tag">家博爆款 · '+esc(x.id)+'</span></div></div>'+
   '<div class="d-body">'+
    '<div class="card"><div class="d-brand">'+(x.logo?'<img src="'+esc(x.logo)+'" alt="">':'')+F(id,'brand',x.brand)+'</div>'+
     '<div class="d-name">'+F(id,'name',x.name)+'</div>'+
     '<div class="pbox"><div class="ex"><small>家博价 ¥</small>'+F(id,'expo',x.expo)+'<small> /'+F(id,'unit',x.unit)+'</small></div>'+
     '<div class="mk">市场价 ¥<s>'+F(id,'market',x.market)+'</s></div></div>'+
     '<dl class="kv"><dt>限量</dt><dd>'+F(id,'qty',x.qty)+'</dd><dt>满减券</dt><dd>'+F(id,'coupon',x.coupon,'span','coupon')+'</dd><dt>券说明</dt><dd>'+F(id,'couponNote',x.couponNote||'—')+'</dd></dl></div>'+
    '<div class="card"><h3>卖点</h3>'+F(id,'sp',x.sp,'div','sp')+'</div>'+
    '<div class="card"><h3>规格参数</h3>'+F(id,'specs',x.specs,'div','pre')+'</div>'+
    '<div class="card visit"><h3>到店 · 店铺在哪</h3><div class="where">'+F(id,'guide',x.guide)+'</div>'+
     '<div class="steps"><div><small>① 场馆</small><b>'+F(id,'hall',x.hall)+'</b></div><div><small>② 楼层</small><b>'+F(id,'floor',x.floor)+'</b></div><div><small>③ 铺位号</small><b>'+F(id,'shop',x.shop)+'</b></div></div>'+
     '<div class="ph"><span>☎ '+F(id,'phone',x.phone)+'</span><a class="'+(tel?'':'dis')+'" href="'+(tel?'tel:'+tel:'#')+'">拨打</a></div>'+
     '<div class="note">'+F(id,'locNote',x.locNote||'','div')+'</div></div>'+
   '</div>';
  window.scrollTo(0,0);
}
// ---------- 路由 ----------
function route(){var m=location.hash.match(/^#d-(.+)$/);
  if(m){document.body.className='v-detail'+(editing?' editing':'');$('#vList').classList.remove('on');$('#vDetail').classList.add('on');renderDetail(decodeURIComponent(m[1]))}
  else{document.body.className='v-list'+(editing?' editing':'');$('#vDetail').classList.remove('on');$('#vList').classList.add('on');renderList()}}
window.addEventListener('hashchange',route);
// 点击
document.addEventListener('click',function(e){
  var c=e.target.closest('.chip'); if(c){filter=c.dataset.c;renderList();return}
  var o=e.target.closest('[data-open]'); if(o){location.hash='#d-'+o.dataset.open;return}
  var t=e.target.closest('.tofu'); if(t&&!editing){location.hash='#d-'+t.dataset.go}
});
// 编辑输入
document.addEventListener('input',function(e){var el=e.target.closest('[data-f]');if(!el)return;
  var id=el.dataset.id,f=el.dataset.f,v=el.innerText.replace(/\u00a0/g,' ').replace(/\n+$/,'');
  draft[id]=draft[id]||{}; if(v===String(byId[id][f]==null?'':byId[id][f])){delete draft[id][f];if(!Object.keys(draft[id]).length)delete draft[id]}else draft[id][f]=v; dirty=true;});
document.addEventListener('focusout',function(e){var el=e.target.closest&&e.target.closest('[data-f]');if(el)el.classList.toggle('tbc',el.innerText.indexOf('待确认')>=0)});
document.addEventListener('keydown',function(e){var el=e.target.closest&&e.target.closest('[data-f]');if(el&&e.key==='Enter'&&!/^(specs|sp|coupon|locNote|couponNote)$/.test(el.dataset.f)){e.preventDefault();el.blur()}});
window.addEventListener('beforeunload',function(e){if(dirty){e.preventDefault();e.returnValue=''}});
// 工具条
$('#bEdit').onclick=function(){editing=!editing;this.textContent='✎ 编辑：'+(editing?'开':'关');route();toast(editing?'编辑已开：点虚线框直接改，改完点「保存」':'编辑已关')};
function save(){localStorage.setItem(KEY,JSON.stringify(draft));saved=JSON.parse(JSON.stringify(draft));dirty=false;toast('已保存到本机浏览器（改了 '+Object.keys(draft).length+' 款）')}
$('#bSave').onclick=save;
function download(name,text,type){var b=new Blob([text],{type:type});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
function stamp(){var d=new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')}
$('#bJson').onclick=function(){download('华厦爆款H5_编辑导出_'+stamp()+'.json',JSON.stringify({note:'华厦爆款H5导出',exported_at:new Date().toString(),changes:draft,items:all()},null,2),'application/json');toast('已导出 JSON（含改动清单+全部条目）')};
$('#bHtml').onclick=function(){
  var base=location.href.replace(/#.*$/,'').replace(/[^\/]*$/,'');
  Promise.all([fetch('index.html').then(function(r){return r.text()}),fetch('app.js').then(function(r){return r.text()})]).then(function(r){
    var html=r[0].replace('<head>','<head>\n<base href="'+base+'">')
      .replace('<script src="data.js"></script>','<script>window.BAOKUAN_DATA='+JSON.stringify(all()).replace(/</g,'\\u003c')+';</script>')
      .replace('<script src="app.js"></script>','<script>'+r[1].replace(/<\/script/gi,'<\\/script')+'</script>');
    download('华厦爆款H5_导出_'+stamp()+'.html',html,'text/html');toast('已导出 HTML（改动已并入，图片走线上地址）')
  }).catch(function(){toast('导出 HTML 需在网页链接里打开（本地文件不支持）')})};
$('#bImport').onclick=function(){$('#importFile').click()};
$('#importFile').onchange=function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var j=JSON.parse(r.result);var ch=j.changes||j;Object.keys(ch).forEach(function(id){if(byId[id])draft[id]=Object.assign(draft[id]||{},ch[id])});dirty=true;route();toast('已导入，记得点「保存」')}catch(e){toast('文件不是有效 JSON')}};r.readAsText(f);this.value=''};
$('#bReset').onclick=function(){if(!confirm('清掉本机所有改动，恢复原始数据？'))return;draft={};localStorage.removeItem(KEY);dirty=false;route();toast('已恢复默认')};
// 主题图（仅本机预览）
var slot=$('#heroSlot');
function showHero(src){var im=slot.querySelector('img');if(!im){im=document.createElement('img');slot.insertBefore(im,slot.firstChild)}im.src=src;slot.classList.add('has');slot.querySelector('label').firstChild.nodeValue='换图'}
try{var h=localStorage.getItem(HKEY);if(h)showHero(h)}catch(e){}
$('#heroFile').onchange=function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){showHero(r.result);try{localStorage.setItem(HKEY,r.result)}catch(e){toast('图片太大，仅本次预览')}};r.readAsDataURL(f)};
route();
})();
