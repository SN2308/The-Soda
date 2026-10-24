const PIN='1234'; // ປ່ຽນລະຫັດພະນັກງານຢູ່ບ່ອນນີ້
// ໃສ່ຮູບ: ເພີ່ມ img:'images/ຊື່ໄຟລ໌.jpg' ທ້າຍເມນູທີ່ຕ້ອງການ (ຖ້າບໍ່ມີຮູບ ຈະໃຊ້ອີໂມຈິ)
const MENU=[
 {n:'Soda Blue Hawaii',p:39000,e:'🌊☀️'},
 {n:'Soda Blueberry',p:39000,e:'🫐'},
 {n:'Soda Lychee',p:39000,e:'🤍🌸'},
 {n:'Soda Strawberry',p:39000,e:'🍓'},
 {n:'Soda Mixed Berry',p:39000,e:'🫐🍓'},

 {n:'Vampire Blood',p:39000,e:'🧛🩸🍓',sp:1},
 {n:'Soda Pink',p:39000,e:'🩷🍓🍈',sp:1},
 {n:'Lychee Sky Soda',p:45000,e:'🩵🌿🍈',sp:1},

 {n:'Secret Blue Hawaii',p:45000,e:'🔮💙✨',s:1},
 {n:'Secret Lychee',p:45000,e:'👻🩷🍈',s:1},
 {n:'Secret Mixed Berry',p:45000,e:'🧛‍♂️🫐🍓',s:1} // s:1 = ເມນູລັບ (Secret) ແກ້ຊື່ແລະລາຄາໄດ້
];
const SHOT=8000; // ລາຄາ Shot Soju ທີ່ເພີ່ມ
let tab='main',shotMode=false;
const cat=m=>m.s?'secret':m.sp?'special':'main';
const KEY='thesoda_sales_v1';
let mem=[],cart={},pay='cash',view=ymd(new Date());
const $=id=>document.getElementById(id);
const baht=n=>n.toLocaleString('en-US')+' ກີບ';
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function load(){try{const r=localStorage.getItem(KEY);return r?JSON.parse(r):mem}catch(e){return mem}}
function save(a){mem=a;try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}}

// lock
function unlock(){if($('pin').value===PIN){$('lock').style.display='none'}else{$('pinErr').textContent='ລະຫັດບໍ່ຖືກຕ້ອງ ລອງໃໝ່ອີກຄັ້ງ';$('pin').value=''}}
$('pinGo').onclick=unlock;$('pin').onkeydown=e=>{if(e.key==='Enter')unlock()};

// clock
function tick(){const d=new Date();
 $('time').textContent=d.toLocaleTimeString('lo-LA',{hour12:false});
 $('date').textContent=d.toLocaleDateString('lo-LA',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 if(ymd(d)!==today){today=ymd(d)}}
let today=ymd(new Date());setInterval(tick,1000);tick();

// menu + cart
function drawMenu(){$('menu').innerHTML=MENU.map((m,i)=>cat(m)!==tab?'':`<button class="item${m.s?' secret':''}" data-i="${i}">${m.img?`<img class="pic" src="${m.img}" alt="" loading="lazy" onerror="this.nextElementSibling.style.display='block';this.remove()">`:''}<span class="e"${m.img?' style="display:none"':''}>${m.e}</span><span class="n">${m.n}</span><span class="p">${baht(m.p+(m.s&&shotMode?SHOT:0))}${m.s&&shotMode?' 🍶':''}</span></button>`).join('')}
$('menu').onclick=e=>{const b=e.target.closest('.item');if(!b)return;const i=b.dataset.i+(MENU[b.dataset.i].s&&shotMode?'s':'');cart[i]=(cart[i]||0)+1;drawCart()};
const idx=k=>parseInt(k),isShot=k=>String(k).endsWith('s');
const unit=k=>MENU[idx(k)].p+(isShot(k)?SHOT:0);
function cartTotal(){return Object.entries(cart).reduce((s,[k,q])=>s+unit(k)*q,0)}
function drawCart(){
 const ks=Object.keys(cart);
 $('cart').innerHTML=ks.length?ks.map(i=>`<div class="row"><span>${MENU[idx(i)].e} ${MENU[idx(i)].n}${isShot(i)?' 🍶 + Shot Soju':''}<br><small style="color:var(--mute)">${baht(unit(i))}</small>${MENU[idx(i)].s?`<br><button class="link" data-sw="${i}">${isShot(i)?'ເອົາ Shot Soju ອອກ':'+ ເພີ່ມ Shot Soju'}</button>`:''}</span><span class="qty"><button data-d="-1" data-i="${i}" aria-label="ຫຼຸດ">−</button><b>${cart[i]}</b><button data-d="1" data-i="${i}" aria-label="ເພີ່ມ">+</button></span></div>`).join(''):'<div class="empty">ແຕະເມນູເພື່ອເພີ່ມໃສ່ບິນ</div>';
 $('cartTotal').textContent=baht(cartTotal());$('sell').disabled=!ks.length}
$('cart').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.sw){const k=b.dataset.sw,n=isShot(k)?String(idx(k)):idx(k)+'s';cart[k]--;if(cart[k]<=0)delete cart[k];cart[n]=(cart[n]||0)+1;drawCart();return}const i=b.dataset.i;cart[i]+=+b.dataset.d;if(cart[i]<=0)delete cart[i];drawCart()};
document.querySelector('.pay').onclick=e=>{const b=e.target.closest('button');if(!b)return;pay=b.dataset.pay;document.querySelectorAll('.pay button').forEach(x=>x.classList.toggle('on',x===b))};
$('clear').onclick=()=>{cart={};drawCart()};
$('sell').onclick=()=>{
 const items=Object.entries(cart).map(([i,q])=>({n:MENU[idx(i)].n+(isShot(i)?' + Shot Soju':''),p:unit(i),q,sj:isShot(i)?1:0}));
 const a=load();a.push({id:Date.now(),ts:new Date().toISOString(),items,total:cartTotal(),pay});save(a);
 cart={};drawCart();view=ymd(new Date());render()};

// summary
$('vd').onchange=e=>{if(e.target.value){view=e.target.value;render()}};
$('today').onclick=()=>{view=ymd(new Date());render()};
$('log').onclick=e=>{const b=e.target.closest('[data-del]');if(!b)return;if(confirm('ລຶບບິນນີ້ອອກຈາກລະບົບບໍ?')){save(load().filter(s=>String(s.id)!==b.dataset.del));render()}};
function render(){
 $('vd').value=view;
 const isToday=view===ymd(new Date());
 $('allLbl').textContent=isToday?'ຍອດຂາຍມື້ນີ້':'ຍອດຂາຍວັນທີ '+new Date(view+'T00:00').toLocaleDateString('lo-LA',{day:'numeric',month:'long',year:'numeric'});
 const s=load().filter(x=>ymd(new Date(x.ts))===view).sort((a,b)=>b.id-a.id);
 const sum=p=>s.filter(x=>!p||x.pay===p).reduce((t,x)=>t+x.total,0);
 $('sAll').textContent=baht(sum());$('sCash').textContent=baht(sum('cash'));$('sTr').textContent=baht(sum('transfer'));
 $('sBills').textContent=s.length;
 const sold={};s.forEach(x=>x.items.forEach(i=>{sold[i.n]=sold[i.n]||{q:0,t:0};sold[i.n].q+=i.q;sold[i.n].t+=i.q*i.p}));
 $('sCups').textContent=Object.values(sold).reduce((t,x)=>t+x.q,0);
 $('sShots').textContent=s.reduce((t,x)=>t+x.items.reduce((u,i)=>u+(i.sj?i.q:0),0),0);
 const sk=Object.entries(sold).sort((a,b)=>b[1].q-a[1].q);
 $('sold').innerHTML=sk.length?sk.map(([n,v])=>`<div class="row"><span>${n}</span><span>${v.q} ແກ້ວ · ${baht(v.t)}</span></div>`).join(''):'<div class="empty">ຍັງບໍ່ມີຍອດຂາຍ</div>';
 $('log').innerHTML=s.length?s.map(x=>`<div class="row"><span><b>${new Date(x.ts).toLocaleTimeString('lo-LA',{hour12:false})}</b> <span class="badge ${x.pay}">${x.pay==='cash'?'ເງິນສົດ':'ເງິນໂອນ'}</span><br><small style="color:var(--mute)">${x.items.map(i=>i.n+' x'+i.q).join(', ')}</small></span><span>${baht(x.total)} <button class="link x" data-del="${x.id}" aria-label="ລຶບບິນ">ລຶບ</button></span></div>`).join(''):'<div class="empty">ຍັງບໍ່ມີບິນ</div>';
}
$('tgShot').textContent='🍶 ເພີ່ມ Shot Soju (+'+SHOT.toLocaleString('en-US')+' ກີບ)';
$('tgShot').onclick=e=>{shotMode=!shotMode;e.currentTarget.classList.toggle('on',shotMode);e.currentTarget.setAttribute('aria-pressed',shotMode);drawMenu()};
$('tabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;tab=b.dataset.tab;$('tgShot').parentNode.style.display=tab==='secret'?'':'none';document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x===b));drawMenu()};
$('tgShot').parentNode.style.display='none';drawMenu();drawCart();render();