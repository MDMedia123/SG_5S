import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Home as HomeIcon, AlertTriangle, ArrowRight, FileText, Clock, RefreshCw,
  Filter as FilterIcon, Folder, LayoutGrid, ClipboardList, Target, User as UserIcon,
  Sparkles, Camera, Paperclip, Footprints, Wrench, ClipboardCheck, PersonStanding, ShieldCheck,
} from "lucide-react";

// ── SUPABASE CLIENT ────────────────────────────────────────
const SB_URL = "https://lxuokewkfxkjgptfcoeb.supabase.co";
const SB_KEY = "sb_publishable_T7E8MsS9x1C-Nt0UFHoqTg_iFzbWgh_";

async function sbFetch(table, orderCol = "created_at") {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?select=*&order=${orderCol}.desc`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
    });
    return await r.json();
  } catch { return []; }
}

async function sbUpsert(table, row) {
  try {
    await fetch(`${SB_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(row)
    });
  } catch { /* silent */ }
}


// ── DESIGN TOKENS ─────────────────────────────────────────
const TEAL    = "#1B9BAA";
const SGREY   = "#4A4A4A";
const FONT    = "'Nunito','Segoe UI',sans-serif";
const MONO    = "'JetBrains Mono','Courier New',monospace";

const C = {
  bg:         "#F3F4F7",
  surface:    "#FFFFFF",
  surfaceAlt: "#F0F2F5",
  border:     "#E2E5EA",
  ink:        "#1E2025",
  inkMid:     "#5B6472",
  inkLight:   "#8992A3",
  teal:       TEAL,
  tealDk:     "#148A96",
  // 5S colours
  s1:"#EF4444", s1b:"rgba(239,68,68,0.10)",  s1g:"linear-gradient(135deg,#EF4444,#F87171)",
  s2:"#F59E0B", s2b:"rgba(245,158,11,0.10)", s2g:"linear-gradient(135deg,#F59E0B,#FCD34D)",
  s3:"#10B981", s3b:"rgba(16,185,129,0.10)", s3g:"linear-gradient(135deg,#10B981,#34D399)",
  s4:TEAL,      s4b:"rgba(27,155,170,0.10)", s4g:`linear-gradient(135deg,${TEAL},#22BDD0)`,
  s5:"#8B5CF6", s5b:"rgba(139,92,246,0.10)", s5g:"linear-gradient(135deg,#8B5CF6,#A78BFA)",
  // status
  open:    "#EF4444", openBg:    "rgba(239,68,68,0.10)",
  prog:    "#F59E0B", progBg:    "rgba(245,158,11,0.10)",
  closed:  "#10B981", closedBg:  "rgba(16,185,129,0.10)",
  shadow:  "0 2px 12px rgba(30,32,37,0.08)",
};

// ── TEAM ──────────────────────────────────────────────────
const USERS = [
  { id:"rajen",    name:"Rajen Padayachee",     dept:"Litho Print",          role:"Manager",    title:"Litho Print Manager",         initials:"RP", color:TEAL       },
  { id:"mark",     name:"Mark O'Brien",          dept:"Finishing",            role:"Manager",    title:"Finishing Manager",           initials:"MO", color:"#F59E0B"  },
  { id:"riaan",    name:"Riaan Roux",            dept:"Punching",             role:"Manager",    title:"Punching Manager",            initials:"RR", color:"#EF4444"  },
  { id:"sibusiso", name:"Sibusiso Ngubane",      dept:"Quality Assurance",    role:"Manager",    title:"QA Manager",                  initials:"SN", color:"#10B981"  },
  { id:"nishaal",  name:"Nishaal Ramnarun",      dept:"Raw Materials",        role:"Manager",    title:"Raw Materials Controller",    initials:"NR", color:"#8B5CF6"  },
  { id:"desigran", name:"Desigran Moodley",      dept:"Repro",                role:"Supervisor", title:"Repro Supervisor",            initials:"DM", color:"#F59E0B"  },
  { id:"manoj",    name:"Manoj Singh",           dept:"Corrugating",          role:"Supervisor", title:"Corrugating Supervisor",      initials:"MS", color:TEAL       },
  { id:"yougash",  name:"Yougashree Padayachee", dept:"Logistics",            role:"Manager",    title:"Logistics Manager",          initials:"YP", color:"#EC4899"  },
  { id:"michael",  name:"Michael Downes",        dept:"Innovation & Quality", role:"Auditor",    title:"Innovation/Quality Manager",  initials:"MD", color:TEAL       },
  { id:"clifford", name:"Clifford Barnes",        dept:"Quality Assurance",    role:"Auditor",    title:"QA Controller",               initials:"CB", color:"#64748B"  },
  { id:"richard",  name:"Richard Downes",         dept:"Executive",            role:"Admin",      title:"Managing Director",           initials:"RD", color:SGREY      },
  { id:"jason",    name:"Jason Staats",           dept:"Finance",              role:"Admin",      title:"Financial Director",          initials:"JS", color:SGREY      },
  { id:"clint",    name:"Clint Jennings",         dept:"Operations",           role:"Manager",    title:"Operations Manager",          initials:"CJ", color:"#0EA5E9"  },
  { id:"mikevdw",  name:"Mike Van Der Westhuizen",dept:"Technical & Mechanical",role:"Manager",   title:"Technical and Mechanical Manager", initials:"MV", color:"#0891B2" },
  { id:"peroshin", name:"Peroshin Chetty",        dept:"Supply Chain",         role:"Manager",    title:"Supply Chain Manager",        initials:"PC", color:"#D946EF"  },
  { id:"julian",   name:"Julian Naidoo",          dept:"Production Planning",  role:"Manager",    title:"Production Planning Manager", initials:"JN", color:"#84CC16"  },
  { id:"mikemc",   name:"Mike Mcgrath",           dept:"Materials",            role:"Manager",    title:"Materials Manager",           initials:"MM", color:"#F43F5E"  },
];

const DEPARTMENTS = [
  "Litho Print","Finishing","Punching","Quality Assurance","Raw Materials",
  "Repro","Corrugating","Logistics","Innovation & Quality","Warehouse","Dispatch","Maintenance",
];

// ── 5S CATEGORIES ─────────────────────────────────────────
const SCATS = [
  { key:"sort",    short:"S1", label:"SORT",         jp:"Seiri",   color:"#EF4444", bg:"rgba(239,68,68,0.14)",  grad:"linear-gradient(135deg,#EF4444,#F87171)", icon:"⊗",
    questions:[
      { q:"Only required materials, tools & WIP are present at workstation",      ref:"GIB-SOP-001 §3.1" },
      { q:"Red-tagged items identified and removed or quarantined this period",    ref:"GIB-SOP-001 §3.2" },
      { q:"No obsolete dies, plates or tooling found in work area",               ref:"GIB-SOP-001 §3.3" },
      { q:"WIP quantity does not exceed the defined batch limit",                  ref:"GIB-SOP-001 §3.4" },
      { q:"Walkways and emergency routes clear of all materials and equipment",    ref:"GIB-SOP-001 §3.5" },
    ]},
  { key:"set",     short:"S2", label:"SET IN ORDER", jp:"Seiton",  color:"#F59E0B", bg:"rgba(245,158,11,0.14)", grad:"linear-gradient(135deg,#F59E0B,#FCD34D)", icon:"⊞",
    questions:[
      { q:"All tools and equipment in designated, labelled storage positions",     ref:"GIB-SOP-002 §3.1" },
      { q:"Floor markings, shadow boards and rack labels visible and undamaged",   ref:"GIB-SOP-002 §3.2" },
      { q:"FIFO system in place and actively followed",                            ref:"GIB-SOP-002 §3.3" },
      { q:"Pallets stored only in authorised zones per site layout GIB-FL-003",   ref:"GIB-SOP-002 §3.4" },
      { q:"Materials returned to correct location after use without prompting",    ref:"GIB-SOP-002 §3.5" },
    ]},
  { key:"shine",   short:"S3", label:"SHINE",        jp:"Seiso",   color:"#10B981", bg:"rgba(16,185,129,0.14)", grad:"linear-gradient(135deg,#10B981,#34D399)", icon:"◎",
    questions:[
      { q:"Work surfaces, benches and floors clean and free of debris and ink",    ref:"GIB-SOP-003 §3.1" },
      { q:"Machinery wiped down and cleaned at shift end per maintenance log",     ref:"GIB-SOP-003 §3.2" },
      { q:"Waste bins not overflowing and emptied on schedule",                    ref:"GIB-SOP-003 §3.3" },
      { q:"Cleaning schedule posted, visible, and all sign-off boxes completed",   ref:"GIB-SOP-003 §3.4" },
      { q:"Drains, ducts and ventilation points clear and inspected this month",   ref:"GIB-SOP-003 §3.5" },
    ]},
  { key:"std",     short:"S4", label:"STANDARDISE",  jp:"Seiketsu",color:TEAL,      bg:"rgba(27,155,170,0.14)", grad:`linear-gradient(135deg,${TEAL},#22BDD0)`,  icon:"⊡",
    questions:[
      { q:"5S standards, visual controls and SOPs posted at point of use",         ref:"GIB-SOP-004 §3.1" },
      { q:"All stock units carry correct GIB-LAB-001 product ID and batch labels", ref:"GIB-SOP-004 §3.2" },
      { q:"Colour-coding for materials, tools and hazard zones consistently applied",ref:"GIB-SOP-004 §3.3"},
      { q:"Previous audit corrective actions signed off and closed",               ref:"GIB-SOP-004 §3.4" },
      { q:"Team aware of 5S responsibilities and visual standards",                 ref:"GIB-SOP-004 §3.5" },
    ]},
  { key:"sustain", short:"S5", label:"SUSTAIN",      jp:"Shitsuke",color:"#8B5CF6", bg:"rgba(139,92,246,0.14)", grad:"linear-gradient(135deg,#8B5CF6,#A78BFA)", icon:"⊕",
    questions:[
      { q:"5S score maintained or improved vs previous month audit",               ref:"GIB-SOP-005 §3.1" },
      { q:"Team completed 5S awareness training within the last 6 months",         ref:"GIB-SOP-005 §3.2" },
      { q:"Near misses and housekeeping issues logged promptly",                    ref:"GIB-SOP-005 §3.3" },
      { q:"At least one improvement suggestion submitted by team this month",       ref:"GIB-SOP-005 §3.4" },
      { q:"Management walkround conducted and signed off this period",              ref:"GIB-SOP-005 §3.5" },
    ]},
];

// ── STANDARDS LIBRARY ─────────────────────────────────────
const STDS = [
  { code:"GIB-HSE-001", title:"Emergency Egress & Fire Route Clearance",    type:"Safety Rule",       scat:"set",     status:"live", scope:"All departments",                   weights:{safety:30,product:5, sop:20,area:15}, dueDays:1  },
  { code:"GIB-HSE-002", title:"Hazardous Waste Container Labelling",         type:"Safety Rule",       scat:"shine",   status:"live", scope:"Litho Print, Repro, Corrugating",   weights:{safety:28,product:18,sop:18,area:12}, dueDays:2  },
  { code:"GIB-HSE-003", title:"Pallet Storage Zone Compliance",              type:"Safety Rule",       scat:"set",     status:"live", scope:"All departments",                   weights:{safety:25,product:10,sop:15,area:12}, dueDays:4  },
  { code:"GIB-HSE-004", title:"Machine Guarding & Barrier Integrity",        type:"Safety Rule",       scat:"std",     status:"live", scope:"Punching, Finishing, Corrugating",   weights:{safety:30,product:8, sop:22,area:18}, dueDays:1  },
  { code:"GIB-SOP-001", title:"Sort & Red Tag Procedure",                    type:"SOP",               scat:"sort",    status:"live", scope:"All departments",                   weights:{safety:8, product:15,sop:12,area:8 }, dueDays:7  },
  { code:"GIB-SOP-002", title:"Set In Order — Location & Labelling",         type:"SOP",               scat:"set",     status:"live", scope:"All departments",                   weights:{safety:10,product:18,sop:14,area:10}, dueDays:5  },
  { code:"GIB-SOP-003", title:"Shine — Cleaning & Inspection Schedule",      type:"SOP",               scat:"shine",   status:"live", scope:"All departments",                   weights:{safety:12,product:20,sop:12,area:8 }, dueDays:5  },
  { code:"GIB-SOP-004", title:"Standardise — Visual Controls & SOP Display", type:"SOP",               scat:"std",     status:"live", scope:"All departments",                   weights:{safety:8, product:22,sop:15,area:10}, dueDays:5  },
  { code:"GIB-SOP-005", title:"Sustain — Audit & Training Compliance",       type:"SOP",               scat:"sustain", status:"live", scope:"All departments",                   weights:{safety:5, product:10,sop:10,area:8 }, dueDays:14 },
  { code:"GIB-QMS-001", title:"Product Label & Batch Traceability",          type:"GMP Rule",          scat:"std",     status:"live", scope:"Raw Materials, Warehouse, Logistics",weights:{safety:5, product:30,sop:18,area:15}, dueDays:2  },
  { code:"GIB-QMS-002", title:"Ink & Chemical Storage Segregation",          type:"GMP Rule",          scat:"shine",   status:"live", scope:"Litho Print, Repro",                weights:{safety:22,product:20,sop:16,area:14}, dueDays:2  },
  { code:"GIB-VIS-001", title:"Floor Marking & Zone Colour Code Standard",   type:"Visual Agreement",  scat:"set",     status:"live", scope:"All departments",                   weights:{safety:15,product:12,sop:10,area:10}, dueDays:7  },
  { code:"GIB-WI-001",  title:"Shift End Cleaning & Machine Wipe-Down",      type:"Work Instruction",  scat:"shine",   status:"live", scope:"All production departments",         weights:{safety:10,product:18,sop:12,area:10}, dueDays:1  },
  { code:"GIB-WI-002",  title:"Waste Bin Rotation & Overflow Prevention",    type:"Work Instruction",  scat:"shine",   status:"live", scope:"All departments",                   weights:{safety:12,product:8, sop:8, area:6 }, dueDays:1  },
  { code:"GIB-OPL-001", title:"FIFO — First In First Out Visual Check",      type:"One Point Lesson",  scat:"set",     status:"live", scope:"Raw Materials, Warehouse",           weights:{safety:3, product:20,sop:10,area:10}, dueDays:3  },
];

const SEVERITY_BANDS = [
  { min:0,  max:20,  label:"Observation",  color:"#64748B", priority:"LOG",      dueMult:2.0 },
  { min:21, max:40,  label:"Minor Finding",    color:TEAL,      priority:"LOW",      dueMult:1.5 },
  { min:41, max:60,  label:"Moderate Finding", color:"#F59E0B", priority:"MEDIUM",   dueMult:1.0 },
  { min:61, max:80,  label:"Major Finding",    color:"#EF4444", priority:"HIGH",     dueMult:0.5 },
  { min:81, max:100, label:"Critical Finding", color:"#9333EA", priority:"CRITICAL", dueMult:0.25},
];

function getSeverityBand(score) {
  return SEVERITY_BANDS.find(b => score >= b.min && score <= b.max) || SEVERITY_BANDS[0];
}
function computeScore(std, repeatCount, visualCond) {
  return Math.min(100,
    Math.min(std.weights.safety,30) +
    Math.min(std.weights.product,25) +
    Math.min(repeatCount*5,15) +
    Math.min(std.weights.sop,15) +
    Math.min(std.weights.area,10) +
    Math.round((visualCond/4)*5)
  );
}

// ── SCORING ───────────────────────────────────────────────
const catScore = (answers, catKey) => {
  const cat = SCATS.find(c => c.key === catKey);
  if (!cat) return null;
  let total = 0, answered = 0;
  cat.questions.forEach((_, i) => {
    const v = answers[`${catKey}_${i}`];
    if (v !== undefined) { total += v; answered++; }
  });
  return answered === 0 ? null : Math.round((total / (answered * 4)) * 100);
};
const deptScore = (answers) => {
  const scores = SCATS.map(c => catScore(answers, c.key)).filter(v => v !== null);
  return scores.length === 0 ? null : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};
const scoreColor = v => v >= 80 ? C.closed : v >= 60 ? C.prog : C.open;
const scoreLabel = v => v >= 80 ? "COMPLIANT" : v >= 60 ? "DEVELOPING" : "NEEDS ACTION";

// ── SEED DATA ─────────────────────────────────────────────
const SEED_ISSUES = [
  {
    id:"F-001", dept:"Punching", manager:"Riaan Roux", mgrColor:"#EF4444", mgrInit:"RR",
    desc:"Pallet blocking fire extinguisher access near press No.3.",
    scat:SCATS[1], status:"OPEN", raisedBy:"Michael Downes", raisedAt:"2026-05-04 08:22",
    ncType:"Major Finding", severityScore:68, severityBand:SEVERITY_BANDS[3],
    governingStd:STDS[0], hasGoverningStandard:true, priority:"HIGH", dueDate:"2026-05-05",
    aiNote:"Nonconformance recorded under SET IN ORDER (Seiton). Pallet placement adjacent to press No.3 breaches GIB-HSE-001 emergency egress standard. Corrective action mandatory within 4 hours.",
    photo:null, closeEvidence:null,
    timeline:[
      { time:"2026-05-04 08:22", actor:"Michael Downes",    action:"Finding raised",                                       type:"raise" },
      { time:"2026-05-04 08:22", actor:"AI Engine L2",      action:"Classified: Pallet — blocking emergency access",       type:"ai"    },
      { time:"2026-05-04 08:22", actor:"Standards Engine L3",action:"GIB-HSE-001 verified (live)",                         type:"ai"    },
      { time:"2026-05-04 08:22", actor:"Scoring Engine L4", action:"Score: 68/100 → Major Finding · Riaan Roux notified",      type:"ai"    },
    ]
  },
  {
    id:"F-002", dept:"Raw Materials", manager:"Nishaal Ramnarun", mgrColor:"#8B5CF6", mgrInit:"NR",
    desc:"Unlabelled stock boxes — batch traceability compromised.",
    scat:SCATS[3], status:"IN PROGRESS", raisedBy:"Clifford Barnes", raisedAt:"2026-05-03 14:05",
    ncType:"Moderate Finding", severityScore:48, severityBand:SEVERITY_BANDS[2],
    governingStd:STDS[9], hasGoverningStandard:true, priority:"MEDIUM", dueDate:"2026-05-05",
    aiNote:"Nonconformance under STANDARDISE (Seiketsu). GIB-QMS-001 batch traceability requirement breached. Labels must be applied within 48 hours.",
    photo:null, closeEvidence:null,
    timeline:[
      { time:"2026-05-03 14:05", actor:"Clifford Barnes",   action:"Finding raised · Photo attached",                      type:"raise" },
      { time:"2026-05-03 14:05", actor:"AI Engine L2",      action:"Classified: Stock boxes — missing ID labels",          type:"ai"    },
      { time:"2026-05-03 14:05", actor:"Standards Engine L3",action:"GIB-QMS-001 verified (live)",                         type:"ai"    },
      { time:"2026-05-03 14:05", actor:"Scoring Engine L4", action:"Score: 48/100 → Moderate Finding · Nishaal notified",      type:"ai"    },
      { time:"2026-05-03 16:30", actor:"Nishaal Ramnarun",  action:"Acknowledged — labels being sourced",                  type:"update"},
    ]
  },
  {
    id:"F-003", dept:"Litho Print", manager:"Rajen Padayachee", mgrColor:TEAL, mgrInit:"RP",
    desc:"Ink waste containers not labelled — regulatory breach risk.",
    scat:SCATS[2], status:"CLOSED", raisedBy:"Michael Downes", raisedAt:"2026-05-01 10:45",
    ncType:"Major Finding", severityScore:72, severityBand:SEVERITY_BANDS[3],
    governingStd:STDS[1], hasGoverningStandard:true, priority:"HIGH", dueDate:"2026-05-03",
    aiNote:"Nonconformance under SHINE (Seiso). GIB-HSE-002 breached. All containers must be labelled within 2 hours.",
    photo:null,
    closeEvidence:{ note:"All containers labelled, waste register updated, team briefed.", photo:null, doc:"waste-register-may2026.pdf" },
    timeline:[
      { time:"2026-05-01 10:45", actor:"Michael Downes",    action:"Finding raised",                                       type:"raise" },
      { time:"2026-05-01 10:45", actor:"AI Engine L2",      action:"Classified: Ink containers — unlabelled hazardous waste",type:"ai"  },
      { time:"2026-05-01 10:45", actor:"Standards Engine L3",action:"GIB-HSE-002 verified (live)",                         type:"ai"    },
      { time:"2026-05-01 10:45", actor:"Scoring Engine L4", action:"Score: 72/100 → Major Finding · Rajen notified",           type:"ai"    },
      { time:"2026-05-01 11:30", actor:"Rajen Padayachee",  action:"Acknowledged",                                         type:"update"},
      { time:"2026-05-01 14:00", actor:"Rajen Padayachee",  action:"Closed · Doc: waste-register-may2026.pdf",             type:"update"},
    ]
  },
];

const SEED_AUDITS = {
  "Punching":     { sort_0:3,sort_1:2,sort_2:3,sort_3:3,sort_4:2, set_0:2,set_1:3,set_2:2,set_3:1,set_4:3, shine_0:3,shine_1:3,shine_2:2,shine_3:3,shine_4:2, std_0:2,std_1:3,std_2:3,std_3:2,std_4:3, sustain_0:3,sustain_1:2,sustain_2:3,sustain_3:2,sustain_4:3 },
  "Litho Print":  { sort_0:4,sort_1:3,sort_2:4,sort_3:3,sort_4:4, set_0:3,set_1:4,set_2:3,set_3:3,set_4:4, shine_0:3,shine_1:4,shine_2:3,shine_3:4,shine_4:3, std_0:4,std_1:3,std_2:3,std_3:4,std_4:3, sustain_0:3,sustain_1:4,sustain_2:3,sustain_3:3,sustain_4:4 },
  "Raw Materials":{ sort_0:2,sort_1:2,sort_2:3,sort_3:2,sort_4:3, set_0:3,set_1:2,set_2:3,set_3:2,set_4:2, shine_0:2,shine_1:2,shine_2:3,shine_3:2,shine_4:1, std_0:1,std_1:1,std_2:2,std_3:2,std_4:2, sustain_0:2,sustain_1:2,sustain_2:1,sustain_3:2,sustain_4:2 },
};

// ── AI CALLS ──────────────────────────────────────────────
async function callAI(desc, catLabel, dept, manager) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:600,
        messages:[{ role:"user", content:
          `You are the 5S Compliance Authority for Gibson Packaging. Write a formal compliance notification (3 sentences) for this finding:
Department: ${dept} | Manager: ${manager} | 5S Category: ${catLabel} | Finding: "${desc}"
Include: 5S category breach with Japanese name, a Gibson standard reference (e.g. GIB-HSE-001), corrective action and deadline. Direct, no bullet points.`
        }]
      })
    });
    const d = await res.json();
    return d.content?.[0]?.text || "";
  } catch { return ""; }
}

async function classifyFinding(desc, dept, imgB64) {
  const stdList = STDS.map(s => `${s.code}|${s.title}|${s.scat}|${s.status}`).join("\n");
  const prompt = `You are the AI Compliance Engine for Gibson Packaging.
Finding: "${desc}" in department: ${dept || "unknown"}
Standards library:\n${stdList}

Reply ONLY with valid JSON (no markdown):
{"object":"1-4 words","condition":"5-10 words","riskCategory":"Safety|Quality|Housekeeping|Compliance","scat":"sort|set|shine|std|sustain","scatReason":"one sentence","primaryStandard":"GIB-HSE-001","standardStatus":"live|draft|none","hasGoverningStandard":true,"proposedStandardTitle":"","visualConditionScore":2,"immediateAction":"one sentence","confidence":"high|medium|low"}`;

  try {
    const content = imgB64
      ? [{ type:"image", source:{ type:"base64", media_type:"image/jpeg", data: imgB64.replace(/^data:image\/\w+;base64,/,"") }}, { type:"text", text:prompt }]
      : [{ type:"text", text:prompt }];
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:600, messages:[{ role:"user", content }] })
    });
    const d = await res.json();
    const text = (d.content?.[0]?.text || "").trim();
    return JSON.parse(text);
  } catch { return null; }
}

// ── STYLE INJECTION ───────────────────────────────────────
function injectStyles() {
  if (document.getElementById("g5s")) return;
  const el = document.createElement("style");
  el.id = "g5s";
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
    *{box-sizing:border-box} ::-webkit-scrollbar{display:none}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
    .card{animation:fadeUp 0.3s ease both}
    .card:nth-child(2){animation-delay:.06s}
    .card:nth-child(3){animation-delay:.12s}
    .card:nth-child(4){animation-delay:.18s}
    button:active{transform:scale(0.97)}
  `;
  document.head.appendChild(el);
}

// ─────────────────────────────────────────────────────────
// SHARED UI COMPONENTS  (defined first so all views can use them)
// ─────────────────────────────────────────────────────────

function Shell({ children, toast }) {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", display:"flex", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:480, background:C.bg, minHeight:"100vh",
        paddingBottom:88, fontFamily:FONT, position:"relative" }}>
        {children}
        {toast && (
          <div style={{ position:"fixed", bottom:96, left:"50%", transform:"translateX(-50%)",
            background:`linear-gradient(135deg,${C.closed},#34D399)`, color:"#fff",
            padding:"10px 22px", borderRadius:100, fontSize:13, fontWeight:800,
            letterSpacing:1, boxShadow:`0 6px 24px ${C.closed}44`,
            whiteSpace:"nowrap", zIndex:999, animation:"popIn 0.2s ease" }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function Av({ txt, color, size=36 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%",
      background:`${color}22`, border:`2px solid ${color}55`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.33, fontWeight:900, color, flexShrink:0, fontFamily:MONO }}>
      {txt}
    </div>
  );
}

function ProgressRing({ pct, size=64, stroke=7, color=TEAL }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const val = pct == null ? 0 : Math.max(0, Math.min(100, pct));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - (val/100)*c} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
  );
}

function SHead({ label }) {
  return (
    <div style={{ padding:"16px 16px 8px", fontSize:10,
      color:C.inkLight, letterSpacing:3, fontWeight:800 }}>
      {label}
    </div>
  );
}

function FLabel({ text }) {
  return (
    <div style={{ fontSize:10, color:C.inkLight, letterSpacing:3,
      fontWeight:800, marginBottom:6, marginTop:14 }}>
      {text}
    </div>
  );
}

// Shared style snippets
const sx = {
  backBtnW:{ background:"rgba(255,255,255,0.2)", border:"1.5px solid rgba(255,255,255,0.35)",
    borderRadius:8, color:"#fff", padding:"6px 12px", fontSize:12, fontWeight:700,
    cursor:"pointer", fontFamily:FONT },
  textarea:{ width:"100%", background:C.surfaceAlt, border:`1.5px solid ${C.border}`,
    borderRadius:10, color:C.ink, padding:"12px", fontSize:13, fontFamily:FONT, resize:"none" },
  select:{ width:"100%", background:C.surfaceAlt, border:`1.5px solid ${C.border}`,
    borderRadius:10, color:C.ink, padding:"12px", fontSize:13, fontFamily:FONT },
  ghostBtn:{ flex:1, padding:"12px", background:C.surface, border:`1.5px solid ${C.border}`,
    borderRadius:10, color:C.inkMid, fontSize:13, fontWeight:700, fontFamily:FONT, cursor:"pointer" },
  solidBtn:{ flex:1, padding:"12px", border:"none", borderRadius:10, color:"#fff",
    fontSize:13, fontWeight:800, fontFamily:FONT, cursor:"pointer" },
};

// ─────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [sel, setSel] = useState("");
  const user = USERS.find(u => u.id === sel);

  return (
    <div style={{ background:"#EDEFF3", minHeight:"100vh", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"24px 20px", position:"relative", overflow:"hidden", fontFamily:FONT }}>

      <div style={{ position:"absolute", top:0, left:0, right:0, height:5,
        background:`linear-gradient(90deg,${SGREY},${TEAL},${SGREY})`, zIndex:10 }}/>

      {/* Watermark */}
      <div style={{ position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%,-55%)", width:340, height:340,
        opacity:0.04, pointerEvents:"none", zIndex:0 }}>
        <svg viewBox="0 0 200 220" width="100%" height="100%">
          <text x="5" y="160" fontSize="180" fontWeight="900"
            fontFamily="Arial Black,sans-serif" fill={TEAL}>S</text>
          <text x="90" y="215" fontSize="140" fontWeight="900"
            fontFamily="Arial Black,sans-serif" fill={SGREY}>G</text>
        </svg>
      </div>

      <div style={{ position:"absolute", bottom:-80, right:-60, width:280, height:280,
        borderRadius:"50%", background:`radial-gradient(circle,${TEAL}14 0%,transparent 70%)`,
        pointerEvents:"none", zIndex:0 }}/>

      <div style={{ width:"100%", maxWidth:400, position:"relative",
        zIndex:2, animation:"slideUp 0.4s ease" }}>

        <div style={{ textAlign:"center", marginBottom:26 }}>
          <div style={{ width:90, height:90, borderRadius:22, background:"#FFFFFF",
            border:`2px solid ${TEAL}44`, margin:"0 auto 16px",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 8px 24px rgba(30,32,37,0.10)" }}>
            <svg viewBox="0 0 100 120" width="60" height="60">
              <text x="2" y="72" fontSize="85" fontWeight="900"
                fontFamily="Arial Black,sans-serif" fill={SGREY}>S</text>
              <text x="34" y="114" fontSize="70" fontWeight="900"
                fontFamily="Arial Black,sans-serif" fill={TEAL}>G</text>
            </svg>
          </div>
          <div style={{ fontSize:11, color:TEAL, letterSpacing:6, fontWeight:900, marginBottom:6 }}>
            SHAVE &amp; GIBSON
          </div>
          <div style={{ fontSize:21, fontWeight:900, color:"#1E2025", letterSpacing:2 }}>
            OpsApp
          </div>
          <div style={{ fontSize:10, color:"#8992A3", letterSpacing:3, marginTop:6 }}>
            INTEGRATED OPERATIONS PLATFORM
          </div>
        </div>

        <div style={{ background:"#FFFFFF", borderRadius:18, padding:"24px 22px",
          border:"1px solid #E2E5EA", boxShadow:"0 20px 50px rgba(30,32,37,0.10)" }}>

          <div style={{ fontSize:11, fontWeight:800, color:"#78808F",
            letterSpacing:3, marginBottom:12 }}>SELECT YOUR NAME</div>

          <select style={{ width:"100%", padding:"12px", border:`2px solid ${sel?TEAL:"#E2E5EA"}`,
            borderRadius:12, fontSize:14, fontFamily:FONT,
            color:sel?"#1E2025":"#8992A3", background:"#F0F2F5",
            marginBottom:14, outline:"none" }}
            value={sel} onChange={e => setSel(e.target.value)}>
            <option value="" style={{ color:"#8992A3", background:"#F0F2F5" }}>— Select your name —</option>
            {[...USERS].sort((a,b) => a.name.localeCompare(b.name)).map(u => (
              <option key={u.id} value={u.id} style={{ color:"#1E2025", background:"#F0F2F5" }}>
                {u.name}
              </option>
            ))}
          </select>

          {user && (
            <div style={{ background:`${user.color}18`, border:`1.5px solid ${user.color}44`,
              borderRadius:12, padding:"11px 13px", marginBottom:16,
              display:"flex", alignItems:"center", gap:12, animation:"fadeUp 0.2s ease" }}>
              <Av txt={user.initials} color={user.color} size={44}/>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#1E2025" }}>{user.name}</div>
                <div style={{ fontSize:11, color:user.color, fontWeight:700, marginTop:2 }}>{user.title}</div>
                <div style={{ fontSize:10, color:"#8992A3", marginTop:2 }}>{user.dept}</div>
              </div>
            </div>
          )}

          <button style={{ width:"100%", padding:"13px",
            background:sel?`linear-gradient(135deg,${TEAL},${C.tealDk})`:"#E2E5EA",
            border:"none", borderRadius:12, color:sel?"#fff":"#8992A3",
            fontSize:14, fontWeight:800, letterSpacing:1, fontFamily:FONT,
            cursor:sel?"pointer":"default",
            boxShadow:sel?`0 6px 24px ${TEAL}44`:"none" }}
            onClick={() => { if (user) onLogin(user); }} disabled={!sel}>
            {sel ? `Sign In as ${user?.name.split(" ")[0]} →` : "Select your name above"}
          </button>
        </div>

        <div style={{ textAlign:"center", marginTop:18, fontSize:9,
          color:"#C7CCD5", letterSpacing:3 }}>
          INTERNAL USE ONLY · SHAVE & GIBSON
        </div>
      </div>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4,
        background:`linear-gradient(90deg,${SGREY},${TEAL},${SGREY})`, zIndex:10 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────

function MainApp({ currentUser, onLogout, auditAnswers, setAuditAnswers, onHome, issues, setIssues }) {
  const [tab,          setTab]          = useState("board");
  // issues/setIssues passed from App root for shared badge counts
  const [selected,     setSelected]     = useState(null);
  const [filter,       setFilter]       = useState("ALL");
  const [catFilter,    setCatFilter]    = useState("");
  const [showCatMenu,  setShowCatMenu]  = useState(false);
  const [myOnly,       setMyOnly]       = useState(false);
  const [toast,        setToast]        = useState("");
  const [dbLoaded,     setDbLoaded]     = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    (async () => {
      const rows = await sbFetch("issues");
      if (Array.isArray(rows) && rows.length > 0) {
        const loaded = rows.map(r => ({
          ...r.data,
          scat: SCATS.find(s => s.key === r.data?.scat?.key) || SCATS[1],
          severityBand: SEVERITY_BANDS.find(b => b.label === r.data?.severityBand?.label) || null,
          governingStd: STDS.find(s => s.code === r.data?.governingStd?.code) || null,
        }));
        setIssues(loaded);
      }
      const audRows = await sbFetch("audits", "updated_at");
      if (Array.isArray(audRows) && audRows.length > 0) {
        const audMap = {};
        audRows.forEach(r => { audMap[r.dept] = r.data; });
        setAuditAnswers(prev => ({ ...prev, ...audMap }));
      }
      setDbLoaded(true);
    })();
  }, []);
  // raise
  const [desc,         setDesc]         = useState("");
  const [dept,         setDept]         = useState("");
  const [mgr,          setMgr]          = useState("");
  const [scat,         setScat]         = useState("");
  const [img,          setImg]          = useState(null);
  const [genning,      setGenning]      = useState(false);
  const [engineRunning,setEngineRunning]= useState(false);
  const [engineResult, setEngineResult] = useState(null);
  const [engineScore,  setEngineScore]  = useState(null);
  const [engineBand,   setEngineBand]   = useState(null);
  const [engineStd,    setEngineStd]    = useState(null);
  const [descTimer,    setDescTimer]    = useState(null);
  // close
  const [closingId,    setClosingId]    = useState(null);
  const [closeNote,    setCloseNote]    = useState("");
  const [closePhoto,   setClosePhoto]   = useState(null);
  const [closeDocName, setCloseDocName] = useState("");
  // audit
  const [auditDept,    setAuditDept]    = useState(
    currentUser.dept !== "All Departments" && currentUser.dept !== "Executive" && currentUser.dept !== "Finance"
      ? currentUser.dept : ""
  );
  const [auditStep,    setAuditStep]    = useState(0);
  const [localAns,     setLocalAns]     = useState({});

  const imgRef      = useRef();
  const closeImgRef = useRef();
  const closeDocRef = useRef();

  const showToast   = msg => { setToast(msg); setTimeout(() => setToast(""), 2800); };
  const statColor   = s => s==="CLOSED"?C.closed:s==="IN PROGRESS"?"#2563EB":C.open;
  const statBg      = s => s==="CLOSED"?C.closedBg:s==="IN PROGRESS"?"#DBEAFE":C.openBg;
  const myFindings      = issues.filter(i => i.manager === currentUser.name);
  const myOpenCt    = myFindings.filter(i => i.status === "OPEN").length;

  const facilityScores = DEPARTMENTS.map(d => ({ d, sc:deptScore(auditAnswers[d]||{}) }));
  const scoredDepts    = facilityScores.filter(x => x.sc !== null);
  const facilityAvg    = scoredDepts.length === 0 ? null
    : Math.round(scoredDepts.reduce((a,b) => a+b.sc, 0) / scoredDepts.length);
  const myDeptScore    = currentUser.dept && !["Executive","Finance","All Departments"].includes(currentUser.dept)
    ? deptScore(auditAnswers[currentUser.dept]||{}) : null;

  const handleImg = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      setImg(ev.target.result);
      if (desc.trim().length > 10) runEngine(desc, dept, ev.target.result);
    };
    r.readAsDataURL(f);
  };

  const runEngine = async (d, dp, imgData) => {
    setEngineRunning(true);
    setEngineResult(null); setEngineScore(null); setEngineBand(null); setEngineStd(null);
    const result = await classifyFinding(d, dp, imgData);
    if (result) {
      setEngineResult(result);
      if (result.scat) setScat(prev => prev || result.scat);
      const std = STDS.find(s => s.code === result.primaryStandard) || null;
      setEngineStd(std);
      if (std && std.status === "live" && result.hasGoverningStandard) {
        const repeatCount = issues.filter(i => i.dept===dp && i.scat?.key===result.scat).length;
        const score = computeScore(std, repeatCount, result.visualConditionScore ?? 2);
        setEngineScore(score);
        setEngineBand(getSeverityBand(score));
      }
    }
    setEngineRunning(false);
  };

  const handleDescChange = val => {
    setDesc(val);
    setEngineResult(null); setEngineScore(null); setEngineBand(null); setEngineStd(null);
    if (descTimer) clearTimeout(descTimer);
    if (val.trim().length < 12) return;
    const t = setTimeout(() => runEngine(val, dept, img), 1100);
    setDescTimer(t);
  };

  const handleRaise = async () => {
    if (!desc || !dept || !mgr) { showToast("⚠ Please fill description, department and manager"); return; }
    setGenning(true);
    const m   = USERS.find(u => u.id === mgr);
    const cat = SCATS.find(x => x.key === (scat || engineResult?.scat || "set")) || SCATS[1];
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const band = engineBand || SEVERITY_BANDS[0];
    const hasStd = !!(engineResult?.hasGoverningStandard && engineStd?.status === "live");
    const dueDays = engineStd ? Math.round(engineStd.dueDays * band.dueMult) : 14;
    const due = new Date(); due.setDate(due.getDate() + dueDays);
    const dueStr = due.toISOString().slice(0,10);
    let note = await callAI(desc, `${cat.label} (${cat.jp})`, dept, m.name);
    if (!note) note = `Finding recorded under ${cat.label} (${cat.jp}). ${hasStd ? `Standard: ${engineStd.code}.` : "No governing standard — logged as Observation."} Manager ${m.name} notified. Due: ${dueStr}.`;

    const isNCR     = hasStd && engineScore >= 61;  // Major or Critical → NCR
    const findingType = !hasStd ? "Observation" : isNCR ? band.label + " NCR" : band.label + " Finding";

    const issue = {
      id:`F-${String(issues.length+1).padStart(3,"0")}`,
      dept, manager:m.name, mgrColor:m.color, mgrInit:m.initials,
      desc, scat:cat, status:"OPEN", photo:img, closeEvidence:null,
      raisedBy:currentUser.name, raisedAt:now,
      aiNote:note, aiClassification:engineResult,
      governingStd:engineStd||null, hasGoverningStandard:hasStd,
      severityScore:engineScore, severityBand:band,
      isNCR, // true = NCR generated, false = Finding only
      ncType:findingType,
      priority:hasStd ? band.priority : "LOG", dueDate:dueStr,
      timeline:[
        { time:now, actor:currentUser.name, action:"Finding raised"+(img?" · Photo attached":""), type:"raise" },
        { time:now, actor:"AI Engine L2",   action:engineResult ? `Classified: ${engineResult.object} — ${engineResult.condition}` : "Classified", type:"ai" },
        { time:now, actor:"Standards L3",   action:hasStd ? `${engineStd.code} verified (live)` : "No governing standard — Observation only", type:"ai" },
        ...(hasStd ? [{ time:now, actor:"Scoring L4", action:`Score: ${engineScore}/100 → ${findingType}${isNCR ? " · NCR GENERATED" : ""} · ${m.name} notified`, type:"ai" }] : []),
      ]
    };
    setIssues(p => [issue, ...p]);
    // Save to Supabase
    sbUpsert("issues", { id: issue.id, data: issue, created_at: new Date().toISOString() });
    setGenning(false);
    showToast(`✓ ${issue.id} ${hasStd ? band.label : "Observation"} — ${m.name} notified`);
    setDesc(""); setDept(""); setMgr(""); setScat(""); setImg(null);
    setEngineResult(null); setEngineScore(null); setEngineBand(null); setEngineStd(null);
    setTimeout(() => setTab("board"), 600);
  };

  const updateStatus = (id, status, note, evPhoto, evDoc) => {
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const parts = [note||`Status → ${status}`, evPhoto?"· Close-out photo":"", evDoc?`· Doc: ${evDoc}`:""].filter(Boolean);
    const upd = { time:now, actor:currentUser.name, action:parts.join(" "), type:"update" };
    const ce  = status==="CLOSED" ? { note, photo:evPhoto, doc:evDoc } : null;
    setIssues(p => p.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, status, closeEvidence:ce, timeline:[...i.timeline,upd] };
      sbUpsert("issues", { id: updated.id, data: updated, created_at: updated.raisedAt });
      return updated;
    }));
    if (selected?.id===id) setSelected(p => ({ ...p, status, closeEvidence:ce, timeline:[...p.timeline,upd] }));
    setClosingId(null); setCloseNote(""); setClosePhoto(null); setCloseDocName("");
    showToast(`✓ ${id} ${status==="CLOSED" ? "closed out" : "updated"}`);
  };

  const submitAudit = () => {
    const merged = { ...(auditAnswers[auditDept]||{}), ...localAns };
    setAuditAnswers(prev => ({ ...prev, [auditDept]: merged }));
    sbUpsert("audits", { id: auditDept, dept: auditDept, data: merged, updated_at: new Date().toISOString() });
    showToast(`✓ Audit submitted for ${auditDept}`);
    setTimeout(() => { setLocalAns({}); setAuditStep(0); setTab("report"); }, 800);
  };

  const filtered = (() => {
    let l = myOnly ? myFindings : issues;
    if (filter !== "ALL") l = l.filter(i => i.status === filter);
    if (catFilter) l = l.filter(i => i.scat?.key === catFilter);
    return l;
  })();

  // ── DETAIL VIEW ────────────────────────────────────────
  if (selected) {
    const cat = selected.scat;
    const isMyFinding = selected.manager === currentUser.name;
    return (
      <Shell toast={toast}>
        <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", padding:"16px 16px 0", gap:10 }}>
            <button onClick={() => setSelected(null)} style={{ width:36, height:36, borderRadius:9,
              background:C.surface, border:`1px solid ${C.border}`, display:"flex", alignItems:"center",
              justifyContent:"center", cursor:"pointer" }}>
              <ArrowLeft size={16} color={C.ink}/>
            </button>
            <div style={{ marginLeft:"auto", background:C.surfaceAlt, borderRadius:100,
              padding:"3px 14px", fontSize:12, fontWeight:900, color:C.inkMid, fontFamily:MONO }}>
              {selected.id}
            </div>
            {isMyFinding && <div style={{ background:`${currentUser.color}18`, borderRadius:100,
              padding:"3px 10px", fontSize:9, fontWeight:800, color:currentUser.color }}>MY Finding</div>}
          </div>
          {selected.photo && (
            <div style={{ position:"relative", margin:"12px 16px 0", borderRadius:14, overflow:"hidden" }}>
              <img src={selected.photo} alt="" style={{ width:"100%", height:180, objectFit:"cover" }}/>
              <div style={{ position:"absolute", bottom:8, left:8, background:"rgba(0,0,0,0.6)",
                color:"#fff", fontSize:9, padding:"3px 10px", borderRadius:6 }}>📷 EVIDENCE</div>
            </div>
          )}
          <div style={{ padding:"14px 16px 18px" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6,
              background:cat.bg, borderRadius:100, padding:"3px 12px", marginBottom:9 }}>
              <Folder size={13} color={cat.color}/>
              <span style={{ fontSize:11, fontWeight:800, color:cat.color, letterSpacing:1 }}>{cat.label}</span>
            </div>
            <div style={{ fontSize:19, fontWeight:900, color:C.ink, marginBottom:5 }}>{selected.dept}</div>
            <div style={{ fontSize:13, color:C.inkMid, lineHeight:1.6 }}>{selected.desc}</div>
          </div>
        </div>

        {/* Score bar */}
        {selected.severityScore != null && selected.severityBand && (
          <div style={{ margin:"12px 16px 0", background:C.surface,
            border:`1px solid ${selected.severityBand.color}44`, borderRadius:12, padding:"12px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div>
                <div style={{ fontSize:9, color:C.inkLight, letterSpacing:2 }}>{selected.isNCR ? "⚠ NCR GENERATED · L4 SCORE" : "FINDING · L4 SCORE"}</div>
                {selected.governingStd && <div style={{ fontSize:10, color:C.teal, marginTop:2 }}>
                  {selected.governingStd.code} — {selected.governingStd.title}</div>}
              </div>
              <div style={{ fontSize:26, fontWeight:900, color:selected.severityBand.color }}>
                {selected.severityScore}<span style={{ fontSize:11 }}>/100</span>
              </div>
            </div>
            <div style={{ height:5, background:C.border, borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${selected.severityScore}%`,
                background:selected.severityBand.color, borderRadius:3 }}/>
            </div>
            <div style={{ marginTop:6, fontSize:10, color:C.inkMid }}>
              {selected.severityBand.label} · Priority: <strong style={{ color:selected.severityBand.color }}>
              {selected.severityBand.priority}</strong> · Due: {selected.dueDate}
            </div>
          </div>
        )}
        {selected.hasGoverningStandard === false && (
          <div style={{ margin:"12px 16px 0", background:`${C.prog}18`,
            border:`1px solid ${C.prog}44`, borderRadius:12, padding:"12px 14px" }}>
            <div style={{ fontSize:10, fontWeight:800, color:C.prog, letterSpacing:1, marginBottom:3 }}>
              OBSERVATION — NO GOVERNING STANDARD
            </div>
            <div style={{ fontSize:11, color:C.inkMid, lineHeight:1.5 }}>
              Logged as Observation only — no score or penalty. Standard proposal queued for review.
            </div>
          </div>
        )}

        {/* Meta grid */}
        <div style={{ padding:"12px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            { label:"Manager", val:selected.manager, color:selected.mgrColor },
            { label:"Status",  val:selected.status,  color:statColor(selected.status) },
            { label:"Type",    val:selected.ncType||"Finding", color:selected.severityBand?.color||C.teal },
            { label:"Raised",  val:selected.raisedAt?.slice(0,10), color:C.inkMid },
          ].map(m => (
            <div key={m.label} style={{ background:C.surfaceAlt, borderRadius:10,
              padding:"9px 12px", border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:9, color:C.inkLight, letterSpacing:2, marginBottom:2 }}>{m.label}</div>
              <div style={{ fontSize:12, fontWeight:800, color:m.color }}>{m.val}</div>
            </div>
          ))}
        </div>

        {/* AI note */}
        <div style={{ margin:"0 16px 12px", background:`${C.s5}12`,
          border:`1px solid ${C.s5}44`, borderRadius:12, padding:"12px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <Sparkles size={14} color={C.s5}/>
            <div style={{ fontSize:10, fontWeight:800, color:C.s5, letterSpacing:2 }}>
              5S COMPLIANCE NOTE</div>
            <div style={{ marginLeft:"auto", background:C.s5, color:"#fff",
              fontSize:8, fontWeight:700, padding:"2px 8px", borderRadius:100 }}>AI</div>
          </div>
          <p style={{ fontSize:12, color:C.inkMid, lineHeight:1.75, margin:0 }}>{selected.aiNote}</p>
        </div>

        {/* Timeline */}
        <SHead label="AUDIT TRAIL"/>
        <div style={{ padding:"4px 18px 12px" }}>
          {selected.timeline.map((t,i) => (
            <div key={i} style={{ display:"flex", gap:10, minHeight:48 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                paddingTop:4, width:14 }}>
                <div style={{ width:11, height:11, borderRadius:"50%", flexShrink:0,
                  background:t.type==="ai"?C.s5:t.type==="raise"?C.open:C.closed,
                  boxShadow:`0 0 0 3px ${t.type==="ai"?C.s5b:t.type==="raise"?C.openBg:C.closedBg}` }}/>
                {i < selected.timeline.length-1 &&
                  <div style={{ flex:1, width:1, background:C.border, margin:"3px 0" }}/>}
              </div>
              <div style={{ flex:1, paddingBottom:10 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.ink }}>{t.action}</div>
                <div style={{ fontSize:10, color:C.inkLight, marginTop:2, fontFamily:MONO }}>
                  {t.actor} · {t.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Close-out */}
        {selected.status !== "CLOSED" && (isMyFinding || currentUser.role==="Admin" || currentUser.role==="Auditor") && (
          <div style={{ padding:"0 16px 32px" }}>
            <SHead label="UPDATE STATUS"/>
            {closingId === selected.id ? (
              <div style={{ background:C.closedBg, border:`1.5px solid ${C.closed}44`,
                borderRadius:14, padding:"14px" }}>
                <div style={{ fontSize:11, fontWeight:800, color:C.closed,
                  letterSpacing:2, marginBottom:12 }}>CLOSE-OUT DETAILS</div>
                <FLabel text="CORRECTIVE ACTION TAKEN"/>
                <textarea style={{ ...sx.textarea, background:C.surface, borderColor:`${C.closed}33` }}
                  rows={3} value={closeNote} onChange={e=>setCloseNote(e.target.value)}
                  placeholder="Describe what was done to resolve this finding…"/>
                <FLabel text="CLOSE-OUT PHOTO"/>
                <div style={{ border:`2px dashed ${closePhoto?C.closed:C.border}`, borderRadius:10,
                  background:closePhoto?C.closedBg:C.surfaceAlt, overflow:"hidden",
                  minHeight:80, display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer" }} onClick={() => closeImgRef.current.click()}>
                  {closePhoto
                    ? <div style={{ position:"relative", width:"100%" }}>
                        <img src={closePhoto} alt="" style={{ width:"100%",height:120,objectFit:"cover",display:"block" }}/>
                        <div style={{ position:"absolute", top:6, right:6, background:C.closed,
                          color:"#fff", fontSize:9, fontWeight:800, padding:"2px 9px", borderRadius:100 }}>
                          ADDED</div>
                      </div>
                    : <div style={{ textAlign:"center", padding:16 }}>
                        <div style={{ fontSize:24 }}>📷</div>
                        <div style={{ fontSize:11, fontWeight:700, color:C.inkMid, marginTop:6 }}>
                          Tap to add close-out photo</div>
                      </div>
                  }
                  <input ref={closeImgRef} type="file" accept="image/*"
                    style={{ display:"none" }}
                    onChange={e => { const f=e.target.files[0]; if(!f)return;
                      const r=new FileReader(); r.onload=ev=>setClosePhoto(ev.target.result); r.readAsDataURL(f); }}/>
                </div>
                <FLabel text="SUPPORTING DOCUMENT (optional)"/>
                <div style={{ border:`2px dashed ${closeDocName?C.closed:C.border}`, borderRadius:10,
                  background:closeDocName?C.closedBg:C.surfaceAlt, padding:"12px 14px",
                  display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
                  onClick={() => closeDocRef.current.click()}>
                  <span style={{ fontSize:22 }}>{closeDocName?"📄":"📎"}</span>
                  <div style={{ flex:1 }}>
                    {closeDocName
                      ? <div style={{ fontSize:12, fontWeight:800, color:C.closed }}>{closeDocName}</div>
                      : <><div style={{ fontSize:12, fontWeight:700, color:C.inkMid }}>Attach document</div>
                          <div style={{ fontSize:10, color:C.inkLight }}>PDF, Word, Excel or image</div></>}
                  </div>
                  <input ref={closeDocRef} type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                    style={{ display:"none" }}
                    onChange={e => { const f=e.target.files[0]; if(f) setCloseDocName(f.name); }}/>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:12 }}>
                  <button style={sx.ghostBtn} onClick={() => {
                    setClosingId(null); setClosePhoto(null); setCloseDocName(""); setCloseNote("");
                  }}>Cancel</button>
                  <button style={{ ...sx.solidBtn, background:`linear-gradient(135deg,${C.closed},#34D399)` }}
                    onClick={() => updateStatus(selected.id,"CLOSED",closeNote||"Resolved",closePhoto,closeDocName)}>
                    Submit Close-Out
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", gap:8 }}>
                {selected.status==="OPEN" && (
                  <button style={{ ...sx.solidBtn, background:`linear-gradient(135deg,${C.prog},#FCD34D)` }}
                    onClick={() => updateStatus(selected.id,"IN PROGRESS","Acknowledged")}>
                    Acknowledge
                  </button>
                )}
                <button style={{ ...sx.solidBtn, background:`linear-gradient(135deg,${C.closed},#34D399)` }}
                  onClick={() => setClosingId(selected.id)}>
                  Close Out
                </button>
              </div>
            )}
          </div>
        )}
        {selected.status==="CLOSED" && (
          <div style={{ margin:"0 16px 28px" }}>
            <div style={{ padding:"12px", background:C.closedBg, border:`1px solid ${C.closed}44`,
              borderRadius:10, textAlign:"center", fontSize:12, fontWeight:800,
              color:C.closed, letterSpacing:2, marginBottom:
              selected.closeEvidence?.photo||selected.closeEvidence?.doc?10:0 }}>
              NONCONFORMANCE CLOSED
            </div>
            {selected.closeEvidence && (selected.closeEvidence.note||selected.closeEvidence.photo||selected.closeEvidence.doc) && (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
                <div style={{ padding:"8px 12px", borderBottom:`1px solid ${C.border}`,
                  fontSize:9, fontWeight:800, color:C.inkLight, letterSpacing:2 }}>
                  CLOSE-OUT EVIDENCE</div>
                {selected.closeEvidence.note && (
                  <div style={{ padding:"8px 12px", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:9, color:C.inkLight, marginBottom:3 }}>CORRECTIVE ACTION</div>
                    <div style={{ fontSize:12, color:C.inkMid }}>{selected.closeEvidence.note}</div>
                  </div>
                )}
                {selected.closeEvidence.photo && (
                  <img src={selected.closeEvidence.photo} alt="" style={{ width:"100%",height:140,objectFit:"cover",display:"block" }}/>
                )}
                {selected.closeEvidence.doc && (
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px" }}>
                    <span style={{ fontSize:20 }}>📄</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:800, color:C.ink }}>{selected.closeEvidence.doc}</div>
                      <div style={{ fontSize:10, color:C.inkLight }}>Supporting document</div>
                    </div>
                    <span style={{ marginLeft:"auto", color:C.closed }}>✓</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Shell>
    );
  }

  // ── RAISE ──────────────────────────────────────────────
  if (tab === "raise") {
    const engineCat = SCATS.find(c => c.key === (scat||engineResult?.scat)) || null;
    const hasStd = !!(engineResult?.hasGoverningStandard && engineStd?.status==="live");
    const noStd  = engineResult && !engineResult.hasGoverningStandard;
    return (
      <Shell toast={toast}>
        <div style={{ background:`linear-gradient(135deg,${TEAL},${C.tealDk})`,
          padding:"14px 16px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button style={sx.backBtnW} onClick={() => setTab("board")}>← Back</button>
            <div style={{ fontSize:14, fontWeight:900, color:"#fff", letterSpacing:2 }}>RAISE FINDING</div>
            <div style={{ marginLeft:"auto", fontSize:9, color:"rgba(255,255,255,0.7)", letterSpacing:1 }}>
              L1→L2→L3→L4 ENGINE</div>
          </div>
        </div>
        <div style={{ padding:"14px 16px" }}>

          {/* L1 — Evidence */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <div style={{ width:20, height:20, borderRadius:5, background:`linear-gradient(135deg,${TEAL},${C.tealDk})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:9, fontWeight:900, color:"#fff" }}>L1</div>
            <div style={{ fontSize:11, fontWeight:800, color:C.ink, letterSpacing:1 }}>EVIDENCE</div>
          </div>
          <div style={{ border:`2px dashed ${img?C.teal:C.border}`, borderRadius:12, minHeight:110,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", overflow:"hidden", background:C.surfaceAlt, marginBottom:8 }}
            onClick={() => imgRef.current.click()}>
            {img
              ? <img src={img} alt="" style={{ width:"100%",height:150,objectFit:"cover" }}/>
              : <div style={{ textAlign:"center", padding:16 }}>
                  <div style={{ fontSize:30 }}>📷</div>
                  <div style={{ fontSize:12, fontWeight:800, color:C.ink, marginTop:6 }}>
                    Tap to attach photo from library</div>
                  <div style={{ fontSize:10, color:C.inkLight, marginTop:3 }}>
                    Photo is evidence — AI will analyse it</div>
                </div>
            }
            <input ref={imgRef} type="file" accept="image/*"
              style={{ display:"none" }} onChange={handleImg}/>
          </div>
          <textarea style={{ ...sx.textarea, marginBottom:8 }} rows={3} value={desc}
            onChange={e => handleDescChange(e.target.value)}
            placeholder="Describe the finding — e.g. Pallet blocking fire extinguisher…"/>
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <select style={{ ...sx.select, flex:1 }} value={dept}
              onChange={e => { setDept(e.target.value); if(desc.trim().length>10) runEngine(desc,e.target.value,img); }}>
              <option value="">— Department —</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <select style={{ ...sx.select, flex:1 }} value={mgr}
              onChange={e => setMgr(e.target.value)}>
              <option value="">— Manager —</option>
              {USERS.filter(u => u.role==="Manager"||u.role==="Supervisor").map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Engine running */}
          {engineRunning && (
            <div style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`,
              borderRadius:10, padding:"12px 14px", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ animation:"spin 1.2s linear infinite", display:"inline-block", fontSize:18 }}>⚙</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:800, color:C.teal }}>AI ENGINE RUNNING…</div>
                  <div style={{ fontSize:10, color:C.inkLight }}>L2 Classify → L3 Verify → L4 Score</div>
                </div>
              </div>
            </div>
          )}

          {/* Engine results */}
          {engineResult && !engineRunning && (
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:10 }}>
              {/* L2 */}
              <div style={{ background:C.surfaceAlt, border:`1px solid ${C.teal}44`,
                borderRadius:10, padding:"10px 12px" }}>
                <div style={{ display:"flex", gap:6, marginBottom:6 }}>
                  <div style={{ background:`linear-gradient(135deg,${TEAL},${C.tealDk})`, color:"#fff",
                    fontSize:8, fontWeight:800, padding:"2px 8px", borderRadius:100 }}>L2 CLASSIFIED</div>
                  <div style={{ marginLeft:"auto", fontSize:9, color:C.inkLight }}>
                    {engineResult.confidence?.toUpperCase()}</div>
                </div>
                <div style={{ display:"flex", gap:12, marginBottom:6 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:9, color:C.inkLight }}>OBJECT</div>
                    <div style={{ fontSize:12, fontWeight:800, color:C.ink }}>{engineResult.object}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:9, color:C.inkLight }}>RISK</div>
                    <div style={{ fontSize:12, fontWeight:800, color:C.ink }}>{engineResult.riskCategory}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:9, color:C.inkLight }}>5S PILLAR</div>
                    <div style={{ fontSize:12, fontWeight:800, color:engineCat?.color||C.teal }}>
                      {engineCat?.short||"—"} {engineCat?.label||""}</div>
                  </div>
                </div>
                <div style={{ padding:"6px 10px", background:`${C.open}14`,
                  border:`1px solid ${C.open}33`, borderRadius:7 }}>
                  <div style={{ fontSize:9, color:C.inkLight, marginBottom:2 }}>IMMEDIATE ACTION</div>
                  <div style={{ fontSize:11, fontWeight:700, color:C.ink }}>{engineResult.immediateAction}</div>
                </div>
              </div>

              {/* L3 */}
              <div style={{ background:C.surfaceAlt,
                border:`1px solid ${hasStd?C.closed+"44":noStd?C.prog+"44":C.border}`,
                borderRadius:10, padding:"10px 12px" }}>
                <div style={{ marginBottom:6 }}>
                  <div style={{ display:"inline-block", background:hasStd?`linear-gradient(135deg,${C.closed},#34D399)`:noStd?`linear-gradient(135deg,${C.prog},#FCD34D)`:C.border,
                    color:"#fff", fontSize:8, fontWeight:800, padding:"2px 8px", borderRadius:100 }}>
                    L3 {hasStd?"STANDARD VERIFIED":noStd?"NO STANDARD":"CHECKING"}
                  </div>
                </div>
                {hasStd ? (
                  <>
                    <div style={{ fontSize:11, fontWeight:800, color:C.closed }}>
                      {engineStd.code} — {engineStd.title}</div>
                    <div style={{ fontSize:10, color:C.inkLight, marginTop:2 }}>
                      {engineStd.type} · {engineStd.scope}</div>
                  </>
                ) : noStd ? (
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:C.prog }}>No governing standard found</div>
                    <div style={{ fontSize:10, color:C.inkMid, marginTop:4, lineHeight:1.5 }}>
                      Will be logged as <strong>Observation only</strong> — no score, no penalty.
                      A standard proposal will be queued for review.</div>
                    {engineResult.proposedStandardTitle && (
                      <div style={{ marginTop:8, padding:"6px 10px",
                        background:`${C.prog}18`, borderRadius:7 }}>
                        <div style={{ fontSize:9, color:C.inkLight }}>PROPOSED STANDARD</div>
                        <div style={{ fontSize:11, fontWeight:700, color:C.ink }}>
                          {engineResult.proposedStandardTitle}</div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* L4 */}
              {hasStd && engineScore !== null && engineBand && (
                <div style={{ background:C.surfaceAlt,
                  border:`1px solid ${engineBand.color}44`, borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <div>
                      <div style={{ display:"inline-block", background:`linear-gradient(135deg,${engineBand.color},${engineBand.color}99)`,
                        color:"#fff", fontSize:8, fontWeight:800, padding:"2px 8px",
                        borderRadius:100, marginBottom:4 }}>L4 SCORED</div>
                      <div style={{ fontSize:16, fontWeight:900, color:engineBand.color }}>
                        {engineBand.label}</div>
                    </div>
                    <div style={{ marginLeft:"auto", fontSize:36, fontWeight:900,
                      color:engineBand.color, lineHeight:1 }}>
                      {engineScore}<span style={{ fontSize:12 }}>/100</span>
                    </div>
                  </div>
                  <div style={{ height:5, background:C.border, borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${engineScore}%`,
                      background:engineBand.color, borderRadius:3 }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    fontSize:8, color:C.inkLight, marginTop:4 }}>
                    <span>Obs</span><span>Minor</span><span>Moderate</span><span>Major</span><span>Critical</span>
                  </div>
                </div>
              )}

              {/* Category override */}
              <div>
                <div style={{ fontSize:9, color:C.inkLight, letterSpacing:2,
                  fontWeight:800, marginBottom:5 }}>
                  5S CATEGORY <span style={{ color:C.teal }}>(AI selected — tap to override)</span></div>
                <div style={{ display:"flex", gap:5 }}>
                  {SCATS.map(c => (
                    <button key={c.key} onClick={() => setScat(c.key)}
                      style={{ flex:1, display:"flex", flexDirection:"column",
                        alignItems:"center", gap:2, padding:"7px 3px",
                        background:(scat||engineResult?.scat)===c.key?c.grad:C.surfaceAlt,
                        border:`1.5px solid ${(scat||engineResult?.scat)===c.key?c.color:C.border}`,
                        borderRadius:9, cursor:"pointer" }}>
                      <span style={{ fontSize:13, color:(scat||engineResult?.scat)===c.key?"#fff":c.color }}>
                        {c.icon}</span>
                      <span style={{ fontSize:9, fontWeight:800,
                        color:(scat||engineResult?.scat)===c.key?"#fff":c.color }}>{c.short}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button style={{
            width:"100%", marginTop:8, padding:"14px", border:"none", borderRadius:11,
            color:engineResult?"#fff":C.inkLight, fontSize:14, fontWeight:800,
            letterSpacing:1, fontFamily:FONT,
            background:engineResult
              ? (hasStd ? `linear-gradient(135deg,${engineBand?.color||TEAL},${engineBand?.color||TEAL}aa)`
                       : `linear-gradient(135deg,${C.prog},#FCD34D)`)
              : C.surfaceAlt,
            cursor:engineResult&&!genning?"pointer":"default",
            opacity:genning?0.65:1,
            display:"flex", alignItems:"center", justifyContent:"center", gap:8
          }} onClick={handleRaise} disabled={!engineResult||genning}>
            {genning
              ? <><span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⚙</span> Creating record…</>
              : engineResult
                ? (hasStd ? (engineScore >= 61 ? `⚡ Submit Finding → Generate ${engineBand?.label||"Major"} NCR` : `⚡ Submit ${engineBand?.label||"Finding"} — No NCR Required`) 
                          : "📋 Log Observation — No NCR Generated")
                : "Describe finding above to activate engine"
            }
          </button>
        </div>
      </Shell>
    );
  }

  // ── AUDIT ──────────────────────────────────────────────
  if (tab === "audit") {
    const cat = SCATS[auditStep];
    const setAns = (k,i,v) => setLocalAns(p => ({ ...p, [`${k}_${i}`]:v }));
    const getAns = (k,i) => localAns[`${k}_${i}`];
    const catPct = catScore({ ...(auditAnswers[auditDept]||{}), ...localAns }, cat.key);
    const labels = ["None","Poor","Partial","Good","Full"];
    return (
      <Shell toast={toast}>
        <div style={{ background:`linear-gradient(135deg,${TEAL},${C.tealDk})`, padding:"14px 16px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <button style={sx.backBtnW} onClick={() => setTab("board")}>← Back</button>
            <div style={{ fontSize:14, fontWeight:900, color:"#fff", letterSpacing:2 }}>5S AUDIT</div>
          </div>
          <select style={{ width:"100%", padding:"10px 12px", borderRadius:10,
            border:"1.5px solid rgba(255,255,255,0.3)",
            background:"rgba(255,255,255,0.15)", color:"#fff",
            fontFamily:FONT, fontSize:13, fontWeight:700 }}
            value={auditDept}
            onChange={e => { setAuditDept(e.target.value); setLocalAns({}); setAuditStep(0); }}>
            <option value="" style={{ color:C.ink }}>— Select department to audit —</option>
            {DEPARTMENTS.map(d => <option key={d} value={d} style={{ color:C.ink }}>{d}</option>)}
          </select>
        </div>

        {!auditDept ? (
          <div style={{ textAlign:"center", padding:"48px 20px" }}>
            <div style={{ fontSize:40 }}>📋</div>
            <div style={{ fontSize:13, fontWeight:700, color:C.inkLight, marginTop:10 }}>
              Select a department to begin</div>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", overflowX:"auto", gap:5, padding:"10px 16px",
              borderBottom:`1px solid ${C.border}` }}>
              {SCATS.map((c,i) => {
                const pct = catScore({ ...(auditAnswers[auditDept]||{}), ...localAns }, c.key);
                return (
                  <button key={c.key} onClick={() => setAuditStep(i)}
                    style={{ display:"flex", flexDirection:"column", alignItems:"center",
                      gap:2, padding:"7px 10px", flexShrink:0, minWidth:56,
                      background:i===auditStep?c.grad:C.surface,
                      border:`1.5px solid ${i===auditStep?c.color:C.border}`,
                      borderRadius:9, cursor:"pointer" }}>
                    <span style={{ fontSize:12, color:i===auditStep?"#fff":c.color }}>{c.icon}</span>
                    <span style={{ fontSize:9, fontWeight:800,
                      color:i===auditStep?"#fff":c.color }}>{c.short}</span>
                    {pct!==null && <span style={{ fontSize:9, fontWeight:800,
                      color:i===auditStep?"rgba(255,255,255,0.9)":scoreColor(pct) }}>{pct}%</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ margin:"10px 16px", background:cat.bg,
              border:`1px solid ${cat.color}33`, borderRadius:12,
              padding:"11px 14px", display:"flex", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:900, color:cat.color }}>{cat.label}</div>
                <div style={{ fontSize:10, color:C.inkLight }}>{cat.jp} · SOP-linked · 0–4</div>
              </div>
              {catPct!==null && <div style={{ fontSize:22, fontWeight:900, color:scoreColor(catPct) }}>{catPct}%</div>}
            </div>
            <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:9 }}>
              {cat.questions.map((item,qi) => {
                const val = getAns(cat.key, qi);
                return (
                  <div key={qi} style={{ background:C.surface,
                    border:`1.5px solid ${val!==undefined?cat.color+"55":C.border}`,
                    borderRadius:12, padding:"11px 12px" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:9 }}>
                      <div style={{ width:20, height:20, borderRadius:5, background:cat.bg,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:9, fontWeight:900, color:cat.color, flexShrink:0 }}>{qi+1}</div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:C.ink, lineHeight:1.5 }}>{item.q}</div>
                        <div style={{ fontSize:9, color:C.inkLight, marginTop:2, fontFamily:MONO }}>{item.ref}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:4 }}>
                      {[0,1,2,3,4].map(r => (
                        <button key={r} onClick={() => setAns(cat.key, qi, r)}
                          style={{ flex:1, padding:"7px 2px", borderRadius:7, cursor:"pointer",
                            border:`1.5px solid ${val===r?cat.color:C.border}`,
                            background:val===r?cat.grad:"transparent",
                            display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
                          <span style={{ fontSize:11, fontWeight:800,
                            color:val===r?"#fff":C.inkMid }}>{r}</span>
                          <span style={{ fontSize:7, color:val===r?"rgba(255,255,255,0.8)":C.inkLight }}>
                            {labels[r]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:8, padding:"14px 16px" }}>
              {auditStep > 0 && (
                <button style={sx.ghostBtn} onClick={() => setAuditStep(auditStep-1)}>← Prev</button>
              )}
              {auditStep < SCATS.length-1
                ? <button style={{ ...sx.solidBtn, background:cat.grad }}
                    onClick={() => setAuditStep(auditStep+1)}>
                    Next: {SCATS[auditStep+1].label} →
                  </button>
                : <button style={{ ...sx.solidBtn, background:`linear-gradient(135deg,${C.closed},#34D399)` }}
                    onClick={submitAudit}>Submit Audit</button>
              }
            </div>
          </>
        )}
      </Shell>
    );
  }

  // ── REPORT ─────────────────────────────────────────────
  if (tab === "report") {
    return (
      <Shell toast={toast}>
        <div style={{ background:`linear-gradient(135deg,${TEAL},${C.tealDk})`,
          padding:"14px 16px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <button style={sx.backBtnW} onClick={() => setTab("board")}>← Back</button>
            <div style={{ fontSize:14, fontWeight:900, color:"#fff", letterSpacing:2 }}>MONTHLY REPORT</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.22)",
              borderRadius:12, padding:"13px", textAlign:"center" }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)", letterSpacing:2, marginBottom:3 }}>FACILITY SCORE</div>
              <div style={{ fontSize:32, fontWeight:900, color:"#fff" }}>
                {facilityAvg !== null ? `${facilityAvg}%` : "—"}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", marginTop:3 }}>
                {scoredDepts.length}/{DEPARTMENTS.length} audited</div>
            </div>
            <div style={{ flex:1, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.22)",
              borderRadius:12, padding:"13px", textAlign:"center" }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)", letterSpacing:2, marginBottom:3 }}>OPEN Findings</div>
              <div style={{ fontSize:32, fontWeight:900, color:"#fff" }}>
                {issues.filter(i => i.status==="OPEN").length}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", marginTop:3 }}>require action</div>
            </div>
          </div>
        </div>

        <SHead label="DEPARTMENT SCORES — AUDIT BASED"/>
        {facilityScores.map(({d,sc}) => {
          const col = sc !== null ? scoreColor(sc) : C.inkLight;
          return (
            <div key={d} style={{ display:"flex", alignItems:"center", gap:10,
              padding:"9px 16px", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, color:sc!==null?C.ink:C.inkLight,
                fontWeight:sc!==null?700:400, width:116, flexShrink:0 }}>{d}</div>
              <div style={{ flex:1, height:7, background:C.border, borderRadius:3, overflow:"hidden" }}>
                {sc!==null && <div style={{ width:`${sc}%`, height:"100%", background:col, borderRadius:3 }}/>}
              </div>
              <div style={{ fontSize:12, fontWeight:800, color:col, width:52, textAlign:"right" }}>
                {sc!==null ? `${sc}%` : "Pending"}</div>
            </div>
          );
        })}

        <SHead label="5S CATEGORY AVERAGES"/>
        {SCATS.map(cat => {
          const scores = scoredDepts.map(({d}) => catScore(auditAnswers[d]||{},cat.key)).filter(v=>v!==null);
          const avg = scores.length===0 ? null : Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
          return (
            <div key={cat.key} style={{ display:"flex", alignItems:"center", gap:10,
              padding:"9px 16px", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:28, height:28, borderRadius:7, background:cat.grad,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, flexShrink:0 }}>
                <span style={{ color:"#fff" }}>{cat.icon}</span>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:C.ink, width:100, flexShrink:0 }}>{cat.label}</div>
              <div style={{ flex:1, height:7, background:C.border, borderRadius:3, overflow:"hidden" }}>
                {avg!==null && <div style={{ width:`${avg}%`, height:"100%", background:cat.grad, borderRadius:3 }}/>}
              </div>
              <div style={{ fontSize:12, fontWeight:800, width:46, textAlign:"right",
                color:avg!==null?scoreColor(avg):C.inkLight }}>
                {avg!==null ? `${avg}%` : "—"}</div>
            </div>
          );
        })}

        <SHead label="Finding SUMMARY"/>
        <div style={{ display:"flex", gap:8, padding:"0 16px 24px" }}>
          {[["OPEN",C.open,C.openBg],["IN PROGRESS",C.prog,C.progBg],["CLOSED",C.closed,C.closedBg]].map(([st,col,bg]) => (
            <div key={st} style={{ flex:1, background:bg, border:`1px solid ${col}44`,
              borderRadius:12, padding:"13px 8px", textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:900, color:col }}>
                {issues.filter(i => i.status===st).length}</div>
              <div style={{ fontSize:8, color:C.inkMid, letterSpacing:1, marginTop:4 }}>{st}</div>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  // ── PROFILE ────────────────────────────────────────────
  if (tab === "profile") {
    const myAuditData = auditAnswers[currentUser.dept]||{};
    const allEvents = issues.flatMap(nc => nc.timeline.map(t => ({
      ncId:nc.id, dept:nc.dept, manager:nc.manager, scatColor:nc.scat.color,
      desc:nc.desc.slice(0,55)+(nc.desc.length>55?"…":""), status:nc.status, ...t
    }))).sort((a,b) => b.time.localeCompare(a.time));

    return (
      <Shell toast={toast}>
        <div style={{ background:`linear-gradient(135deg,${currentUser.color}CC,${currentUser.color}88)`,
          padding:"18px 16px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <button style={{ ...sx.backBtnW }} onClick={() => setTab("board")}>⊞ Home</button>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", letterSpacing:2 }}>MY PROFILE</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <Av txt={currentUser.initials} color="#fff" size={52}/>
            <div>
              <div style={{ fontSize:18, fontWeight:900, color:"#fff" }}>{currentUser.name}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:3 }}>{currentUser.title}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{currentUser.dept}</div>
            </div>
          </div>
          {myDeptScore !== null && (
            <div style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)",
              borderRadius:12, padding:"12px 14px", display:"flex",
              justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)", letterSpacing:2 }}>MY DEPT SCORE</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{currentUser.dept}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:28, fontWeight:900, color:"#fff" }}>{myDeptScore}%</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)", letterSpacing:2 }}>
                  {scoreLabel(myDeptScore)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Finding counts */}
        <div style={{ padding:"12px 16px 0", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[["OPEN",C.open],["IN PROGRESS",C.prog],["CLOSED",C.closed]].map(([st,col]) => (
            <div key={st} style={{ background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:10, padding:"10px 6px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:col }}>
                {myFindings.filter(n => n.status===st).length}</div>
              <div style={{ fontSize:7, color:C.inkLight, letterSpacing:1, marginTop:3 }}>{st}</div>
            </div>
          ))}
        </div>

        <SHead label={`MY Findings — ${myFindings.length} total`}/>
        {myFindings.length === 0 ? (
          <div style={{ margin:"0 16px", background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:10, padding:"20px", textAlign:"center", color:C.inkLight, fontSize:13 }}>
            <div style={{ fontSize:28, marginBottom:6 }}>✓</div>No Findings assigned to you
          </div>
        ) : (
          <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:8 }}>
            {myFindings.map(nc => {
              const days = Math.floor((Date.now()-new Date(nc.raisedAt).getTime())/(864e5));
              const overdue = nc.status!=="CLOSED" && days >= 2;
              return (
                <button key={nc.id} style={{ width:"100%", background:C.surface,
                  border:`1.5px solid ${overdue?`${C.open}88`:C.border}`,
                  borderRadius:12, padding:0, cursor:"pointer", textAlign:"left",
                  overflow:"hidden", fontFamily:FONT, display:"block" }}
                  onClick={() => setSelected(nc)}>
                  <div style={{ height:3, background:nc.scat.grad }}/>
                  <div style={{ padding:"11px 13px" }}>
                    <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:7 }}>
                      <div style={{ background:statBg(nc.status), color:statColor(nc.status),
                        fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:100 }}>{nc.status}</div>
                      {overdue && <div style={{ background:C.openBg, color:C.open,
                        fontSize:8, fontWeight:800, padding:"2px 7px", borderRadius:100 }}>OVERDUE</div>}
                      <div style={{ marginLeft:"auto", fontSize:10, color:C.inkLight, fontFamily:MONO }}>{nc.id}</div>
                    </div>
                    <div style={{ fontSize:13, fontWeight:800, color:C.ink, marginBottom:3 }}>{nc.dept}</div>
                    <div style={{ fontSize:11, color:C.inkMid, lineHeight:1.5 }}>{nc.desc}</div>
                    <div style={{ fontSize:10, color:overdue?C.open:C.inkLight, marginTop:5, fontWeight:overdue?800:400 }}>
                      {nc.status==="CLOSED" ? "✓ Closed" : `Raised ${days}d ago`}
                      {nc.dueDate && nc.status!=="CLOSED" && ` · Due ${nc.dueDate}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {myDeptScore !== null && (
          <>
            <SHead label="MY DEPT — 5S BREAKDOWN"/>
            {SCATS.map(cat => {
              const pct = catScore(myAuditData, cat.key);
              return (
                <div key={cat.key} style={{ display:"flex", alignItems:"center", gap:10,
                  padding:"8px 16px", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ width:26, height:26, borderRadius:6, background:cat.grad,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, flexShrink:0 }}>
                    <span style={{ color:"#fff" }}>{cat.icon}</span>
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:C.ink, width:96, flexShrink:0 }}>{cat.label}</div>
                  <div style={{ flex:1, height:6, background:C.border, borderRadius:3, overflow:"hidden" }}>
                    {pct!==null && <div style={{ width:`${pct}%`, height:"100%", background:cat.grad, borderRadius:3 }}/>}
                  </div>
                  <div style={{ fontSize:11, fontWeight:800, width:38, textAlign:"right",
                    color:pct!==null?scoreColor(pct):C.inkLight }}>
                    {pct!==null ? `${pct}%` : "—"}</div>
                </div>
              );
            })}
          </>
        )}

        <SHead label="AUDIT ACTIVITY LOG"/>
        <div style={{ padding:"0 16px 8px" }}>
          {allEvents.slice(0,25).map((ev,i) => {
            const dotColor = ev.type==="ai"?C.s5:ev.type==="raise"?C.open:C.closed;
            const badge = ev.type==="raise"?"RAISED":ev.type==="ai"?"AI":
              ev.action.toLowerCase().includes("closed")?"CLOSED":"UPDATED";
            const badgeColor = badge==="RAISED"?C.open:badge==="AI"?C.s5:badge==="CLOSED"?C.closed:C.prog;
            return (
              <div key={i} style={{ display:"flex", gap:10, minHeight:50 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                  paddingTop:5, width:14, flexShrink:0 }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:dotColor,
                    boxShadow:`0 0 0 2px ${dotColor}33` }}/>
                  {i < Math.min(allEvents.length,25)-1 &&
                    <div style={{ flex:1, width:1, background:C.border, margin:"3px 0" }}/>}
                </div>
                <div style={{ flex:1, paddingBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                    <div style={{ fontSize:8, fontWeight:800, color:badgeColor,
                      background:`${badgeColor}18`, padding:"1px 7px", borderRadius:100 }}>{badge}</div>
                    <div style={{ fontSize:9, color:C.inkLight, fontFamily:MONO }}>{ev.ncId}</div>
                    <div style={{ fontSize:9, fontWeight:700, color:C.inkMid }}>{ev.dept}</div>
                    <div style={{ marginLeft:"auto", fontSize:8, color:C.inkLight }}>{ev.time.slice(5)}</div>
                  </div>
                  <div style={{ fontSize:11, color:C.ink, lineHeight:1.4 }}>{ev.action}</div>
                  <div style={{ fontSize:10, color:C.inkLight }}>{ev.actor}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding:"16px" }}>
          <button style={{ width:"100%", padding:"12px", background:C.surfaceAlt,
            border:`1px solid ${C.border}`, borderRadius:10, color:C.inkMid,
            fontSize:13, fontWeight:700, fontFamily:FONT, cursor:"pointer" }}
            onClick={onLogout}>Sign Out</button>
        </div>
      </Shell>
    );
  }

  // ── BOARD ──────────────────────────────────────────────
  const openCt   = issues.filter(i => i.status==="OPEN").length;
  const progCt   = issues.filter(i => i.status==="IN PROGRESS").length;
  const closedCt = issues.filter(i => i.status==="CLOSED").length;

  return (
    <Shell toast={toast}>
      {/* Header */}
      <div style={{ background:C.surface, padding:"16px 16px 14px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {onHome && (
              <button onClick={onHome} style={{ width:40, height:40, borderRadius:10, background:C.surface,
                border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", flexShrink:0 }}>
                <ArrowLeft size={18} color={C.ink}/>
              </button>
            )}
            <div style={{ width:40, height:40, borderRadius:10, background:`${TEAL}14`,
              border:`1.5px solid ${TEAL}55`, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:900, color:TEAL, fontFamily:MONO, flexShrink:0 }}>5S</div>
            <div>
              <div style={{ fontSize:16, fontWeight:900, color:C.ink, letterSpacing:0.2 }}>
                S&amp;G Facility Compliance</div>
              <div style={{ fontSize:9, color:C.inkLight, letterSpacing:2 }}>
                HOUSEKEEPING · MAY 2026</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {onHome && (
              <button onClick={onHome}
                style={{ display:"flex", alignItems:"center", gap:6, background:C.surface,
                  border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, padding:"8px 12px",
                  fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:FONT }}>
                <HomeIcon size={14}/> Home
              </button>
            )}
            <button onClick={() => setTab("profile")}
              style={{ display:"flex", alignItems:"center", gap:7, background:C.surface,
                border:`1px solid ${C.border}`, borderRadius:10, padding:"6px 12px 6px 6px", cursor:"pointer" }}>
              <Av txt={currentUser.initials} color={currentUser.color} size={24}/>
              <span style={{ fontSize:11, fontWeight:800, color:C.ink }}>{currentUser.name.split(" ")[0]}</span>
              {myOpenCt > 0 && (
                <div style={{ background:C.open, color:"#fff", fontSize:8, fontWeight:900, width:16, height:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{myOpenCt}</div>
              )}
            </button>
          </div>
        </div>

        {/* Facility compliance card */}
        <div style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:14,
          padding:"16px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:9, color:C.inkLight, letterSpacing:2, fontWeight:800, marginBottom:6 }}>FACILITY COMPLIANCE</div>
            <div style={{ fontSize:32, fontWeight:900, color:TEAL, lineHeight:1 }}>
              {facilityAvg !== null ? `${facilityAvg}%` : "—"}</div>
            <div style={{ fontSize:11, color:C.inkMid, marginTop:6 }}>
              {scoredDepts.length}/{DEPARTMENTS.length} departments audited</div>
            {myDeptScore !== null && (
              <div style={{ fontSize:10, color:C.inkLight, marginTop:3 }}>
                Your dept ({currentUser.dept}): <strong style={{ color:C.inkMid }}>{myDeptScore}%</strong></div>
            )}
          </div>
          <ProgressRing pct={facilityAvg} color={TEAL}/>
        </div>
      </div>

      {/* My open Finding alert */}
      {myOpenCt > 0 && (
        <div style={{ margin:"12px 16px 0", background:C.openBg,
          border:`1px solid ${C.open}44`, borderRadius:12, padding:"11px 14px",
          display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
          onClick={() => { setMyOnly(true); setFilter("OPEN"); }}>
          <div style={{ width:34, height:34, borderRadius:9, background:C.open,
            display:"flex", alignItems:"center", justifyContent:"center" }}><AlertTriangle size={16} color="#fff"/></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.open }}>
              You have {myOpenCt} open Finding{myOpenCt>1?"s":""}</div>
            <div style={{ fontSize:11, color:C.inkMid, marginTop:2 }}>
              Tap to view your outstanding actions</div>
          </div>
          <ArrowRight size={16} color={C.open}/>
        </div>
      )}

      {/* Raise CTA */}
      <div style={{ padding:"12px 16px 0" }}>
        <button style={{ width:"100%", background:`linear-gradient(135deg,${TEAL},${C.tealDk})`,
          border:"none", borderRadius:14, padding:"14px 16px",
          display:"flex", alignItems:"center", gap:12, cursor:"pointer",
          boxShadow:`0 6px 24px ${TEAL}33`, textAlign:"left" }}
          onClick={() => setTab("raise")}>
          <div style={{ width:40, height:40, borderRadius:10, background:"rgba(255,255,255,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center" }}><AlertTriangle size={20} color="#fff"/></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:900, color:"#fff", letterSpacing:1, fontFamily:FONT }}>
              RAISE FINDING</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.8)", marginTop:2 }}>
              AI Standards Verification Engine · L1 → L2 → L3 → L4</div>
          </div>
          <ArrowRight size={18} color="rgba(255,255,255,0.8)"/>
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", margin:"12px 16px 0", background:C.surface,
        border:`1px solid ${C.border}`, borderRadius:12, boxShadow:C.shadow }}>
        {[
          { label:"OPEN",        val:openCt,   Icon:FileText,  f:"OPEN"        },
          { label:"IN PROGRESS", val:progCt,   Icon:Clock,     f:"IN PROGRESS" },
          { label:"CLOSED",      val:closedCt, Icon:RefreshCw, f:"CLOSED"      },
        ].map((st,i) => (
          <button key={st.label} onClick={() => { setFilter(filter===st.f?"ALL":st.f); setMyOnly(false); }}
            style={{ flex:1, background:"none",
              border:"none", borderLeft:i>0?`1px solid ${C.border}`:"none",
              padding:"12px 6px", textAlign:"center", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:5,
              opacity:filter===st.f&&!myOnly?1:0.85 }}>
            <st.Icon size={16} color={filter===st.f&&!myOnly?TEAL:C.inkLight}/>
            <div style={{ fontSize:20, fontWeight:900, color:C.ink }}>{st.val}</div>
            <div style={{ fontSize:8, color:C.inkLight, letterSpacing:0.5 }}>{st.label}</div>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", padding:"12px 16px 0", gap:8, alignItems:"center" }}>
        <div style={{ display:"flex", gap:14, flex:1, borderBottom:`1px solid ${C.border}` }}>
          <button onClick={() => { setMyOnly(!myOnly); setFilter("ALL"); }}
            style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none",
              borderBottom:`2px solid ${myOnly?TEAL:"transparent"}`,
              color:myOnly?TEAL:C.inkLight, fontSize:11, fontWeight:700,
              padding:"0 0 8px", cursor:"pointer", fontFamily:FONT, flexShrink:0 }}>
            <Av txt={currentUser.initials} color={currentUser.color} size={14}/>
            Mine {myOpenCt>0 && (
              <span style={{ background:C.open, color:"#fff", borderRadius:"50%",
                width:14, height:14, display:"inline-flex",
                alignItems:"center", justifyContent:"center", fontSize:8 }}>{myOpenCt}</span>
            )}
          </button>
          {[["ALL","All Findings"],["OPEN","Open"],["IN PROGRESS","In Progress"],["CLOSED","Closed"]].map(([f,label]) => (
            <button key={f} onClick={() => { setFilter(f); setMyOnly(false); }}
              style={{ background:"none", border:"none",
                borderBottom:`2px solid ${filter===f&&!myOnly?TEAL:"transparent"}`,
                color:filter===f&&!myOnly?TEAL:C.inkLight,
                fontSize:11, fontWeight:700, whiteSpace:"nowrap",
                padding:"0 0 8px", cursor:"pointer", fontFamily:FONT }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ position:"relative", flexShrink:0 }}>
          <button onClick={() => setShowCatMenu(v=>!v)}
            style={{ display:"flex", alignItems:"center", gap:6, background:C.surface,
              border:`1px solid ${catFilter?TEAL:C.border}`, borderRadius:9, padding:"7px 11px",
              fontSize:11, fontWeight:700, color:catFilter?TEAL:C.inkMid, cursor:"pointer", fontFamily:FONT }}>
            <FilterIcon size={13}/> Filter
          </button>
          {showCatMenu && (
            <div style={{ position:"absolute", top:"110%", right:0, background:C.surface,
              border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 24px rgba(30,32,37,0.14)",
              zIndex:20, minWidth:150, overflow:"hidden" }}>
              <button onClick={()=>{setCatFilter("");setShowCatMenu(false);}}
                style={{ width:"100%", textAlign:"left", padding:"9px 12px", background:!catFilter?C.surfaceAlt:"none",
                  border:"none", fontSize:11, fontWeight:700, color:C.ink, cursor:"pointer", fontFamily:FONT }}>
                All categories
              </button>
              {SCATS.map(c=>(
                <button key={c.key} onClick={()=>{setCatFilter(c.key);setShowCatMenu(false);}}
                  style={{ width:"100%", textAlign:"left", padding:"9px 12px", background:catFilter===c.key?C.surfaceAlt:"none",
                    border:"none", fontSize:11, fontWeight:700, color:c.color, cursor:"pointer", fontFamily:FONT,
                    display:"flex", alignItems:"center", gap:6 }}>
                  {c.short} · {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Issue cards */}
      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map((nc,idx) => {
          const isMyFinding = nc.manager === currentUser.name;
          const band = nc.severityBand;
          return (
            <div key={nc.id} className="card" style={{ animationDelay:`${idx*0.07}s` }}>
              <button style={{ width:"100%", background:C.surface,
                border:`1px solid ${isMyFinding&&nc.status==="OPEN"?`${C.open}55`:C.border}`,
                borderRadius:14, padding:"14px", cursor:"pointer", textAlign:"left",
                fontFamily:FONT, display:"flex", gap:12, boxShadow:C.shadow }}
                onClick={() => setSelected(nc)}>
                <div style={{ width:44, height:44, borderRadius:10, background:nc.scat.bg,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  flexShrink:0, gap:1 }}>
                  <Folder size={16} color={nc.scat.color}/>
                  <span style={{ fontSize:8, fontWeight:900, color:nc.scat.color, fontFamily:MONO }}>{nc.scat.short}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:5, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                    {nc.severityScore != null && (
                      <div style={{ background:C.surfaceAlt, color:C.inkMid,
                        fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:100 }}>
                        {nc.severityScore}/100</div>
                    )}
                    {band ? (
                      <div style={{ background:`${band.color}18`, color:band.color,
                        fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:100, textTransform:"uppercase" }}>
                        {nc.isNCR ? "⚠ NCR · " : ""}{band.label}</div>
                    ) : nc.hasGoverningStandard===false ? (
                      <div style={{ background:`${C.prog}18`, color:C.prog,
                        fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:100 }}>OBSERVATION</div>
                    ) : null}
                    <div style={{ background:statBg(nc.status), color:statColor(nc.status), fontSize:9, fontWeight:800,
                      padding:"2px 8px", borderRadius:100 }}>{nc.status}</div>
                    {isMyFinding && <div style={{ background:`${currentUser.color}18`,
                      color:currentUser.color, fontSize:8, fontWeight:800,
                      padding:"2px 7px", borderRadius:100 }}>MINE</div>}
                    <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                      <span style={{ fontSize:10, color:C.inkLight, fontFamily:MONO }}>{nc.id}</span>
                      <ArrowRight size={13} color={C.inkLight}/>
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color:C.ink, marginBottom:4 }}>{nc.dept}</div>
                  <div style={{ fontSize:12, color:C.inkMid, lineHeight:1.55, marginBottom:10 }}>{nc.desc}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <Av txt={nc.mgrInit} color={nc.mgrColor} size={22}/>
                      <span style={{ fontSize:11, color:C.inkMid }}>{nc.manager}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                      {nc.timeline.map((t,i) => (
                        <div key={i} style={{ width:7, height:7, borderRadius:"50%",
                          background:t.type==="ai"?C.s5:t.type==="raise"?C.open:C.closed }}/>
                      ))}
                      <span style={{ fontSize:9, color:C.inkLight, marginLeft:3 }}>{nc.timeline.length}</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"48px 20px" }}>
          <div style={{ fontSize:44 }}>{myOnly?"✓":"📋"}</div>
          <div style={{ fontSize:13, fontWeight:700, color:C.inkLight, marginTop:8 }}>
            {myOnly ? "No outstanding Findings assigned to you" : "No issues found"}</div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480, background:C.surface,
        borderTop:`1px solid ${C.border}`, display:"flex",
        paddingBottom:"env(safe-area-inset-bottom,0)",
        boxShadow:"0 -4px 24px rgba(30,32,37,0.08)" }}>
        {[
          { id:"board",   Icon:LayoutGrid,     label:"BOARD"  },
          { id:"raise",   Icon:AlertTriangle,  label:"RAISE"  },
          { id:"audit",   Icon:ClipboardList,  label:"AUDIT"  },
          { id:"report",  Icon:Target,         label:"REPORT" },
          { id:"profile", Icon:UserIcon,       label:"ME"     },
        ].map(n => (
          <button key={n.id}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              gap:3, padding:"11px 2px", background:"none", border:"none",
              color:tab===n.id?C.teal:C.inkLight, fontSize:8, letterSpacing:1,
              fontWeight:800, cursor:"pointer", fontFamily:FONT,
              borderTop:`2.5px solid ${tab===n.id?C.teal:"transparent"}`,
              position:"relative" }}
            onClick={() => setTab(n.id)}>
            <n.Icon size={18}/>
            {n.label}
            {n.id==="profile" && myOpenCt > 0 && (
              <div style={{ position:"absolute", top:6, right:"calc(50% - 18px)",
                background:C.open, color:"#fff", fontSize:7, fontWeight:900,
                width:14, height:14, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {myOpenCt}
              </div>
            )}
          </button>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────
// GEMBA WALK MODULE
// ─────────────────────────────────────────────────────────

const GEMBA_CATS = [
  { key:"people",    label:"People & HR",      icon:"👥", color:"#8B5CF6", grad:"linear-gradient(135deg,#8B5CF6,#A78BFA)" },
  { key:"equipment", label:"Equipment",         icon:"⚙️",  color:"#F59E0B", grad:"linear-gradient(135deg,#F59E0B,#FCD34D)" },
  { key:"process",   label:"Process",           icon:"🔄", color:TEAL,      grad:`linear-gradient(135deg,${TEAL},#22BDD0)` },
  { key:"safety",    label:"Safety",            icon:"⚠️",  color:"#EF4444", grad:"linear-gradient(135deg,#EF4444,#F87171)" },
  { key:"quality",   label:"Quality",           icon:"✅", color:"#10B981", grad:"linear-gradient(135deg,#10B981,#34D399)" },
  { key:"other",     label:"General",           icon:"📋", color:"#64748B", grad:"linear-gradient(135deg,#64748B,#94A3B8)" },
];

const SEED_GEMBA = [
  {
    id:"GW-001", category:"equipment", area:"Punching", owner:"Riaan Roux", ownerInit:"RR", ownerColor:"#EF4444",
    desc:"Die press No.2 making grinding noise — possible bearing failure. Needs maintenance inspection.",
    priority:"HIGH", status:"OPEN", raisedBy:"Michael Downes", raisedAt:"2026-05-04 09:15", dueDate:"2026-05-05",
    aiNote:"Equipment finding logged during Gemba walk. Die press No.2 audible bearing deterioration presents risk of unplanned downtime and potential safety hazard. Maintenance inspection required within 24 hours. Log against asset record GIB-EQ-047.",
    photo:null, closeEvidence:null,
    timeline:[
      { time:"2026-05-04 09:15", actor:"Michael Downes", action:"Gemba finding raised · Area: Punching", type:"raise" },
      { time:"2026-05-04 09:15", actor:"AI System",       action:"Action logged · Riaan Roux notified",   type:"ai" },
    ]
  },
];

async function gembaAI(desc, category, area, owner) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:400,
        messages:[{ role:"user", content:
          `You are a factory floor operations manager at Gibson Packaging. During a Gemba walk the following was observed:
Area: ${area} | Category: ${category} | Owner: ${owner} | Observation: "${desc}"
Write a concise action note (2-3 sentences): describe the finding, the risk or impact, and the required action. Direct, professional, no bullet points.`
        }]
      })
    });
    const d = await res.json();
    return d.content?.[0]?.text || "";
  } catch { return ""; }
}

function GembaModule({ currentUser, onBack, items, setItems }) {
  const [tab,      setTab]      = useState("board");
  // items/setItems passed from App root for shared badge counts
  const [selected, setSelected] = useState(null);
  const [toast,    setToast]    = useState("");
  const [myOnly,      setMyOnly]      = useState(false);
  const [filter,      setFilter]      = useState("ALL");
  const [catFilter,   setCatFilter]   = useState("");
  const [showCatMenu, setShowCatMenu] = useState(false);

  useEffect(() => {
    (async () => {
      const rows = await sbFetch("gemba");
      if (Array.isArray(rows) && rows.length > 0) setItems(rows.map(r => r.data));
    })();
  }, []);
  // raise
  const [desc,    setDesc]    = useState("");
  const [area,    setArea]    = useState("");
  const [owner,   setOwner]   = useState("");
  const [cat,     setCat]     = useState("");
  const [priority,setPriority]= useState("MEDIUM");
  const [img,     setImg]     = useState(null);
  const [genning, setGenning] = useState(false);
  // close
  const [closingId,    setClosingId]    = useState(null);
  const [closeNote,    setCloseNote]    = useState("");
  const [closePhoto,   setClosePhoto]   = useState(null);
  const [closeDocName, setCloseDocName] = useState("");

  const imgRef      = useRef();
  const closeImgRef = useRef();
  const closeDocRef = useRef();

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2800); };
  const statColor = s => s==="CLOSED"?C.closed:s==="IN PROGRESS"?"#2563EB":C.open;
  const statBg    = s => s==="CLOSED"?C.closedBg:s==="IN PROGRESS"?"#DBEAFE":C.openBg;
  const priColor  = p => p==="CRITICAL"?"#9333EA":p==="HIGH"?C.open:p==="MEDIUM"?C.prog:C.teal;
  const getCat    = k => GEMBA_CATS.find(c => c.key===k) || GEMBA_CATS[5];

  const handleImg = e => {
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>setImg(ev.target.result); r.readAsDataURL(f);
  };

  const handleRaise = async () => {
    if (!desc||!area||!owner||!cat) { showToast("⚠ Please fill all fields"); return; }
    setGenning(true);
    const m   = USERS.find(u=>u.id===owner);
    const c   = getCat(cat);
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    let note  = await gembaAI(desc, c.label, area, m.name);
    if (!note) note = `Gemba walk finding in ${area} — ${c.label} category. Owner ${m.name} to address by due date.`;
    const item = {
      id:`GW-${String(items.length+1).padStart(3,"0")}`,
      category:cat, area, owner:m.name, ownerInit:m.initials, ownerColor:m.color,
      desc, priority, status:"OPEN", photo:img, closeEvidence:null,
      raisedBy:currentUser.name, raisedAt:now,
      dueDate: new Date(Date.now()+(priority==="HIGH"||priority==="CRITICAL"?86400000:priority==="MEDIUM"?259200000:604800000)).toISOString().slice(0,10),
      aiNote:note,
      timeline:[
        { time:now, actor:currentUser.name, action:"Gemba finding raised"+(img?" · Photo attached":""), type:"raise" },
        { time:now, actor:"AI System",       action:`Action note generated · ${m.name} notified`, type:"ai" },
      ]
    };
    setItems(p=>[item,...p]);
    sbUpsert("gemba", { id:item.id, data:item, created_at:now });
    setGenning(false);
    showToast(`✓ ${item.id} raised — ${m.name} notified`);
    setDesc(""); setArea(""); setOwner(""); setCat(""); setImg(null); setPriority("MEDIUM");
    setTimeout(()=>setTab("board"),600);
  };

  const updateStatus = (id, status, note, evPhoto, evDoc) => {
    const now=new Date().toISOString().slice(0,16).replace("T"," ");
    const parts=[note||`Status → ${status}`,evPhoto?"· Photo attached":"",evDoc?`· Doc: ${evDoc}`:""].filter(Boolean);
    const upd={time:now,actor:currentUser.name,action:parts.join(" "),type:"update"};
    const ce=status==="CLOSED"?{note,photo:evPhoto,doc:evDoc}:null;
    setItems(p=>p.map(i=>{
      if(i.id!==id) return i;
      const updated={...i,status,closeEvidence:ce,timeline:[...i.timeline,upd]};
      sbUpsert("gemba",{id:updated.id,data:updated,created_at:updated.raisedAt});
      return updated;
    }));
    if(selected?.id===id) setSelected(p=>({...p,status,closeEvidence:ce,timeline:[...p.timeline,upd]}));
    setClosingId(null); setCloseNote(""); setClosePhoto(null); setCloseDocName("");
    showToast(`✓ ${id} updated`);
  };

  // Detail view
  if (selected) {
    const c = getCat(selected.category);
    const isOwner = selected.owner===currentUser.name;
    return (
      <Shell toast={toast}>
        <div style={{background:C.surface, borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",padding:"16px 16px 0",gap:10}}>
            <button onClick={()=>setSelected(null)} style={{ width:36, height:36, borderRadius:9,
              background:C.surface, border:`1px solid ${C.border}`, display:"flex", alignItems:"center",
              justifyContent:"center", cursor:"pointer" }}>
              <ArrowLeft size={16} color={C.ink}/>
            </button>
            <div style={{marginLeft:"auto",background:C.surfaceAlt,borderRadius:100,padding:"3px 14px",fontSize:12,fontWeight:900,color:C.inkMid,fontFamily:MONO}}>{selected.id}</div>
          </div>
          {selected.photo&&(<div style={{position:"relative",margin:"12px 16px 0",borderRadius:14,overflow:"hidden"}}><img src={selected.photo} alt="" style={{width:"100%",height:180,objectFit:"cover"}}/></div>)}
          <div style={{padding:"14px 16px 18px"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:c.bg,borderRadius:100,padding:"4px 12px",marginBottom:9}}>
              <Folder size={13} color={c.color}/><span style={{fontSize:11,fontWeight:800,color:c.color}}>{c.label}</span>
            </div>
            <div style={{fontSize:19,fontWeight:900,color:C.ink,marginBottom:5}}>{selected.area}</div>
            <div style={{fontSize:13,color:C.inkMid,lineHeight:1.6}}>{selected.desc}</div>
          </div>
        </div>
        <div style={{padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[{label:"Owner",val:selected.owner,color:selected.ownerColor},{label:"Priority",val:selected.priority,color:priColor(selected.priority)},{label:"Status",val:selected.status,color:statColor(selected.status)},{label:"Due",val:selected.dueDate,color:C.inkMid}].map(m=>(
            <div key={m.label} style={{background:C.surfaceAlt,borderRadius:10,padding:"9px 12px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,color:C.inkLight,letterSpacing:2,marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:12,fontWeight:800,color:m.color}}>{m.val}</div>
            </div>
          ))}
        </div>
        <div style={{margin:"0 16px 12px",background:`${C.s5}12`,border:`1px solid ${C.s5}44`,borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:800,color:C.s5,letterSpacing:2,marginBottom:6}}>ACTION NOTE</div>
          <p style={{fontSize:12,color:C.inkMid,lineHeight:1.75,margin:0}}>{selected.aiNote}</p>
        </div>
        <SHead label="ACTIVITY LOG"/>
        <div style={{padding:"4px 18px 12px"}}>
          {selected.timeline.map((t,i)=>(
            <div key={i} style={{display:"flex",gap:10,minHeight:46}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:4,width:14}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:t.type==="ai"?C.s5:t.type==="raise"?C.open:C.closed,boxShadow:`0 0 0 2px ${t.type==="ai"?C.s5b:t.type==="raise"?C.openBg:C.closedBg}`}}/>
                {i<selected.timeline.length-1&&<div style={{flex:1,width:1,background:C.border,margin:"3px 0"}}/>}
              </div>
              <div style={{flex:1,paddingBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:C.ink}}>{t.action}</div>
                <div style={{fontSize:10,color:C.inkLight,marginTop:2,fontFamily:MONO}}>{t.actor} · {t.time}</div>
              </div>
            </div>
          ))}
        </div>
        {selected.status!=="CLOSED"&&(isOwner||currentUser.role==="Admin"||currentUser.role==="Auditor")&&(
          <div style={{padding:"0 16px 28px"}}>
            <SHead label="UPDATE"/>
            {closingId===selected.id?(
              <div style={{background:C.closedBg,border:`1px solid ${C.closed}44`,borderRadius:14,padding:"14px"}}>
                <FLabel text="ACTION TAKEN"/>
                <textarea style={{...sx.textarea,background:C.surface,borderColor:`${C.closed}33`}} rows={3} value={closeNote} onChange={e=>setCloseNote(e.target.value)} placeholder="Describe what was done…"/>
                <FLabel text="CLOSE-OUT PHOTO"/>
                <div style={{border:`2px dashed ${closePhoto?C.closed:C.border}`,borderRadius:10,background:C.surfaceAlt,minHeight:80,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden"}} onClick={()=>closeImgRef.current.click()}>
                  {closePhoto?<img src={closePhoto} alt="" style={{width:"100%",height:120,objectFit:"cover",display:"block"}}/>:<div style={{textAlign:"center",padding:16}}><div style={{fontSize:24}}>📷</div><div style={{fontSize:11,color:C.inkMid,marginTop:6}}>Tap to add photo</div></div>}
                  <input ref={closeImgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setClosePhoto(ev.target.result);r.readAsDataURL(f);}}/>
                </div>
                <FLabel text="DOCUMENT (optional)"/>
                <div style={{border:`2px dashed ${closeDocName?C.closed:C.border}`,borderRadius:10,background:C.surfaceAlt,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>closeDocRef.current.click()}>
                  <span style={{fontSize:20}}>{closeDocName?"📄":"📎"}</span>
                  <div style={{flex:1}}>{closeDocName?<div style={{fontSize:12,fontWeight:800,color:C.closed}}>{closeDocName}</div>:<div style={{fontSize:12,color:C.inkMid}}>Attach document</div>}</div>
                  <input ref={closeDocRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)setCloseDocName(f.name);}}/>
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button style={sx.ghostBtn} onClick={()=>{setClosingId(null);setClosePhoto(null);setCloseDocName("");setCloseNote("");}}>Cancel</button>
                  <button style={{...sx.solidBtn,background:`linear-gradient(135deg,${C.closed},#34D399)`}} onClick={()=>updateStatus(selected.id,"CLOSED",closeNote||"Resolved",closePhoto,closeDocName)}>Close Out</button>
                </div>
              </div>
            ):(
              <div style={{display:"flex",gap:8}}>
                {selected.status==="OPEN"&&<button style={{...sx.solidBtn,background:`linear-gradient(135deg,${C.prog},#FCD34D)`}} onClick={()=>updateStatus(selected.id,"IN PROGRESS","Acknowledged")}>Acknowledge</button>}
                <button style={{...sx.solidBtn,background:`linear-gradient(135deg,${C.closed},#34D399)`}} onClick={()=>setClosingId(selected.id)}>Close Out</button>
              </div>
            )}
          </div>
        )}
        {selected.status==="CLOSED"&&(
          <div style={{margin:"0 16px 28px"}}>
            <div style={{padding:"12px",background:C.closedBg,border:`1px solid ${C.closed}44`,borderRadius:10,textAlign:"center",fontSize:12,fontWeight:800,color:C.closed,letterSpacing:2,marginBottom:selected.closeEvidence?.note||selected.closeEvidence?.photo||selected.closeEvidence?.doc?12:0}}>✓ ACTION CLOSED</div>
            {selected.closeEvidence&&(selected.closeEvidence.note||selected.closeEvidence.photo||selected.closeEvidence.doc)&&(
              <div style={{background:C.surface,border:`1px solid ${C.closed}44`,borderRadius:12,overflow:"hidden"}}>
                <div style={{padding:"8px 14px",background:`${C.closed}18`,borderBottom:`1px solid ${C.closed}33`}}>
                  <div style={{fontSize:10,fontWeight:800,color:C.closed,letterSpacing:2}}>ACTION IMPLEMENTED / CORRECTIVE ACTION</div>
                </div>
                {selected.closeEvidence.note&&(
                  <div style={{padding:"12px 14px",borderBottom:selected.closeEvidence.photo||selected.closeEvidence.doc?`1px solid ${C.border}`:"none"}}>
                    <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{selected.closeEvidence.note}</div>
                  </div>
                )}
                {selected.closeEvidence.photo&&(
                  <div style={{position:"relative"}}>
                    <img src={selected.closeEvidence.photo} alt="" style={{width:"100%",height:140,objectFit:"cover",display:"block"}}/>
                    <div style={{position:"absolute",bottom:8,left:8,background:"rgba(16,185,129,0.9)",color:"#fff",fontSize:9,fontWeight:800,padding:"3px 10px",borderRadius:100}}>📷 CLOSE-OUT PHOTO</div>
                  </div>
                )}
                {selected.closeEvidence.doc&&(
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderTop:selected.closeEvidence.photo?`1px solid ${C.border}`:"none"}}>
                    <span style={{fontSize:20}}>📄</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:800,color:C.ink}}>{selected.closeEvidence.doc}</div>
                      <div style={{fontSize:10,color:C.inkLight}}>Supporting document</div>
                    </div>
                    <span style={{marginLeft:"auto",color:C.closed}}>✓</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Shell>
    );
  }

  // Raise view
  if (tab==="raise") return (
    <Shell toast={toast}>
      <div style={{background:`linear-gradient(135deg,${TEAL},${C.tealDk})`,padding:"14px 16px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button style={sx.backBtnW} onClick={()=>setTab("board")}>← Back</button>
          <div style={{fontSize:14,fontWeight:900,color:"#fff",letterSpacing:2}}>LOG GEMBA FINDING</div>
        </div>
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{border:`2px dashed ${img?C.teal:C.border}`,borderRadius:12,minHeight:100,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",background:C.surfaceAlt,marginBottom:10}} onClick={()=>imgRef.current.click()}>
          {img?<img src={img} alt="" style={{width:"100%",height:150,objectFit:"cover"}}/>:<div style={{textAlign:"center",padding:16}}><div style={{fontSize:28}}>📷</div><div style={{fontSize:12,fontWeight:800,color:C.ink,marginTop:6}}>Tap to attach photo</div></div>}
          <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
        </div>
        <FLabel text="OBSERVATION / FINDING"/>
        <textarea style={{...sx.textarea,marginBottom:4}} rows={3} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe what you observed during the walk…"/>
        <FLabel text="AREA / LOCATION"/>
        <select style={{...sx.select,marginBottom:4}} value={area} onChange={e=>setArea(e.target.value)}>
          <option value="">— Select area —</option>
          {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
        </select>
        <FLabel text="ASSIGN OWNER"/>
        <select style={{...sx.select,marginBottom:4}} value={owner} onChange={e=>setOwner(e.target.value)}>
          <option value="">— Select owner —</option>
          {[...USERS].sort((a,b)=>a.name.localeCompare(b.name)).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <FLabel text="CATEGORY"/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:4}}>
          {GEMBA_CATS.map(c=>(
            <button key={c.key} onClick={()=>setCat(c.key)}
              style={{flex:1,minWidth:80,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 4px",background:cat===c.key?c.grad:C.surfaceAlt,border:`1.5px solid ${cat===c.key?c.color:C.border}`,borderRadius:10,cursor:"pointer"}}>
              <span style={{fontSize:16}}>{c.icon}</span>
              <span style={{fontSize:9,fontWeight:800,color:cat===c.key?"#fff":c.color}}>{c.label}</span>
            </button>
          ))}
        </div>
        <FLabel text="PRIORITY"/>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {["LOW","MEDIUM","HIGH","CRITICAL"].map(p=>(
            <button key={p} onClick={()=>setPriority(p)}
              style={{flex:1,padding:"9px 4px",borderRadius:9,border:`1.5px solid ${priColor(p)}`,background:priority===p?`linear-gradient(135deg,${priColor(p)},${priColor(p)}aa)`:"transparent",color:priority===p?"#fff":priColor(p),fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:FONT}}>
              {p}
            </button>
          ))}
        </div>
        <button style={{width:"100%",padding:"14px",background:desc&&area&&owner&&cat?`linear-gradient(135deg,#8B5CF6,#6D28D9)`:C.surfaceAlt,border:"none",borderRadius:11,color:desc&&area&&owner&&cat?"#fff":C.inkLight,fontSize:14,fontWeight:800,letterSpacing:1,fontFamily:FONT,cursor:"pointer",opacity:genning?0.65:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
          onClick={handleRaise} disabled={genning}>
          {genning?<><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⚙</span> Creating action…</>:"⚡ Log Finding & Notify Owner"}
        </button>
      </div>
    </Shell>
  );

  // Board
  const openCt   = items.filter(i=>i.status==="OPEN").length;
  const progCt   = items.filter(i=>i.status==="IN PROGRESS").length;
  const closedCt = items.filter(i=>i.status==="CLOSED").length;
  let visible = myOnly ? items.filter(i=>i.owner===currentUser.name) : items;
  if (filter !== "ALL") visible = visible.filter(i=>i.status===filter);
  if (catFilter) visible = visible.filter(i=>i.category===catFilter);
  return (
    <Shell toast={toast}>
      <div style={{ background:C.surface, padding:"16px 16px 14px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onBack} style={{ width:40, height:40, borderRadius:10, background:C.surface,
              border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <ArrowLeft size={18} color={C.ink}/>
            </button>
            <div style={{ width:40, height:40, borderRadius:10, background:`${TEAL}14`,
              border:`1.5px solid ${TEAL}55`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Footprints size={18} color={TEAL}/>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:900, color:C.ink }}>Gemba Walks</div>
              <div style={{ fontSize:9, color:C.inkLight, letterSpacing:2 }}>FLOOR OBSERVATIONS &amp; ACTIONS</div>
            </div>
          </div>
          <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:C.surface,
            border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, padding:"8px 12px",
            fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:FONT }}>
            <HomeIcon size={14}/> Home
          </button>
        </div>
        <button style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${C.tealDk})`,border:"none",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",boxShadow:`0 6px 24px ${TEAL}33`,textAlign:"left"}} onClick={()=>setTab("raise")}>
          <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}><ClipboardList size={20} color="#fff"/></div>
          <div><div style={{fontSize:13,fontWeight:800,color:"#fff"}}>LOG GEMBA FINDING</div><div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:2}}>Photo · Observation · Assign owner · AI action note</div></div>
          <ArrowRight size={16} color="rgba(255,255,255,0.8)" style={{marginLeft:"auto"}}/>
        </button>
      </div>

      <div style={{ display:"flex", margin:"12px 16px 0", background:C.surface,
        border:`1px solid ${C.border}`, borderRadius:12, boxShadow:C.shadow }}>
        {[{label:"OPEN",val:openCt,Icon:FileText,f:"OPEN"},{label:"IN PROGRESS",val:progCt,Icon:Clock,f:"IN PROGRESS"},{label:"CLOSED",val:closedCt,Icon:RefreshCw,f:"CLOSED"}].map((st,i)=>(
          <button key={st.label} onClick={()=>{setFilter(filter===st.f?"ALL":st.f);setMyOnly(false);}}
            style={{flex:1,background:"none",border:"none",borderLeft:i>0?`1px solid ${C.border}`:"none",padding:"12px 6px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",opacity:filter===st.f&&!myOnly?1:0.85}}>
            <st.Icon size={16} color={filter===st.f&&!myOnly?TEAL:C.inkLight}/>
            <div style={{fontSize:20,fontWeight:900,color:C.ink}}>{st.val}</div>
            <div style={{fontSize:8,color:C.inkLight,letterSpacing:0.5}}>{st.label}</div>
          </button>
        ))}
      </div>

      <div style={{ display:"flex", padding:"12px 16px 0", gap:8, alignItems:"center" }}>
        <div style={{ display:"flex", gap:14, flex:1, borderBottom:`1px solid ${C.border}`, overflowX:"auto" }}>
          <button onClick={()=>{setMyOnly(v=>!v);setFilter("ALL");}}
            style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none",
              borderBottom:`2px solid ${myOnly?TEAL:"transparent"}`, color:myOnly?TEAL:C.inkLight,
              fontSize:11, fontWeight:700, padding:"0 0 8px", cursor:"pointer", fontFamily:FONT, flexShrink:0 }}>
            <Av txt={currentUser.initials} color={currentUser.color} size={14}/> Mine
          </button>
          {[["ALL","All Findings"],["OPEN","Open"],["IN PROGRESS","In Progress"],["CLOSED","Closed"]].map(([f,label])=>(
            <button key={f} onClick={()=>{setFilter(f);setMyOnly(false);}}
              style={{ background:"none", border:"none",
                borderBottom:`2px solid ${filter===f&&!myOnly?TEAL:"transparent"}`,
                color:filter===f&&!myOnly?TEAL:C.inkLight, fontSize:11, fontWeight:700, whiteSpace:"nowrap",
                padding:"0 0 8px", cursor:"pointer", fontFamily:FONT, flexShrink:0 }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ position:"relative", flexShrink:0 }}>
          <button onClick={()=>setShowCatMenu(v=>!v)}
            style={{ display:"flex", alignItems:"center", gap:6, background:C.surface,
              border:`1px solid ${catFilter?TEAL:C.border}`, borderRadius:9, padding:"7px 11px",
              fontSize:11, fontWeight:700, color:catFilter?TEAL:C.inkMid, cursor:"pointer", fontFamily:FONT }}>
            <FilterIcon size={13}/> Filter
          </button>
          {showCatMenu && (
            <div style={{ position:"absolute", top:"110%", right:0, background:C.surface,
              border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 24px rgba(30,32,37,0.14)",
              zIndex:20, minWidth:150, overflow:"hidden" }}>
              <button onClick={()=>{setCatFilter("");setShowCatMenu(false);}}
                style={{ width:"100%", textAlign:"left", padding:"9px 12px", background:!catFilter?C.surfaceAlt:"none",
                  border:"none", fontSize:11, fontWeight:700, color:C.ink, cursor:"pointer", fontFamily:FONT }}>
                All categories
              </button>
              {GEMBA_CATS.map(c=>(
                <button key={c.key} onClick={()=>{setCatFilter(c.key);setShowCatMenu(false);}}
                  style={{ width:"100%", textAlign:"left", padding:"9px 12px", background:catFilter===c.key?C.surfaceAlt:"none",
                    border:"none", fontSize:11, fontWeight:700, color:c.color, cursor:"pointer", fontFamily:FONT }}>
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
        {visible.map((item,idx)=>{
          const c=getCat(item.category);
          const isOwner=item.owner===currentUser.name;
          return (
            <div key={item.id} className="card" style={{animationDelay:`${idx*0.07}s`}}>
              <button style={{width:"100%",background:C.surface,border:`1px solid ${isOwner&&item.status==="OPEN"?`${C.open}55`:C.border}`,borderRadius:14,padding:"14px",cursor:"pointer",textAlign:"left",fontFamily:FONT,display:"flex",gap:12,boxShadow:C.shadow}} onClick={()=>setSelected(item)}>
                <div style={{ width:44, height:44, borderRadius:10, background:c.bg,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Folder size={18} color={c.color}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                    <div style={{background:c.bg,color:c.color,fontSize:10,fontWeight:800,padding:"2px 9px",borderRadius:100}}>{c.label}</div>
                    <div style={{background:`${priColor(item.priority)}18`,color:priColor(item.priority),fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:100}}>{item.priority}</div>
                    <div style={{background:statBg(item.status),color:statColor(item.status),fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:100}}>{item.status}</div>
                    {isOwner&&<div style={{background:`${currentUser.color}18`,color:currentUser.color,fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:100}}>MINE</div>}
                    <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                      <span style={{fontSize:10,color:C.inkLight,fontFamily:MONO}}>{item.id}</span>
                      <ArrowRight size={13} color={C.inkLight}/>
                    </div>
                  </div>
                  <div style={{fontSize:13,fontWeight:800,color:C.ink,marginBottom:4}}>{item.area}</div>
                  <div style={{fontSize:12,color:C.inkMid,lineHeight:1.55,marginBottom:10}}>{item.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <Av txt={item.ownerInit} color={item.ownerColor} size={22}/>
                      <span style={{fontSize:11,color:C.inkMid}}>{item.owner}</span>
                    </div>
                    <span style={{fontSize:10,color:item.dueDate&&item.status!=="CLOSED"&&new Date(item.dueDate)<new Date()?C.open:C.inkLight}}>Due {item.dueDate}</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
      {visible.length===0&&<div style={{textAlign:"center",padding:"40px 20px"}}><Footprints size={36} color={C.inkLight}/><div style={{fontSize:13,color:C.inkLight,marginTop:8}}>No Gemba findings yet</div></div>}

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480, background:C.surface,
        borderTop:`1px solid ${C.border}`, display:"flex",
        paddingBottom:"env(safe-area-inset-bottom,0)",
        boxShadow:"0 -4px 24px rgba(30,32,37,0.08)" }}>
        {[
          { id:"board", Icon:LayoutGrid,    label:"BOARD" },
          { id:"raise", Icon:ClipboardList, label:"RAISE" },
        ].map(n => (
          <button key={n.id} onClick={()=>setTab(n.id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              gap:3, padding:"11px 2px", background:"none", border:"none",
              color:tab===n.id?TEAL:C.inkLight, fontSize:8, letterSpacing:1,
              fontWeight:800, cursor:"pointer", fontFamily:FONT,
              borderTop:`2.5px solid ${tab===n.id?TEAL:"transparent"}` }}>
            <n.Icon size={18}/>
            {n.label}
          </button>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────
// MAINTENANCE — JOB CARDS
// ─────────────────────────────────────────────────────────
const MAINT_ADMINS = [
  { id:"mike",     name:"Mike Van Der Westhuizen" },
  { id:"noel",     name:"Noel Chapman" },
  { id:"oscar",    name:"Oscar" },
];
const MAINT_MACHINES = ["202","203","302","303","406","407","408","409","511","512","651","648","646","652","641","803","804","807","808","861","863","864","865","868"];
const MAINT_ARTISANS = [
  { id:"wesley3", name:"Wesley Technician 3" },
];
const MAINT_PRIORITIES = ["Breakdown - Critical","Breakdown - Major","Breakdown - Minor","Planned Maintenance"];
const maintPriColor = p => p==="Breakdown - Critical"?"#9333EA":p==="Breakdown - Major"?C.open:p==="Breakdown - Minor"?C.prog:C.teal;
const maintName = (list,id) => (list.find(x=>x.id===id)||{}).name || "—";

const SEED_JOBCARDS = [
  {
    id:"004375",
    title:"407 plate clamp",
    machineNumber:"407",
    machineSection:"Print Units",
    operationalUnit:"Litho Print",
    maintAdmin:"mike",
    ccAdmins:["noel","oscar"],
    initiatedBy:"Litho Foreman",
    initiatedAt:"2026-01-30 16:00",
    priority:"Breakdown - Critical",
    description:"please assist with 3rd unit plate clamp not releasing",
    artisan:"wesley3",
    targetDate:"2026-04-04T21:40",
    downtime:true,
    action:"Stripped out the plate clamp guard, found the leak, replace the pneumatic pip, reassembled and tested.",
    repairsDone:true, toolsReturned:true, machineCleaned:true, noUnaccounted:true,
    hoursWorked:"01:15",
    actualCompletionDate:"2026-02-28T00:45",
    effectivenessReview:"Done.",
    managerReview:"CLOSED.",
    status:"CLOSED",
    raisedBy:"Michael Downes",
    cost:0,
    comments:[],
    timeline:[
      { time:"2026-01-30 16:00", actor:"Litho Foreman",    action:"Job card raised — 407 plate clamp",     type:"raise"  },
      { time:"2026-01-30 16:05", actor:"Mike Van Der Westhuizen",  action:"Assigned to Wesley Technician 3",       type:"update" },
      { time:"2026-02-28 00:45", actor:"Mike Van Der Westhuizen",  action:"Job card closed",                       type:"update" },
    ],
  },
];

function MaintenancePage({ currentUser, onBack, items, setItems }) {
  const [tab,      setTab]      = useState("board");
  const [selected, setSelected] = useState(null);
  const [toast,    setToast]    = useState("");
  const [dbLoaded, setDbLoaded] = useState(false);
  const [myOnly,      setMyOnly]      = useState(false);
  const [filter,      setFilter]      = useState("ALL");
  const [prioFilter,  setPrioFilter]  = useState("");
  const [showPrioMenu,setShowPrioMenu]= useState(false);

  useEffect(() => {
    (async () => {
      const rows = await sbFetch("jobcards");
      if (Array.isArray(rows) && rows.length > 0) setItems(rows.map(r => r.data));
      setDbLoaded(true);
    })();
  }, []);

  // raise
  const [title,     setTitle]     = useState("");
  const [machineNo, setMachineNo] = useState("");
  const [section,   setSection]   = useState("");
  const [unit,      setUnit]      = useState("");
  const [admin,     setAdmin]     = useState("");
  const [ccAdmins,  setCcAdmins]  = useState([]);
  const [initBy,    setInitBy]    = useState("");
  const [priority,  setPriority]  = useState("Breakdown - Critical");
  const [desc,      setDesc]      = useState("");
  const [saving,    setSaving]    = useState(false);

  // work panel
  const [artisan,    setArtisan]    = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [downtime,   setDowntime]   = useState(null);
  const [action,        setAction]        = useState("");
  const [repairsDone,   setRepairsDone]   = useState(false);
  const [toolsReturned, setToolsReturned] = useState(false);
  const [machineCleaned,setMachineCleaned]= useState(false);
  const [noUnaccounted, setNoUnaccounted] = useState(false);
  const [hoursWorked,   setHoursWorked]   = useState("");
  const [actualDate,    setActualDate]    = useState("");
  const [effReview,     setEffReview]     = useState("");
  const [mgrReview,      setMgrReview]     = useState("");
  const [newComment,     setNewComment]    = useState("");

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2800); };
  const statColor = s => s==="CLOSED"?C.closed:s==="IN PROGRESS"?"#2563EB":C.open;
  const statBg    = s => s==="CLOSED"?C.closedBg:s==="IN PROGRESS"?"#DBEAFE":C.openBg;
  const soon      = () => showToast("This tab isn't built yet — coming soon");

  const persist = updated => {
    setItems(p => p.map(i => i.id===updated.id ? updated : i));
    if (selected?.id===updated.id) setSelected(updated);
    sbUpsert("jobcards", { id:updated.id, data:updated, created_at:updated.initiatedAt });
  };

  const handleRaise = () => {
    if (!title || !machineNo || !unit || !admin || !desc) { showToast("⚠ Please fill title, machine, unit, admin and description"); return; }
    setSaving(true);
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const card = {
      id: String(1000 + items.length + 1).padStart(6,"0"),
      title, machineNumber:machineNo, machineSection:section, operationalUnit:unit,
      maintAdmin:admin, ccAdmins, initiatedBy:initBy || currentUser.name,
      initiatedAt:now, priority, description:desc,
      artisan:"", targetDate:"", downtime:null, action:"",
      repairsDone:false, toolsReturned:false, machineCleaned:false, noUnaccounted:false,
      hoursWorked:"", actualCompletionDate:"", effectivenessReview:"", managerReview:"",
      status:"OPEN", raisedBy:currentUser.name, cost:0, comments:[],
      timeline:[{ time:now, actor:currentUser.name, action:`Job card raised — ${title}`, type:"raise" }],
    };
    setItems(p => [card, ...p]);
    sbUpsert("jobcards", { id:card.id, data:card, created_at:now });
    setSaving(false);
    showToast(`✓ Job card ${card.id} raised`);
    setTitle(""); setMachineNo(""); setSection(""); setUnit(""); setAdmin(""); setCcAdmins([]);
    setInitBy(""); setPriority("Breakdown - Critical"); setDesc("");
    setTimeout(() => setTab("board"), 500);
  };

  const startWork = () => {
    if (!artisan) { showToast("⚠ Assign an artisan first"); return; }
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const updated = {
      ...selected, artisan, targetDate, downtime,
      status:"IN PROGRESS",
      timeline:[...selected.timeline, { time:now, actor:currentUser.name, action:`Assigned to ${maintName(MAINT_ARTISANS,artisan)}`, type:"update" }],
    };
    persist(updated);
    showToast("✓ Work started");
  };

  const closeCard = () => {
    if (!mgrReview) { showToast("⚠ Add a manager review before closing"); return; }
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const updated = {
      ...selected, action, repairsDone, toolsReturned, machineCleaned, noUnaccounted,
      hoursWorked, actualCompletionDate:actualDate, effectivenessReview:effReview, managerReview:mgrReview,
      status:"CLOSED",
      timeline:[...selected.timeline, { time:now, actor:currentUser.name, action:"Job card closed", type:"update" }],
    };
    persist(updated);
    showToast(`✓ ${selected.id} closed`);
  };

  const postComment = () => {
    if (!newComment.trim()) return;
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const updated = { ...selected, comments:[...(selected.comments||[]), { time:now, actor:currentUser.name, text:newComment.trim() }] };
    persist(updated);
    setNewComment("");
  };

  // ── Detail view ──────────────────────────────────────────
  if (selected) {
    const s = selected;
    return (
      <Shell toast={toast}>
        <div style={{background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"16px 16px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <button onClick={()=>setSelected(null)} style={{ width:36, height:36, borderRadius:9,
              background:C.surface, border:`1px solid ${C.border}`, display:"flex", alignItems:"center",
              justifyContent:"center", cursor:"pointer" }}>
              <ArrowLeft size={16} color={C.ink}/>
            </button>
            <div style={{marginLeft:"auto",background:C.surfaceAlt,borderRadius:100,padding:"3px 14px",fontSize:12,fontWeight:900,color:C.inkMid,fontFamily:MONO}}>#{s.id}</div>
            <div style={{background:C.surfaceAlt,borderRadius:100,padding:"3px 12px",fontSize:11,fontWeight:800,color:C.inkMid}}>R{(s.cost||0).toFixed(2)}</div>
          </div>
          <div style={{fontSize:18,fontWeight:900,color:C.ink,marginBottom:4}}>{s.title}</div>
          <div style={{fontSize:12,color:C.inkMid}}>{s.machineNumber} · {s.operationalUnit}</div>
        </div>

        <div style={{padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            { label:"Status",   val:s.status, color:statColor(s.status) },
            { label:"Priority", val:s.priority, color:maintPriColor(s.priority) },
            { label:"Maintenance Admin", val:maintName(MAINT_ADMINS,s.maintAdmin), color:C.inkMid },
            { label:"Initiated By", val:s.initiatedBy, color:C.inkMid },
          ].map(m => (
            <div key={m.label} style={{background:C.surfaceAlt,borderRadius:10,padding:"9px 12px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,color:C.inkLight,letterSpacing:2,marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:12,fontWeight:800,color:m.color}}>{m.val}</div>
            </div>
          ))}
        </div>

        <div style={{margin:"0 16px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:800,color:C.inkLight,letterSpacing:2,marginBottom:6}}>MAINTENANCE DESCRIPTION</div>
          <p style={{fontSize:12,color:C.ink,lineHeight:1.6,margin:0}}>{s.description}</p>
        </div>

        {/* Tabs — Comments live, rest stubbed */}
        <div style={{display:"flex",gap:14,padding:"0 16px",borderBottom:`1px solid ${C.border}`,marginBottom:14,overflowX:"auto"}}>
          {["Comments","5 Why's","Costs","Documents","Audit","Additional Fields"].map(t=>(
            <div key={t} onClick={()=> t!=="Comments" && soon()} style={{padding:"8px 2px",fontSize:12,fontWeight:700,color:t==="Comments"?TEAL:C.inkLight,borderBottom:t==="Comments"?`2px solid ${TEAL}`:"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}}>{t}</div>
          ))}
        </div>

        <div style={{padding:"0 16px 12px"}}>
          <textarea style={{...sx.textarea,marginBottom:8}} rows={2} placeholder="New comment…" value={newComment} onChange={e=>setNewComment(e.target.value)}/>
          <button style={{...sx.solidBtn,width:"100%",background:TEAL,flex:"none"}} onClick={postComment}>Post Comment</button>
          <div style={{marginTop:12}}>
            {(s.comments||[]).length===0 && <div style={{fontSize:12,color:C.inkLight,textAlign:"center",padding:"10px 0"}}>No comments yet</div>}
            {(s.comments||[]).map((c,i)=>(
              <div key={i} style={{background:C.surfaceAlt,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:800,color:C.ink}}>{c.actor}</div>
                <div style={{fontSize:12,color:C.inkMid,marginTop:2,lineHeight:1.5}}>{c.text}</div>
                <div style={{fontSize:9,color:C.inkLight,marginTop:4,fontFamily:MONO}}>{c.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Work panel */}
        {s.status==="OPEN" && (currentUser.role==="Admin" || currentUser.role==="Manager" || MAINT_ADMINS.some(a=>a.id===s.maintAdmin)) && (
          <div style={{padding:"0 16px 28px"}}>
            <SHead label="ASSIGN & START WORK"/>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:14}}>
              <FLabel text="ARTISAN"/>
              <select style={{...sx.select,marginBottom:10}} value={artisan} onChange={e=>setArtisan(e.target.value)}>
                <option value="">— Select artisan —</option>
                {MAINT_ARTISANS.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <FLabel text="TARGET COMPLETION DATE"/>
              <input type="datetime-local" style={{...sx.select,marginBottom:10}} value={targetDate} onChange={e=>setTargetDate(e.target.value)}/>
              <FLabel text="MACHINE DOWNTIME"/>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                {[["Yes",true],["No",false]].map(([lbl,val])=>(
                  <button key={lbl} onClick={()=>setDowntime(val)} style={{flex:1,padding:"9px 4px",borderRadius:9,border:`1.5px solid ${C.teal}`,background:downtime===val?C.teal:"transparent",color:downtime===val?"#fff":C.teal,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:FONT}}>{lbl}</button>
                ))}
              </div>
              <button style={{...sx.solidBtn,width:"100%",background:`linear-gradient(135deg,${C.prog},#FCD34D)`}} onClick={startWork}>Assign & Start Work</button>
            </div>
          </div>
        )}

        {s.status==="IN PROGRESS" && (
          <div style={{padding:"0 16px 28px"}}>
            <SHead label="CLOSE OUT JOB CARD"/>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:14}}>
              <FLabel text="MAINTENANCE ACTION"/>
              <textarea style={{...sx.textarea,marginBottom:10}} rows={3} value={action} onChange={e=>setAction(e.target.value)} placeholder="Describe the repair carried out…"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                {[
                  ["Maintenance/Repairs done",repairsDone,setRepairsDone],
                  ["All tools & Spares returned",toolsReturned,setToolsReturned],
                  ["Machine Cleaned",machineCleaned,setMachineCleaned],
                  ["No unaccounted spares or tools",noUnaccounted,setNoUnaccounted],
                ].map(([lbl,val,set])=>(
                  <label key={lbl} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.inkMid,cursor:"pointer"}}>
                    <input type="checkbox" checked={val} onChange={e=>set(e.target.checked)}/> {lbl}
                  </label>
                ))}
              </div>
              <FLabel text="ARTISAN HOURS WORKED"/>
              <input style={{...sx.select,marginBottom:10}} placeholder="e.g. 01:15" value={hoursWorked} onChange={e=>setHoursWorked(e.target.value)}/>
              <FLabel text="ACTUAL COMPLETION DATE"/>
              <input type="datetime-local" style={{...sx.select,marginBottom:10}} value={actualDate} onChange={e=>setActualDate(e.target.value)}/>
              <FLabel text="JOB CARD EFFECTIVENESS REVIEW"/>
              <textarea style={{...sx.textarea,marginBottom:10}} rows={2} value={effReview} onChange={e=>setEffReview(e.target.value)} placeholder="Maintenance admin review…"/>
              <FLabel text="MAINTENANCE MANAGER REVIEW"/>
              <textarea style={{...sx.textarea,marginBottom:12}} rows={2} value={mgrReview} onChange={e=>setMgrReview(e.target.value)} placeholder="Required to close the job card…"/>
              <button style={{...sx.solidBtn,width:"100%",background:`linear-gradient(135deg,${C.closed},#34D399)`}} onClick={closeCard}>Close Job Card</button>
            </div>
          </div>
        )}

        {s.status==="CLOSED" && (
          <div style={{margin:"0 16px 28px",background:C.closedBg,border:`1px solid ${C.closed}44`,borderRadius:12,padding:14}}>
            <div style={{fontSize:11,fontWeight:800,color:C.closed,letterSpacing:2,marginBottom:8}}>✓ JOB CARD CLOSED</div>
            {s.action && <div style={{fontSize:12,color:C.ink,lineHeight:1.6,marginBottom:8}}>{s.action}</div>}
            <div style={{fontSize:11,color:C.inkMid}}>Artisan: {maintName(MAINT_ARTISANS,s.artisan)} · Hours: {s.hoursWorked||"—"}</div>
            {s.managerReview && <div style={{fontSize:11,color:C.inkMid,marginTop:4}}>Manager review: {s.managerReview}</div>}
          </div>
        )}
      </Shell>
    );
  }

  // ── Raise view ───────────────────────────────────────────
  if (tab==="raise") return (
    <Shell toast={toast}>
      <div style={{background:`linear-gradient(135deg,${TEAL},${C.tealDk})`,padding:"14px 16px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button style={sx.backBtnW} onClick={()=>setTab("board")}>← Back</button>
          <div style={{fontSize:14,fontWeight:900,color:"#fff",letterSpacing:2}}>NEW JOB CARD</div>
        </div>
      </div>
      <div style={{padding:"14px 16px"}}>
        <FLabel text="TITLE"/>
        <input style={{...sx.select,marginBottom:4}} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. 407 plate clamp"/>
        <FLabel text="MACHINE NUMBER"/>
        <select style={{...sx.select,marginBottom:4}} value={machineNo} onChange={e=>setMachineNo(e.target.value)}>
          <option value="">— Select machine —</option>
          {MAINT_MACHINES.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <FLabel text="MACHINE SECTION"/>
        <input style={{...sx.select,marginBottom:4}} value={section} onChange={e=>setSection(e.target.value)} placeholder="e.g. Print Units"/>
        <FLabel text="OPERATIONAL UNIT"/>
        <select style={{...sx.select,marginBottom:4}} value={unit} onChange={e=>setUnit(e.target.value)}>
          <option value="">— Select unit —</option>
          {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
        </select>
        <FLabel text="MAINTENANCE ADMIN"/>
        <select style={{...sx.select,marginBottom:4}} value={admin} onChange={e=>setAdmin(e.target.value)}>
          <option value="">— Select admin —</option>
          {MAINT_ADMINS.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <FLabel text="ADDITIONAL ADMINS (CC)"/>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
          {MAINT_ADMINS.filter(a=>a.id!==admin).map(a=>(
            <label key={a.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.inkMid,background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:100,padding:"4px 10px",cursor:"pointer"}}>
              <input type="checkbox" checked={ccAdmins.includes(a.id)} onChange={e=>setCcAdmins(p=> e.target.checked ? [...p,a.id] : p.filter(x=>x!==a.id))}/> {a.name}
            </label>
          ))}
        </div>
        <FLabel text="INITIATED BY"/>
        <input style={{...sx.select,marginBottom:4}} value={initBy} onChange={e=>setInitBy(e.target.value)} placeholder={currentUser.name}/>
        <FLabel text="PRIORITY"/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {MAINT_PRIORITIES.map(p=>(
            <button key={p} onClick={()=>setPriority(p)} style={{flex:"1 1 45%",padding:"9px 4px",borderRadius:9,border:`1.5px solid ${maintPriColor(p)}`,background:priority===p?maintPriColor(p):"transparent",color:priority===p?"#fff":maintPriColor(p),fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:FONT}}>{p}</button>
          ))}
        </div>
        <FLabel text="MAINTENANCE DESCRIPTION"/>
        <textarea style={{...sx.textarea,marginBottom:10}} rows={3} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe the fault or work required…"/>
        <button style={{width:"100%",padding:"14px",background:title&&machineNo&&unit&&admin&&desc?`linear-gradient(135deg,${TEAL},${C.tealDk})`:C.surfaceAlt,border:"none",borderRadius:11,color:title&&machineNo&&unit&&admin&&desc?"#fff":C.inkLight,fontSize:14,fontWeight:800,letterSpacing:1,fontFamily:FONT,cursor:"pointer",opacity:saving?0.65:1}}
          onClick={handleRaise} disabled={saving}>
          🔧 Raise Job Card
        </button>
      </div>
    </Shell>
  );

  // ── Board ────────────────────────────────────────────────
  const openCt   = items.filter(i=>i.status==="OPEN").length;
  const progCt   = items.filter(i=>i.status==="IN PROGRESS").length;
  const closedCt = items.filter(i=>i.status==="CLOSED").length;
  let visible = myOnly ? items.filter(i=>maintName(MAINT_ADMINS,i.maintAdmin)===currentUser.name) : items;
  if (filter !== "ALL") visible = visible.filter(i=>i.status===filter);
  if (prioFilter) visible = visible.filter(i=>i.priority===prioFilter);
  return (
    <Shell toast={toast}>
      <div style={{ background:C.surface, padding:"16px 16px 14px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onBack} style={{ width:40, height:40, borderRadius:10, background:C.surface,
              border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <ArrowLeft size={18} color={C.ink}/>
            </button>
            <div style={{ width:40, height:40, borderRadius:10, background:`${TEAL}14`,
              border:`1.5px solid ${TEAL}55`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Wrench size={18} color={TEAL}/>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:900, color:C.ink }}>Maintenance</div>
              <div style={{ fontSize:9, color:C.inkLight, letterSpacing:2 }}>JOB CARDS</div>
            </div>
          </div>
          <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:C.surface,
            border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, padding:"8px 12px",
            fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:FONT }}>
            <HomeIcon size={14}/> Home
          </button>
        </div>
        <button style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${C.tealDk})`,border:"none",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",boxShadow:`0 6px 24px ${TEAL}33`,textAlign:"left"}} onClick={()=>setTab("raise")}>
          <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}><Wrench size={20} color="#fff"/></div>
          <div><div style={{fontSize:13,fontWeight:800,color:"#fff"}}>NEW JOB CARD</div><div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:2}}>Machine · Priority · Assign admin</div></div>
          <ArrowRight size={16} color="rgba(255,255,255,0.8)" style={{marginLeft:"auto"}}/>
        </button>
      </div>

      <div style={{ display:"flex", margin:"12px 16px 0", background:C.surface,
        border:`1px solid ${C.border}`, borderRadius:12, boxShadow:C.shadow }}>
        {[{label:"OPEN",val:openCt,Icon:FileText,f:"OPEN"},{label:"IN PROGRESS",val:progCt,Icon:Clock,f:"IN PROGRESS"},{label:"CLOSED",val:closedCt,Icon:RefreshCw,f:"CLOSED"}].map((st,i)=>(
          <button key={st.label} onClick={()=>{setFilter(filter===st.f?"ALL":st.f);setMyOnly(false);}}
            style={{flex:1,background:"none",border:"none",borderLeft:i>0?`1px solid ${C.border}`:"none",padding:"12px 6px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",opacity:filter===st.f&&!myOnly?1:0.85}}>
            <st.Icon size={16} color={filter===st.f&&!myOnly?TEAL:C.inkLight}/>
            <div style={{fontSize:20,fontWeight:900,color:C.ink}}>{st.val}</div>
            <div style={{fontSize:8,color:C.inkLight,letterSpacing:0.5}}>{st.label}</div>
          </button>
        ))}
      </div>

      <div style={{ display:"flex", padding:"12px 16px 0", gap:8, alignItems:"center" }}>
        <div style={{ display:"flex", gap:14, flex:1, borderBottom:`1px solid ${C.border}`, overflowX:"auto" }}>
          <button onClick={()=>{setMyOnly(v=>!v);setFilter("ALL");}}
            style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none",
              borderBottom:`2px solid ${myOnly?TEAL:"transparent"}`, color:myOnly?TEAL:C.inkLight,
              fontSize:11, fontWeight:700, padding:"0 0 8px", cursor:"pointer", fontFamily:FONT, flexShrink:0 }}>
            <Av txt={currentUser.initials} color={currentUser.color} size={14}/> Mine
          </button>
          {[["ALL","All Job Cards"],["OPEN","Open"],["IN PROGRESS","In Progress"],["CLOSED","Closed"]].map(([f,label])=>(
            <button key={f} onClick={()=>{setFilter(f);setMyOnly(false);}}
              style={{ background:"none", border:"none",
                borderBottom:`2px solid ${filter===f&&!myOnly?TEAL:"transparent"}`,
                color:filter===f&&!myOnly?TEAL:C.inkLight, fontSize:11, fontWeight:700, whiteSpace:"nowrap",
                padding:"0 0 8px", cursor:"pointer", fontFamily:FONT, flexShrink:0 }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ position:"relative", flexShrink:0 }}>
          <button onClick={()=>setShowPrioMenu(v=>!v)}
            style={{ display:"flex", alignItems:"center", gap:6, background:C.surface,
              border:`1px solid ${prioFilter?TEAL:C.border}`, borderRadius:9, padding:"7px 11px",
              fontSize:11, fontWeight:700, color:prioFilter?TEAL:C.inkMid, cursor:"pointer", fontFamily:FONT }}>
            <FilterIcon size={13}/> Filter
          </button>
          {showPrioMenu && (
            <div style={{ position:"absolute", top:"110%", right:0, background:C.surface,
              border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 24px rgba(30,32,37,0.14)",
              zIndex:20, minWidth:170, overflow:"hidden" }}>
              <button onClick={()=>{setPrioFilter("");setShowPrioMenu(false);}}
                style={{ width:"100%", textAlign:"left", padding:"9px 12px", background:!prioFilter?C.surfaceAlt:"none",
                  border:"none", fontSize:11, fontWeight:700, color:C.ink, cursor:"pointer", fontFamily:FONT }}>
                All priorities
              </button>
              {MAINT_PRIORITIES.map(p=>(
                <button key={p} onClick={()=>{setPrioFilter(p);setShowPrioMenu(false);}}
                  style={{ width:"100%", textAlign:"left", padding:"9px 12px", background:prioFilter===p?C.surfaceAlt:"none",
                    border:"none", fontSize:11, fontWeight:700, color:maintPriColor(p), cursor:"pointer", fontFamily:FONT }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
        {visible.map((item,idx)=>(
          <div key={item.id} className="card" style={{animationDelay:`${idx*0.07}s`}}>
            <button style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px",cursor:"pointer",textAlign:"left",fontFamily:FONT,display:"flex",gap:12,boxShadow:C.shadow}} onClick={()=>{
              setSelected(item);
              setArtisan(item.artisan||""); setTargetDate(item.targetDate||""); setDowntime(item.downtime);
              setAction(item.action||""); setRepairsDone(!!item.repairsDone); setToolsReturned(!!item.toolsReturned);
              setMachineCleaned(!!item.machineCleaned); setNoUnaccounted(!!item.noUnaccounted);
              setHoursWorked(item.hoursWorked||""); setActualDate(item.actualCompletionDate||"");
              setEffReview(item.effectivenessReview||""); setMgrReview(item.managerReview||"");
            }}>
              <div style={{ width:44, height:44, borderRadius:10, background:`${maintPriColor(item.priority)}18`,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Wrench size={18} color={maintPriColor(item.priority)}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                  <div style={{background:`${maintPriColor(item.priority)}18`,color:maintPriColor(item.priority),fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:100}}>{item.priority}</div>
                  <div style={{background:statBg(item.status),color:statColor(item.status),fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:100}}>{item.status}</div>
                  <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                    <span style={{fontSize:10,color:C.inkLight,fontFamily:MONO}}>#{item.id}</span>
                    <ArrowRight size={13} color={C.inkLight}/>
                  </div>
                </div>
                <div style={{fontSize:13,fontWeight:800,color:C.ink,marginBottom:4}}>{item.title}</div>
                <div style={{fontSize:12,color:C.inkMid,lineHeight:1.55,marginBottom:8}}>{item.description}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:C.inkMid}}>{item.machineNumber} · {item.operationalUnit}</span>
                  <span style={{fontSize:10,color:C.inkLight}}>{maintName(MAINT_ADMINS,item.maintAdmin)}</span>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
      {visible.length===0&&<div style={{textAlign:"center",padding:"40px 20px"}}><Wrench size={36} color={C.inkLight}/><div style={{fontSize:13,color:C.inkLight,marginTop:8}}>No job cards yet</div></div>}

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480, background:C.surface,
        borderTop:`1px solid ${C.border}`, display:"flex",
        paddingBottom:"env(safe-area-inset-bottom,0)",
        boxShadow:"0 -4px 24px rgba(30,32,37,0.08)" }}>
        {[
          { id:"board", Icon:LayoutGrid, label:"BOARD" },
          { id:"raise", Icon:Wrench,     label:"RAISE" },
        ].map(n => (
          <button key={n.id} onClick={()=>setTab(n.id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              gap:3, padding:"11px 2px", background:"none", border:"none",
              color:tab===n.id?TEAL:C.inkLight, fontSize:8, letterSpacing:1,
              fontWeight:800, cursor:"pointer", fontFamily:FONT,
              borderTop:`2.5px solid ${tab===n.id?TEAL:"transparent"}` }}>
            <n.Icon size={18}/>
            {n.label}
          </button>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────
// QUALITY DESK LANDING PAGE
// ─────────────────────────────────────────────────────────
const QUAL_CATS = [
  { key:"product",   label:"Product Quality",    color:"#EF4444", bg:"rgba(239,68,68,0.10)"  },
  { key:"packaging", label:"Packaging",          color:"#F59E0B", bg:"rgba(245,158,11,0.10)" },
  { key:"delivery",  label:"Delivery/Logistics", color:"#8B5CF6", bg:"rgba(139,92,246,0.10)" },
  { key:"docs",      label:"Documentation",      color:TEAL,      bg:`${TEAL}18`             },
  { key:"other",     label:"Other",              color:"#64748B", bg:"rgba(100,116,139,0.10)"},
];
const qualPriColor = p => p==="CRITICAL"?"#9333EA":p==="HIGH"?C.open:p==="MEDIUM"?C.prog:C.teal;
const getQualCat = k => QUAL_CATS.find(c=>c.key===k) || QUAL_CATS[4];

const SEED_COMPLAINTS = [
  {
    id:"QC-001",
    customerName:"Acme Retail Group",
    product:"500ml corrugated shipper — batch B4521",
    department:"Litho Print",
    category:"product",
    priority:"HIGH",
    description:"Ink transfer on ~12% of units in latest shipment, print smudging visible on branding panel.",
    raisedBy:"Michael Downes", raisedAt:"2026-06-02 09:10",
    owner:"sibusiso", ownerInit:"SN", ownerColor:"#10B981",
    status:"OPEN",
    rootCause:"", correctiveAction:"", closeEvidence:null, comments:[],
    timeline:[
      { time:"2026-06-02 09:10", actor:"Michael Downes", action:"Complaint logged — Acme Retail Group", type:"raise" },
      { time:"2026-06-02 09:15", actor:"Michael Downes", action:"Assigned to Sibusiso Ngubane", type:"update" },
    ],
  },
];

function QualityDeskPage({ currentUser, onBack, items, setItems }) {
  const [tab,      setTab]      = useState("board");
  const [selected, setSelected] = useState(null);
  const [toast,    setToast]    = useState("");
  const [myOnly,      setMyOnly]      = useState(false);
  const [filter,      setFilter]      = useState("ALL");
  const [catFilter,   setCatFilter]   = useState("");
  const [showCatMenu, setShowCatMenu] = useState(false);

  useEffect(() => {
    (async () => {
      const rows = await sbFetch("complaints");
      if (Array.isArray(rows) && rows.length > 0) setItems(rows.map(r => r.data));
    })();
  }, []);

  // raise
  const [customerName, setCustomerName] = useState("");
  const [product,      setProduct]      = useState("");
  const [department,   setDepartment]   = useState("");
  const [category,     setCategory]     = useState("");
  const [priority,     setPriority]     = useState("MEDIUM");
  const [owner,        setOwner]        = useState("");
  const [desc,         setDesc]         = useState("");
  const [saving,       setSaving]       = useState(false);

  // close-out
  const [rootCause,        setRootCause]        = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [newComment,       setNewComment]       = useState("");

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2800); };
  const statColor = s => s==="CLOSED"?C.closed:s==="IN PROGRESS"?"#2563EB":C.open;
  const statBg    = s => s==="CLOSED"?C.closedBg:s==="IN PROGRESS"?"#DBEAFE":C.openBg;
  const soon      = () => showToast("This tab isn't built yet — coming soon");

  const persist = updated => {
    setItems(p => p.map(i => i.id===updated.id ? updated : i));
    if (selected?.id===updated.id) setSelected(updated);
    sbUpsert("complaints", { id:updated.id, data:updated, created_at:updated.raisedAt });
  };

  const handleRaise = () => {
    if (!customerName || !department || !category || !owner || !desc) { showToast("⚠ Please fill customer, department, category, owner and description"); return; }
    setSaving(true);
    const m = USERS.find(u=>u.id===owner);
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const item = {
      id:`QC-${String(items.length+1).padStart(3,"0")}`,
      customerName, product, department, category, priority, description:desc,
      raisedBy:currentUser.name, raisedAt:now,
      owner, ownerName:m.name, ownerInit:m.initials, ownerColor:m.color,
      status:"OPEN", rootCause:"", correctiveAction:"", closeEvidence:null, comments:[],
      timeline:[
        { time:now, actor:currentUser.name, action:`Complaint logged — ${customerName}`, type:"raise" },
        { time:now, actor:currentUser.name, action:`Assigned to ${m.name}`, type:"update" },
      ],
    };
    setItems(p => [item, ...p]);
    sbUpsert("complaints", { id:item.id, data:item, created_at:now });
    setSaving(false);
    showToast(`✓ ${item.id} logged — ${m.name} notified`);
    setCustomerName(""); setProduct(""); setDepartment(""); setCategory(""); setPriority("MEDIUM"); setOwner(""); setDesc("");
    setTimeout(() => setTab("board"), 500);
  };

  const updateStatus = (status) => {
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const upd = { time:now, actor:currentUser.name, action:`Status → ${status}`, type:"update" };
    const updated = { ...selected, status, timeline:[...selected.timeline, upd] };
    persist(updated);
    showToast(`✓ ${selected.id} updated`);
  };

  const closeComplaint = () => {
    if (!correctiveAction) { showToast("⚠ Add a corrective action before closing"); return; }
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const updated = {
      ...selected, rootCause, correctiveAction, status:"CLOSED",
      closeEvidence:{ note:correctiveAction },
      timeline:[...selected.timeline, { time:now, actor:currentUser.name, action:"Complaint closed — CAPA recorded", type:"update" }],
    };
    persist(updated);
    showToast(`✓ ${selected.id} closed`);
  };

  const postComment = () => {
    if (!newComment.trim()) return;
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const updated = { ...selected, comments:[...(selected.comments||[]), { time:now, actor:currentUser.name, text:newComment.trim() }] };
    persist(updated);
    setNewComment("");
  };

  // ── Detail view ──────────────────────────────────────────
  if (selected) {
    const s = selected;
    const c = getQualCat(s.category);
    const isOwner = USERS.find(u=>u.id===s.owner)?.name === currentUser.name;
    return (
      <Shell toast={toast}>
        <div style={{background:C.surface, borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",padding:"16px 16px 0",gap:10}}>
            <button onClick={()=>setSelected(null)} style={{ width:36, height:36, borderRadius:9,
              background:C.surface, border:`1px solid ${C.border}`, display:"flex", alignItems:"center",
              justifyContent:"center", cursor:"pointer" }}>
              <ArrowLeft size={16} color={C.ink}/>
            </button>
            <div style={{marginLeft:"auto",background:C.surfaceAlt,borderRadius:100,padding:"3px 14px",fontSize:12,fontWeight:900,color:C.inkMid,fontFamily:MONO}}>{s.id}</div>
          </div>
          <div style={{padding:"14px 16px 18px"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:c.bg,borderRadius:100,padding:"4px 12px",marginBottom:9}}>
              <Folder size={13} color={c.color}/><span style={{fontSize:11,fontWeight:800,color:c.color}}>{c.label}</span>
            </div>
            <div style={{fontSize:19,fontWeight:900,color:C.ink,marginBottom:5}}>{s.customerName}</div>
            <div style={{fontSize:12,color:C.inkMid}}>{s.product}</div>
          </div>
        </div>

        <div style={{padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            { label:"Status",     val:s.status,   color:statColor(s.status) },
            { label:"Priority",   val:s.priority, color:qualPriColor(s.priority) },
            { label:"Owner",      val:USERS.find(u=>u.id===s.owner)?.name || "—", color:C.inkMid },
            { label:"Department", val:s.department, color:C.inkMid },
          ].map(m => (
            <div key={m.label} style={{background:C.surfaceAlt,borderRadius:10,padding:"9px 12px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,color:C.inkLight,letterSpacing:2,marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:12,fontWeight:800,color:m.color}}>{m.val}</div>
            </div>
          ))}
        </div>

        <div style={{margin:"0 16px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:800,color:C.inkLight,letterSpacing:2,marginBottom:6}}>COMPLAINT DETAIL</div>
          <p style={{fontSize:12,color:C.ink,lineHeight:1.6,margin:0}}>{s.description}</p>
        </div>

        {/* Tabs — Comments live, rest stubbed */}
        <div style={{display:"flex",gap:14,padding:"0 16px",borderBottom:`1px solid ${C.border}`,marginBottom:14,overflowX:"auto"}}>
          {["Comments","Root Cause","CAPA","Holds","Documents"].map(t=>(
            <div key={t} onClick={()=> t!=="Comments" && soon()} style={{padding:"8px 2px",fontSize:12,fontWeight:700,color:t==="Comments"?TEAL:C.inkLight,borderBottom:t==="Comments"?`2px solid ${TEAL}`:"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}}>{t}</div>
          ))}
        </div>

        <div style={{padding:"0 16px 12px"}}>
          <textarea style={{...sx.textarea,marginBottom:8}} rows={2} placeholder="New comment…" value={newComment} onChange={e=>setNewComment(e.target.value)}/>
          <button style={{...sx.solidBtn,width:"100%",background:TEAL,flex:"none"}} onClick={postComment}>Post Comment</button>
          <div style={{marginTop:12}}>
            {(s.comments||[]).length===0 && <div style={{fontSize:12,color:C.inkLight,textAlign:"center",padding:"10px 0"}}>No comments yet</div>}
            {(s.comments||[]).map((cm,i)=>(
              <div key={i} style={{background:C.surfaceAlt,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:800,color:C.ink}}>{cm.actor}</div>
                <div style={{fontSize:12,color:C.inkMid,marginTop:2,lineHeight:1.5}}>{cm.text}</div>
                <div style={{fontSize:9,color:C.inkLight,marginTop:4,fontFamily:MONO}}>{cm.time}</div>
              </div>
            ))}
          </div>
        </div>

        {s.status!=="CLOSED" && (isOwner || currentUser.role==="Admin" || currentUser.role==="Auditor") && (
          <div style={{padding:"0 16px 28px"}}>
            <SHead label="INVESTIGATE & CLOSE"/>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:14}}>
              {s.status==="OPEN" && (
                <button style={{...sx.solidBtn,width:"100%",marginBottom:12,background:`linear-gradient(135deg,${C.prog},#FCD34D)`}} onClick={()=>updateStatus("IN PROGRESS")}>Acknowledge — Start Investigation</button>
              )}
              <FLabel text="ROOT CAUSE"/>
              <textarea style={{...sx.textarea,marginBottom:10}} rows={2} value={rootCause} onChange={e=>setRootCause(e.target.value)} placeholder="What caused this?"/>
              <FLabel text="CORRECTIVE ACTION (CAPA)"/>
              <textarea style={{...sx.textarea,marginBottom:12}} rows={3} value={correctiveAction} onChange={e=>setCorrectiveAction(e.target.value)} placeholder="Required to close — what was done to fix and prevent recurrence…"/>
              <button style={{...sx.solidBtn,width:"100%",background:`linear-gradient(135deg,${C.closed},#34D399)`}} onClick={closeComplaint}>Close Complaint</button>
            </div>
          </div>
        )}

        {s.status==="CLOSED" && (
          <div style={{margin:"0 16px 28px",background:C.closedBg,border:`1px solid ${C.closed}44`,borderRadius:12,padding:14}}>
            <div style={{fontSize:11,fontWeight:800,color:C.closed,letterSpacing:2,marginBottom:8}}>✓ COMPLAINT CLOSED</div>
            {s.rootCause && <div style={{fontSize:11,color:C.inkMid,marginBottom:6}}><strong>Root cause:</strong> {s.rootCause}</div>}
            {s.correctiveAction && <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{s.correctiveAction}</div>}
          </div>
        )}
      </Shell>
    );
  }

  // ── Raise view ───────────────────────────────────────────
  if (tab==="raise") return (
    <Shell toast={toast}>
      <div style={{background:`linear-gradient(135deg,${TEAL},${C.tealDk})`,padding:"14px 16px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button style={sx.backBtnW} onClick={()=>setTab("board")}>← Back</button>
          <div style={{fontSize:14,fontWeight:900,color:"#fff",letterSpacing:2}}>LOG COMPLAINT</div>
        </div>
      </div>
      <div style={{padding:"14px 16px"}}>
        <FLabel text="CUSTOMER NAME"/>
        <input style={{...sx.select,marginBottom:4}} value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="e.g. Acme Retail Group"/>
        <FLabel text="PRODUCT / BATCH"/>
        <input style={{...sx.select,marginBottom:4}} value={product} onChange={e=>setProduct(e.target.value)} placeholder="e.g. 500ml shipper — batch B4521"/>
        <FLabel text="DEPARTMENT"/>
        <select style={{...sx.select,marginBottom:4}} value={department} onChange={e=>setDepartment(e.target.value)}>
          <option value="">— Select department —</option>
          {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
        </select>
        <FLabel text="CATEGORY"/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {QUAL_CATS.map(c=>(
            <button key={c.key} onClick={()=>setCategory(c.key)}
              style={{flex:"1 1 30%",padding:"8px 4px",background:category===c.key?c.color:C.surfaceAlt,border:`1.5px solid ${category===c.key?c.color:C.border}`,borderRadius:10,cursor:"pointer"}}>
              <span style={{fontSize:9,fontWeight:800,color:category===c.key?"#fff":c.color}}>{c.label}</span>
            </button>
          ))}
        </div>
        <FLabel text="PRIORITY"/>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          {["LOW","MEDIUM","HIGH","CRITICAL"].map(p=>(
            <button key={p} onClick={()=>setPriority(p)}
              style={{flex:1,padding:"9px 4px",borderRadius:9,border:`1.5px solid ${qualPriColor(p)}`,background:priority===p?`linear-gradient(135deg,${qualPriColor(p)},${qualPriColor(p)}aa)`:"transparent",color:priority===p?"#fff":qualPriColor(p),fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:FONT}}>
              {p}
            </button>
          ))}
        </div>
        <FLabel text="ASSIGN OWNER"/>
        <select style={{...sx.select,marginBottom:4}} value={owner} onChange={e=>setOwner(e.target.value)}>
          <option value="">— Select owner —</option>
          {[...USERS].sort((a,b)=>a.name.localeCompare(b.name)).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <FLabel text="COMPLAINT DETAIL"/>
        <textarea style={{...sx.textarea,marginBottom:10}} rows={3} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe the customer's complaint…"/>
        <button style={{width:"100%",padding:"14px",background:customerName&&department&&category&&owner&&desc?`linear-gradient(135deg,${TEAL},${C.tealDk})`:C.surfaceAlt,border:"none",borderRadius:11,color:customerName&&department&&category&&owner&&desc?"#fff":C.inkLight,fontSize:14,fontWeight:800,letterSpacing:1,fontFamily:FONT,cursor:"pointer",opacity:saving?0.65:1}}
          onClick={handleRaise} disabled={saving}>
          ✅ Log Complaint &amp; Notify Owner
        </button>
      </div>
    </Shell>
  );

  // ── Board ────────────────────────────────────────────────
  const openCt   = items.filter(i=>i.status==="OPEN").length;
  const progCt   = items.filter(i=>i.status==="IN PROGRESS").length;
  const closedCt = items.filter(i=>i.status==="CLOSED").length;
  let visible = myOnly ? items.filter(i=>USERS.find(u=>u.id===i.owner)?.name===currentUser.name) : items;
  if (filter !== "ALL") visible = visible.filter(i=>i.status===filter);
  if (catFilter) visible = visible.filter(i=>i.category===catFilter);
  return (
    <Shell toast={toast}>
      <div style={{ background:C.surface, padding:"16px 16px 14px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onBack} style={{ width:40, height:40, borderRadius:10, background:C.surface,
              border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <ArrowLeft size={18} color={C.ink}/>
            </button>
            <div style={{ width:40, height:40, borderRadius:10, background:`${TEAL}14`,
              border:`1.5px solid ${TEAL}55`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <ShieldCheck size={18} color={TEAL}/>
            </div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontSize:16, fontWeight:900, color:C.ink }}>Quality Desk</div>
                <div style={{ fontSize:8, fontWeight:800, letterSpacing:0.5, color:C.prog, background:C.progBg, padding:"2px 8px", borderRadius:100 }}>QC MOBILE (TESTING)</div>
              </div>
              <div style={{ fontSize:9, color:C.inkLight, letterSpacing:2 }}>COMPLAINTS &amp; CAPA</div>
            </div>
          </div>
          <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:C.surface,
            border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, padding:"8px 12px",
            fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:FONT }}>
            <HomeIcon size={14}/> Home
          </button>
        </div>
        <div style={{background:`${C.prog}12`, border:`1px solid ${C.prog}33`, borderRadius:10, padding:"8px 12px", marginBottom:12, fontSize:11, color:C.inkMid, lineHeight:1.5}}>
          Pilot feature — findings logged here are reviewed and actioned in the main NCR system (Quality Desk) separately.
        </div>
        <button style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${C.tealDk})`,border:"none",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",boxShadow:`0 6px 24px ${TEAL}33`,textAlign:"left"}} onClick={()=>setTab("raise")}>
          <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}><ShieldCheck size={20} color="#fff"/></div>
          <div><div style={{fontSize:13,fontWeight:800,color:"#fff"}}>LOG COMPLAINT</div><div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:2}}>Customer · Product · Assign owner · CAPA</div></div>
          <ArrowRight size={16} color="rgba(255,255,255,0.8)" style={{marginLeft:"auto"}}/>
        </button>
      </div>

      <div style={{ display:"flex", margin:"12px 16px 0", background:C.surface,
        border:`1px solid ${C.border}`, borderRadius:12, boxShadow:C.shadow }}>
        {[{label:"OPEN",val:openCt,Icon:FileText,f:"OPEN"},{label:"IN PROGRESS",val:progCt,Icon:Clock,f:"IN PROGRESS"},{label:"CLOSED",val:closedCt,Icon:RefreshCw,f:"CLOSED"}].map((st,i)=>(
          <button key={st.label} onClick={()=>{setFilter(filter===st.f?"ALL":st.f);setMyOnly(false);}}
            style={{flex:1,background:"none",border:"none",borderLeft:i>0?`1px solid ${C.border}`:"none",padding:"12px 6px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",opacity:filter===st.f&&!myOnly?1:0.85}}>
            <st.Icon size={16} color={filter===st.f&&!myOnly?TEAL:C.inkLight}/>
            <div style={{fontSize:20,fontWeight:900,color:C.ink}}>{st.val}</div>
            <div style={{fontSize:8,color:C.inkLight,letterSpacing:0.5}}>{st.label}</div>
          </button>
        ))}
      </div>

      <div style={{ display:"flex", padding:"12px 16px 0", gap:8, alignItems:"center" }}>
        <div style={{ display:"flex", gap:14, flex:1, borderBottom:`1px solid ${C.border}`, overflowX:"auto" }}>
          <button onClick={()=>{setMyOnly(v=>!v);setFilter("ALL");}}
            style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none",
              borderBottom:`2px solid ${myOnly?TEAL:"transparent"}`, color:myOnly?TEAL:C.inkLight,
              fontSize:11, fontWeight:700, padding:"0 0 8px", cursor:"pointer", fontFamily:FONT, flexShrink:0 }}>
            <Av txt={currentUser.initials} color={currentUser.color} size={14}/> Mine
          </button>
          {[["ALL","All Complaints"],["OPEN","Open"],["IN PROGRESS","In Progress"],["CLOSED","Closed"]].map(([f,label])=>(
            <button key={f} onClick={()=>{setFilter(f);setMyOnly(false);}}
              style={{ background:"none", border:"none",
                borderBottom:`2px solid ${filter===f&&!myOnly?TEAL:"transparent"}`,
                color:filter===f&&!myOnly?TEAL:C.inkLight, fontSize:11, fontWeight:700, whiteSpace:"nowrap",
                padding:"0 0 8px", cursor:"pointer", fontFamily:FONT, flexShrink:0 }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ position:"relative", flexShrink:0 }}>
          <button onClick={()=>setShowCatMenu(v=>!v)}
            style={{ display:"flex", alignItems:"center", gap:6, background:C.surface,
              border:`1px solid ${catFilter?TEAL:C.border}`, borderRadius:9, padding:"7px 11px",
              fontSize:11, fontWeight:700, color:catFilter?TEAL:C.inkMid, cursor:"pointer", fontFamily:FONT }}>
            <FilterIcon size={13}/> Filter
          </button>
          {showCatMenu && (
            <div style={{ position:"absolute", top:"110%", right:0, background:C.surface,
              border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 24px rgba(30,32,37,0.14)",
              zIndex:20, minWidth:170, overflow:"hidden" }}>
              <button onClick={()=>{setCatFilter("");setShowCatMenu(false);}}
                style={{ width:"100%", textAlign:"left", padding:"9px 12px", background:!catFilter?C.surfaceAlt:"none",
                  border:"none", fontSize:11, fontWeight:700, color:C.ink, cursor:"pointer", fontFamily:FONT }}>
                All categories
              </button>
              {QUAL_CATS.map(c=>(
                <button key={c.key} onClick={()=>{setCatFilter(c.key);setShowCatMenu(false);}}
                  style={{ width:"100%", textAlign:"left", padding:"9px 12px", background:catFilter===c.key?C.surfaceAlt:"none",
                    border:"none", fontSize:11, fontWeight:700, color:c.color, cursor:"pointer", fontFamily:FONT }}>
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
        {visible.map((item,idx)=>{
          const c = getQualCat(item.category);
          const isOwner = USERS.find(u=>u.id===item.owner)?.name === currentUser.name;
          return (
            <div key={item.id} className="card" style={{animationDelay:`${idx*0.07}s`}}>
              <button style={{width:"100%",background:C.surface,border:`1px solid ${isOwner&&item.status==="OPEN"?`${C.open}55`:C.border}`,borderRadius:14,padding:"14px",cursor:"pointer",textAlign:"left",fontFamily:FONT,display:"flex",gap:12,boxShadow:C.shadow}} onClick={()=>setSelected(item)}>
                <div style={{ width:44, height:44, borderRadius:10, background:c.bg,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Folder size={18} color={c.color}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                    <div style={{background:c.bg,color:c.color,fontSize:10,fontWeight:800,padding:"2px 9px",borderRadius:100}}>{c.label}</div>
                    <div style={{background:`${qualPriColor(item.priority)}18`,color:qualPriColor(item.priority),fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:100}}>{item.priority}</div>
                    <div style={{background:statBg(item.status),color:statColor(item.status),fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:100}}>{item.status}</div>
                    {isOwner&&<div style={{background:`${currentUser.color}18`,color:currentUser.color,fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:100}}>MINE</div>}
                    <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                      <span style={{fontSize:10,color:C.inkLight,fontFamily:MONO}}>{item.id}</span>
                      <ArrowRight size={13} color={C.inkLight}/>
                    </div>
                  </div>
                  <div style={{fontSize:13,fontWeight:800,color:C.ink,marginBottom:4}}>{item.customerName}</div>
                  <div style={{fontSize:12,color:C.inkMid,lineHeight:1.55,marginBottom:10}}>{item.description}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <Av txt={item.ownerInit} color={item.ownerColor} size={22}/>
                      <span style={{fontSize:11,color:C.inkMid}}>{USERS.find(u=>u.id===item.owner)?.name}</span>
                    </div>
                    <span style={{fontSize:10,color:C.inkLight}}>{item.department}</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
      {visible.length===0&&<div style={{textAlign:"center",padding:"40px 20px"}}><ShieldCheck size={36} color={C.inkLight}/><div style={{fontSize:13,color:C.inkLight,marginTop:8}}>No complaints logged yet</div></div>}

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480, background:C.surface,
        borderTop:`1px solid ${C.border}`, display:"flex",
        paddingBottom:"env(safe-area-inset-bottom,0)",
        boxShadow:"0 -4px 24px rgba(30,32,37,0.08)" }}>
        {[
          { id:"board", Icon:LayoutGrid,  label:"BOARD" },
          { id:"raise", Icon:ShieldCheck, label:"RAISE" },
        ].map(n => (
          <button key={n.id} onClick={()=>setTab(n.id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              gap:3, padding:"11px 2px", background:"none", border:"none",
              color:tab===n.id?TEAL:C.inkLight, fontSize:8, letterSpacing:1,
              fontWeight:800, cursor:"pointer", fontFamily:FONT,
              borderTop:`2.5px solid ${tab===n.id?TEAL:"transparent"}` }}>
            <n.Icon size={18}/>
            {n.label}
          </button>
        ))}
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────
// FPA HOME SCREEN — S&G OpsApp
// ─────────────────────────────────────────────────────────
function FPAHome({ currentUser, onLogout, onModule, issues, gembaItems, jobCards, qualityItems }) {
  const [showMyLog, setShowMyLog] = useState(false);

  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Count open items per module for this user
  const my5sOpen    = (issues    ||[]).filter(i => i.manager===currentUser.name && i.status==="OPEN").length;
  const myGembaOpen = (gembaItems||[]).filter(i => i.owner  ===currentUser.name && i.status==="OPEN").length;
  const myMaintOpen = (jobCards  ||[]).filter(i => i.maintAdmin && MAINT_ADMINS.find(a=>a.id===i.maintAdmin)?.name===currentUser.name && i.status!=="CLOSED").length;
  const myQualOpen  = (qualityItems||[]).filter(i => USERS.find(u=>u.id===i.owner)?.name===currentUser.name && i.status!=="CLOSED").length;
  const myTotalOpen = my5sOpen + myGembaOpen;

  // All my open items combined for My Log
  const my5sItems    = (issues    ||[]).filter(i => i.manager===currentUser.name && i.status!=="CLOSED");
  const myGembaItems = (gembaItems||[]).filter(i => i.owner  ===currentUser.name && i.status!=="CLOSED");

  const modules = [
    { id:"5s",          Icon:ClipboardCheck,  label:"5S Housekeeping", desc:"Audits · Findings · Compliance scoring", color:TEAL,      status:"LIVE",        badge:my5sOpen    },
    { id:"gemba",       Icon:PersonStanding,  label:"Gemba Walks",     desc:"Floor observations · Action tracking",   color:"#8B5CF6", status:"LIVE",        badge:myGembaOpen },
    { id:"maintenance", Icon:Wrench,          label:"Maintenance",     desc:"Job cards · Planned maintenance",         color:"#F59E0B", status:"LIVE",        badge:myMaintOpen },
    { id:"quality",     Icon:ShieldCheck,     label:"Quality Desk",    desc:"Complaints · Holds · CAPA",               color:"#10B981", status:"LIVE",        badge:myQualOpen  },
  ];

  // MY LOG overlay
  if (showMyLog) return (
    <div style={{background:C.bg, minHeight:"100vh", fontFamily:FONT}}>
      <div style={{background:`linear-gradient(135deg,${currentUser.color}CC,${currentUser.color}88)`, padding:"20px 16px 22px"}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
          <button style={sx.backBtnW} onClick={()=>setShowMyLog(false)}>← Back</button>
          <div style={{fontSize:15, fontWeight:900, color:"#fff", letterSpacing:2}}>MY LOG</div>
          {myTotalOpen>0 && <div style={{background:"rgba(255,255,255,0.25)", borderRadius:100, padding:"3px 12px", fontSize:11, fontWeight:800, color:"#fff"}}>{myTotalOpen} open</div>}
        </div>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <Av txt={currentUser.initials} color="#fff" size={40}/>
          <div>
            <div style={{fontSize:16, fontWeight:900, color:"#fff"}}>{currentUser.name}</div>
            <div style={{fontSize:10, color:"rgba(255,255,255,0.7)", marginTop:2}}>All outstanding actions across modules</div>
          </div>
        </div>
      </div>

      <div style={{padding:"14px 16px"}}>
        {myTotalOpen===0 && (
          <div style={{textAlign:"center", padding:"48px 20px"}}>
            <div style={{fontSize:44}}>✓</div>
            <div style={{fontSize:14, fontWeight:700, color:C.inkLight, marginTop:10}}>All clear — no outstanding actions</div>
          </div>
        )}

        {my5sItems.length>0 && (
          <>
            <div style={{fontSize:10, color:TEAL, letterSpacing:3, fontWeight:800, marginBottom:10, marginTop:4}}>5S HOUSEKEEPING ({my5sItems.length})</div>
            {my5sItems.map(nc=>(
              <div key={nc.id} style={{background:C.surface, border:`1.5px solid ${nc.status==="OPEN"?`${C.open}55`:C.border}`, borderRadius:14, overflow:"hidden", marginBottom:10}}>
                <div style={{height:3, background:nc.scat?.grad||`linear-gradient(135deg,${TEAL},#22BDD0)`}}/>
                <div style={{padding:"11px 14px"}}>
                  <div style={{display:"flex", gap:6, alignItems:"center", marginBottom:6}}>
                    <div style={{background:nc.status==="OPEN"?C.openBg:C.progBg, color:nc.status==="OPEN"?C.open:C.prog, fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:100}}>{nc.status}</div>
                    {nc.severityBand&&<div style={{background:`${nc.severityBand.color}22`, color:nc.severityBand.color, fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:100}}>{nc.severityBand.label}</div>}
                    <div style={{marginLeft:"auto", fontSize:10, color:C.inkLight, fontFamily:MONO}}>{nc.id}</div>
                  </div>
                  <div style={{fontSize:13, fontWeight:800, color:C.ink, marginBottom:3}}>{nc.dept}</div>
                  <div style={{fontSize:11, color:C.inkMid, lineHeight:1.5, marginBottom:5}}>{nc.desc}</div>
                  {nc.dueDate&&<div style={{fontSize:10, color:new Date(nc.dueDate)<now?C.open:C.inkLight}}>Due {nc.dueDate}</div>}
                </div>
              </div>
            ))}
          </>
        )}

        {myGembaItems.length>0 && (
          <>
            <div style={{fontSize:10, color:"#8B5CF6", letterSpacing:3, fontWeight:800, marginBottom:10, marginTop:my5sItems.length>0?16:4}}>GEMBA WALKS ({myGembaItems.length})</div>
            {myGembaItems.map(item=>{
              const gc = GEMBA_CATS.find(c=>c.key===item.category)||GEMBA_CATS[5];
              return (
                <div key={item.id} style={{background:C.surface, border:`1.5px solid ${item.status==="OPEN"?`${C.open}55`:C.border}`, borderRadius:14, overflow:"hidden", marginBottom:10}}>
                  <div style={{height:3, background:gc.grad}}/>
                  <div style={{padding:"11px 14px"}}>
                    <div style={{display:"flex", gap:6, alignItems:"center", marginBottom:6}}>
                      <div style={{background:`${gc.color}22`, color:gc.color, fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:100}}>{gc.icon} {gc.label}</div>
                      <div style={{background:item.status==="OPEN"?C.openBg:C.progBg, color:item.status==="OPEN"?C.open:C.prog, fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:100}}>{item.status}</div>
                      <div style={{marginLeft:"auto", fontSize:10, color:C.inkLight, fontFamily:MONO}}>{item.id}</div>
                    </div>
                    <div style={{fontSize:13, fontWeight:800, color:C.ink, marginBottom:3}}>{item.area}</div>
                    <div style={{fontSize:11, color:C.inkMid, lineHeight:1.5, marginBottom:5}}>{item.desc}</div>
                    {item.dueDate&&<div style={{fontSize:10, color:new Date(item.dueDate)<now?C.open:C.inkLight}}>Due {item.dueDate}</div>}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{background:C.bg, minHeight:"100vh", fontFamily:FONT}}>
      {/* Header */}
      <div style={{background:`linear-gradient(160deg,#FFFFFF,#EDEFF3)`, padding:"28px 16px 20px", borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18}}>
          <div>
            <div style={{fontSize:10, color:TEAL, letterSpacing:4, fontWeight:800, marginBottom:4}}>SHAVE &amp; GIBSON</div>
            <div style={{fontSize:24, fontWeight:900, color:C.ink, letterSpacing:1}}>OpsApp</div>
          </div>
          <div style={{width:52, height:52, borderRadius:14, background:"#FFFFFF", border:`2px solid ${TEAL}44`, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <svg viewBox="0 0 100 120" width="34" height="34">
              <text x="2" y="72" fontSize="85" fontWeight="900" fontFamily="Arial Black,sans-serif" fill={SGREY}>S</text>
              <text x="34" y="114" fontSize="70" fontWeight="900" fontFamily="Arial Black,sans-serif" fill={TEAL}>G</text>
            </svg>
          </div>
        </div>

        {/* User card — tap for My Log */}
        <button onClick={()=>setShowMyLog(true)} style={{width:"100%", background:C.surface, border:`1px solid ${myTotalOpen>0?`${C.open}55`:C.border}`, borderRadius:14, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", textAlign:"left"}}>
          <Av txt={currentUser.initials} color={currentUser.color} size={44}/>
          <div style={{flex:1}}>
            <div style={{fontSize:12, color:C.inkLight}}>{greeting},</div>
            <div style={{fontSize:16, fontWeight:900, color:C.ink}}>{currentUser.name}</div>
            <div style={{fontSize:10, color:currentUser.color, marginTop:2}}>{currentUser.title}</div>
          </div>
          <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6}}>
            {myTotalOpen>0 ? (
              <>
                <div style={{background:C.open, color:"#fff", fontSize:14, fontWeight:900, width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center"}}>{myTotalOpen}</div>
                <div style={{fontSize:9, color:C.open, fontWeight:800}}>MY LOG →</div>
              </>
            ) : (
              <>
                <div style={{fontSize:10, color:C.closed}}>✓ All clear</div>
                <div style={{fontSize:9, color:C.inkLight}}>MY LOG →</div>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Modules */}
      <div style={{padding:"18px 16px"}}>
        <div style={{fontSize:10, color:C.inkLight, letterSpacing:3, fontWeight:800, marginBottom:12}}>MODULES</div>
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {modules.map(mod=>(
            <button key={mod.id} onClick={()=>mod.status==="LIVE"&&onModule(mod.id)}
              style={{width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderLeft:`4px solid ${mod.color}`, borderRadius:16, padding:0, cursor:mod.status==="LIVE"?"pointer":"default", textAlign:"left", overflow:"hidden", fontFamily:FONT, display:"block", boxShadow:C.shadow}}>
              <div style={{padding:"14px 16px", display:"flex", alignItems:"center", gap:12}}>
                <div style={{width:56, height:56, borderRadius:"50%", background:`${mod.color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  <mod.Icon size={24} color={mod.color}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16, fontWeight:900, color:mod.status==="LIVE"?C.ink:C.inkLight}}>{mod.label}</div>
                  <div style={{fontSize:11, color:C.inkLight, marginTop:2}}>{mod.desc}</div>
                </div>
                <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5}}>
                  {/* Badge for open items */}
                  {mod.badge>0 && (
                    <div style={{background:C.open, color:"#fff", fontSize:11, fontWeight:900, minWidth:22, height:22, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 6px"}}>{mod.badge}</div>
                  )}
                  <div style={{fontSize:9, fontWeight:800, letterSpacing:1, color:mod.status==="LIVE"?C.teal:C.inkLight, background:mod.status==="LIVE"?`${C.teal}18`:C.surfaceAlt, padding:"3px 9px", borderRadius:100}}>
                    {mod.status}
                  </div>
                  {mod.status==="LIVE"&&<ArrowRight size={16} color={C.teal}/>}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20}}>
          <button onClick={onLogout} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:8, color:C.inkLight, padding:"7px 14px", fontSize:11, cursor:"pointer", fontFamily:FONT}}>Sign out</button>
          <div style={{fontSize:9, color:C.border, letterSpacing:2}}>S&amp;G OPSAPP · v1.0</div>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// ROOT — defined last so all components above are ready
// ─────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => injectStyles(), []);
  const [currentUser,  setCurrentUser]  = useState(null);
  const [auditAnswers, setAuditAnswers] = useState(SEED_AUDITS);
  const [module,       setModule]       = useState(null);
  const [issues,       setIssues]       = useState(SEED_ISSUES);
  const [gembaItems,   setGembaItems]   = useState(SEED_GEMBA);
  const [jobCards,     setJobCards]     = useState(SEED_JOBCARDS);
  const [qualityItems, setQualityItems] = useState(SEED_COMPLAINTS);

  if (!currentUser) return <LoginScreen onLogin={u => { setCurrentUser(u); setModule(null); }}/>;

  if (module === "5s") return (
    <MainApp
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
      auditAnswers={auditAnswers}
      setAuditAnswers={setAuditAnswers}
      onHome={() => setModule(null)}
      issues={issues}
      setIssues={setIssues}
    />
  );
  if (module === "gemba")       return <GembaModule currentUser={currentUser} onBack={()=>setModule(null)} items={gembaItems} setItems={setGembaItems}/>;
  if (module === "maintenance") return <MaintenancePage currentUser={currentUser} onBack={()=>setModule(null)} items={jobCards} setItems={setJobCards}/>;
  if (module === "quality")     return <QualityDeskPage currentUser={currentUser} onBack={()=>setModule(null)} items={qualityItems} setItems={setQualityItems}/>;

  return (
    <FPAHome
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
      onModule={setModule}
      issues={issues}
      gembaItems={gembaItems}
      jobCards={jobCards}
      qualityItems={qualityItems}
    />
  );
}
