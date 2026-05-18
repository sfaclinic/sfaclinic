import { useState, useEffect } from "react";

const SUPABASE_URL = "https://uzghqzgsijgfnaaqmdou.supabase.co";
const SUPABASE_KEY = "sb_publishable_PZ_ZYSnlWCEMLyp-kDydWQ_jovL0Dw8";

async function sb(table, method = "GET", body = null, filter = "") {
  const url = `${SUPABASE_URL}/rest/v1/${table}${filter}`;
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": method === "POST" ? "return=representation" : method === "PATCH" ? "return=representation" : "",
  };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : null });
  if (!res.ok) { const e = await res.text(); throw new Error(e); }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const db = {
  getUsers: () => sb("users", "GET", null, "?select=*"),
  getPatients: () => sb("patients", "GET", null, "?select=*"),
  getAttempts: (pid) => sb("attempts", "GET", null, `?patient_id=eq.${pid}&select=*&order=date.asc`),
  getLabs: (pid) => sb("lab_entries", "GET", null, `?patient_id=eq.${pid}&select=*&order=date.asc`),
  getInquiries: () => sb("inquiries", "GET", null, "?select=*&order=id.desc"),
  addPatient: (p) => sb("patients", "POST", p),
  updatePatient: (id, p) => sb("patients", "PATCH", p, `?id=eq.${id}`),
  addAttempt: (a) => sb("attempts", "POST", a),
  addLab: (l) => sb("lab_entries", "POST", l),
  addInquiry: (i) => sb("inquiries", "POST", i),
  updateInquiry: (id, i) => sb("inquiries", "PATCH", i, `?id=eq.${id}`),
  addUser: (u) => sb("users", "POST", u),
};

function encodeRemedy(name, potency) {
  const ew = (w, n) => { if (w.length < 2) return w; const r = w[1]+w[0]+w.slice(2); return r.slice(0,n).replace(/^./,c=>c.toUpperCase()); };
  const words = name.trim().split(/\s+/);
  const coded = words.length===1 ? ew(words[0],4) : words.slice(0,2).map(w=>ew(w,3)).join(".");
  const ep = (p) => { const s=String(p).toUpperCase(); if(s.endsWith("M")) return toRoman(parseInt(s))+"M"; const num=parseInt(s.replace(/\D/g,"")); return String(num).split("").map(d=>d==="0"?"x":toRoman(parseInt(d))).join(""); };
  return `${coded}-${ep(potency)}`;
}
function toRoman(n) {
  const v=[1000,900,500,400,100,90,50,40,10,9,5,4,1],s=["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"]; let r="";
  for(let i=0;i<v.length;i++) while(n>=v[i]){r+=s[i];n-=v[i];} return r;
}
function publicTitle(ch) { if(!ch) return "Case under documentation....."; return ch.trim().split(/\s+/).slice(0,5).join(" ")+".....";}

const C={bg:"#0d0f14",surface:"#151820",card:"#1c2130",border:"#2a3048",accent:"#c8a96e",accentDim:"#8a7048",text:"#e8e4d9",muted:"#7a8099",success:"#4caf82",fail:"#e05a5a",research:"#7b9fd4",white:"#ffffff"};
const G=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inconsolata:wght@400;600&family=Noto+Nastaliq+Urdu&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{background:#0d0f14;color:#e8e4d9;font-family:'Cormorant Garamond',serif;min-height:100vh;}
input,textarea,select{font-family:'Cormorant Garamond',serif;}::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-thumb{background:#2a3048;border-radius:3px;}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}} .fade-in{animation:fadeIn 0.5s ease forwards;}`;

const Btn=({children,onClick,variant="primary",small,full,style:s={}})=>{
  const base={border:"none",cursor:"pointer",borderRadius:"4px",fontFamily:"'Inconsolata',monospace",fontWeight:600,padding:small?"6px 14px":"10px 22px",fontSize:small?"12px":"14px",width:full?"100%":undefined,...s};
  const v={primary:{background:C.accent,color:C.bg},ghost:{background:"transparent",color:C.accent,border:`1px solid ${C.accentDim}`},success:{background:C.success,color:C.bg},muted:{background:C.surface,color:C.muted,border:`1px solid ${C.border}`}};
  return <button onClick={onClick} style={{...base,...v[variant]}}>{children}</button>;
};
const Field=({label,value,onChange,type="text",placeholder,rows})=>(
  <div style={{marginBottom:"14px"}}>
    {label&&<div style={{fontSize:"11px",color:C.muted,fontFamily:"'Inconsolata',monospace",marginBottom:"5px",letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</div>}
    {rows?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:"4px",color:C.text,padding:"10px 12px",fontSize:"15px",resize:"vertical"}}/>
         :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:"4px",color:C.text,padding:"10px 12px",fontSize:"15px"}}/>}
  </div>
);
const Sel=({label,value,onChange,options})=>(
  <div style={{marginBottom:"14px"}}>
    {label&&<div style={{fontSize:"11px",color:C.muted,fontFamily:"'Inconsolata',monospace",marginBottom:"5px",letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:"4px",color:C.text,padding:"10px 12px",fontSize:"15px"}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
const Badge=({label,color})=><span style={{background:color+"22",color,border:`1px solid ${color}55`,borderRadius:"3px",padding:"2px 8px",fontSize:"11px",fontFamily:"'Inconsolata',monospace",fontWeight:600}}>{label}</span>;
const AgeInput=({label,value,onChange})=>(
  <div style={{marginBottom:"14px"}}>
    {label&&<div style={{fontSize:"11px",color:C.muted,fontFamily:"'Inconsolata',monospace",marginBottom:"5px",letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</div>}
    <input type="number" value={value} onChange={e=>onChange(e.target.value)} placeholder="e.g. 45" min="0" max="120" style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:"4px",color:C.text,padding:"10px 12px",fontSize:"15px"}}/>
  </div>
);
const Loader=()=><div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"60px",color:C.muted,fontStyle:"italic",fontSize:"18px"}}>Loading...</div>;

function CaseCard({patient:p, index:i}){
  const [expanded, setExpanded] = useState(false);
  const hasLongSummary = p.urdu_summary && p.urdu_summary.length > 120;
  const previewText = hasLongSummary && !expanded ? p.urdu_summary.slice(0,120)+"..." : p.urdu_summary;
  return(
    <div className="fade-in" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"10px",overflow:"hidden",animationDelay:`${i*0.07}s`}}>
      <div style={{padding:"16px 24px 14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:"21px",color:C.text,fontWeight:600,marginBottom:"8px",letterSpacing:"0.01em"}}>{publicTitle(p.case_history)}</div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {(p.conditions||[]).map(c=><Badge key={c} label={c} color={C.accentDim}/>)}
          <Badge label={p.case_type==="research"?"RESEARCH":"REGULAR"} color={p.case_type==="research"?C.research:C.muted}/>
          <Badge label={p.status} color={p.status==="Active"?C.success:p.status==="Completed"?C.accent:C.muted}/>
        </div>
      </div>
      <div style={{padding:"20px 24px 12px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:"19px",lineHeight:2.4,color:p.urdu_summary?C.text:C.muted,fontStyle:p.urdu_summary?"normal":"italic"}}>
        {p.urdu_summary ? previewText : "اردو خلاصہ جلد شائع کیا جائے گا۔"}
      </div>
      {hasLongSummary && (
        <div style={{padding:"0 24px 16px",direction:"rtl"}}>
          <button onClick={()=>setExpanded(!expanded)} style={{background:"transparent",border:`1px solid ${C.accentDim}`,borderRadius:"4px",color:C.accent,fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:"15px",padding:"6px 16px",cursor:"pointer"}}>
            {expanded ? "کم کریں ▲" : "مزید پڑھیں ▼"}
          </button>
        </div>
      )}
    </div>
  );
}

function PublicJournal({onLogin}){
  const [overlay,setOverlay]=useState(null);
  const [loginId,setLoginId]=useState("");const [loginPw,setLoginPw]=useState("");const [loginErr,setLoginErr]=useState("");
  const [form,setForm]=useState({name:"",contact:"",message:""});const [sent,setSent]=useState(false);
  const [patients,setPatients]=useState([]);const [loading,setLoading]=useState(true);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  useEffect(()=>{db.getPatients().then(setPatients).catch(console.error).finally(()=>setLoading(false));},[]);
  const doLogin=async()=>{try{const users=await db.getUsers();const u=users.find(u=>u.id===loginId&&u.password===loginPw);if(u){setOverlay(null);onLogin(u);}else setLoginErr("Invalid credentials.");}catch{setLoginErr("Connection error.");}};
  const submitInquiry=async(type)=>{if(!form.name||!form.contact)return alert("Please fill name and contact.");try{await db.addInquiry({id:Date.now(),type,...form,date:new Date().toISOString().split("T")[0],status:"pending"});setSent(true);}catch{alert("Error. Please try again.");}};
  const openOverlay=(type)=>{setOverlay(type);setSent(false);setForm({name:"",contact:"",message:""}); };
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <header style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"20px 32px"}}>
        <div style={{maxWidth:"860px",margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <div style={{fontSize:"11px",fontFamily:"'Inconsolata',monospace",color:C.accentDim,letterSpacing:"0.2em",marginBottom:"4px"}}>PUBLIC CLINICAL JOURNAL</div>
            <div style={{fontSize:"26px",color:C.accent,fontStyle:"italic"}}>H/Dr. Syed Furqan Ahmed</div>
            <div style={{fontSize:"12px",color:C.muted,fontFamily:"'Inconsolata',monospace"}}>DHMS · RHMP — Homeopathic Practice</div>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <Btn onClick={()=>openOverlay("consultation")} variant="ghost" small>REQUEST CONSULTATION</Btn>
            <Btn onClick={()=>openOverlay("message")} variant="ghost" small>SEND MESSAGE</Btn>
            <Btn onClick={()=>openOverlay("login")} small>LOGIN</Btn>
          </div>
        </div>
      </header>
      <div style={{maxWidth:"860px",margin:"0 auto",padding:"40px 28px 60px"}}>
        <div style={{borderLeft:`3px solid ${C.accentDim}`,paddingLeft:"20px",marginBottom:"36px"}}>
          <div style={{fontSize:"19px",fontStyle:"italic",color:C.text,lineHeight:1.7,marginBottom:"8px"}}>Anonymized records of real cases — including failures, turning points, and breakthroughs. No names. No identifiers. Only the journey.</div>
          <div style={{fontSize:"14px",color:C.muted}}>Cases accepted after conventional treatment has not produced results. Documented fully and honestly.</div>
        </div>
        <div style={{display:"flex",gap:"16px",marginBottom:"36px",flexWrap:"wrap"}}>
          {[["Total",patients.length],["Research",patients.filter(p=>p.case_type==="research").length],["Active",patients.filter(p=>p.status==="Active").length],["Completed",patients.filter(p=>p.status==="Completed").length]].map(([l,v])=>(
            <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"14px 22px",textAlign:"center",minWidth:"80px"}}>
              <div style={{fontSize:"28px",color:C.accent}}>{v}</div>
              <div style={{fontSize:"10px",color:C.muted,fontFamily:"'Inconsolata',monospace",marginTop:"2px"}}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
        {loading&&<Loader/>}
        {!loading&&patients.length===0&&<div style={{textAlign:"center",padding:"60px",color:C.muted,fontStyle:"italic"}}>Case summaries will appear here as they are published.</div>}
        <div style={{display:"grid",gap:"20px"}}>
          {[...patients].reverse().map((p,i)=>(
            <CaseCard key={p.id} patient={p} index={i}/>
          ))}

        </div>
      </div>
      {overlay&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setOverlay(null);}} style={{position:"fixed",inset:0,background:"#000000aa",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"20px"}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"32px",width:"100%",maxWidth:"420px",position:"relative"}}>
            <button onClick={()=>setOverlay(null)} style={{position:"absolute",top:"14px",right:"16px",background:"none",border:"none",color:C.muted,fontSize:"22px",cursor:"pointer"}}>×</button>
            {overlay==="login"&&<>
              <div style={{fontSize:"22px",color:C.accent,fontStyle:"italic",marginBottom:"22px"}}>Login to Portal</div>
              <Field label="User ID" value={loginId} onChange={setLoginId} placeholder="Your ID"/>
              <Field label="Password" value={loginPw} onChange={setLoginPw} type="password" placeholder="5-digit password"/>
              {loginErr&&<div style={{color:C.fail,fontSize:"13px",marginBottom:"12px"}}>{loginErr}</div>}
              <Btn onClick={doLogin} full>ENTER</Btn>
              <div style={{marginTop:"18px",borderTop:`1px solid ${C.border}`,paddingTop:"16px"}}>
                <div style={{fontSize:"13px",color:C.muted,marginBottom:"10px"}}>Don't have an account?</div>
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                  <Btn onClick={()=>openOverlay("consultation")} variant="ghost" small>Request Consultation</Btn>
                  <Btn onClick={()=>openOverlay("student")} variant="muted" small>Student Access</Btn>
                </div>
              </div>
            </>}
            {overlay==="message"&&<>
              <div style={{fontSize:"22px",color:C.accent,fontStyle:"italic",marginBottom:"6px"}}>Send a Message</div>
              <div style={{fontSize:"13px",color:C.muted,marginBottom:"20px"}}>Reviewed by the doctor personally.</div>
              {sent?<div style={{textAlign:"center",padding:"24px",color:C.success,fontStyle:"italic"}}>Your message has been sent.</div>
                   :<><Field label="Name" value={form.name} onChange={f("name")} placeholder="Full name"/><Field label="Contact" value={form.contact} onChange={f("contact")} placeholder="Phone or email"/><Field label="Message" value={form.message} onChange={f("message")} rows={4} placeholder="Write here..."/><Btn onClick={()=>submitInquiry("message")} full>SEND MESSAGE</Btn></>}
            </>}
            {overlay==="consultation"&&<>
              <div style={{fontSize:"22px",color:C.accent,fontStyle:"italic",marginBottom:"6px"}}>Request Consultation</div>
              <div style={{fontSize:"13px",color:C.muted,marginBottom:"20px"}}>Accepted selectively. Doctor will contact you if case is accepted.</div>
              {sent?<div style={{textAlign:"center",padding:"24px",color:C.success,fontStyle:"italic"}}>Request submitted.</div>
                   :<><Field label="Name" value={form.name} onChange={f("name")} placeholder="Full name"/><Field label="Contact" value={form.contact} onChange={f("contact")} placeholder="Phone or email"/><Field label="Your condition" value={form.message} onChange={f("message")} rows={5} placeholder="Diagnosis and treatments tried..."/><Btn onClick={()=>submitInquiry("consultation")} full>SUBMIT REQUEST</Btn></>}
            </>}
            {overlay==="student"&&<>
              <div style={{fontSize:"22px",color:C.accent,fontStyle:"italic",marginBottom:"6px"}}>Request Student Access</div>
              <div style={{fontSize:"13px",color:C.muted,marginBottom:"20px"}}>Read anonymized clinical records for educational purposes.</div>
              {sent?<div style={{textAlign:"center",padding:"24px",color:C.success,fontStyle:"italic"}}>Request submitted.</div>
                   :<><Field label="Name" value={form.name} onChange={f("name")} placeholder="Full name"/><Field label="Contact" value={form.contact} onChange={f("contact")} placeholder="Phone or email"/><Field label="Background" value={form.message} onChange={f("message")} rows={3} placeholder="Institution and purpose..."/><Btn onClick={()=>submitInquiry("student")} full>REQUEST ACCESS</Btn></>}
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({user,onLogout,goPublic}){
  const [patients,setPatients]=useState([]);const [loading,setLoading]=useState(true);
  const [view,setView]=useState("list");const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");const [adminTab,setAdminTab]=useState("patients");
  const [inquiries,setInquiries]=useState([]);
  const isAdmin=user.role==="admin";
  const loadAll=async()=>{setLoading(true);try{const [p,i]=await Promise.all([db.getPatients(),isAdmin?db.getInquiries():Promise.resolve([])]);setPatients(p);setInquiries(i);}catch(e){console.error(e);}setLoading(false);};
  useEffect(()=>{loadAll();},[]);
  const pendingCount=inquiries.filter(i=>i.status==="pending").length;
  const filtered=patients.filter(p=>p.id.toLowerCase().includes(search.toLowerCase())||(p.conditions||[]).some(c=>c.toLowerCase().includes(search.toLowerCase())));
  if(view==="new"&&isAdmin)return <NewPatientForm onBack={()=>{setView("list");loadAll();}}/>;
  if(view==="patient"&&selected)return <PatientDetail patient={selected} onBack={()=>{setView("list");setSelected(null);loadAll();}} user={user}/>;
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <header style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
        <div><div style={{fontSize:"18px",color:C.accent,fontStyle:"italic"}}>H/Dr. Syed Furqan Ahmed</div><div style={{fontSize:"11px",color:C.muted,fontFamily:"'Inconsolata',monospace"}}>DHMS · RHMP — {user.role.toUpperCase()} VIEW</div></div>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}><Btn onClick={goPublic} variant="muted" small>PUBLIC JOURNAL</Btn><Btn onClick={onLogout} variant="ghost" small>LOGOUT</Btn></div>
      </header>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 28px",display:"flex"}}>
        {[["patients","PATIENTS"],...(isAdmin?[["inbox",`INBOX${pendingCount>0?` (${pendingCount})`:""}`]]:[])] .map(([key,label])=>(
          <button key={key} onClick={()=>setAdminTab(key)} style={{padding:"12px 20px",border:"none",background:"transparent",color:adminTab===key?C.accent:C.muted,borderBottom:adminTab===key?`2px solid ${C.accent}`:"2px solid transparent",cursor:"pointer",fontFamily:"'Inconsolata',monospace",fontSize:"12px"}}>{label}</button>
        ))}
      </div>
      <div style={{padding:"28px",maxWidth:"1100px",margin:"0 auto"}}>
        {adminTab==="patients"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
            <div style={{fontSize:"26px",fontStyle:"italic"}}>Patient Registry</div>
            {isAdmin&&<Btn onClick={()=>setView("new")}>+ NEW PATIENT</Btn>}
          </div>
          <Field label="" value={search} onChange={setSearch} placeholder="Search by patient ID or condition..."/>
          {loading?<Loader/>:(
            <div style={{display:"grid",gap:"12px"}}>
              {filtered.length===0&&<div style={{textAlign:"center",color:C.muted,padding:"48px",fontStyle:"italic"}}>No patients found.</div>}
              {filtered.map(p=>(
                <div key={p.id} onClick={()=>{setSelected(p);setView("patient");}} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"18px 22px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.accentDim} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div>
                    <div style={{display:"flex",gap:"10px",alignItems:"center",marginBottom:"6px",flexWrap:"wrap"}}>
                      <span style={{fontFamily:"'Inconsolata',monospace",color:C.accent,fontWeight:600}}>{p.id}</span>
                      <Badge label={p.case_type==="research"?"RESEARCH":"REGULAR"} color={p.case_type==="research"?C.research:C.accentDim}/>
                      <Badge label={p.status} color={p.status==="Active"?C.success:p.status==="Completed"?C.accent:C.muted}/>
                    </div>
                    <div style={{fontSize:"14px",color:C.muted,marginBottom:"4px"}}>{(p.conditions||[]).join(" · ")}</div>
                    <div style={{fontSize:"13px",color:C.accentDim,fontStyle:"italic"}}>{publicTitle(p.case_history)}</div>
                  </div>
                  {p.dob&&<div style={{fontSize:"12px",color:C.muted}}>Age: {p.dob}</div>}
                </div>
              ))}
            </div>
          )}
        </>}
        {adminTab==="inbox"&&isAdmin&&<InboxTab inquiries={inquiries} reload={loadAll}/>}
      </div>
    </div>
  );
}

function InboxTab({inquiries,reload}){
  const markReviewed=async(id)=>{await db.updateInquiry(id,{status:"reviewed"});reload();};
  const tl={message:"Message",consultation:"Consultation Request",student:"Student Access"};
  const tc={message:C.muted,consultation:C.accent,student:C.research};
  return(
    <div>
      <div style={{fontSize:"26px",fontStyle:"italic",marginBottom:"24px"}}>Inbox</div>
      {inquiries.length===0&&<div style={{textAlign:"center",color:C.muted,padding:"48px",fontStyle:"italic"}}>No inquiries yet.</div>}
      <div style={{display:"grid",gap:"14px"}}>
        {inquiries.map(inq=>(
          <div key={inq.id} style={{background:C.card,border:`1px solid ${inq.status==="pending"?C.accentDim:C.border}`,borderRadius:"8px",padding:"20px 24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
              <div style={{display:"flex",gap:"10px"}}><Badge label={tl[inq.type]||inq.type} color={tc[inq.type]||C.muted}/><Badge label={inq.status==="pending"?"PENDING":"REVIEWED"} color={inq.status==="pending"?C.fail:C.success}/></div>
              <span style={{fontSize:"12px",fontFamily:"'Inconsolata',monospace",color:C.muted}}>{inq.date}</span>
            </div>
            <div style={{marginBottom:"6px"}}><span style={{color:C.muted,fontSize:"13px"}}>Name: </span><span>{inq.name}</span></div>
            <div style={{marginBottom:"10px"}}><span style={{color:C.muted,fontSize:"13px"}}>Contact: </span><span style={{color:C.accent,fontFamily:"'Inconsolata',monospace"}}>{inq.contact}</span></div>
            {inq.message&&<div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:"4px",padding:"12px",fontSize:"15px",lineHeight:1.7,marginBottom:"14px"}}>{inq.message}</div>}
            {inq.status==="pending"&&<Btn onClick={()=>markReviewed(inq.id)} variant="success" small>MARK AS REVIEWED</Btn>}
          </div>
        ))}
      </div>
    </div>
  );
}

function NewPatientForm({onBack}){
  const [form,setForm]=useState({id:"",name:"",dob:"",gender:"",contact:"",conditions:"",caseType:"regular",status:"Active",caseHistory:"",patientPassword:""});
  const [saving,setSaving]=useState(false);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  const save=async()=>{
    if(!form.id||!form.name)return alert("Patient ID and Name required.");
    setSaving(true);
    try{
      await db.addPatient({id:form.id,name:form.name,dob:form.dob,gender:form.gender,contact:form.contact,conditions:form.conditions.split(",").map(s=>s.trim()).filter(Boolean),case_type:form.caseType,status:form.status,case_history:form.caseHistory,urdu_summary:""});
      await db.addUser({id:form.id,password:form.patientPassword||"00000",role:"patient",name:form.name});
      onBack();
    }catch(e){alert("Error: "+e.message);}
    setSaving(false);
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,padding:"28px"}}>
      <div style={{maxWidth:"700px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"28px"}}>
          <Btn onClick={onBack} variant="ghost" small>← BACK</Btn>
          <div style={{fontSize:"24px",color:C.accent,fontStyle:"italic"}}>Register New Patient</div>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"28px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
            <Field label="Patient ID" value={form.id} onChange={f("id")} placeholder="e.g. PT001"/>
            <Field label="Patient Password (5 digits)" value={form.patientPassword} onChange={f("patientPassword")} placeholder="e.g. 11234"/>
            <Field label="Full Name (confidential)" value={form.name} onChange={f("name")} placeholder="Full name"/>
            <AgeInput label="Age (years)" value={form.dob} onChange={f("dob")}/>
            <Sel label="Gender" value={form.gender} onChange={f("gender")} options={[{value:"",label:"Select"},{value:"Male",label:"Male"},{value:"Female",label:"Female"},{value:"Other",label:"Other"}]}/>
            <Field label="Contact (confidential)" value={form.contact} onChange={f("contact")} placeholder="Phone / email"/>
          </div>
          <Field label="Conditions (comma separated)" value={form.conditions} onChange={f("conditions")} placeholder="e.g. CKD, Hypertension"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
            <Sel label="Case Type" value={form.caseType} onChange={f("caseType")} options={[{value:"regular",label:"Regular"},{value:"research",label:"Research"}]}/>
            <Sel label="Status" value={form.status} onChange={f("status")} options={[{value:"Active",label:"Active"},{value:"On Hold",label:"On Hold"},{value:"Completed",label:"Completed"}]}/>
          </div>
          <Field label="Initial Case History (confidential)" value={form.caseHistory} onChange={f("caseHistory")} rows={6} placeholder="Begin with a descriptive title — first 5 words become the public case title..."/>
          {form.caseHistory&&<div style={{fontSize:"12px",color:C.accentDim,fontStyle:"italic",marginBottom:"14px"}}>Public title: <strong style={{color:C.accent}}>{publicTitle(form.caseHistory)}</strong></div>}
          <Btn onClick={save} style={{opacity:saving?0.6:1}}>{saving?"SAVING...":"REGISTER PATIENT"}</Btn>
        </div>
      </div>
    </div>
  );
}

function PatientDetail({patient:init,onBack,user}){
  const [patient,setPatient]=useState(init);
  const [attempts,setAttempts]=useState([]);const [labs,setLabs]=useState([]);
  const [tab,setTab]=useState("timeline");const [loading,setLoading]=useState(true);
  const isAdmin=user.role==="admin";
  const loadData=async()=>{setLoading(true);try{const [a,l]=await Promise.all([db.getAttempts(init.id),db.getLabs(init.id)]);setAttempts(a);setLabs(l);}catch(e){console.error(e);}setLoading(false);};
  useEffect(()=>{loadData();},[]);
  const tabs=["timeline","labs","urdu_summary",...(isAdmin?["case_history","edit"]:[])];
  const tl={timeline:"Treatment Timeline",labs:"Lab Markers",urdu_summary:"Urdu Summary",case_history:"Case History",edit:"Edit Record"};
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <header style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 28px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"8px",flexWrap:"wrap"}}>
          <Btn onClick={onBack} variant="ghost" small>← BACK</Btn>
          <span style={{fontFamily:"'Inconsolata',monospace",color:C.accent,fontSize:"18px"}}>{patient.id}</span>
          <Badge label={patient.case_type==="research"?"RESEARCH":"REGULAR"} color={patient.case_type==="research"?C.research:C.accentDim}/>
          <Badge label={patient.status} color={patient.status==="Active"?C.success:C.accent}/>
          {isAdmin&&<span style={{color:C.muted,fontSize:"14px"}}>— {patient.name}</span>}
        </div>
        <div style={{fontSize:"13px",color:C.accentDim,fontStyle:"italic",marginBottom:"4px"}}>{publicTitle(patient.case_history)}</div>
        <div style={{fontSize:"13px",color:C.muted}}>{(patient.conditions||[]).join(" · ")}</div>
      </header>
      <div style={{padding:"0 28px",background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",overflowX:"auto"}}>
        {tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"12px 16px",border:"none",background:"transparent",color:tab===t?C.accent:C.muted,borderBottom:tab===t?`2px solid ${C.accent}`:"2px solid transparent",cursor:"pointer",fontFamily:"'Inconsolata',monospace",fontSize:"11px",whiteSpace:"nowrap"}}>{tl[t].toUpperCase()}</button>)}
      </div>
      <div style={{padding:"28px",maxWidth:"900px",margin:"0 auto"}}>
        {loading?<Loader/>:<>
          {tab==="timeline"&&<TimelineTab patient={patient} attempts={attempts} isAdmin={isAdmin} reload={loadData}/>}
          {tab==="labs"&&<LabsTab patient={patient} labs={labs} isAdmin={isAdmin} reload={loadData}/>}
          {tab==="urdu_summary"&&<UrduTab patient={patient} attempts={attempts} isAdmin={isAdmin} onUpdate={p=>setPatient(p)}/>}
          {tab==="case_history"&&isAdmin&&<div><div style={{fontSize:"13px",color:C.muted,fontFamily:"'Inconsolata',monospace",marginBottom:"16px"}}>CONFIDENTIAL — FULL CASE HISTORY</div><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"24px",whiteSpace:"pre-wrap",lineHeight:1.9,fontSize:"15px"}}>{patient.case_history||"No case history recorded yet."}</div></div>}
          {tab==="edit"&&isAdmin&&<EditPatientTab patient={patient} onUpdate={p=>setPatient(p)}/>}
        </>}
      </div>
    </div>
  );
}

function TimelineTab({patient,attempts,isAdmin,reload}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({date:"",remedyName:"",potency:"",posology:"",rationale:"",response:"",outcome:"Partial",notes:""});
  const [saving,setSaving]=useState(false);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  const coded=form.remedyName&&form.potency?(()=>{try{return encodeRemedy(form.remedyName,form.potency);}catch{return "";}})():"";
  const add=async()=>{
    if(!form.date||!form.remedyName||!form.potency)return alert("Date, remedy and potency required.");
    setSaving(true);
    try{await db.addAttempt({id:Date.now(),patient_id:patient.id,date:form.date,remedy_name:form.remedyName,potency:form.potency,code:coded,posology:form.posology,rationale:form.rationale,response:form.response,outcome:form.outcome,notes:form.notes});setForm({date:"",remedyName:"",potency:"",posology:"",rationale:"",response:"",outcome:"Partial",notes:""});setShow(false);reload();}
    catch(e){alert("Error: "+e.message);}
    setSaving(false);
  };
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <div style={{fontSize:"20px",fontStyle:"italic"}}>Treatment Timeline <span style={{fontSize:"13px",color:C.muted,fontStyle:"normal",fontFamily:"'Inconsolata',monospace"}}>({attempts.length} attempts)</span></div>
        {isAdmin&&<Btn onClick={()=>setShow(!show)} small>{show?"CANCEL":"+ ADD ATTEMPT"}</Btn>}
      </div>
      {show&&(
        <div style={{background:C.card,border:`1px solid ${C.accentDim}`,borderRadius:"8px",padding:"22px",marginBottom:"24px"}}>
          <div style={{fontSize:"13px",color:C.accent,marginBottom:"16px",fontFamily:"'Inconsolata',monospace"}}>NEW TREATMENT ATTEMPT</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 16px"}}>
            <Field label="Date" value={form.date} onChange={f("date")} type="date"/>
            <Field label="Remedy Name" value={form.remedyName} onChange={f("remedyName")} placeholder="e.g. Lachesis"/>
            <Field label="Potency" value={form.potency} onChange={f("potency")} placeholder="e.g. 30 or 200 or 1M"/>
          </div>
          {coded&&<div style={{marginBottom:"14px",fontFamily:"'Inconsolata',monospace",color:C.accent,fontSize:"15px"}}>Encoded: <strong>{coded}</strong></div>}
          <Field label="Posology" value={form.posology} onChange={f("posology")} placeholder="e.g. 3 drops TDS for 7 days"/>
          <Field label="Rationale" value={form.rationale} onChange={f("rationale")} rows={2} placeholder="Clinical reasoning..."/>
          <Field label="Patient Response" value={form.response} onChange={f("response")} rows={2} placeholder="What happened..."/>
          <Sel label="Outcome" value={form.outcome} onChange={f("outcome")} options={[{value:"Improvement",label:"✓ Improvement"},{value:"Partial",label:"~ Partial Response"},{value:"No Change",label:"— No Change"},{value:"Aggravation",label:"▲ Aggravation"},{value:"Failed",label:"✗ Failed"},{value:"Breakthrough",label:"★ Breakthrough"}]}/>
          <Field label="Notes" value={form.notes} onChange={f("notes")} rows={2}/>
          <Btn onClick={add} style={{opacity:saving?0.6:1}}>{saving?"SAVING...":"SAVE ATTEMPT"}</Btn>
        </div>
      )}
      {attempts.length===0&&<div style={{color:C.muted,fontStyle:"italic",textAlign:"center",padding:"40px"}}>No treatment attempts recorded yet.</div>}
      {attempts.map((a,i)=>{
        const color=a.outcome==="Breakthrough"?C.accent:a.outcome==="Improvement"?C.success:a.outcome==="Failed"||a.outcome==="No Change"?C.fail:C.muted;
        const icon={Improvement:"✓",Partial:"~","No Change":"—",Aggravation:"▲",Failed:"✗",Breakthrough:"★"}[a.outcome]||"·";
        return(
          <div key={a.id||i} style={{display:"flex",gap:"16px",marginBottom:"16px"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:"32px"}}>
              <div style={{width:"28px",height:"28px",borderRadius:"50%",background:color+"22",border:`2px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",color,flexShrink:0}}>{icon}</div>
              {i<attempts.length-1&&<div style={{width:"1px",flex:1,background:C.border,margin:"4px 0"}}/>}
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"16px 20px",flex:1,marginBottom:"4px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px",flexWrap:"wrap",gap:"8px"}}>
                <div style={{display:"flex",gap:"10px",alignItems:"center"}}><span style={{fontFamily:"'Inconsolata',monospace",color:C.accent,fontWeight:600,fontSize:"15px"}}>{a.code}</span><Badge label={a.outcome} color={color}/></div>
                <span style={{fontSize:"12px",color:C.muted,fontFamily:"'Inconsolata',monospace"}}>{a.date} · #{i+1}</span>
              </div>
              {a.posology&&<div style={{fontSize:"13px",color:C.muted,marginBottom:"6px"}}><span style={{color:C.text}}>Posology:</span> {a.posology}</div>}
              {isAdmin&&a.rationale&&<div style={{fontSize:"13px",color:C.muted,marginBottom:"6px"}}><span style={{color:C.text}}>Rationale:</span> {a.rationale}</div>}
              {a.response&&<div style={{fontSize:"13px",color:C.muted,marginBottom:"6px"}}><span style={{color:C.text}}>Response:</span> {a.response}</div>}
              {a.notes&&<div style={{fontSize:"13px",color:C.muted,fontStyle:"italic"}}>{a.notes}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LabsTab({patient,labs,isAdmin,reload}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({date:"",marker:"",value:"",unit:"",note:""});const [saving,setSaving]=useState(false);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  const add=async()=>{if(!form.date||!form.marker||!form.value)return alert("Date, marker and value required.");setSaving(true);try{await db.addLab({id:Date.now(),patient_id:patient.id,...form});setForm({date:"",marker:"",value:"",unit:"",note:""});setShow(false);reload();}catch(e){alert("Error: "+e.message);}setSaving(false);};
  const grouped=labs.reduce((a,l)=>{(a[l.marker]=a[l.marker]||[]).push(l);return a;},{});
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <div style={{fontSize:"20px",fontStyle:"italic"}}>Lab Markers</div>
        {isAdmin&&<Btn onClick={()=>setShow(!show)} small>{show?"CANCEL":"+ ADD RESULT"}</Btn>}
      </div>
      {show&&(
        <div style={{background:C.card,border:`1px solid ${C.accentDim}`,borderRadius:"8px",padding:"22px",marginBottom:"24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0 16px"}}>
            <Field label="Date" value={form.date} onChange={f("date")} type="date"/>
            <Field label="Marker" value={form.marker} onChange={f("marker")} placeholder="e.g. Creatinine"/>
            <Field label="Value" value={form.value} onChange={f("value")} placeholder="e.g. 2.4"/>
            <Field label="Unit" value={form.unit} onChange={f("unit")} placeholder="e.g. mg/dL"/>
          </div>
          <Field label="Note" value={form.note} onChange={f("note")} placeholder="Clinical note..."/>
          <Btn onClick={add} style={{opacity:saving?0.6:1}}>{saving?"SAVING...":"SAVE RESULT"}</Btn>
        </div>
      )}
      {Object.keys(grouped).length===0&&<div style={{color:C.muted,fontStyle:"italic",textAlign:"center",padding:"40px"}}>No lab results recorded yet.</div>}
      {Object.entries(grouped).map(([marker,entries])=>(
        <div key={marker} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"20px",marginBottom:"16px"}}>
          <div style={{fontSize:"16px",color:C.accent,marginBottom:"14px",fontFamily:"'Inconsolata',monospace"}}>{marker}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
            {entries.map((e,i)=>(
              <div key={i} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"10px 14px",minWidth:"110px"}}>
                <div style={{fontSize:"11px",color:C.muted,fontFamily:"'Inconsolata',monospace",marginBottom:"4px"}}>{e.date}</div>
                <div style={{fontSize:"20px",color:C.text}}>{e.value} <span style={{fontSize:"12px",color:C.muted}}>{e.unit}</span></div>
                {e.note&&<div style={{fontSize:"11px",color:C.muted,marginTop:"4px",fontStyle:"italic"}}>{e.note}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UrduTab({patient,attempts,isAdmin,onUpdate}){
  const [editing,setEditing]=useState(false);
  const [text,setText]=useState(patient.urdu_summary||"");const [saving,setSaving]=useState(false);
  const save=async()=>{setSaving(true);try{await db.updatePatient(patient.id,{urdu_summary:text});onUpdate({...patient,urdu_summary:text});setEditing(false);}catch(e){alert("Error: "+e.message);}setSaving(false);};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <div style={{fontSize:"20px",fontStyle:"italic"}}>Patient Summary — <span style={{fontFamily:"'Noto Nastaliq Urdu',serif"}}>اردو خلاصہ</span></div>
        {isAdmin&&<Btn onClick={()=>setEditing(!editing)} small>{editing?"CANCEL":"EDIT SUMMARY"}</Btn>}
      </div>
      {editing&&<div style={{marginBottom:"20px"}}><textarea value={text} onChange={e=>setText(e.target.value)} rows={8} dir="rtl" style={{width:"100%",background:C.bg,border:`1px solid ${C.accentDim}`,borderRadius:"6px",color:C.text,padding:"14px",fontSize:"18px",fontFamily:"'Noto Nastaliq Urdu',serif",lineHeight:2,resize:"vertical"}} placeholder="اردو میں خلاصہ لکھیں..."/><div style={{marginTop:"10px"}}><Btn onClick={save} style={{opacity:saving?0.6:1}}>{saving?"SAVING...":"SAVE URDU SUMMARY"}</Btn></div></div>}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"28px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:"20px",lineHeight:2.4,minHeight:"160px"}}>
        {patient.urdu_summary||<span style={{color:C.muted,fontStyle:"italic"}}>آپ کا ڈاکٹر جلد خلاصہ لکھے گا۔</span>}
      </div>
      <div style={{marginTop:"20px",background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"20px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif"}}>
        <div style={{fontSize:"13px",color:C.accent,marginBottom:"12px",fontFamily:"'Inconsolata',monospace",direction:"ltr"}}>TREATMENT TIMELINE</div>
        {attempts.map((a,i)=>{const color=a.outcome==="Breakthrough"?C.accent:a.outcome==="Improvement"?C.success:a.outcome==="Failed"?C.fail:C.muted;return <div key={i} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:"10px",marginBottom:"10px",fontSize:"16px"}}><span style={{color:C.muted,fontFamily:"'Inconsolata',monospace",fontSize:"12px"}}>{a.date}</span>{"  "}<Badge label={a.outcome} color={color}/>{a.response&&<div style={{fontSize:"15px",color:C.muted,marginTop:"6px"}}>{a.response}</div>}</div>;})}
        {!attempts.length&&<div style={{color:C.muted,fontStyle:"italic"}}>ابھی کوئی ریکارڈ نہیں۔</div>}
      </div>
    </div>
  );
}

function EditPatientTab({patient,onUpdate}){
  const [form,setForm]=useState({...patient,conditions:(patient.conditions||[]).join(", ")});
  const [saving,setSaving]=useState(false);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  const save=async()=>{setSaving(true);try{const u={...form,conditions:form.conditions.split(",").map(s=>s.trim()).filter(Boolean)};await db.updatePatient(patient.id,{name:u.name,dob:u.dob,gender:u.gender,contact:u.contact,conditions:u.conditions,case_type:u.case_type,status:u.status,case_history:u.case_history});onUpdate(u);}catch(e){alert("Error: "+e.message);}setSaving(false);};
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"28px"}}>
      <div style={{fontSize:"16px",color:C.accent,marginBottom:"20px",fontFamily:"'Inconsolata',monospace"}}>EDIT PATIENT RECORD</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
        <Field label="Full Name" value={form.name} onChange={f("name")}/>
        <AgeInput label="Age (years)" value={form.dob} onChange={f("dob")}/>
        <Field label="Contact" value={form.contact} onChange={f("contact")}/>
        <Sel label="Gender" value={form.gender} onChange={f("gender")} options={[{value:"Male",label:"Male"},{value:"Female",label:"Female"},{value:"Other",label:"Other"}]}/>
      </div>
      <Field label="Conditions (comma separated)" value={form.conditions} onChange={f("conditions")}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
        <Sel label="Case Type" value={form.case_type} onChange={f("case_type")} options={[{value:"regular",label:"Regular"},{value:"research",label:"Research"}]}/>
        <Sel label="Status" value={form.status} onChange={f("status")} options={[{value:"Active",label:"Active"},{value:"On Hold",label:"On Hold"},{value:"Completed",label:"Completed"}]}/>
      </div>
      <Field label="Case History (confidential)" value={form.case_history} onChange={f("case_history")} rows={8}/>
      {form.case_history&&<div style={{fontSize:"12px",color:C.accentDim,fontStyle:"italic",marginBottom:"14px"}}>Public title: <strong style={{color:C.accent}}>{publicTitle(form.case_history)}</strong></div>}
      <Btn onClick={save} style={{opacity:saving?0.6:1}}>{saving?"SAVING...":"SAVE CHANGES"}</Btn>
    </div>
  );
}

function PatientPortal({user,onLogout,goPublic}){
  const [patient,setPatient]=useState(null);const [attempts,setAttempts]=useState([]);const [labs,setLabs]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{const load=async()=>{try{const ps=await db.getPatients();const p=ps.find(p=>p.id===user.id);if(p){setPatient(p);const [a,l]=await Promise.all([db.getAttempts(p.id),db.getLabs(p.id)]);setAttempts(a);setLabs(l);}}catch(e){console.error(e);}setLoading(false);};load();},[]);
  if(loading)return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><Loader/></div>;
  if(!patient)return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:"48px",marginBottom:"16px"}}>⚕</div><div style={{fontSize:"18px"}}>Your record is being prepared.</div><div style={{marginTop:"20px",display:"flex",gap:"10px",justifyContent:"center"}}><Btn onClick={goPublic} variant="ghost">PUBLIC JOURNAL</Btn><Btn onClick={onLogout} variant="muted">LOGOUT</Btn></div></div></div>;
  const grouped=labs.reduce((a,l)=>{(a[l.marker]=a[l.marker]||[]).push(l);return a;},{});
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <header style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
        <div style={{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:"20px",color:C.accent,direction:"rtl"}}>خوش آمدید — آپ کا ریکارڈ</div>
        <div style={{display:"flex",gap:"10px"}}><Btn onClick={goPublic} variant="muted" small>PUBLIC JOURNAL</Btn><Btn onClick={onLogout} variant="ghost" small>LOGOUT</Btn></div>
      </header>
      <div style={{padding:"28px",maxWidth:"800px",margin:"0 auto"}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"22px",marginBottom:"20px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif"}}>
          <div style={{display:"flex",gap:"10px",marginBottom:"10px",justifyContent:"flex-end"}}><Badge label={patient.status} color={patient.status==="Active"?C.success:C.accent}/><Badge label={patient.case_type==="research"?"RESEARCH":"REGULAR"} color={patient.case_type==="research"?C.research:C.accentDim}/></div>
          <div style={{fontSize:"16px",color:C.muted}}>{(patient.conditions||[]).join(" · ")}</div>
        </div>
        {patient.urdu_summary&&<div style={{background:C.card,border:`1px solid ${C.accentDim}`,borderRadius:"8px",padding:"24px",marginBottom:"20px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:"20px",lineHeight:2.4}}><div style={{fontSize:"13px",color:C.accent,marginBottom:"12px",fontFamily:"'Inconsolata',monospace",direction:"ltr"}}>DOCTOR'S SUMMARY</div>{patient.urdu_summary}</div>}
        {labs.length>0&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"22px",marginBottom:"20px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif"}}><div style={{fontSize:"13px",color:C.accent,marginBottom:"14px",fontFamily:"'Inconsolata',monospace",direction:"ltr"}}>LAB MARKERS</div>{Object.entries(grouped).map(([m,es])=><div key={m} style={{marginBottom:"14px"}}><div style={{fontSize:"15px",color:C.text,marginBottom:"8px"}}>{m}</div><div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{es.map((e,i)=><div key={i} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"8px 12px",textAlign:"center"}}><div style={{fontSize:"10px",color:C.muted,fontFamily:"'Inconsolata',monospace"}}>{e.date}</div><div style={{fontSize:"18px",color:C.text}}>{e.value} <span style={{fontSize:"11px",color:C.muted}}>{e.unit}</span></div></div>)}</div></div>)}</div>}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"22px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif"}}>
          <div style={{fontSize:"13px",color:C.accent,marginBottom:"14px",fontFamily:"'Inconsolata',monospace",direction:"ltr"}}>TREATMENT TIMELINE ({attempts.length} attempts)</div>
          {attempts.map((a,i)=>{const color=a.outcome==="Breakthrough"?C.accent:a.outcome==="Improvement"?C.success:a.outcome==="Failed"||a.outcome==="No Change"?C.fail:C.muted;return <div key={i} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:"12px",marginBottom:"12px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}><Badge label={a.outcome} color={color}/><span style={{fontSize:"12px",fontFamily:"'Inconsolata',monospace",color:C.muted}}>{a.date}</span></div><div style={{fontSize:"16px",color:C.muted}}>{a.response}</div></div>;})}
          {!attempts.length&&<div style={{color:C.muted,fontStyle:"italic"}}>ابھی کوئی ریکارڈ نہیں۔</div>}
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [user,setUser]=useState(null);const [screen,setScreen]=useState("journal");
  const handleLogin=u=>{setUser(u);setScreen("portal");};
  const handleLogout=()=>{setUser(null);setScreen("journal");};
  return(<><style>{G}</style>{screen==="journal"&&<PublicJournal onLogin={handleLogin}/>}{screen==="portal"&&user?.role==="patient"&&<PatientPortal user={user} onLogout={handleLogout} goPublic={()=>setScreen("journal")}/>}{screen==="portal"&&(user?.role==="admin"||user?.role==="student")&&<AdminDashboard user={user} onLogout={handleLogout} goPublic={()=>setScreen("journal")}/>}</>);
}
