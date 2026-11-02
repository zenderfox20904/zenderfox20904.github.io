const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C=window.SITE_CONFIG||{};let sb=null;const V=()=>$('#view');
if(!C.SUPABASE_URL||!C.SUPABASE_ANON_KEY){$('#setup').classList.remove('hidden')}else{sb=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);init()}
async function init(){const {data:{session}}=await sb.auth.getSession();session?start(session):$('#login').classList.remove('hidden');
 $('#lf').onsubmit=async e=>{e.preventDefault();const {data,error}=await sb.auth.signInWithPassword({email:$('#le').value,password:$('#lp').value});if(error)return $('#lmsg').textContent=error.message;start(data.session)};
}
const TABS={Dashboard:dash,Blog:posts,Orders:orders,Invoices:invoices,Projects:projects,Clients:clients,Experience:experience,Content:content,Settings:settings};
const TI={Dashboard:'layout-dashboard',Blog:'newspaper',Orders:'shopping-cart',Invoices:'receipt',Projects:'folder-kanban',Clients:'users',Experience:'briefcase',Content:'file-pen-line',Settings:'settings'};
function start(s){if(s.user.email!==C.ADMIN_EMAIL){$('#lmsg').textContent='This account is not the site owner.';sb.auth.signOut();return}
 $('#login').classList.add('hidden');document.querySelector('header.nav')?.remove();$('#app').classList.remove('hidden');$('#who').textContent=s.user.email;const L=$('#app');if(localStorage.getItem('sbcol')==='1')L.classList.add('col');$('#cb').onclick=()=>{L.classList.toggle('col');localStorage.setItem('sbcol',L.classList.contains('col')?'1':'0')};$('#mb').onclick=()=>L.classList.add('open');$('#scrim').onclick=()=>L.classList.remove('open');$('#thm').onclick=()=>UI.toggle();$('#logout').onclick=async()=>{await sb.auth.signOut();location.reload()};
 $('#tabs').innerHTML=Object.keys(TABS).map(t=>`<button class="nl" data-t="${t}" title="${t}">${UI.i(TI[t])}<span class="lbl">${t}</span></button>`).join('');
 const go=t=>{const bs=[...document.querySelectorAll('#tabs button')],b=bs.find(x=>x.dataset.t===t);bs.forEach(x=>x.classList.toggle('on',x===b));$('#vt').textContent=t;$('#app').classList.remove('open');
  V().onclick=V().onchange=null;V().style.animation='none';V().offsetHeight;V().style.animation='';V().innerHTML=skel(3);location.hash=t;TABS[t]()};
 $('#tabs').onclick=e=>{const t=e.target.closest('[data-t]')?.dataset.t;if(t)go(t)};go(TABS[location.hash.slice(1)]?location.hash.slice(1):'Dashboard');
 sb.channel('orders-live').on('postgres_changes',{event:'INSERT',schema:'public',table:'orders'},p=>{UI.toast('New order from '+(p.new.client_name||'a client'));const t=location.hash.slice(1);if(t==='Dashboard'||t==='Orders')TABS[t]()}).subscribe()}
const err=e=>{if(e){UI.toast(e.message,true);return true}};const ok=m=>UI.toast(m);const skel=n=>`<div class="grid">${'<div class="card sk"></div>'.repeat(n)}</div>`;
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
// ---------- Blog ----------
async function posts(){const {data}=await sb.from('posts').select('*').order('created_at',{ascending:false});
 V().innerHTML=`<div class="row" style="justify-content:space-between"><h2>Blog posts</h2><button class="btn p sm" id="np">New post</button></div><div class="tablewrap"><table><tr><th>Title</th><th>Status</th><th></th></tr>${(data||[]).map(p=>`<tr><td>${esc(p.title)}</td><td>${p.published?'Published':'Draft'}</td><td class="row"><button class="btn sm" data-e="${p.id}">Edit</button><button class="btn sm" data-pub="${p.id}">${p.published?'Unpublish':'Publish'}</button><button class="btn sm red" data-d="${p.id}">Delete</button></td></tr>`).join('')}</table></div>`;
 $('#np').onclick=()=>editPost({});V().onclick=async e=>{const d=e.target.dataset,p=(data||[]).find(x=>x.id===(d.e||d.pub||d.d));if(!p)return;
  if(d.e)editPost(p);if(d.pub){if(!err((await sb.from('posts').update({published:!p.published,published_at:p.published_at||new Date().toISOString()}).eq('id',p.id)).error))posts()}
  if(d.d&&confirm('Delete "'+p.title+'"?')){if(!err((await sb.from('posts').delete().eq('id',p.id)).error)){ok('Post deleted');posts()}}}}
function editPost(p){V().onclick=null;V().innerHTML=`<h2>${p.id?'Edit':'New'} post</h2><form class="f card" id="pf"><div class="full"><label>Title</label><input name="title" required value="${esc(p.title)}"></div>
<div><label>Slug</label><input name="slug" value="${esc(p.slug)}" placeholder="auto"></div><div><label>Cover image</label><input type="file" id="cov" accept="image/*"><input name="cover_url" value="${esc(p.cover_url)}" placeholder="or image URL" style="margin-top:6px"></div>
<div class="full"><label>Excerpt</label><input name="excerpt" value="${esc(p.excerpt)}"></div><div class="full"><label>Body (Markdown)</label><textarea name="body" id="bd" style="min-height:300px">${esc(p.body)}</textarea></div>
<div class="full"><label><input type="checkbox" name="published" ${p.published?'checked':''} style="width:auto;min-height:0"> Published</label></div>
<div class="full row"><button class="btn p">Save</button><button type="button" class="btn" id="pv">Preview</button><button type="button" class="btn" id="bk">Back</button></div><div class="full md card hidden" id="pvw"></div></form>`;
 $('#bk').onclick=posts;$('#pv').onclick=()=>{const w=$('#pvw');w.classList.remove('hidden');w.innerHTML=DOMPurify.sanitize(marked.parse($('#bd').value))};
 $('#pf').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const file=$('#cov').files[0];
  if(file){const path=Date.now()+'-'+slug(file.name);const up=await sb.storage.from('covers').upload(path,file);if(err(up.error))return;f.cover_url=sb.storage.from('covers').getPublicUrl(path).data.publicUrl}
  const row={title:f.title,slug:f.slug||slug(f.title),cover_url:f.cover_url||null,excerpt:f.excerpt,body:f.body,published:!!f.published,updated_at:new Date().toISOString()};
  if(row.published&&!p.published_at)row.published_at=new Date().toISOString();
  const r=p.id?await sb.from('posts').update(row).eq('id',p.id):await sb.from('posts').insert(row);if(!err(r.error)){ok('Post saved');posts()}}}
// ---------- Orders ----------
async function orders(){const {data}=await sb.from('orders').select('*').order('created_at',{ascending:false});
 V().innerHTML=`<h2>Orders</h2>${(data||[]).map(o=>`<div class="card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><h3>${esc(o.client_name)} · ${esc(o.project_type)}</h3><span class="chip">${o.status}</span></div>
<p class="mut small">${esc(o.client_email)} · Budget: ${esc(o.budget||'-')} · Timeline: ${esc(o.timeline||'-')} · ${new Date(o.created_at).toLocaleString()}</p><p style="white-space:pre-wrap;margin-top:8px">${esc(o.requirements)}</p>
${o.status==='pending'?`<div class="row" style="margin-top:12px"><input type="number" min="0" step="0.01" placeholder="Invoice amount" id="amt-${o.id}" style="max-width:200px"><button class="btn p sm" data-c="${o.id}">Confirm + invoice</button><button class="btn sm red" data-r="${o.id}">Reject</button></div>`:''}</div>`).join('')||`<div class="card empty">${UI.illus.empty}<p class="mut">No orders yet.</p></div>`}`;
 V().onclick=async e=>{const d=e.target.dataset,o=(data||[]).find(x=>x.id===(d.c||d.r));if(!o)return;
  if(d.r&&confirm('Reject this order?')){if(!err((await sb.from('orders').update({status:'rejected'}).eq('id',o.id)).error)){ok('Order rejected');orders()}}
  if(d.c){const amt=parseFloat($('#amt-'+o.id).value);if(!(amt>=0))return UI.toast('Enter an invoice amount',true);
   let {data:cl}=await sb.from('clients').select('id').eq('email',o.client_email).maybeSingle();
   if(!cl){const r=await sb.from('clients').insert({name:o.client_name,email:o.client_email}).select('id').single();if(err(r.error))return;cl=r.data}
   if(err((await sb.from('orders').update({status:'confirmed',client_id:cl.id}).eq('id',o.id)).error))return;
   const inv=await sb.from('invoices').insert({order_id:o.id,client_id:cl.id,amount:amt,items:[{description:`${o.project_type}: project development`,qty:1,price:amt}]}).select('id').single();if(err(inv.error))return;
   await sb.from('milestones').insert([['Kickoff & requirements',0],['Design',1],['Development',2],['Delivery & handover',3]].map(([title,sort])=>({order_id:o.id,title,sort})));
   ok('Order confirmed, invoice created');showInvoice(inv.data.id)}}}
// ---------- Projects / milestones ----------
async function projects(){const {data:os}=await sb.from('orders').select('id,client_name,project_type,milestones(*)').eq('status','confirmed').order('created_at',{ascending:false});
 V().innerHTML=`<h2>Projects & milestones</h2>${(os||[]).map(o=>{const ms=(o.milestones||[]).sort((a,b)=>a.sort-b.sort);const done=ms.filter(m=>m.status==='done').length;return `<div class="card" style="margin-bottom:12px"><h3>${esc(o.client_name)} · ${esc(o.project_type)}</h3><p class="mut small">${done}/${ms.length} milestones done</p><div class="tablewrap"><table>${ms.map(m=>`<tr><td>${esc(m.title)}</td><td><input type="date" value="${m.due_date||''}" data-due="${m.id}" style="min-height:36px;padding:6px"></td><td><select data-st="${m.id}" style="min-height:36px;padding:6px">${['todo','in_progress','done','blocked'].map(s=>`<option ${s===m.status?'selected':''}>${s}</option>`).join('')}</select></td><td><button class="btn sm red" data-dm="${m.id}">✕</button></td></tr>`).join('')}</table></div>
<div class="row" style="margin-top:10px"><input placeholder="New milestone" id="nm-${o.id}" style="max-width:280px"><button class="btn sm" data-am="${o.id}" data-n="${ms.length}">Add</button></div></div>`}).join('')||`<div class="card empty">${UI.illus.empty}<p class="mut">No confirmed projects yet.</p></div>`}`;
 V().onchange=async e=>{const d=e.target.dataset;if(d.st&&!err((await sb.from('milestones').update({status:e.target.value}).eq('id',d.st)).error))ok('Milestone updated');if(d.due)err((await sb.from('milestones').update({due_date:e.target.value||null}).eq('id',d.due)).error)};
 V().onclick=async e=>{const d=e.target.dataset;if(d.dm&&confirm('Remove milestone?')){if(!err((await sb.from('milestones').delete().eq('id',d.dm)).error))projects()}
  if(d.am){const t=$('#nm-'+d.am).value.trim();if(t&&!err((await sb.from('milestones').insert({order_id:d.am,title:t,sort:+d.n})).error))projects()}}}
// ---------- Invoices ----------
async function invoices(){V().onchange=null;const {data}=await sb.from('invoices').select('*,clients(name,email)').order('created_at',{ascending:false});
 V().innerHTML=`<h2>Invoices</h2><div class="tablewrap"><table><tr><th>No.</th><th>Client</th><th>Amount</th><th>Status</th><th></th></tr>${(data||[]).map(i=>`<tr><td>${esc(i.number)}</td><td>${esc(i.clients?.name)}</td><td>${esc(i.currency)} ${(+i.amount).toFixed(2)}</td><td><select data-s="${i.id}" style="min-height:36px;padding:6px">${['unpaid','paid','void'].map(s=>`<option ${s===i.status?'selected':''}>${s}</option>`).join('')}</select></td><td><button class="btn sm" data-v="${i.id}">View</button></td></tr>`).join('')}</table></div>`;
 V().onchange=async e=>{if(e.target.dataset.s&&!err((await sb.from('invoices').update({status:e.target.value}).eq('id',e.target.dataset.s)).error))ok('Invoice marked '+e.target.value)};
 V().onclick=e=>{if(e.target.dataset.v)showInvoice(e.target.dataset.v)}}
async function showInvoice(id){V().onclick=null;V().onchange=null;const {data:i}=await sb.from('invoices').select('*,clients(name,email),orders(project_type,timeline)').eq('id',id).single();const d=await fetch('content.json').then(r=>r.json());
 V().innerHTML=`<div class="row" style="margin:12px 0"><button class="btn sm" id="ib">← Invoices</button><button class="btn sm" onclick="print()">Print</button><button class="btn p sm" id="pdf">Download PDF</button></div>
<div id="inv"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px"><div><img src="logo.svg" width="48" alt=""><h2 style="margin:8px 0 0">${esc(d.name)}</h2><p>${esc(d.contact.email)}</p></div><div style="text-align:right"><h2 style="margin:0">INVOICE</h2><p><b>${esc(i.number)}</b><br>Issued: ${i.issue_date}<br>Due: ${i.due_date}<br>Status: ${i.status}</p></div></div>
<p style="margin:20px 0"><b>Bill to:</b><br>${esc(i.clients?.name)}<br>${esc(i.clients?.email)}</p>
<table><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>${(i.items||[]).map(t=>`<tr><td>${esc(t.description)}</td><td>${t.qty}</td><td>${(+t.price).toFixed(2)}</td><td>${(t.qty*t.price).toFixed(2)}</td></tr>`).join('')}
<tr><th colspan="3" style="text-align:right">Total (${esc(i.currency)})</th><th>${(+i.amount).toFixed(2)}</th></tr></table></div>`;
 $('#ib').onclick=invoices;$('#pdf').onclick=()=>html2pdf().set({filename:i.number+'.pdf',margin:10,html2canvas:{scale:2}}).from($('#inv')).save()}
// ---------- Clients ----------
async function clients(){V().onclick=null;V().onchange=null;const {data}=await sb.from('clients').select('*,orders(id,status),invoices(amount,status)').order('created_at',{ascending:false});
 V().innerHTML=`<h2>Clients</h2><div class="tablewrap"><table><tr><th>Name</th><th>Email</th><th>Projects</th><th>Billed</th></tr>${(data||[]).map(c=>`<tr><td>${esc(c.name)}</td><td><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></td><td>${(c.orders||[]).length}</td><td>${(c.invoices||[]).filter(x=>x.status!=='void').reduce((s,x)=>s+ +x.amount,0).toFixed(2)}</td></tr>`).join('')}</table></div>`}
// ---------- Site content (overrides content.json) ----------
async function content(){V().onclick=null;V().onchange=null;const {data}=await sb.from('site_content').select('data').eq('id','main').maybeSingle();const base=data?.data||await fetch('content.json').then(r=>r.json());
 V().innerHTML=`<h2>Site content</h2><p class="mut small">JSON that drives the public site (name, headline, about, skills, experience, projects, contact). Saved to the database; overrides content.json.</p><textarea id="cj" style="min-height:60vh;font-family:monospace;font-size:13px">${esc(JSON.stringify(base,null,2))}</textarea><div class="row" style="margin-top:12px"><button class="btn p" id="cs">Save</button><span id="cm" class="mut small"></span></div>`;
 $('#cs').onclick=async()=>{let j;try{j=JSON.parse($('#cj').value)}catch(e){return UI.toast('Invalid JSON: '+e.message,true)}
  if(!err((await sb.from('site_content').upsert({id:'main',data:j,updated_at:new Date().toISOString()})).error))ok('Content saved')}}

// ---------- Dashboard ----------
async function dash(){const cnt=async(t,f)=>{let q=sb.from(t).select('*',{count:'exact',head:true});if(f)q=f(q);const {count}=await q;return count||0};
 const [o,p,i,c,po]=await Promise.all([cnt('orders'),cnt('orders',q=>q.eq('status','pending')),cnt('invoices'),cnt('clients'),cnt('posts')]);
 const {data:inv}=await sb.from('invoices').select('amount,status');const paid=(inv||[]).filter(x=>x.status==='paid').reduce((s,x)=>s+ +x.amount,0),due=(inv||[]).filter(x=>x.status==='unpaid').reduce((s,x)=>s+ +x.amount,0);
 const since=new Date();since.setMonth(since.getMonth()-5,1);const {data:os}=await sb.from('orders').select('created_at').gte('created_at',since.toISOString());
 const months=[...Array(6)].map((_,k)=>{const d=new Date(since);d.setMonth(since.getMonth()+k);return d});const vals=months.map(m=>(os||[]).filter(x=>{const d=new Date(x.created_at);return d.getMonth()===m.getMonth()&&d.getFullYear()===m.getFullYear()}).length);const mx=Math.max(1,...vals);
 const KI={'Total orders':'shopping-cart','Pending orders':'clock','Invoices':'receipt','Clients':'users','Blog posts':'newspaper','Paid (USD)':'circle-dollar-sign','Outstanding (USD)':'hourglass'};const k=(l,v,pre='')=>`<div class="card kpi rv"><span class="ki">${UI.i(KI[l])}</span><span class="mut small">${l}</span><b>${pre}<span data-n="${v}">0</span></b></div>`;
 V().innerHTML=`<h2>Overview</h2><p class="sub">Live from Supabase. New orders appear automatically.</p><div class="kpis">${k('Total orders',o)}${k('Pending orders',p)}${k('Invoices',i)}${k('Clients',c)}${k('Blog posts',po)}${k('Paid (USD)',Math.round(paid),'$')}${k('Outstanding (USD)',Math.round(due),'$')}</div>
 <div class="card rv" style="margin-top:18px"><h3>Orders, last 6 months</h3><svg viewBox="0 0 600 220" style="width:100%;height:auto;margin-top:10px" role="img" aria-label="Orders per month">
 ${vals.map((v,j)=>{const h=v/mx*150;return `<rect class="chartbar" style="animation-delay:${j*80}ms" x="${j*100+25}" y="${180-h}" width="50" height="${h||2}" rx="8" fill="#0284c7"/><text x="${j*100+50}" y="${172-h}" text-anchor="middle" font-size="14" fill="currentColor">${v}</text><text x="${j*100+50}" y="205" text-anchor="middle" font-size="13" fill="currentColor" opacity=".6">${months[j].toLocaleString('en',{month:'short'})}</text>`}).join('')}</svg></div>`;
 V().querySelectorAll('[data-n]').forEach(n=>UI.count(n,n.dataset.n));UI.reveal(V())}

// ---------- Experience editor ----------
async function experience(){V().onclick=null;V().onchange=null;const {data}=await sb.from('site_content').select('data').eq('id','main').maybeSingle();const base=data?.data||await fetch('content.json').then(r=>r.json());
 V().innerHTML=`<h2>Experience timeline</h2><p class="mut small">Edit the roles shown on the public timeline. <code>projects</code> and <code>skills</code> link each role to project cards and skill chips.</p><textarea id="ej" style="min-height:60vh;font-family:monospace;font-size:13px">${esc(JSON.stringify(base.experience||[],null,2))}</textarea><div class="row" style="margin-top:12px"><button class="btn p" id="es">${UI.i('save')} Save timeline</button></div>`;
 $('#es').onclick=async()=>{let j;try{j=JSON.parse($('#ej').value);if(!Array.isArray(j))throw Error('Must be a JSON array')}catch(e){return UI.toast('Invalid JSON: '+e.message,true)}
  if(!err((await sb.from('site_content').upsert({id:'main',data:{...base,experience:j},updated_at:new Date().toISOString()})).error))ok('Timeline saved')}}
// ---------- Settings ----------
async function settings(){V().onclick=null;V().onchange=null;const {data:{session}}=await sb.auth.getSession();
 V().innerHTML=`<h2>Settings</h2><div class="kpis" style="margin-top:14px"><div class="card"><span class="kpi"><span class="ki">${UI.i('user')}</span></span><h3>Account</h3><p class="mut small">${esc(session?.user?.email||'')}</p></div><div class="card"><span class="kpi"><span class="ki">${UI.i('sun-moon')}</span></span><h3>Theme</h3><p class="mut small">Saved on this device.</p><button class="btn sm" id="st" style="margin-top:10px">Toggle theme</button></div><div class="card"><span class="kpi"><span class="ki">${UI.i('database')}</span></span><h3>Backend</h3><p class="mut small">Supabase · ${esc((C.SUPABASE_URL||'').replace('https://',''))}</p></div><div class="card"><span class="kpi"><span class="ki">${UI.i('panel-left')}</span></span><h3>Sidebar</h3><p class="mut small">Collapse to icons.</p><button class="btn sm" id="sc" style="margin-top:10px">Toggle sidebar</button></div></div>`;
 $('#st').onclick=()=>UI.toggle();$('#sc').onclick=()=>$('#cb').click()}
