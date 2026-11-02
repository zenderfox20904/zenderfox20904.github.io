const SVI=['sparkles','layers','graduation-cap','smartphone'],STI=['calendar-clock','layout-grid','folder-kanban','code'];const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C=window.SITE_CONFIG||{};const sb=(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY&&window.supabase)?supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY):null;
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
$('.burger').onclick=e=>{const l=$('.links');l.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',l.classList.contains('open'))};
document.querySelectorAll('.links a').forEach(a=>a.onclick=()=>$('.links').classList.remove('open'));
$('#yr').textContent=new Date().getFullYear();$('#loginBtn').innerHTML=UI.user;
async function loadContent(){let d=await fetch('content.json').then(r=>r.json());
 if(sb){try{const {data}=await sb.from('site_content').select('data').eq('id','main').maybeSingle();if(data&&data.data)d={...d,...data.data}}catch(e){}
  const {data:{session}}=await sb.auth.getSession();if(session){const b=$('#loginBtn');b.innerHTML=UI.dash;b.dataset.tip='Dashboard';b.setAttribute('aria-label','Dashboard')}}
 return d}
const empty=t=>`<div class="card empty" style="grid-column:1/-1">${UI.illus.empty}<p class="mut">${t}</p></div>`;
function render(d){$('#name').textContent=d.name;UI.type($('#headline'),[d.headline,...(d.rotating||[])]);$('#tagline').textContent=d.tagline||'';$('#loc').textContent=d.location?'📍 '+d.location:'';
 $('#stats').innerHTML=(d.stats||[]).map((s,i)=>`<div class="stat"><span class="sti">${UI.i(STI[i%4])}</span><b><span data-n="${+s.value}">0</span>${esc(s.suffix||'')}</b><span>${esc(s.label)}</span></div>`).join('');
 const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('[data-n]').forEach(n=>UI.count(n,n.dataset.n));so.disconnect()}}));so.observe($('#stats'));
 $('#aboutTxt').innerHTML=(Array.isArray(d.about)?d.about:[d.about]).map(p=>`<p style="margin:8px 0">${esc(p)}</p>`).join('');
 $('#svcList').innerHTML=(d.services||[]).map((s,i)=>`<div class="card hov rv"><span class="svci">${UI.i(SVI[i%4])}</span><h3>${esc(s.title)}</h3><p class="mut small">${esc(s.text)}</p></div>`).join('');
 const proj=d.projects||[];
 $('#expList').innerHTML='<div class="fill"></div>'+(d.experience||[]).map(e=>`<div class="ti rv"><span class="dot"></span><div class="card hov"><div class="head"><h3>${UI.i("briefcase")} ${esc(e.role)} · <span class="gt">${esc(e.org)}</span></h3><span class="mut small">${esc(e.period)}</span></div><p class="mut small">${esc(e.place||'')}</p><ul>${(e.points||[]).map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
 ${(e.projects||[]).length||(e.skills||[]).length?`<div class="rel">${(e.projects||[]).map(p=>`<a href="#p-${slug(p)}">↗ ${esc(p)}</a>`).join('')}${(e.skills||[]).map(s=>`<span class="chip" style="font-size:12px;padding:3px 9px">${esc(s)}</span>`).join('')}</div>`:''}</div></div>`).join('');
 $('#eduList').innerHTML=(d.education||[]).map(e=>`<div class="card hov rv"><h3>${esc(e.school)}</h3><p class="mut">${esc(e.degree)} · ${esc(e.period)}</p></div>`).join('');
 $('#projList').innerHTML=proj.map(p=>`<div class="card hov rv" id="p-${slug(p.title)}"><h3>${esc(p.title)}</h3><p class="mut small">${esc(p.org||'')}${p.period?' · '+esc(p.period):''}</p><p style="margin-top:8px">${esc(p.description)}</p><div class="tags">${(p.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div>${(p.url||p.github)?`<p style="margin-top:12px;display:flex;gap:14px">${p.url?`<a href="${esc(p.url)}" target="_blank" rel="noopener">${UI.i("external-link")} Visit</a>`:''}${p.github?`<a href="${esc(p.github)}" target="_blank" rel="noopener">${UI.i("github")} GitHub</a>`:''}</p>`:''}</div>`).join('');
 const groups=d.skillGroups||[{name:'Skills',items:d.skills}];
 $('#skillList').innerHTML=groups.map(g=>`<div class="card rv"><h3>${esc(g.name)}</h3><div class="chips" style="margin-top:10px">${g.items.map(s=>{const at=(d.experience||[]).filter(e=>(e.skills||[]).includes(s)).map(e=>e.org);return `<span class="chip" title="${at.length?'Used at '+esc(at.join(', ')):''}">${esc(s)}</span>`}).join('')}</div></div>`).join('');
 const c=d.contact;$('#contactList').innerHTML=[c.email&&`<a class="btn p" href="mailto:${esc(c.email)}">${UI.mail} ${esc(c.email)}</a>`,c.linkedin&&`<a class="btn" href="${esc(c.linkedin)}" target="_blank" rel="noopener">${UI.li} LinkedIn</a>`,c.github&&`<a class="btn" href="${esc(c.github)}" target="_blank" rel="noopener">${UI.gh} GitHub</a>`,...(c.websites||[]).map(w=>`<a class="btn" href="${esc(w)}" target="_blank" rel="noopener">${UI.i("globe")} ${esc(w.replace(/^https?:\/\/(www\.)?/,''))}</a>`)].filter(Boolean).join('');
 $('#ftag').textContent=d.tagline||'';$('#floc').textContent=d.location||'';$('#fmail').href='mailto:'+c.email;$('#fmail').textContent=c.email;
 $('#fsoc').innerHTML=[c.linkedin&&`<a class="ib" href="${esc(c.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">${UI.li}</a>`,c.github&&`<a class="ib" href="${esc(c.github)}" target="_blank" rel="noopener" aria-label="GitHub">${UI.gh}</a>`,c.email&&`<a class="ib" href="mailto:${esc(c.email)}" aria-label="Email">${UI.mail}</a>`].filter(Boolean).join('');
 $('#fsvc').innerHTML=(d.services||[]).map(s=>`<li><a href="#order">${esc(s.title)}</a></li>`).join('');
 UI.reveal();timelineFill()}
function timelineFill(){const tl=$('#expList'),f=tl.querySelector('.fill');const on=()=>{const r=tl.getBoundingClientRect(),v=innerHeight*.7;f.style.height=Math.max(0,Math.min(r.height-12,v-r.top))+'px'};addEventListener('scroll',on,{passive:true});on()}
async function repos(u){try{const r=await fetch(`https://api.github.com/users/${u}/repos?per_page=100&sort=pushed`);if(!r.ok)throw 0;let a=(await r.json()).filter(x=>!x.fork);
 $('#repoNote').innerHTML=`<span data-n="${a.length}">0</span> public repositories, fetched live from GitHub.`;UI.count($('#repoNote [data-n]'),a.length);
 $('#repoList').innerHTML=a.slice(0,9).map(x=>`<a class="card repo rv" href="${x.html_url}" target="_blank" rel="noopener"><div><h3>${esc(x.name)}</h3><p class="mut small">${esc(x.description||'')}</p></div><div class="meta">${x.language?`<span>● ${esc(x.language)}</span>`:''}<span>★ ${x.stargazers_count}</span><span>Updated ${new Date(x.pushed_at).toLocaleDateString()}</span></div></a>`).join('')+`<a class="card rv" href="https://github.com/${u}?tab=repositories" target="_blank" rel="noopener" style="display:grid;place-items:center">See all on GitHub ↗</a>`;UI.reveal($('#repoList'))
}catch(e){$('#repoList').innerHTML='';$('#repoNote').innerHTML=`Couldn't reach GitHub right now. <a href="https://github.com/${u}">View profile ↗</a>`}}
async function blog(){if(!sb){$('#blogList').innerHTML=empty('Posts coming soon.');return}
 const {data}=await sb.from('posts').select('id,slug,title,cover_url,excerpt,published_at').eq('published',true).order('published_at',{ascending:false});
 $('#blogList').innerHTML=data&&data.length?data.map(p=>`<a class="card blogcard rv" href="#post/${esc(p.slug)}">${p.cover_url?`<img src="${esc(p.cover_url)}" alt="" loading="lazy">`:''}<h3>${esc(p.title)}</h3><p class="mut small">${new Date(p.published_at).toLocaleDateString()}</p><p class="mut">${esc(p.excerpt||'')}</p></a>`).join(''):empty('No posts yet. First one is on the way.');
 UI.reveal($('#blogList'));route()}
async function route(){const m=location.hash.match(/^#post\/(.+)/);const v=$('#postView');if(!m||!sb){v.classList.add('hidden');$('#blogList').classList.remove('hidden');return}
 const {data:p}=await sb.from('posts').select('*').eq('slug',decodeURIComponent(m[1])).eq('published',true).maybeSingle();if(!p)return;
 $('#blogList').classList.add('hidden');v.classList.remove('hidden');
 v.innerHTML=`<a href="#blog" class="btn sm">← All posts</a>${p.cover_url?`<img src="${esc(p.cover_url)}" alt="" style="margin:18px 0">`:''}<h2>${esc(p.title)}</h2><p class="mut small">${new Date(p.published_at).toLocaleDateString()}</p><div class="md">${DOMPurify.sanitize(marked.parse(p.body||''))}</div>`;$('#blog').scrollIntoView()}
addEventListener('hashchange',route);
$('#orderForm').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const m=$('#orderMsg');if(f.website)return;delete f.website;m.classList.remove('hidden');
 if(!sb){const d=window.__d;m.innerHTML=`Please <a href="mailto:${d.contact.email}?subject=${encodeURIComponent('Project request: '+f.project_type)}&body=${encodeURIComponent(Object.entries(f).map(([k,v])=>k+': '+v).join('\n'))}">send this request by email</a>.`;return}
 const b=e.target.querySelector('button');b.disabled=true;b.textContent='Sending…';
 const {error}=await sb.from('orders').insert(f);b.disabled=false;b.textContent='Send request';m.textContent=error?'Sorry, something went wrong. Please email me instead.':'Thanks! Your request was received. I will reply by email soon.';if(!error)e.target.reset()};
loadContent().then(d=>{window.__d=d;render(d);repos(d.githubUser);blog()});
