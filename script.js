const $=id=>document.getElementById(id);
const DB='portfolio',KEY='cv';
function db(){return new Promise((ok,no)=>{try{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}catch(e){no(e)}})}
async function op(mode,fn){const d=await db();return new Promise((ok,no)=>{const q=fn(d.transaction('f',mode).objectStore('f'));q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})}
let url=null;
function show(blob){
 if(url)URL.revokeObjectURL(url);
 url=blob?URL.createObjectURL(blob):null;
 $('viewBtn').hidden=$('dl').hidden=$('rm').hidden=!blob;
 $('viewer').hidden=true;
 if(blob){$('viewer').src=url;$('dl').href=url;$('dl').download=blob.name||'CV.pdf';$('drop').firstElementChild.nextSibling;}
}
async function load(){try{const b=await op('readonly',s=>s.get(KEY));if(b){show(b);$('msg').textContent='CV ត្រូវបាន Upload ហើយ'}}catch(e){$('msg').textContent='មិនអាចរក្សាទុក CV ក្នុង Browser នេះបានទេ'}}
async function save(f){
 if(!f)return;
 if(f.type!=='application/pdf'){$('msg').textContent='សូមជ្រើសរើសឯកសារ PDF';return}
 if(f.size>5*1024*1024){$('msg').textContent='ឯកសារធំជាង 5MB';return}
 try{await op('readwrite',s=>s.put(f,KEY))}catch(e){$('msg').textContent='រក្សាទុកមិនបាន ប៉ុន្តែអាចមើលបណ្តោះអាសន្ន'}
 show(f);$('viewer').hidden=false;$('msg').textContent='Upload រួចរាល់៖ '+f.name;
}
$('file').onchange=e=>save(e.target.files[0]);
const dz=$('drop');
dz.ondragover=e=>{e.preventDefault();dz.classList.add('on')};
dz.ondragleave=()=>dz.classList.remove('on');
dz.ondrop=e=>{e.preventDefault();dz.classList.remove('on');save(e.dataTransfer.files[0])};
dz.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('file').click()}};
$('viewBtn').onclick=()=>{$('viewer').hidden=!$('viewer').hidden};
$('rm').onclick=async()=>{try{await op('readwrite',s=>s.delete(KEY))}catch(e){}show(null);$('msg').textContent='បានលុប CV'};
$('theme').onclick=e=>{e.preventDefault();const r=document.documentElement;const dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dark?'light':'dark'};

// animations
document.documentElement.classList.add('js');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('section h2,section>p,.card,.tags,.cv'.replace('.tags','.tags,.skills')).forEach(el=>{el.classList.add('rv');io.observe(el)});
const roles=['Web Developer','UI Designer','Problem Solver'],rl=$('role');
if(matchMedia('(prefers-reduced-motion:reduce)').matches){rl.textContent=roles[0]}else{
 let i=0,j=0,del=false;
 (function tick(){const w=roles[i];j+=del?-1:1;rl.textContent=w.slice(0,j);
  let t=del?45:90;
  if(!del&&j===w.length){del=true;t=1600}else if(del&&j===0){del=false;i=(i+1)%roles.length;t=300}
  setTimeout(tick,t)})();
}

// header + footer
$('yr').textContent=new Date().getFullYear();
const hd=document.querySelector('header.site'),mn=$('menu'),bg=$('burger');
addEventListener('scroll',()=>hd.classList.toggle('sc',scrollY>10),{passive:true});
bg.onclick=()=>{const o=mn.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.textContent=o?'✕':'☰'};
mn.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{mn.classList.remove('open');bg.textContent='☰';bg.setAttribute('aria-expanded','false')}));
const links=[...mn.querySelectorAll('a[href^="#"]:not(#theme)')];
const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('section[id]').forEach(x=>so.observe(x));

// projects
const SAMPLES=[['System lab','https://computer011.free.je/'],['',''],['',' ']];
let projects=[],editId=null,imgData='';
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e};
function safeUrl(u){try{const x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:null}catch(e){return null}}
function renderP(){
 const g=$('projects');g.replaceChildren();
 if(!projects.length){
  SAMPLES.forEach(([t,d])=>{const c=mk('div','card');c.append(mk('h3','',t),mk('p','',d));g.append(c)});
  g.append(mk('p','sample','នេះជាគម្រោងគំរូ។ ចុច "+ បន្ថែមគម្រោង" ដើម្បីដាក់គម្រោងរបស់អ្នក។'));return;
 }
 projects.forEach(pr=>{
  const c=mk('div','card pcard');
  if(pr.img){const i=mk('img','pimg');i.src=pr.img;i.alt=pr.title;c.append(i)}else c.append(mk('div','pimg'));
  const b=mk('div','pb');b.append(mk('h3','',pr.title));
  if(pr.desc)b.append(mk('p','',pr.desc));
  if(pr.tech.length){const t=mk('div','tags');pr.tech.forEach(x=>t.append(mk('span','',x)));b.append(t)}
  const a=mk('div','pact');
  const u=safeUrl(pr.link);if(u){const l=mk('a','','មើលគម្រោង');l.href=u;l.target='_blank';l.rel='noopener noreferrer';a.append(l)}
  const e=mk('button','','កែ');e.onclick=()=>openP(pr);
  const d=mk('button','del','លុប');d.onclick=async()=>{if(confirm('លុបគម្រោង "'+pr.title+'"?')){projects=projects.filter(x=>x.id!==pr.id);await saveP();renderP()}};
  a.append(e,d);b.append(a);c.append(b);g.append(c);
 });
}
async function saveP(){try{await op('readwrite',s=>s.put(projects,'projects'));$('pmsg').textContent=''}catch(e){$('pmsg').textContent='រក្សាទុកក្នុង Browser មិនបាន'}}
async function loadP(){try{projects=(await op('readonly',s=>s.get('projects')))||[]}catch(e){projects=[]}renderP()}
function openP(pr){
 editId=pr?pr.id:null;imgData=pr?pr.img:'';
 $('pdt').textContent=pr?'កែគម្រោង':'គម្រោងថ្មី';
 $('pt').value=pr?pr.title:'';$('pds').value=pr?pr.desc:'';$('pk').value=pr?pr.tech.join(', '):'';$('pl').value=pr?pr.link:'';$('pi').value='';
 $('pprev').hidden=!imgData;if(imgData)$('pprev').src=imgData;
 $('pd').showModal();
}
$('addP').onclick=()=>openP(null);
$('pc').onclick=()=>$('pd').close();
$('pi').onchange=e=>{
 const f=e.target.files[0];if(!f)return;
 if(!f.type.startsWith('image/')){$('pi').value='';return}
 const r=new FileReader();
 r.onload=()=>{const im=new Image();im.onload=()=>{
  const k=Math.min(1,900/im.width),cv=document.createElement('canvas');
  cv.width=im.width*k;cv.height=im.height*k;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
  imgData=cv.toDataURL('image/jpeg',.82);$('pprev').src=imgData;$('pprev').hidden=false};im.src=r.result};
 r.readAsDataURL(f);
};
$('pf').onsubmit=async e=>{
 e.preventDefault();
 const o={id:editId||Date.now().toString(36),title:$('pt').value.trim(),desc:$('pds').value.trim(),
  tech:$('pk').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,8),link:$('pl').value.trim(),img:imgData};
 if(!o.title)return;
 projects=editId?projects.map(x=>x.id===editId?o:x):[o,...projects];
 await saveP();renderP();$('pd').close();
};
loadP();
load();
