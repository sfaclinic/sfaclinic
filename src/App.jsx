import { useState } from "react";

// ── Remedy Encoder ────────────────────────────────────────────────────────────
function encodeRemedy(name, potency) {
  const encodeWord = (word, letters) => {
    if (word.length < 2) return word;
    const r = word[1] + word[0] + word.slice(2);
    return r.slice(0, letters).replace(/^./, c => c.toUpperCase());
  };
  const words = name.trim().split(/\s+/);
  const coded = words.length === 1
    ? encodeWord(words[0], 4)
    : words.slice(0, 2).map(w => encodeWord(w, 3)).join(".");

  const encodePotency = (p) => {
    const s = String(p).toUpperCase();
    if (s.endsWith("M")) return toRoman(parseInt(s)) + "M";
    const num = parseInt(s.replace(/\D/g, ""));
    return String(num).split("").map(d => d === "0" ? "x" : toRoman(parseInt(d))).join("");
  };
  return `${coded}-${encodePotency(potency)}`;
}

function toRoman(n) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let r = "";
  for (let i = 0; i < vals.length; i++) while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
  return r;
}

function publicTitle(caseHistory) {
  if (!caseHistory) return "Case under documentation.....";
  const words = caseHistory.trim().split(/\s+/).slice(0, 5).join(" ");
  return words + ".....";
}

// ── Storage ───────────────────────────────────────────────────────────────────
const INITIAL_DATA = {
  users: [
    { id: "admin", password: "00001", role: "admin", name: "H/Dr. Syed Furqan Ahmed DHMS-RHMP" },
    { id: "student01", password: "12345", role: "student", name: "Student User" },
  ],
  patients: [],
  inquiries: [],
};

function loadData() {
  try { const d = localStorage.getItem("sfaPractice_v2"); return d ? JSON.parse(d) : INITIAL_DATA; }
  catch { return INITIAL_DATA; }
}
function saveData(d) { localStorage.setItem("sfaPractice_v2", JSON.stringify(d)); }

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0d0f14", surface: "#151820", card: "#1c2130", border: "#2a3048",
  accent: "#c8a96e", accentDim: "#8a7048", text: "#e8e4d9", muted: "#7a8099",
  success: "#4caf82", fail: "#e05a5a", research: "#7b9fd4", white: "#ffffff",
};

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inconsolata:wght@400;600&family=Noto+Nastaliq+Urdu&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Cormorant Garamond', serif; min-height: 100vh; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
  input, textarea, select { font-family: 'Cormorant Garamond', serif; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.5s ease forwards; }
`;

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", small, full, style: s = {} }) => {
  const base = { border: "none", cursor: "pointer", borderRadius: "4px", fontFamily: "'Inconsolata',monospace", fontWeight: 600, padding: small ? "6px 14px" : "10px 22px", fontSize: small ? "12px" : "14px", transition: "all 0.2s", width: full ? "100%" : undefined, ...s };
  const v = { primary: { background: C.accent, color: C.bg }, ghost: { background: "transparent", color: C.accent, border: `1px solid ${C.accentDim}` }, danger: { background: C.fail, color: C.white }, success: { background: C.success, color: C.bg }, muted: { background: C.surface, color: C.muted, border: `1px solid ${C.border}` } };
  return <button onClick={onClick} style={{ ...base, ...v[variant] }}>{children}</button>;
};

const Field = ({ label, value, onChange, type = "text", placeholder, rows }) => (
  <div style={{ marginBottom: "14px" }}>
    {label && <div style={{ fontSize: "11px", color: C.muted, fontFamily: "'Inconsolata',monospace", marginBottom: "5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>}
    {rows
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px", color: C.text, padding: "10px 12px", fontSize: "15px", resize: "vertical" }} />
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px", color: C.text, padding: "10px 12px", fontSize: "15px" }} />
    }
  </div>
);

const Sel = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: "14px" }}>
    {label && <div style={{ fontSize: "11px", color: C.muted, fontFamily: "'Inconsolata',monospace", marginBottom: "5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px", color: C.text, padding: "10px 12px", fontSize: "15px" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Badge = ({ label, color }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: "3px", padding: "2px 8px", fontSize: "11px", fontFamily: "'Inconsolata',monospace", fontWeight: 600 }}>{label}</span>
);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOBInput = ({ label, value, onChange }) => {
  const parts = value ? value.split("-") : ["","",""];
  const [yr, mo, dy] = [parts[0]||"", parts[1]||"", parts[2]||""];
  const upd = (y,m,d) => (y&&m&&d) ? onChange(`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`) : onChange("");
  const curY = new Date().getFullYear();
  const ss = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px", color: C.text, padding: "10px 8px", fontSize: "15px", width: "100%" };
  return (
    <div style={{ marginBottom: "14px" }}>
      {label && <div style={{ fontSize: "11px", color: C.muted, fontFamily: "'Inconsolata',monospace", marginBottom: "5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.4fr", gap: "8px" }}>
        <select value={dy} onChange={e => upd(yr,mo,e.target.value)} style={ss}>
          <option value="">Day</option>
          {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}</option>)}
        </select>
        <select value={mo} onChange={e => upd(yr,e.target.value,dy)} style={ss}>
          <option value="">Month</option>
          {MONTHS.map((m,i)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}
        </select>
        <select value={yr} onChange={e => upd(e.target.value,mo,dy)} style={ss}>
          <option value="">Year</option>
          {Array.from({length:curY-1919},(_,i)=>curY-i).map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
};

// ── PUBLIC JOURNAL ────────────────────────────────────────────────────────────
function PublicJournal({ onLogin }) {
  const [overlay, setOverlay] = useState(null);
  const [loginId, setLoginId] = useState(""); 
  const [loginPw, setLoginPw] = useState(""); 
  const [loginErr, setLoginErr] = useState("");
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [sent, setSent] = useState(false);
  const data = loadData();
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const doLogin = () => {
    const u = data.users.find(u => u.id === loginId && u.password === loginPw);
    if (u) { setOverlay(null); onLogin(u); }
    else setLoginErr("Invalid credentials.");
  };

  const submitInquiry = (type) => {
    if (!form.name || !form.contact) return alert("Please fill name and contact.");
    const nd = { ...data, inquiries: [...(data.inquiries||[]), { id: Date.now(), type, ...form, date: new Date().toISOString().split("T")[0], status: "pending" }] };
    saveData(nd);
    setSent(true);
  };

  const openOverlay = (type) => { setOverlay(type); setSent(false); setForm({name:"",contact:"",message:""}); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 32px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "'Inconsolata',monospace", color: C.accentDim, letterSpacing: "0.2em", marginBottom: "4px" }}>PUBLIC CLINICAL JOURNAL</div>
            <div style={{ fontSize: "26px", color: C.accent, fontStyle: "italic" }}>H/Dr. Syed Furqan Ahmed</div>
            <div style={{ fontSize: "12px", color: C.muted, fontFamily: "'Inconsolata',monospace" }}>DHMS · RHMP — Homeopathic Practice</div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Btn onClick={() => openOverlay("consultation")} variant="ghost" small>REQUEST CONSULTATION</Btn>
            <Btn onClick={() => openOverlay("message")} variant="ghost" small>SEND MESSAGE</Btn>
            <Btn onClick={() => openOverlay("login")} small>LOGIN</Btn>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 28px 60px" }}>
        <div style={{ borderLeft: `3px solid ${C.accentDim}`, paddingLeft: "20px", marginBottom: "36px" }}>
          <div style={{ fontSize: "19px", fontStyle: "italic", color: C.text, lineHeight: 1.7, marginBottom: "8px" }}>
            Anonymized records of real cases — including failures, turning points, and breakthroughs. No names. No identifiers. Only the journey.
          </div>
          <div style={{ fontSize: "14px", color: C.muted }}>Cases are accepted after conventional treatment has not produced results. Each case is documented fully and honestly.</div>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: "36px", flexWrap: "wrap" }}>
          {[["Total Cases", loadData().patients.length], ["Research", loadData().patients.filter(p=>p.caseType==="research").length], ["Active", loadData().patients.filter(p=>p.status==="Active").length], ["Completed", loadData().patients.filter(p=>p.status==="Completed").length]].map(([label,val]) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "14px 22px", textAlign: "center", minWidth: "90px" }}>
              <div style={{ fontSize: "28px", color: C.accent }}>{val}</div>
              <div style={{ fontSize: "10px", color: C.muted, fontFamily: "'Inconsolata',monospace", marginTop: "2px" }}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {data.patients.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", color: C.muted, fontStyle: "italic" }}>Case summaries will appear here as they are published.</div>
        )}

        <div style={{ display: "grid", gap: "20px" }}>
          {data.patients.map((p, i) => (
            <div key={p.id} className="fade-in" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden", animationDelay: `${i * 0.07}s` }}>
              <div style={{ padding: "16px 24px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "19px", color: C.accent, fontStyle: "italic", marginBottom: "8px" }}>{publicTitle(p.caseHistory)}</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {(p.conditions||[]).map(c => <Badge key={c} label={c} color={C.accentDim} />)}
                    <Badge label={p.caseType==="research"?"RESEARCH":"REGULAR"} color={p.caseType==="research"?C.research:C.muted} />
                    <Badge label={p.status} color={p.status==="Active"?C.success:p.status==="Completed"?C.accent:C.muted} />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "11px", fontFamily: "'Inconsolata',monospace", color: C.muted }}>{(p.attempts||[]).length} attempts</div>
                  <div style={{ fontSize: "11px", fontFamily: "'Inconsolata',monospace", color: (p.attempts||[]).some(a=>a.outcome==="Breakthrough")?C.accent:C.muted, marginTop: "4px" }}>
                    {(p.attempts||[]).some(a=>a.outcome==="Breakthrough") ? "★ Breakthrough reached" : "Ongoing"}
                  </div>
                </div>
              </div>
              <div style={{ padding: "20px 24px", direction: "rtl", fontFamily: "'Noto Nastaliq Urdu',serif", fontSize: "19px", lineHeight: 2.4, color: p.urduSummary ? C.text : C.muted, fontStyle: p.urduSummary ? "normal" : "italic" }}>
                {p.urduSummary || "اردو خلاصہ جلد شائع کیا جائے گا۔"}
              </div>
              {(p.attempts||[]).length > 0 && (
                <div style={{ padding: "8px 24px 16px", display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {(p.attempts||[]).map((a,i) => {
                    const color = a.outcome==="Breakthrough"?C.accent:a.outcome==="Improvement"?C.success:a.outcome==="Failed"||a.outcome==="No Change"?C.fail:C.muted;
                    const icon = {Improvement:"✓",Partial:"~","No Change":"—",Aggravation:"▲",Failed:"✗",Breakthrough:"★"}[a.outcome]||"·";
                    return <div key={i} title={`${a.date}: ${a.outcome}`} style={{ width:"22px",height:"22px",borderRadius:"50%",background:color+"22",border:`1px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color }}>{icon}</div>;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {overlay && (
        <div onClick={e => { if (e.target===e.currentTarget) setOverlay(null); }}
          style={{ position:"fixed",inset:0,background:"#000000aa",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"20px" }}>
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"32px",width:"100%",maxWidth:"420px",position:"relative" }}>
            <button onClick={() => setOverlay(null)} style={{ position:"absolute",top:"14px",right:"16px",background:"none",border:"none",color:C.muted,fontSize:"22px",cursor:"pointer" }}>×</button>

            {overlay === "login" && <>
              <div style={{ fontSize:"22px",color:C.accent,fontStyle:"italic",marginBottom:"22px" }}>Login to Portal</div>
              <Field label="User ID" value={loginId} onChange={setLoginId} placeholder="Your ID" />
              <Field label="Password" value={loginPw} onChange={setLoginPw} type="password" placeholder="5-digit password" />
              {loginErr && <div style={{ color:C.fail,fontSize:"13px",marginBottom:"12px",fontFamily:"'Inconsolata',monospace" }}>{loginErr}</div>}
              <Btn onClick={doLogin} full>ENTER</Btn>
              <div style={{ marginTop:"18px",borderTop:`1px solid ${C.border}`,paddingTop:"16px" }}>
                <div style={{ fontSize:"13px",color:C.muted,marginBottom:"10px" }}>Don't have an account?</div>
                <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                  <Btn onClick={() => openOverlay("consultation")} variant="ghost" small>Request Consultation</Btn>
                  <Btn onClick={() => openOverlay("student")} variant="muted" small>Student Access</Btn>
                </div>
              </div>
            </>}

            {overlay === "message" && <>
              <div style={{ fontSize:"22px",color:C.accent,fontStyle:"italic",marginBottom:"6px" }}>Send a Message</div>
              <div style={{ fontSize:"13px",color:C.muted,marginBottom:"20px" }}>Your message will be reviewed by the doctor personally.</div>
              {sent
                ? <div style={{ textAlign:"center",padding:"24px",color:C.success,fontStyle:"italic",fontSize:"16px" }}>Your message has been sent. The doctor will respond in due course.</div>
                : <><Field label="Your Name" value={form.name} onChange={f("name")} placeholder="Full name" /><Field label="Contact (phone or email)" value={form.contact} onChange={f("contact")} placeholder="How to reach you" /><Field label="Your Message" value={form.message} onChange={f("message")} placeholder="Write your message here..." rows={4} /><Btn onClick={() => submitInquiry("message")} full>SEND MESSAGE</Btn></>
              }
            </>}

            {overlay === "consultation" && <>
              <div style={{ fontSize:"22px",color:C.accent,fontStyle:"italic",marginBottom:"6px" }}>Request Consultation</div>
              <div style={{ fontSize:"13px",color:C.muted,marginBottom:"20px" }}>Consultations are accepted selectively. The doctor will review your request and contact you if your case is accepted.</div>
              {sent
                ? <div style={{ textAlign:"center",padding:"24px",color:C.success,fontStyle:"italic",fontSize:"16px" }}>Your consultation request has been submitted. You will be contacted if your case is accepted.</div>
                : <><Field label="Your Name" value={form.name} onChange={f("name")} placeholder="Full name" /><Field label="Contact (phone or email)" value={form.contact} onChange={f("contact")} placeholder="How to reach you" /><Field label="Your condition (brief description)" value={form.message} onChange={f("message")} placeholder="What have you been diagnosed with? What treatments have you tried?" rows={5} /><Btn onClick={() => submitInquiry("consultation")} full>SUBMIT REQUEST</Btn></>
              }
            </>}

            {overlay === "student" && <>
              <div style={{ fontSize:"22px",color:C.accent,fontStyle:"italic",marginBottom:"6px" }}>Request Student Access</div>
              <div style={{ fontSize:"13px",color:C.muted,marginBottom:"20px" }}>Student access allows reading of anonymized clinical records for educational purposes.</div>
              {sent
                ? <div style={{ textAlign:"center",padding:"24px",color:C.success,fontStyle:"italic",fontSize:"16px" }}>Your request has been submitted. Credentials will be provided if approved.</div>
                : <><Field label="Your Name" value={form.name} onChange={f("name")} placeholder="Full name" /><Field label="Contact (phone or email)" value={form.contact} onChange={f("contact")} placeholder="How to reach you" /><Field label="Your background / institution" value={form.message} onChange={f("message")} placeholder="Briefly describe your background and purpose..." rows={3} /><Btn onClick={() => submitInquiry("student")} full>REQUEST ACCESS</Btn></>
              }
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function AdminDashboard({ user, onLogout, goPublic }) {
  const [data, setData] = useState(loadData());
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [adminTab, setAdminTab] = useState("patients");

  const persist = d => { setData(d); saveData(d); };
  const isAdmin = user.role === "admin";
  const pendingCount = (data.inquiries||[]).filter(i=>i.status==="pending").length;
  const filtered = data.patients.filter(p => p.id.toLowerCase().includes(search.toLowerCase()) || (p.conditions||[]).some(c=>c.toLowerCase().includes(search.toLowerCase())));

  if (view==="new"&&isAdmin) return <NewPatientForm data={data} persist={persist} onBack={()=>setView("list")} />;
  if (view==="patient"&&selected) return <PatientDetail patient={selected} data={data} persist={persist} onBack={()=>{setView("list");setSelected(null);}} user={user} />;

  return (
    <div style={{ minHeight:"100vh",background:C.bg }}>
      <header style={{ background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px" }}>
        <div>
          <div style={{ fontSize:"18px",color:C.accent,fontStyle:"italic" }}>H/Dr. Syed Furqan Ahmed</div>
          <div style={{ fontSize:"11px",color:C.muted,fontFamily:"'Inconsolata',monospace" }}>DHMS · RHMP — {user.role.toUpperCase()} VIEW</div>
        </div>
        <div style={{ display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap" }}>
          <Btn onClick={goPublic} variant="muted" small>PUBLIC JOURNAL</Btn>
          <span style={{ fontSize:"13px",color:C.muted }}>{user.name}</span>
          <Btn onClick={onLogout} variant="ghost" small>LOGOUT</Btn>
        </div>
      </header>

      <div style={{ background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 28px",display:"flex" }}>
        {[["patients","PATIENTS"],...(isAdmin?[["inbox",`INBOX${pendingCount>0?` (${pendingCount})`:""}`]]:[])] .map(([key,label]) => (
          <button key={key} onClick={()=>setAdminTab(key)}
            style={{ padding:"12px 20px",border:"none",background:"transparent",color:adminTab===key?C.accent:C.muted,borderBottom:adminTab===key?`2px solid ${C.accent}`:"2px solid transparent",cursor:"pointer",fontFamily:"'Inconsolata',monospace",fontSize:"12px",letterSpacing:"0.06em" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding:"28px",maxWidth:"1100px",margin:"0 auto" }}>
        {adminTab==="patients" && <>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
            <div style={{ fontSize:"26px",fontStyle:"italic" }}>Patient Registry</div>
            {isAdmin && <Btn onClick={()=>setView("new")}>+ NEW PATIENT</Btn>}
          </div>
          <Field label="" value={search} onChange={setSearch} placeholder="Search by patient ID or condition..." />
          <div style={{ display:"grid",gap:"12px" }}>
            {filtered.length===0 && <div style={{ textAlign:"center",color:C.muted,padding:"48px",fontStyle:"italic" }}>No patients found.</div>}
            {filtered.map(p => (
              <div key={p.id} onClick={()=>{setSelected(p);setView("patient");}}
                style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"18px 22px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.accentDim}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div>
                  <div style={{ display:"flex",gap:"10px",alignItems:"center",marginBottom:"6px",flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"'Inconsolata',monospace",color:C.accent,fontWeight:600 }}>{p.id}</span>
                    <Badge label={p.caseType==="research"?"RESEARCH":"REGULAR"} color={p.caseType==="research"?C.research:C.accentDim} />
                    <Badge label={p.status} color={p.status==="Active"?C.success:p.status==="Completed"?C.accent:C.muted} />
                  </div>
                  <div style={{ fontSize:"14px",color:C.muted,marginBottom:"4px" }}>{(p.conditions||[]).join(" · ")}</div>
                  <div style={{ fontSize:"13px",color:C.accentDim,fontStyle:"italic" }}>{publicTitle(p.caseHistory)}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"12px",fontFamily:"'Inconsolata',monospace",color:C.muted }}>{(p.attempts||[]).length} attempts</div>
                  {p.dob && <div style={{ fontSize:"12px",color:C.muted,marginTop:"4px" }}>DOB: {p.dob}</div>}
                </div>
              </div>
            ))}
          </div>
        </>}
        {adminTab==="inbox"&&isAdmin && <InboxTab data={data} persist={persist} />}
      </div>
    </div>
  );
}

// ── INBOX ─────────────────────────────────────────────────────────────────────
function InboxTab({ data, persist }) {
  const inquiries = data.inquiries || [];
  const markReviewed = id => persist({ ...data, inquiries: inquiries.map(i=>i.id===id?{...i,status:"reviewed"}:i) });
  const typeLabel = { message:"Message", consultation:"Consultation Request", student:"Student Access Request" };
  const typeColor = { message:C.muted, consultation:C.accent, student:C.research };

  return (
    <div>
      <div style={{ fontSize:"26px",fontStyle:"italic",marginBottom:"24px" }}>Inbox</div>
      {inquiries.length===0 && <div style={{ textAlign:"center",color:C.muted,padding:"48px",fontStyle:"italic" }}>No inquiries yet.</div>}
      <div style={{ display:"grid",gap:"14px" }}>
        {[...inquiries].reverse().map(inq => (
          <div key={inq.id} style={{ background:C.card,border:`1px solid ${inq.status==="pending"?C.accentDim:C.border}`,borderRadius:"8px",padding:"20px 24px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px",flexWrap:"wrap",gap:"8px" }}>
              <div style={{ display:"flex",gap:"10px",alignItems:"center" }}>
                <Badge label={typeLabel[inq.type]||inq.type} color={typeColor[inq.type]||C.muted} />
                <Badge label={inq.status==="pending"?"PENDING":"REVIEWED"} color={inq.status==="pending"?C.fail:C.success} />
              </div>
              <span style={{ fontSize:"12px",fontFamily:"'Inconsolata',monospace",color:C.muted }}>{inq.date}</span>
            </div>
            <div style={{ marginBottom:"6px" }}><span style={{ color:C.muted,fontSize:"13px" }}>Name: </span><span style={{ fontSize:"15px" }}>{inq.name}</span></div>
            <div style={{ marginBottom:"10px" }}><span style={{ color:C.muted,fontSize:"13px" }}>Contact: </span><span style={{ fontSize:"15px",fontFamily:"'Inconsolata',monospace",color:C.accent }}>{inq.contact}</span></div>
            {inq.message && <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:"4px",padding:"12px",fontSize:"15px",lineHeight:1.7,marginBottom:"14px" }}>{inq.message}</div>}
            {inq.status==="pending" && <Btn onClick={()=>markReviewed(inq.id)} variant="success" small>MARK AS REVIEWED</Btn>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── NEW PATIENT FORM ──────────────────────────────────────────────────────────
function NewPatientForm({ data, persist, onBack }) {
  const [form, setForm] = useState({ id:"",name:"",dob:"",gender:"",contact:"",conditions:"",caseType:"regular",status:"Active",caseHistory:"",patientPassword:"" });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const save = () => {
    if (!form.id||!form.name) return alert("Patient ID and Name required.");
    if (data.patients.find(p=>p.id===form.id)) return alert("Patient ID already exists.");
    const patient = { ...form, conditions:form.conditions.split(",").map(s=>s.trim()).filter(Boolean), attempts:[], labEntries:[], urduSummary:"", createdAt:new Date().toISOString() };
    persist({ ...data, patients:[...data.patients,patient], users:[...data.users,{id:form.id,password:form.patientPassword||"00000",role:"patient",name:form.name}] });
    onBack();
  };
  return (
    <div style={{ minHeight:"100vh",background:C.bg,padding:"28px" }}>
      <div style={{ maxWidth:"700px",margin:"0 auto" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"16px",marginBottom:"28px" }}>
          <Btn onClick={onBack} variant="ghost" small>← BACK</Btn>
          <div style={{ fontSize:"24px",color:C.accent,fontStyle:"italic" }}>Register New Patient</div>
        </div>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"28px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px" }}>
            <Field label="Patient ID (login username)" value={form.id} onChange={f("id")} placeholder="e.g. PT001" />
            <Field label="Patient Password (5 digits)" value={form.patientPassword} onChange={f("patientPassword")} placeholder="e.g. 11234" />
            <Field label="Full Name (confidential)" value={form.name} onChange={f("name")} placeholder="Full name" />
            <DOBInput label="Date of Birth" value={form.dob} onChange={f("dob")} />
            <Sel label="Gender" value={form.gender} onChange={f("gender")} options={[{value:"",label:"Select"},{value:"Male",label:"Male"},{value:"Female",label:"Female"},{value:"Other",label:"Other"}]} />
            <Field label="Contact (confidential)" value={form.contact} onChange={f("contact")} placeholder="Phone / email" />
          </div>
          <Field label="Conditions (comma separated)" value={form.conditions} onChange={f("conditions")} placeholder="e.g. CKD, Hypertension" />
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px" }}>
            <Sel label="Case Type" value={form.caseType} onChange={f("caseType")} options={[{value:"regular",label:"Regular"},{value:"research",label:"Research"}]} />
            <Sel label="Status" value={form.status} onChange={f("status")} options={[{value:"Active",label:"Active"},{value:"On Hold",label:"On Hold"},{value:"Completed",label:"Completed"}]} />
          </div>
          <Field label="Initial Case History (confidential)" value={form.caseHistory} onChange={f("caseHistory")} rows={6} placeholder="Begin with a descriptive title line — first 5 words become the public case title..." />
          {form.caseHistory && <div style={{ fontSize:"12px",color:C.accentDim,fontStyle:"italic",marginBottom:"14px" }}>Public title preview: <strong style={{color:C.accent}}>{publicTitle(form.caseHistory)}</strong></div>}
          <Btn onClick={save}>REGISTER PATIENT</Btn>
        </div>
      </div>
    </div>
  );
}

// ── PATIENT DETAIL ────────────────────────────────────────────────────────────
function PatientDetail({ patient: init, data, persist, onBack, user }) {
  const [tab, setTab] = useState("timeline");
  const isAdmin = user.role === "admin";
  const patient = data.patients.find(p=>p.id===init.id)||init;
  const update = updated => persist({ ...data, patients:data.patients.map(p=>p.id===updated.id?updated:p) });
  const tabs = ["timeline","labs","urdu_summary",...(isAdmin?["case_history","edit"]:[])];
  const tabLabels = { timeline:"Treatment Timeline", labs:"Lab Markers", urdu_summary:"Urdu Summary", case_history:"Case History", edit:"Edit Record" };

  return (
    <div style={{ minHeight:"100vh",background:C.bg }}>
      <header style={{ background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 28px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"14px",marginBottom:"8px",flexWrap:"wrap" }}>
          <Btn onClick={onBack} variant="ghost" small>← BACK</Btn>
          <span style={{ fontFamily:"'Inconsolata',monospace",color:C.accent,fontSize:"18px" }}>{patient.id}</span>
          <Badge label={patient.caseType==="research"?"RESEARCH":"REGULAR"} color={patient.caseType==="research"?C.research:C.accentDim} />
          <Badge label={patient.status} color={patient.status==="Active"?C.success:C.accent} />
          {isAdmin && <span style={{ color:C.muted,fontSize:"14px" }}>— {patient.name}</span>}
        </div>
        <div style={{ fontSize:"13px",color:C.accentDim,fontStyle:"italic",marginBottom:"4px" }}>{publicTitle(patient.caseHistory)}</div>
        <div style={{ fontSize:"13px",color:C.muted }}>{(patient.conditions||[]).join(" · ")}</div>
      </header>
      <div style={{ padding:"0 28px",background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",overflowX:"auto" }}>
        {tabs.map(t => (
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding:"12px 16px",border:"none",background:"transparent",color:tab===t?C.accent:C.muted,borderBottom:tab===t?`2px solid ${C.accent}`:"2px solid transparent",cursor:"pointer",fontFamily:"'Inconsolata',monospace",fontSize:"11px",letterSpacing:"0.06em",whiteSpace:"nowrap" }}>
            {tabLabels[t].toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ padding:"28px",maxWidth:"900px",margin:"0 auto" }}>
        {tab==="timeline" && <TimelineTab patient={patient} updatePatient={update} isAdmin={isAdmin} />}
        {tab==="labs" && <LabsTab patient={patient} updatePatient={update} isAdmin={isAdmin} />}
        {tab==="urdu_summary" && <UrduTab patient={patient} updatePatient={update} isAdmin={isAdmin} />}
        {tab==="case_history"&&isAdmin && (
          <div>
            <div style={{ fontSize:"13px",color:C.muted,fontFamily:"'Inconsolata',monospace",marginBottom:"16px" }}>CONFIDENTIAL — FULL CASE HISTORY</div>
            <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"24px",whiteSpace:"pre-wrap",lineHeight:1.9,fontSize:"15px" }}>{patient.caseHistory||"No case history recorded yet."}</div>
          </div>
        )}
        {tab==="edit"&&isAdmin && <EditPatientTab patient={patient} updatePatient={update} />}
      </div>
    </div>
  );
}

// ── TIMELINE TAB ──────────────────────────────────────────────────────────────
function TimelineTab({ patient, updatePatient, isAdmin }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ date:"",remedyName:"",potency:"",posology:"",rationale:"",response:"",outcome:"Partial",notes:"" });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const coded = form.remedyName&&form.potency ? (() => { try { return encodeRemedy(form.remedyName,form.potency); } catch { return ""; } })() : "";
  const add = () => {
    if (!form.date||!form.remedyName||!form.potency) return alert("Date, remedy and potency required.");
    updatePatient({ ...patient, attempts:[...(patient.attempts||[]),{...form,code:coded,id:Date.now()}] });
    setForm({ date:"",remedyName:"",potency:"",posology:"",rationale:"",response:"",outcome:"Partial",notes:"" }); setShow(false);
  };
  const attempts = patient.attempts || [];
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
        <div style={{ fontSize:"20px",fontStyle:"italic" }}>Treatment Timeline <span style={{ fontSize:"13px",color:C.muted,fontStyle:"normal",fontFamily:"'Inconsolata',monospace" }}>({attempts.length} attempts)</span></div>
        {isAdmin && <Btn onClick={()=>setShow(!show)} small>{show?"CANCEL":"+ ADD ATTEMPT"}</Btn>}
      </div>
      {show && (
        <div style={{ background:C.card,border:`1px solid ${C.accentDim}`,borderRadius:"8px",padding:"22px",marginBottom:"24px" }}>
          <div style={{ fontSize:"13px",color:C.accent,marginBottom:"16px",fontFamily:"'Inconsolata',monospace" }}>NEW TREATMENT ATTEMPT</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 16px" }}>
            <Field label="Date" value={form.date} onChange={f("date")} type="date" />
            <Field label="Remedy Name (plain)" value={form.remedyName} onChange={f("remedyName")} placeholder="e.g. Lachesis" />
            <Field label="Potency" value={form.potency} onChange={f("potency")} placeholder="e.g. 30 or 200 or 1M" />
          </div>
          {coded && <div style={{ marginBottom:"14px",fontFamily:"'Inconsolata',monospace",color:C.accent,fontSize:"15px" }}>Encoded: <strong>{coded}</strong></div>}
          <Field label="Posology" value={form.posology} onChange={f("posology")} placeholder="e.g. 3 drops TDS for 7 days" />
          <Field label="Rationale" value={form.rationale} onChange={f("rationale")} rows={2} placeholder="Clinical reasoning..." />
          <Field label="Patient Response" value={form.response} onChange={f("response")} rows={2} placeholder="What happened..." />
          <Sel label="Outcome" value={form.outcome} onChange={f("outcome")} options={[{value:"Improvement",label:"✓ Improvement"},{value:"Partial",label:"~ Partial Response"},{value:"No Change",label:"— No Change"},{value:"Aggravation",label:"▲ Aggravation"},{value:"Failed",label:"✗ Failed"},{value:"Breakthrough",label:"★ Breakthrough"}]} />
          <Field label="Additional Notes" value={form.notes} onChange={f("notes")} rows={2} />
          <Btn onClick={add}>SAVE ATTEMPT</Btn>
        </div>
      )}
      {attempts.length===0 && <div style={{ color:C.muted,fontStyle:"italic",textAlign:"center",padding:"40px" }}>No treatment attempts recorded yet.</div>}
      <div>
        {attempts.map((a,i) => {
          const color = a.outcome==="Breakthrough"?C.accent:a.outcome==="Improvement"?C.success:a.outcome==="Failed"||a.outcome==="No Change"?C.fail:C.muted;
          const icon = {Improvement:"✓",Partial:"~","No Change":"—",Aggravation:"▲",Failed:"✗",Breakthrough:"★"}[a.outcome]||"·";
          return (
            <div key={a.id||i} style={{ display:"flex",gap:"16px",marginBottom:"16px" }}>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",minWidth:"32px" }}>
                <div style={{ width:"28px",height:"28px",borderRadius:"50%",background:color+"22",border:`2px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",color,flexShrink:0 }}>{icon}</div>
                {i<attempts.length-1 && <div style={{ width:"1px",flex:1,background:C.border,margin:"4px 0" }} />}
              </div>
              <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"16px 20px",flex:1,marginBottom:"4px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px",flexWrap:"wrap",gap:"8px" }}>
                  <div style={{ display:"flex",gap:"10px",alignItems:"center" }}>
                    <span style={{ fontFamily:"'Inconsolata',monospace",color:C.accent,fontWeight:600,fontSize:"15px" }}>{a.code}</span>
                    <Badge label={a.outcome} color={color} />
                  </div>
                  <span style={{ fontSize:"12px",color:C.muted,fontFamily:"'Inconsolata',monospace" }}>{a.date} · #{i+1}</span>
                </div>
                {a.posology && <div style={{ fontSize:"13px",color:C.muted,marginBottom:"6px" }}><span style={{color:C.text}}>Posology:</span> {a.posology}</div>}
                {isAdmin&&a.rationale && <div style={{ fontSize:"13px",color:C.muted,marginBottom:"6px" }}><span style={{color:C.text}}>Rationale:</span> {a.rationale}</div>}
                {a.response && <div style={{ fontSize:"13px",color:C.muted,marginBottom:"6px" }}><span style={{color:C.text}}>Response:</span> {a.response}</div>}
                {a.notes && <div style={{ fontSize:"13px",color:C.muted,fontStyle:"italic" }}>{a.notes}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── LABS TAB ──────────────────────────────────────────────────────────────────
function LabsTab({ patient, updatePatient, isAdmin }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ date:"",marker:"",value:"",unit:"",note:"" });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const add = () => {
    if (!form.date||!form.marker||!form.value) return alert("Date, marker and value required.");
    updatePatient({ ...patient, labEntries:[...(patient.labEntries||[]),{...form,id:Date.now()}] });
    setForm({ date:"",marker:"",value:"",unit:"",note:"" }); setShow(false);
  };
  const labs = patient.labEntries || [];
  const grouped = labs.reduce((a,l)=>{ (a[l.marker]=a[l.marker]||[]).push(l); return a; },{});
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
        <div style={{ fontSize:"20px",fontStyle:"italic" }}>Lab Markers</div>
        {isAdmin && <Btn onClick={()=>setShow(!show)} small>{show?"CANCEL":"+ ADD RESULT"}</Btn>}
      </div>
      {show && (
        <div style={{ background:C.card,border:`1px solid ${C.accentDim}`,borderRadius:"8px",padding:"22px",marginBottom:"24px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0 16px" }}>
            <Field label="Date" value={form.date} onChange={f("date")} type="date" />
            <Field label="Marker" value={form.marker} onChange={f("marker")} placeholder="e.g. Creatinine" />
            <Field label="Value" value={form.value} onChange={f("value")} placeholder="e.g. 2.4" />
            <Field label="Unit" value={form.unit} onChange={f("unit")} placeholder="e.g. mg/dL" />
          </div>
          <Field label="Note" value={form.note} onChange={f("note")} placeholder="Clinical note..." />
          <Btn onClick={add}>SAVE RESULT</Btn>
        </div>
      )}
      {Object.keys(grouped).length===0 && <div style={{ color:C.muted,fontStyle:"italic",textAlign:"center",padding:"40px" }}>No lab results recorded yet.</div>}
      {Object.entries(grouped).map(([marker,entries]) => (
        <div key={marker} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"20px",marginBottom:"16px" }}>
          <div style={{ fontSize:"16px",color:C.accent,marginBottom:"14px",fontFamily:"'Inconsolata',monospace" }}>{marker}</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:"10px" }}>
            {entries.sort((a,b)=>a.date.localeCompare(b.date)).map((e,i) => (
              <div key={i} style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"10px 14px",minWidth:"110px" }}>
                <div style={{ fontSize:"11px",color:C.muted,fontFamily:"'Inconsolata',monospace",marginBottom:"4px" }}>{e.date}</div>
                <div style={{ fontSize:"20px",color:C.text }}>{e.value} <span style={{ fontSize:"12px",color:C.muted }}>{e.unit}</span></div>
                {e.note && <div style={{ fontSize:"11px",color:C.muted,marginTop:"4px",fontStyle:"italic" }}>{e.note}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── URDU SUMMARY TAB ──────────────────────────────────────────────────────────
function UrduTab({ patient, updatePatient, isAdmin }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(patient.urduSummary||"");
  const save = () => { updatePatient({...patient,urduSummary:text}); setEditing(false); };
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
        <div style={{ fontSize:"20px",fontStyle:"italic" }}>Patient Summary — <span style={{ fontFamily:"'Noto Nastaliq Urdu',serif" }}>اردو خلاصہ</span></div>
        {isAdmin && <Btn onClick={()=>setEditing(!editing)} small>{editing?"CANCEL":"EDIT SUMMARY"}</Btn>}
      </div>
      {editing && (
        <div style={{ marginBottom:"20px" }}>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={8} dir="rtl"
            style={{ width:"100%",background:C.bg,border:`1px solid ${C.accentDim}`,borderRadius:"6px",color:C.text,padding:"14px",fontSize:"18px",fontFamily:"'Noto Nastaliq Urdu',serif",lineHeight:2,resize:"vertical" }}
            placeholder="اردو میں خلاصہ لکھیں..." />
          <div style={{ marginTop:"10px" }}><Btn onClick={save}>SAVE URDU SUMMARY</Btn></div>
        </div>
      )}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"28px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:"20px",lineHeight:2.4,minHeight:"160px" }}>
        {patient.urduSummary||<span style={{ color:C.muted,fontStyle:"italic" }}>آپ کا ڈاکٹر جلد خلاصہ لکھے گا۔</span>}
      </div>
      <div style={{ marginTop:"20px",background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"20px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif" }}>
        <div style={{ fontSize:"13px",color:C.accent,marginBottom:"12px",fontFamily:"'Inconsolata',monospace",direction:"ltr" }}>TREATMENT TIMELINE</div>
        {(patient.attempts||[]).map((a,i)=>{
          const color=a.outcome==="Breakthrough"?C.accent:a.outcome==="Improvement"?C.success:a.outcome==="Failed"?C.fail:C.muted;
          return <div key={i} style={{ borderBottom:`1px solid ${C.border}`,paddingBottom:"10px",marginBottom:"10px",fontSize:"16px" }}><span style={{ color:C.muted,fontFamily:"'Inconsolata',monospace",fontSize:"12px" }}>{a.date}</span>{"  "}<Badge label={a.outcome} color={color} />{a.response&&<div style={{ fontSize:"15px",color:C.muted,marginTop:"6px" }}>{a.response}</div>}</div>;
        })}
        {!(patient.attempts||[]).length && <div style={{ color:C.muted,fontStyle:"italic" }}>ابھی کوئی ریکارڈ نہیں۔</div>}
      </div>
    </div>
  );
}

// ── EDIT PATIENT TAB ──────────────────────────────────────────────────────────
function EditPatientTab({ patient, updatePatient }) {
  const [form, setForm] = useState({ ...patient, conditions:(patient.conditions||[]).join(", ") });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const save = () => updatePatient({ ...form, conditions:form.conditions.split(",").map(s=>s.trim()).filter(Boolean) });
  return (
    <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"28px" }}>
      <div style={{ fontSize:"16px",color:C.accent,marginBottom:"20px",fontFamily:"'Inconsolata',monospace" }}>EDIT PATIENT RECORD</div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px" }}>
        <Field label="Full Name" value={form.name} onChange={f("name")} />
        <DOBInput label="Date of Birth" value={form.dob} onChange={f("dob")} />
        <Field label="Contact" value={form.contact} onChange={f("contact")} />
        <Sel label="Gender" value={form.gender} onChange={f("gender")} options={[{value:"Male",label:"Male"},{value:"Female",label:"Female"},{value:"Other",label:"Other"}]} />
      </div>
      <Field label="Conditions (comma separated)" value={form.conditions} onChange={f("conditions")} />
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px" }}>
        <Sel label="Case Type" value={form.caseType} onChange={f("caseType")} options={[{value:"regular",label:"Regular"},{value:"research",label:"Research"}]} />
        <Sel label="Status" value={form.status} onChange={f("status")} options={[{value:"Active",label:"Active"},{value:"On Hold",label:"On Hold"},{value:"Completed",label:"Completed"}]} />
      </div>
      <Field label="Case History (confidential)" value={form.caseHistory} onChange={f("caseHistory")} rows={8} />
      {form.caseHistory && <div style={{ fontSize:"12px",color:C.accentDim,fontStyle:"italic",marginBottom:"14px" }}>Public title preview: <strong style={{color:C.accent}}>{publicTitle(form.caseHistory)}</strong></div>}
      <Btn onClick={save}>SAVE CHANGES</Btn>
    </div>
  );
}

// ── PATIENT PORTAL ────────────────────────────────────────────────────────────
function PatientPortal({ user, onLogout, goPublic }) {
  const data = loadData();
  const patient = data.patients.find(p=>p.id===user.id);
  if (!patient) return (
    <div style={{ minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ textAlign:"center",color:C.muted }}>
        <div style={{ fontSize:"48px",marginBottom:"16px" }}>⚕</div>
        <div style={{ fontSize:"18px" }}>Your record is being prepared.</div>
        <div style={{ marginTop:"20px",display:"flex",gap:"10px",justifyContent:"center" }}>
          <Btn onClick={goPublic} variant="ghost">PUBLIC JOURNAL</Btn>
          <Btn onClick={onLogout} variant="muted">LOGOUT</Btn>
        </div>
      </div>
    </div>
  );
  const attempts = patient.attempts || [];
  const labs = patient.labEntries || [];
  return (
    <div style={{ minHeight:"100vh",background:C.bg }}>
      <header style={{ background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px" }}>
        <div style={{ fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:"20px",color:C.accent,direction:"rtl" }}>خوش آمدید — آپ کا ریکارڈ</div>
        <div style={{ display:"flex",gap:"10px" }}>
          <Btn onClick={goPublic} variant="muted" small>PUBLIC JOURNAL</Btn>
          <Btn onClick={onLogout} variant="ghost" small>LOGOUT</Btn>
        </div>
      </header>
      <div style={{ padding:"28px",maxWidth:"800px",margin:"0 auto" }}>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"22px",marginBottom:"20px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif" }}>
          <div style={{ display:"flex",gap:"10px",marginBottom:"10px",justifyContent:"flex-end" }}>
            <Badge label={patient.status} color={patient.status==="Active"?C.success:C.accent} />
            <Badge label={patient.caseType==="research"?"RESEARCH":"REGULAR"} color={patient.caseType==="research"?C.research:C.accentDim} />
          </div>
          <div style={{ fontSize:"16px",color:C.muted }}>{(patient.conditions||[]).join(" · ")}</div>
        </div>
        {patient.urduSummary && (
          <div style={{ background:C.card,border:`1px solid ${C.accentDim}`,borderRadius:"8px",padding:"24px",marginBottom:"20px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:"20px",lineHeight:2.4 }}>
            <div style={{ fontSize:"13px",color:C.accent,marginBottom:"12px",fontFamily:"'Inconsolata',monospace",direction:"ltr" }}>DOCTOR'S SUMMARY</div>
            {patient.urduSummary}
          </div>
        )}
        {labs.length>0 && (
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"22px",marginBottom:"20px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif" }}>
            <div style={{ fontSize:"13px",color:C.accent,marginBottom:"14px",fontFamily:"'Inconsolata',monospace",direction:"ltr" }}>LAB MARKERS</div>
            {Object.entries(labs.reduce((a,l)=>{ (a[l.marker]=a[l.marker]||[]).push(l); return a; },{})).map(([m,es])=>(
              <div key={m} style={{ marginBottom:"14px" }}>
                <div style={{ fontSize:"15px",color:C.text,marginBottom:"8px" }}>{m}</div>
                <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                  {es.sort((a,b)=>a.date.localeCompare(b.date)).map((e,i)=>(
                    <div key={i} style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"8px 12px",textAlign:"center" }}>
                      <div style={{ fontSize:"10px",color:C.muted,fontFamily:"'Inconsolata',monospace" }}>{e.date}</div>
                      <div style={{ fontSize:"18px",color:C.text }}>{e.value} <span style={{ fontSize:"11px",color:C.muted }}>{e.unit}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"22px",direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif" }}>
          <div style={{ fontSize:"13px",color:C.accent,marginBottom:"14px",fontFamily:"'Inconsolata',monospace",direction:"ltr" }}>TREATMENT TIMELINE ({attempts.length} attempts)</div>
          {attempts.map((a,i)=>{
            const color=a.outcome==="Breakthrough"?C.accent:a.outcome==="Improvement"?C.success:a.outcome==="Failed"||a.outcome==="No Change"?C.fail:C.muted;
            return <div key={i} style={{ borderBottom:`1px solid ${C.border}`,paddingBottom:"12px",marginBottom:"12px" }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px" }}><Badge label={a.outcome} color={color} /><span style={{ fontSize:"12px",fontFamily:"'Inconsolata',monospace",color:C.muted }}>{a.date}</span></div><div style={{ fontSize:"16px",color:C.muted }}>{a.response}</div></div>;
          })}
          {!attempts.length && <div style={{ color:C.muted,fontStyle:"italic" }}>ابھی کوئی ریکارڈ نہیں۔</div>}
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("journal");

  const handleLogin = u => { setUser(u); setScreen("portal"); };
  const handleLogout = () => { setUser(null); setScreen("journal"); };

  return (
    <>
      <style>{G}</style>
      {screen==="journal" && <PublicJournal onLogin={handleLogin} />}
      {screen==="portal" && user?.role==="patient" && <PatientPortal user={user} onLogout={handleLogout} goPublic={()=>setScreen("journal")} />}
      {screen==="portal" && (user?.role==="admin"||user?.role==="student") && <AdminDashboard user={user} onLogout={handleLogout} goPublic={()=>setScreen("journal")} />}
    </>
  );
}
