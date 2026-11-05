const store = {
  get(key){ return JSON.parse(localStorage.getItem(key) || "[]"); },
  set(key,value){ localStorage.setItem(key,JSON.stringify(value)); }
};
let applications=store.get("cf_apps"), interviews=store.get("cf_interviews"), reminders=store.get("cf_reminders");
const $=id=>document.getElementById(id);
function navigate(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const target=$(page); if(target) target.classList.add("active");
  document.querySelectorAll("#mainNav a").forEach(a=>a.classList.toggle("selected",a.dataset.page===page));
  $("mainNav").classList.remove("open"); window.scrollTo({top:0,behavior:"smooth"}); render();
}
document.addEventListener("click",e=>{const link=e.target.closest("[data-page]");if(link){e.preventDefault();navigate(link.dataset.page)}});
$("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
function saveAll(){store.set("cf_apps",applications);store.set("cf_interviews",interviews);store.set("cf_reminders",reminders);render()}
function safe(text){return String(text||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function removeItem(type,id){if(type==="app")applications=applications.filter(x=>x.id!==id);if(type==="interview")interviews=interviews.filter(x=>x.id!==id);if(type==="reminder")reminders=reminders.filter(x=>x.id!==id);saveAll()}
$("applicationForm").addEventListener("submit",e=>{e.preventDefault();applications.unshift({id:Date.now(),company:$("company").value.trim(),title:$("jobTitle").value.trim(),status:$("appStatus").value,date:$("appDate").value,link:$("jobLink").value});e.target.reset();saveAll()});
$("interviewForm").addEventListener("submit",e=>{e.preventDefault();interviews.unshift({id:Date.now(),company:$("interviewCompany").value,round:$("interviewRound").value,date:$("interviewDate").value,link:$("meetingLink").value,notes:$("interviewNotes").value});e.target.reset();saveAll()});
$("reminderForm").addEventListener("submit",e=>{e.preventDefault();reminders.unshift({id:Date.now(),title:$("reminderTitle").value,date:$("reminderDate").value,details:$("reminderDetails").value,done:false});e.target.reset();saveAll()});
function render(){
  const offers=applications.filter(a=>a.status==="Offer").length;
  ["homeApps","statApps","anApps"].forEach(id=>$(id).textContent=applications.length);
  ["homeInterviews","statInterviews"].forEach(id=>$(id).textContent=interviews.length);
  ["homeOffers","statOffers"].forEach(id=>$(id).textContent=offers);
  $("statReminders").textContent=reminders.length;
  $("appCount").textContent=`${applications.length} records`;
  $("recentApps").innerHTML=applications.length?applications.slice(0,5).map(a=>`<p><b>${safe(a.company)}</b> — ${safe(a.title)} <span class="badge">${safe(a.status)}</span></p>`).join(""):'No applications yet. Add your first opportunity.';
  $("applicationRows").innerHTML=applications.length?applications.map(a=>`<tr><td><b>${safe(a.company)}</b><br>${safe(a.title)} ${a.link?`<br><a target="_blank" rel="noopener" href="${safe(a.link)}">View job ↗</a>`:""}</td><td>${safe(a.date||"—")}</td><td><span class="badge">${safe(a.status)}</span></td><td><button class="delete" onclick="removeItem('app',${a.id})">Delete</button></td></tr>`).join(""):'<tr><td colspan="4" class="empty">No applications added yet.</td></tr>';
  $("interviewList").innerHTML=interviews.length?interviews.map(i=>`<article class="record"><h3>${safe(i.company)} — ${safe(i.round)}</h3><p>📅 ${safe(i.date)}<br>${safe(i.notes)}</p>${i.link?`<a target="_blank" rel="noopener" href="${safe(i.link)}">Meeting link ↗</a><br>`:""}<button class="delete" onclick="removeItem('interview',${i.id})">Delete</button></article>`).join(""):'<div class="panel empty">No interviews planned yet.</div>';
  $("reminderList").innerHTML=reminders.length?reminders.map(r=>`<article class="record"><h3>${safe(r.title)}</h3><p>Due: ${safe(r.date)}<br>${safe(r.details)}</p><button class="delete" onclick="removeItem('reminder',${r.id})">Delete</button></article>`).join(""):'<div class="panel empty">No reminders yet.</div>';
  const rate=applications.length?Math.round(applications.filter(a=>a.status==="Interview"||a.status==="Offer").length/applications.length*100):0;
  $("anRate").textContent=rate+"%";$("anOfferRate").textContent=(applications.length?Math.round(offers/applications.length*100):0)+"%";
  const statuses=["Saved","Applied","Under Review","Interview","Offer","Rejected"];
  $("statusBreakdown").innerHTML=statuses.map(s=>{const n=applications.filter(a=>a.status===s).length;return `<div class="breakdown-row"><span>${s}</span><div class="track"><div class="fill" style="width:${applications.length?n/applications.length*100:0}%"></div></div><b>${n}</b></div>`}).join("");
}
render();
