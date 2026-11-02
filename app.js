const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C=window.SITE_CONFIG||{};const sb=(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY&&window.supabase)?supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY):null;
$('.burger').onclick=e=>{const l=$('.links');l.classList.toggle('open');e.target.setAttribute('aria-expanded',l.classList.contains('open'))};
document.querySelectorAll('.links a').forEach(a=>a.onclick=()=>$('.links').classList.remove('open'));
$('#yr').textContent=new Date().getFullYear();
async function loadContent(){let d=await fetch('content.json').then(r=>r.json());
 if(sb){const {data}=await sb.from('site_content').select('data').eq('id','main').maybeSingle();if(data&&data.data)d={...d,...data.data};}
 return d}
function render(d){$('#name').textContent=d.name;$('#headline').textContent=d.headline;$('#tagline').textContent=d.tagline||'';$('#loc').textContent=d.location?'📍 '+d.location:'';
 $('#liBtn').href=d.contact.linkedin;if(!d.contact.linkedin)$('#liBtn').remove();
 $('#aboutTxt').innerHTML=(Array.isArray(d.about)?d.about:[d.about]).map(p=>`<p style="margin:6px 0">${esc(p)}</p>`).join('');
 $('#skillList').innerHTML=d.skills.map(s=>`<span class="chip">${esc(s)}</span>`).join('');
 $('#expList').innerHTML=(d.experience||[]).map(e=>`<div class="card"><h3>${esc(e.role)} · <span class="gt">${esc(e.org)}</span></h3><p class="mut small">${esc(e.period)}${e.place?' · '+esc(e.place):''}</p><ul>${(e.points||[]).map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div>`).join('');
 $('#eduList').innerHTML=(d.education||[]).map(e=>`<div class="card"><h3>${esc(e.school)}</h3><p class="mut">${esc(e.degree)} · ${esc(e.period)}</p></div>`).join('');
 $('#projList').innerHTML=d.projects.map(p=>`<div class="card"><h3>${esc(p.title)}</h3><p class="mut small">${esc(p.period||'')}</p><p>${esc(p.description)}</p><div class="tags">${(p.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div>${p.url?`<p style="margin-top:12px"><a href="${esc(p.url)}" target="_blank" rel="noopener">Visit ↗</a></p>`:''}</div>`).join('');
 const c=d.contact;$('#contactList').innerHTML=[c.email&&`<a class="btn p" href="mailto:${esc(c.email)}">✉ ${esc(c.email)}</a>`,c.linkedin&&`<a class="btn" href="${esc(c.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`,c.github&&`<a class="btn" href="${esc(c.github)}" target="_blank" rel="noopener">GitHub</a>`,...(c.websites||[]).map(w=>`<a class="btn" href="${esc(w)}" target="_blank" rel="noopener">${esc(w.replace(/^https?:\/\/(www\.)?/,''))}</a>`)].filter(Boolean).join('');}
async function repos(u){try{const r=await fetch(`https://api.github.com/users/${u}/repos?per_page=100&sort=updated`);if(!r.ok)throw 0;let a=(await r.json()).filter(x=>!x.fork);
 $('#repoNote').textContent=`${a.length} public repositories, fetched live from GitHub.`;
 $('#repoList').innerHTML=a.slice(0,12).map(x=>`<a class="card repo" href="${x.html_url}" target="_blank" rel="noopener"><div><h3 style="color:#fff">${esc(x.name)}</h3><p class="mut small">${esc(x.description||'')}</p></div><div class="meta">${x.language?`<span>● ${esc(x.language)}</span>`:''}<span>★ ${x.stargazers_count}</span><span>Updated ${new Date(x.pushed_at).toLocaleDateString()}</span></div></a>`).join('')+`<a class="card" href="https://github.com/${u}?tab=repositories" target="_blank" rel="noopener" style="display:grid;place-items:center">See all on GitHub ↗</a>`;
}catch(e){$('#repoNote').innerHTML=`Couldn't reach GitHub right now. <a href="https://github.com/${u}">View profile ↗</a>`}}
async function blog(){if(!sb){$('#blog').classList.add('hidden');document.querySelector('a[href="#blog"]').parentElement.remove();return}
 const {data}=await sb.from('posts').select('id,slug,title,cover_url,excerpt,published_at').eq('published',true).order('published_at',{ascending:false});
 if(data&&data.length)$('#blogList').innerHTML=data.map(p=>`<a class="card blogcard" href="#post/${esc(p.slug)}">${p.cover_url?`<img src="${esc(p.cover_url)}" alt="" loading="lazy">`:''}<h3 style="color:#fff">${esc(p.title)}</h3><p class="mut small">${new Date(p.published_at).toLocaleDateString()}</p><p class="mut">${esc(p.excerpt||'')}</p></a>`).join('');
 route()}
async function route(){const m=location.hash.match(/^#post\/(.+)/);const v=$('#postView');if(!m||!sb){v.classList.add('hidden');$('#blogList').classList.remove('hidden');return}
 const {data:p}=await sb.from('posts').select('*').eq('slug',decodeURIComponent(m[1])).eq('published',true).maybeSingle();if(!p)return;
 $('#blogList').classList.add('hidden');v.classList.remove('hidden');
 v.innerHTML=`<a href="#blog" class="btn sm">← All posts</a>${p.cover_url?`<img src="${esc(p.cover_url)}" alt="" style="margin:18px 0">`:''}<h2>${esc(p.title)}</h2><p class="mut small">${new Date(p.published_at).toLocaleDateString()}</p><div class="md">${DOMPurify.sanitize(marked.parse(p.body||''))}</div>`;$('#blog').scrollIntoView()}
addEventListener('hashchange',route);
$('#orderForm').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const m=$('#orderMsg');m.classList.remove('hidden');if(f.website)return;delete f.website;
 if(!sb){const d=window.__d;m.innerHTML=`Online ordering is being set up. Please <a href="mailto:${d.contact.email}?subject=${encodeURIComponent('Project request: '+f.project_type)}&body=${encodeURIComponent(Object.entries(f).map(([k,v])=>k+': '+v).join('\n'))}">send this request by email</a>.`;return}
 const {error}=await sb.from('orders').insert(f);m.textContent=error?'Sorry, something went wrong. Please email me instead.':'Thanks! Your request was received. I will reply by email soon.';if(!error)e.target.reset()};
loadContent().then(d=>{window.__d=d;render(d);repos(d.githubUser);blog()});
