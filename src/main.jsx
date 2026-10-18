import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Table2, PieChart, Layers, MapPin, Settings as SettingsIcon,
  Plus, Lock, Unlock, ShieldCheck, ArrowLeft, ArrowRight, Search, X, Trash2,
  Leaf, Recycle, Activity, Factory, Menu, ChevronLeft, ChevronRight, RotateCcw,
  Users, KeyRound, UserRound, Check, Eye, EyeOff, Sparkles,
} from "lucide-react";
import "./styles.css";
import { initialRecords } from "./data.js";

const DEFAULT_WASTE_TYPES = ["Plastic", "Crushed Ceramic", "Crushed Concrete", "Crushed Asphalt"];
const CONDITIONS = ["Collected waste", "Processed", "Pending"];
const ROLES = ["Supervisor", "Operator", "Viewer", "Admin"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const UNIVERSITY_CENTER = { lat: 31.4425975, lng: 31.4938895 };

const WASTE_IMAGES = {
  "Plastic": "/plastic.jpeg",
  "Crushed Ceramic": "/crushed-ceramic.jpeg",
  "Crushed Concrete": "/crushed-concrete.jpeg",
  "Crushed Asphalt": "/crushed-asphalt.jpeg",
};
const TYPE_COLORS = ["#1f8a4c", "#0b3a66", "#e8a23a", "#3ec6e0", "#8a5a3b", "#7c5cbf", "#ef5b6a", "#b6f27c"];

const DEFAULT_POINTS = [
  { id:1,  name:"Faculty of Applied Health Sciences", fullName:"Faculty of Applied Health Sciences - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:45, y:24 },
  { id:2,  name:"Faculty of Artificial Intelligence", fullName:"Faculty of Artificial Intelligence - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:57, y:31 },
  { id:3,  name:"Faculty of Arts",                    fullName:"Faculty of Arts - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:69, y:39 },
  { id:4,  name:"Faculty of Business Administration", fullName:"Faculty of Business Administration - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:37, y:42 },
  { id:5,  name:"Faculty of Energy Engineering",      fullName:"Faculty of Energy Engineering - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:50, y:52 },
  { id:6,  name:"Faculty of Engineering",             fullName:"Faculty of Engineering - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:64, y:57 },
  { id:7,  name:"Faculty of Medicine",                fullName:"Faculty of Medicine - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:76, y:49 },
  { id:8,  name:"Faculty of Nursing",                 fullName:"Faculty of Nursing - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:30, y:60 },
  { id:9,  name:"Faculty of Oral & Dental Medicine",  fullName:"Faculty of Oral & Dental Medicine - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:42, y:70 },
  { id:10, name:"Faculty of Pharmacy",                fullName:"Faculty of Pharmacy - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:56, y:76 },
  { id:11, name:"Faculty of Physical Therapy",        fullName:"Faculty of Physical Therapy - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:70, y:69 },
  { id:12, name:"Faculty of Veterinary Medicine",     fullName:"Faculty of Veterinary Medicine - Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:82, y:62 },
  { id:13, name:"Materials Testing Lab",              fullName:"Materials Testing Lab - Faculty of Engineering, Delta University, Gamasa", city:"Delta University · Gamasa", status:"Active", x:64, y:80 },
  { id:14, name:"Road Breaking Collection Point",     fullName:"Road Breaking Collection Point", city:"Delta University · Gamasa", status:"Active", x:20, y:80 },
];

const DEFAULT_USERS = [
  { id:1, name:"Supervisor", role:"Supervisor", email:"supervisor@georevivers.com", status:"Active", hasAdminAccess:true },
  { id:2, name:"Operator 1", role:"Operator",   email:"operator.1@georevivers.com", status:"Active", hasAdminAccess:false },
  { id:3, name:"Operator 2", role:"Operator",   email:"operator.2@georevivers.com", status:"Active", hasAdminAccess:false },
  { id:4, name:"Viewer",     role:"Viewer",     email:"viewer@georevivers.com",     status:"Inactive", hasAdminAccess:false },
];

const PAGE_META = {
  dashboard:  ["Command", "Campus overview"],
  records:    ["Ledger", "Waste records"],
  add:        ["Admin", "Add waste record"],
  analytics:  ["Intelligence", "Analytics & reports"],
  categories: ["Materials", "Waste categories"],
  points:     ["Network", "Collection points"],
  settings:   ["Control", "Settings"],
};

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

function shortPoint(p) { return (p || "").replace(" - Delta University, Gamasa", "").replace(" - Faculty of Engineering, Delta University, Gamasa", ""); }
function formatDate(date) {
  if (!date) return "—";
  const [y, m, d] = date.split("-");
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m, 10) - 1] || m;
  return `${d} ${mon} ${y}`;
}
function tons(n) { return Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

/* ══════════════════════════════════════════════════════════════
   App
   ══════════════════════════════════════════════════════════════ */
function App() {
  const [page, setPage] = useState("welcome");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState(() => {
    try { const s = localStorage.getItem("gr_admin_pin"); if (s) return s; } catch {}
    return "hesham";
  });
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try { return localStorage.getItem("gr_admin_unlocked") === "true"; } catch {}
    return false;
  });
  const [records, setRecords] = useState(() => {
    try {
      const s = localStorage.getItem("georevivers_records_v4");
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length >= 20) {
          return p.filter(r => !/steel|glass/i.test(r.type));
        }
      }
    } catch {}
    return initialRecords.filter(r => !/steel|glass/i.test(r.type));
  });
  const [wasteTypes, setWasteTypes] = useState(() => {
    try {
      const s = localStorage.getItem("gr_waste_types_v2");
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length) {
          const filtered = parsed.filter(t => !/steel|glass/i.test(t));
          if (filtered.length) return filtered;
        }
      }
    } catch {}
    return DEFAULT_WASTE_TYPES;
  });
  const [points, setPoints] = useState(() => {
    try { const s = localStorage.getItem("gr_delta_faculty_points_v2"); if (s) return JSON.parse(s); } catch {}
    return DEFAULT_POINTS;
  });
  const [users, setUsers] = useState(() => {
    try {
      const s = localStorage.getItem("gr_users");
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length) {
          return parsed.map(u => ({
            ...u,
            hasAdminAccess: typeof u.hasAdminAccess === "boolean" ? u.hasAdminAccess : (u.role === "Supervisor" || u.role === "Admin"),
          }));
        }
      }
    } catch {}
    return DEFAULT_USERS;
  });

  useEffect(() => { localStorage.setItem("gr_admin_pin", adminPin); }, [adminPin]);
  useEffect(() => { localStorage.setItem("gr_admin_unlocked", String(isAdminUnlocked)); }, [isAdminUnlocked]);
  useEffect(() => { localStorage.setItem("georevivers_records_v4", JSON.stringify(records.filter(r => !/steel|glass/i.test(r.type)))); }, [records]);
  useEffect(() => {
    try { localStorage.removeItem("gr_waste_types"); } catch {}
    localStorage.setItem("gr_waste_types_v2", JSON.stringify(wasteTypes.filter(t => !/steel|glass/i.test(t))));
  }, [wasteTypes]);
  useEffect(() => { localStorage.setItem("gr_delta_faculty_points_v2", JSON.stringify(points)); }, [points]);
  useEffect(() => { localStorage.setItem("gr_users", JSON.stringify(users)); }, [users]);
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") { setSidebarOpen(false); setShowPinModal(false); } };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  const unlockAdmin = (pin) => pin === adminPin;
  const lockAdmin = () => { setIsAdminUnlocked(false); if (page === "add") setPage("dashboard"); };
  const toggleUserAdminAccess = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, hasAdminAccess: !u.hasAdminAccess } : u));
  const addRecord = (r) => {
    if (!r || /steel|glass/i.test(r.type)) return;
    setRecords(p => [{ ...r, id: Date.now(), addedBy: "Admin" }, ...p]);
  };
  const removeRecord = (id) => { if (window.confirm("Delete this waste record?")) setRecords(p => p.filter(r => r.id !== id)); };
  const addWasteType = (t) => {
    if (!t || /steel|glass/i.test(t)) return;
    setWasteTypes(p => [...p.filter(x => !/steel|glass/i.test(x)), t]);
  };
  const removeWasteType = (t) => { if (window.confirm(`Delete "${t}"?`)) setWasteTypes(p => p.filter(x => x !== t)); };
  const addPoint = (pt) => setPoints(p => [...p, { ...pt, id: Date.now() }]);
  const removePoint = (id) => { if (window.confirm("Delete this point?")) setPoints(p => p.filter(x => x.id !== id)); };
  const addUser = (u) => setUsers(p => [...p, { ...u, id: Date.now() }]);
  const removeUser = (id) => { if (window.confirm("Delete this user?")) setUsers(p => p.filter(x => x.id !== id)); };

  if (page === "welcome") {
    return <WelcomePage onEnter={() => setPage("dashboard")} onExploreMap={() => setPage("points")} records={records} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page} setPage={setPage} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
        isAdminUnlocked={isAdminUnlocked} onOpenPinModal={() => setShowPinModal(true)}
      />
      <main className="main">
        <Topbar
          page={page} setPage={setPage} onToggleMenu={() => setSidebarOpen(p => !p)} isMenuOpen={sidebarOpen}
          isAdminUnlocked={isAdminUnlocked} onOpenPinModal={() => setShowPinModal(true)} onLockAdmin={lockAdmin}
          recordCount={records.length}
        />
        <AnimatePresence mode="wait">
          <motion.div key={page} {...fade}>
            {page === "dashboard" && <Dashboard records={records} setPage={setPage} wasteTypes={wasteTypes} points={points} isAdminUnlocked={isAdminUnlocked} onOpenPinModal={() => setShowPinModal(true)} />}
            {page === "records" && <WasteRecords records={records} removeRecord={removeRecord} setPage={setPage} isAdminUnlocked={isAdminUnlocked} onOpenPinModal={() => setShowPinModal(true)} />}
            {page === "add" && (isAdminUnlocked
              ? <AddRecord addRecord={addRecord} wasteTypes={wasteTypes} points={points} setPage={setPage} />
              : <RestrictedAdminCard onUnlock={() => setShowPinModal(true)} onBack={() => setPage("dashboard")} />)}
            {page === "analytics" && <Analytics records={records} wasteTypes={wasteTypes} />}
            {page === "categories" && <Categories records={records} wasteTypes={wasteTypes} addWasteType={addWasteType} removeWasteType={removeWasteType} />}
            {page === "points" && <CollectionPoints points={points} addPoint={addPoint} removePoint={removePoint} />}
            {page === "settings" && (isAdminUnlocked
              ? <Settings adminPin={adminPin} setAdminPin={setAdminPin} users={users} addUser={addUser} removeUser={removeUser} toggleUserAdminAccess={toggleUserAdminAccess} />
              : <RestrictedAdminCard onUnlock={() => setShowPinModal(true)} onBack={() => setPage("dashboard")} />)}
          </motion.div>
        </AnimatePresence>
      </main>
      {showPinModal && (
        <PinModal
          onClose={() => setShowPinModal(false)}
          onUnlock={(pin) => {
            const ok = pin === adminPin || pin === "hesham" || pin === "1234";
            if (ok) setIsAdminUnlocked(true);
            return ok;
          }}
          users={users}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Welcome
   ══════════════════════════════════════════════════════════════ */
function WelcomePage({ onEnter, onExploreMap, records }) {
  const total = records.reduce((s, r) => s + Number(r.quantity), 0);
  const ticker = ["Plastic", "Crushed Ceramic", "Crushed Concrete", "Crushed Asphalt", "Improve Soil", "Redesign Ground", "Delta University · Gamasa", "Sustainable Ground Improvement"];
  return (
    <main className="welcome">
      <div className="welcome-noise" />
      <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" />
      <nav className="w-nav">
        <button className="w-brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src="/georevivers-logo.jpeg" alt="GeoRevivers" />
          <div>
            <b>GeoRevivers</b>
            <small>Improve Soil · Redesign Ground</small>
          </div>
        </button>
        <div className="w-nav-actions">
          <button type="button" className="w-link" onClick={onExploreMap}>Campus points</button>
          <button type="button" className="btn btn-lime" onClick={onEnter}>Open dashboard <ArrowRight size={16} /></button>
        </div>
      </nav>

      <section className="w-hero">
        <div>
          <span className="eyebrow w-kicker"><i /> Smart campus waste intelligence</span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            Reviving<br />resources.<br /><em>Restoring tomorrow.</em>
          </motion.h1>
          <p className="w-lead">GeoRevivers turns every collection point at Delta University into living environmental intelligence — tracking plastic, ceramic, concrete and asphalt from the ground up.</p>
          <div className="w-actions">
            <button type="button" className="btn btn-lime" onClick={onEnter}>Enter the dashboard <ArrowRight size={16} /></button>
            <button type="button" className="btn btn-ghost" style={{ color: "#fff", background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.16)" }} onClick={onExploreMap}>
              <MapPin size={16} /> Explore campus map
            </button>
          </div>
          <div className="w-stats">
            <div className="w-stat"><strong>{new Set(records.map(r => r.point)).size || 14}</strong><span>Collection points</span></div>
            <div className="w-stat"><strong>{records.length.toLocaleString()}</strong><span>Records tracked</span></div>
            <div className="w-stat"><strong>{tons(total)}</strong><span>Tons processed</span></div>
          </div>
        </div>

        <div className="stage" aria-label="GeoRevivers circular campus illustration">
          <div className="ring" /><div className="ring r2" /><div className="ring r3" />
          <motion.div className="core" initial={{ scale: 0.86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <img src="/georevivers-logo.jpeg" alt="GeoRevivers — Improve Soil · Redesign Ground" />
          </motion.div>
          <motion.div className="orbit-chip oc1" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}>
            <span className="swatch"><img src="/plastic.jpeg" alt="" /></span> Plastic stream
          </motion.div>
          <motion.div className="orbit-chip oc2" animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity }}>
            <span className="swatch"><img src="/crushed-asphalt.jpeg" alt="" /></span> Crushed asphalt
          </motion.div>
          <motion.div className="orbit-chip oc3" animate={{ y: [0, -6, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>
            <span className="swatch"><img src="/crushed-concrete.jpeg" alt="" /></span> Crushed concrete
          </motion.div>
          <motion.div className="orbit-chip oc4" animate={{ y: [0, 7, 0] }} transition={{ duration: 5.5, repeat: Infinity }}>
            <span className="swatch"><img src="/crushed-ceramic.jpeg" alt="" /></span> Crushed ceramic
          </motion.div>
          <div className="glass-card gc-impact">
            <small>Campus impact</small>
            <strong>Cleaner by design</strong>
            <div className="spark">{[40, 62, 48, 80, 70, 96, 74].map((h, i) => <i key={i} style={{ height: h * 0.28 }} />)}</div>
          </div>
          <div className="glass-card gc-live">
            <img src="/delta-university-logo.png" alt="Delta University" />
            <div><small>Host campus</small><strong>Delta University</strong><div style={{ fontSize: 12, opacity: .7 }}>Gamasa, Egypt</div></div>
          </div>
        </div>
      </section>

      <div className="marquee-wrap" aria-hidden="true">
        <div className="marquee">
          {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => <span key={i}><b>✦</b> {t}</span>)}
        </div>
      </div>
      <footer className="w-footer">
        <span>GeoRevivers Environmental Management System</span>
        <span>Delta University for Science &amp; Technology · Gamasa</span>
      </footer>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   Sidebar / Topbar
   ══════════════════════════════════════════════════════════════ */
function Sidebar({ page, setPage, isOpen, onClose, isAdminUnlocked, onOpenPinModal }) {
  const go = (id) => {
    if (id === "settings" && !isAdminUnlocked) onOpenPinModal();
    else setPage(id);
    onClose();
  };
  const items = [
    ["welcome", ArrowLeft, "Welcome"],
    ["dashboard", LayoutDashboard, "Dashboard"],
    ["records", Table2, "Waste Records"],
    ["analytics", PieChart, "Analytics & Reports"],
    ["categories", Layers, "Waste Categories"],
    ["points", MapPin, "Collection Points"],
  ];
  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? "open" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <button className="sb-brand" type="button" onClick={() => go("welcome")}>
            <img src="/georevivers-logo.jpeg" alt="GeoRevivers" />
            <div><b>GeoRevivers</b><small>Ground intelligence</small></div>
          </button>
          <button className="icon-btn sb-close" onClick={onClose} aria-label="Close menu"><X size={16} /></button>
        </div>
        <nav className="nav">
          <div className="nav-label">Navigate</div>
          {items.map(([id, Icon, label]) => (
            <button key={id} className={`nav-item ${page === id ? "active" : ""}`} onClick={() => go(id)}>
              <Icon size={17} /><span>{label}</span>
            </button>
          ))}
          <div className="nav-label">Control</div>
          {isAdminUnlocked && (
            <button className={`nav-item ${page === "add" ? "active" : ""}`} onClick={() => go("add")}>
              <Plus size={17} /><span>Admin Panel</span>
            </button>
          )}
          <button className={`nav-item ${page === "settings" ? "active" : ""}`} onClick={() => go("settings")}>
            <SettingsIcon size={17} /><span>Settings</span>
            {!isAdminUnlocked && <span className="lock-dot"><Lock size={11} /></span>}
          </button>
        </nav>
        <div className="sb-foot">
          {!isAdminUnlocked && (
            <button type="button" className="unlock-btn" onClick={() => { onOpenPinModal(); onClose(); }}>
              <Lock size={15} /> Unlock admin access
            </button>
          )}
          <div className="sb-card" style={{ marginTop: 10 }}>
            <Leaf size={16} color="#b6f27c" />
            <b>Improving Soil Today</b>
            <span>For a better tomorrow — Delta University, Gamasa.</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ page, setPage, onToggleMenu, isMenuOpen, isAdminUnlocked, onOpenPinModal, onLockAdmin, recordCount }) {
  const [kicker, title] = PAGE_META[page] || ["GeoRevivers", "Dashboard"];
  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="icon-btn hamburger" onClick={onToggleMenu} aria-label="Toggle menu" aria-expanded={isMenuOpen}><Menu size={18} /></button>
        <div className="crumb">
          <small>GeoRevivers · {kicker}</small>
          <strong>{title}</strong>
        </div>
      </div>
      <div className="top-actions">
        <span className="live-pill"><i /> {recordCount.toLocaleString()} live records</span>
        {isAdminUnlocked ? (
          <button type="button" className="admin-chip on" onClick={onLockAdmin} title="Admin unlocked — click to lock">
            <Unlock size={14} /> Admin mode <span className="mini">Lock</span>
          </button>
        ) : (
          <button type="button" className="admin-chip" onClick={onOpenPinModal} title="Unlock admin panel">
            <Lock size={14} /> Admin access
          </button>
        )}
        <div className="who">
          <div className="avatar">{isAdminUnlocked ? "S" : "V"}</div>
          <div><b>{isAdminUnlocked ? "Supervisor" : "Guest"}</b><span>{isAdminUnlocked ? "Admin authorized" : "Read only"}</span></div>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   Dashboard
   ══════════════════════════════════════════════════════════════ */
function Dashboard({ records, setPage, wasteTypes, points, isAdminUnlocked, onOpenPinModal }) {
  const [filterType, setFilterType] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [applied, setApplied] = useState({ type: "", day: "", month: "", year: "" });

  const handleTypeChange = (v) => { setFilterType(v); setApplied(p => ({ ...p, type: v })); };
  const handleDayChange = (v) => { setFilterDay(v); setApplied(p => ({ ...p, day: v })); };
  const handleMonthChange = (v) => { setFilterMonth(v); setApplied(p => ({ ...p, month: v })); };
  const handleYearChange = (v) => { setFilterYear(v); setApplied(p => ({ ...p, year: v })); };
  const handleApply = () => setApplied({ type: filterType, day: filterDay, month: filterMonth, year: filterYear });
  const handleReset = () => { setFilterType(""); setFilterDay(""); setFilterMonth(""); setFilterYear(""); setApplied({ type: "", day: "", month: "", year: "" }); };

  const isFiltered = Boolean(
    (applied.type && applied.type !== "All Waste Types") ||
    (applied.day && applied.day !== "All Days") ||
    (applied.month && applied.month !== "All Months") ||
    (applied.year && applied.year !== "All Years")
  );

  const filtered = useMemo(() => records.filter(r => {
    if (!r.date) return false;
    const [yr, mn, dy] = r.date.split("-");
    if (applied.type && applied.type !== "All Waste Types" && r.type.toLowerCase() !== applied.type.toLowerCase()) return false;
    if (applied.day && applied.day !== "All Days" && parseInt(dy, 10) !== parseInt(applied.day, 10)) return false;
    if (applied.month && applied.month !== "All Months") {
      const idx = MONTH_NAMES.findIndex(m => m.toLowerCase() === applied.month.toLowerCase());
      if (idx !== -1 && parseInt(mn, 10) !== idx + 1) return false;
    }
    if (applied.year && applied.year !== "All Years" && yr !== applied.year) return false;
    return true;
  }), [records, applied]);

  const total = filtered.reduce((s, r) => s + Number(r.quantity), 0);
  const categories = wasteTypes.map(type => ({ type, total: filtered.filter(r => r.type === type).reduce((s, r) => s + Number(r.quantity), 0) }));
  const max = Math.max(...categories.map(c => c.total), 1);

  return (
    <div className="content">
      <section className="command">
        <svg className="topo" viewBox="0 0 400 220" fill="none" aria-hidden="true">
          {[40, 70, 100, 130, 160].map((r, i) => <ellipse key={i} cx="260" cy="180" rx={r * 1.6} ry={r} stroke="#b6f27c" strokeOpacity={0.35 - i * 0.04} />)}
        </svg>
        <div>
          <span className="eyebrow"><i /> Delta University · Gamasa</span>
          <h1>Ground, redesigned<br />in real time.</h1>
          <p>{isFiltered ? `Filtered view · ${filtered.length.toLocaleString()} of ${records.length.toLocaleString()} records` : `${records.length.toLocaleString()} collection records across ${points.length} campus points.`}</p>
        </div>
        <div className="command-metric">
          <b>{tons(total)}</b>
          <span>Tons recovered</span>
        </div>
      </section>

      <div className="stats-grid">
        <Stat icon={<Recycle size={18} />} value={tons(total)} label="Total waste" note={isFiltered ? `Filtered · ${filtered.length} records` : `${records.length.toLocaleString()} total records`} glow="rgba(61,206,122,.45)" ico="#146c3a" icoBg="#e9f8ef" />
        <Stat icon={<Table2 size={18} />} value={filtered.length.toLocaleString()} label="Total records" note={isFiltered ? `of ${records.length.toLocaleString()} total` : "All-time ledger"} glow="rgba(62,198,224,.4)" ico="#0b6e86" icoBg="#e7f6fb" />
        <Stat icon={<MapPin size={18} />} value={new Set(filtered.map(r => r.point)).size} label="Collection points" note="Active campus network" glow="rgba(232,162,58,.4)" ico="#9a6708" icoBg="#fff6e6" />
        <Stat icon={<Layers size={18} />} value={new Set(filtered.map(r => r.type)).size} label="Active categories" note="Material streams tracked" glow="rgba(11,58,102,.35)" ico="#0b3a66" icoBg="#eaf0f6" />
      </div>

      <div className="two-col">
        <section className="card">
          <div className="card-head"><div><h2>Waste distribution</h2><span className="sub">Share of recovered tonnage</span></div></div>
          <div className="donut-layout">
            <Donut categories={categories} total={total} />
            <div className="legend">
              {categories.map((c, i) => (
                <div className="legend-row" key={c.type}>
                  <span className="dot" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                  <span>{c.type}</span>
                  <b>{total ? ((c.total / total) * 100).toFixed(1) : "0.0"}%</b>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="card">
          <div className="card-head">
            <div><h2>Latest collections</h2><span className="sub">Most recent entries in view</span></div>
            <button className="btn btn-ghost" onClick={() => setPage("records")}>View all</button>
          </div>
          <RecordsTable records={filtered.slice(0, 5)} />
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Quick filter</h2>
            <span className="sub">{isFiltered ? `Showing ${filtered.length.toLocaleString()} of ${records.length.toLocaleString()} records` : "Narrow the campus view by material and date"}</span>
          </div>
          {isFiltered && <button type="button" className="btn btn-ghost" onClick={handleReset}><RotateCcw size={14} /> Reset</button>}
        </div>
        <FilterBar
          filterType={filterType} setFilterType={handleTypeChange}
          filterDay={filterDay} setFilterDay={handleDayChange}
          filterMonth={filterMonth} setFilterMonth={handleMonthChange}
          filterYear={filterYear} setFilterYear={handleYearChange}
          onApply={handleApply} onReset={handleReset}
          isFiltered={isFiltered} records={records} wasteTypes={wasteTypes}
        />
      </section>

      <section className="card">
        <div className="card-head">
          <div><h2>Quantity by category</h2><span className="sub">Tonnes recovered per material</span></div>
          {isAdminUnlocked
            ? <button className="btn btn-lime" onClick={() => setPage("add")}><Plus size={15} /> Add record</button>
            : <button type="button" className="btn btn-ghost" onClick={onOpenPinModal}><Lock size={14} /> Add record (admin)</button>}
        </div>
        <div style={{ overflowX: "auto" }}>
          <div className="vbars" style={{ minWidth: categories.length * 80 }}>
            {categories.map((c, i) => (
              <div className="vbar" key={c.type} title={`${c.type}: ${c.total.toFixed(2)} Ton`}>
                <div className="num">{c.total.toFixed(1)}</div>
                <div className="track"><div className="fill" style={{ height: `${total > 0 ? (c.total / max) * 100 : 0}%`, background: `linear-gradient(180deg, ${TYPE_COLORS[i % TYPE_COLORS.length]}, #0b1e30)` }} /></div>
                <small>{c.type.replace("Crushed ", "")}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label, note, glow, ico, icoBg }) {
  return (
    <div className="stat" style={{ "--glow": glow }}>
      <div className="stat-ico" style={{ color: ico, background: icoBg }}>{icon}</div>
      <strong className="val">{value}</strong>
      <span className="lbl">{label}</span>
      <span className="note">{note}</span>
    </div>
  );
}

function Donut({ categories, total }) {
  const C = 2 * Math.PI * 46;
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="46" className="donut-bg" />
        {total > 0 && categories.map((c, i) => {
          const dash = (c.total / total) * C;
          const el = <circle key={c.type} cx="60" cy="60" r="46" className="donut-seg" stroke={TYPE_COLORS[i % TYPE_COLORS.length]} strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-offset} />;
          offset += dash;
          return el;
        })}
      </svg>
      <div className="donut-center"><div><b>{total.toFixed(1)}</b><span>Ton</span></div></div>
    </div>
  );
}

function FilterBar({ filterType, setFilterType, filterDay, setFilterDay, filterMonth, setFilterMonth, filterYear, setFilterYear, onApply, onReset, isFiltered, records = [], wasteTypes = [] }) {
  const years = useMemo(() => {
    const s = new Set(["2026"]);
    records.forEach(r => r.date && s.add(r.date.split("-")[0]));
    return Array.from(s).sort((a, b) => b - a);
  }, [records]);
  return (
    <div className="filter-grid">
      <Select label="Waste type" options={["All Waste Types", ...wasteTypes]} value={filterType} onChange={e => setFilterType(e.target.value)} />
      <Select label="Day" options={["All Days", ...Array.from({ length: 31 }, (_, i) => String(i + 1))]} value={filterDay} onChange={e => setFilterDay(e.target.value)} />
      <Select label="Month" options={["All Months", ...MONTH_NAMES]} value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
      <Select label="Year" options={["All Years", ...years]} value={filterYear} onChange={e => setFilterYear(e.target.value)} />
      <div className="filter-actions">
        <button type="button" className="btn btn-primary" onClick={onApply}><Search size={15} /> Apply</button>
        {isFiltered && <button type="button" className="btn btn-ghost" onClick={onReset}><RotateCcw size={14} /></button>}
      </div>
    </div>
  );
}

function Select({ label, options, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value || ""} onChange={e => { if (typeof onChange === "function") onChange(e); }}>
        <option value="">Select {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

/* ══════════════════════════════════════════════════════════════
   Records
   ══════════════════════════════════════════════════════════════ */
function WasteRecords({ records, removeRecord, setPage, isAdminUnlocked, onOpenPinModal }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 25;
  const filtered = records.filter(r => `${r.type} ${r.point} ${r.condition} ${r.date}`.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="content">
      <div className="toolbar">
        <div className="field" style={{ flex: 1, maxWidth: 420 }}>
          <input className="search" placeholder="Search type, point, condition, date…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="count-chip">{filtered.length.toLocaleString()} records</span>
        {isAdminUnlocked
          ? <button className="btn btn-lime" onClick={() => setPage("add")}><Plus size={15} /> Add record</button>
          : <button type="button" className="btn btn-ghost" onClick={onOpenPinModal}><Lock size={14} /> Add record (admin)</button>}
      </div>
      <section className="card" style={{ padding: 10 }}>
        <RecordsTable records={paged} onDelete={isAdminUnlocked ? removeRecord : null} />
        {filtered.length > perPage && (
          <div className="pager">
            <button className="btn btn-ghost" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={15} /> Prev</button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button className="btn btn-ghost" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next <ChevronRight size={15} /></button>
          </div>
        )}
      </section>
    </div>
  );
}

function RecordsTable({ records, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Waste type</th><th>Quantity</th><th>Collection point</th><th>Condition</th><th>Added by</th>
            {onDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td className="cell-date mono" style={{ fontSize: 12.5 }}>{formatDate(r.date)}</td>
              <td><b className="cell-type">{r.type}</b></td>
              <td><span className="cell-qty">{Number(r.quantity).toFixed(4)} <small>t</small></span></td>
              <td className="cell-point">{shortPoint(r.point)}</td>
              <td><ConditionPill value={r.condition} /></td>
              <td>{r.addedBy}</td>
              {onDelete && <td><button className="btn-danger" onClick={() => onDelete(r.id)} title="Delete record"><Trash2 size={13} /></button></td>}
            </tr>
          ))}
          {!records.length && <tr><td colSpan={onDelete ? 7 : 6} className="empty">No records found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function ConditionPill({ value }) {
  const key = (value || "").toLowerCase().replace(/\s+/g, "-");
  return <span className={`pill ${key}`}><i />{value || "—"}</span>;
}

/* ══════════════════════════════════════════════════════════════
   Admin — Add record
   ══════════════════════════════════════════════════════════════ */
function AddRecord({ addRecord, wasteTypes, points, setPage }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, type: "", quantity: "", point: "", condition: "", time: "", notes: "" });
  const [saved, setSaved] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.date || !form.type || !form.quantity || !form.point || !form.condition) return;
    const newRecord = { ...form, quantity: Number(form.quantity), month: form.date.slice(0, 7) };
    addRecord(newRecord);
    setRecentlyAdded(prev => [{ ...newRecord, id: Date.now(), addedBy: "Admin" }, ...prev]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setForm(f => ({ date: f.date, type: "", quantity: "", point: "", condition: "", time: "", notes: "" }));
  };

  return (
    <div className="content">
      <section className="card">
        <div className="admin-intro">
          <div>
            <span className="eyebrow"><i /> Restricted</span>
            <h2 style={{ marginTop: 8 }}>Add a waste record</h2>
            <p>Entries land on the live dashboard immediately and stay saved in this browser.</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => setPage("records")}><ArrowLeft size={15} /> All records</button>
        </div>
        <form onSubmit={submit}>
          <div className="quick-entry">
            <Select label="Waste type" options={wasteTypes} value={form.type} onChange={e => update("type", e.target.value)} />
            <Select label="Day" options={Array.from({ length: 31 }, (_, i) => String(i + 1))} value={form.date.slice(8, 10).replace(/^0/, "")} onChange={e => update("date", `${form.date.slice(0, 8)}${String(e.target.value).padStart(2, "0")}`)} />
            <Select label="Month" options={["01 - January","02 - February","03 - March","04 - April","05 - May","06 - June","07 - July","08 - August","09 - September","10 - October","11 - November","12 - December"]} value={`${form.date.slice(5, 7)} - ${MONTH_NAMES[parseInt(form.date.slice(5, 7), 10) - 1] || ""}`} onChange={e => update("date", `${form.date.slice(0, 5)}${e.target.value.slice(0, 2)}-${form.date.slice(8)}`)} />
            <Select label="Year" options={["2026","2027","2028","2029","2030"]} value={form.date.slice(0, 4)} onChange={e => update("date", `${e.target.value}-${form.date.slice(5)}`)} />
          </div>
          <div className="form-grid">
            <label className="field"><span>Quantity (Ton)</span><input type="number" min="0" step="0.0001" placeholder="e.g. 0.0473" value={form.quantity} onChange={e => update("quantity", e.target.value)} /></label>
            <Select label="Collection point" options={points.map(p => p.fullName || p.name)} value={form.point} onChange={e => update("point", e.target.value)} />
            <Select label="Condition" options={CONDITIONS} value={form.condition} onChange={e => update("condition", e.target.value)} />
            <label className="field"><span>Collection time</span><input type="time" value={form.time} onChange={e => update("time", e.target.value)} /></label>
            <label className="field" style={{ gridColumn: "1 / -1" }}><span>Notes (optional)</span><input placeholder="Any additional notes…" value={form.notes} onChange={e => update("notes", e.target.value)} /></label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setForm({ date: today, type: "", quantity: "", point: "", condition: "", time: "", notes: "" })}>Clear</button>
            <button type="submit" className="btn btn-lime"><Check size={15} /> Save to dashboard</button>
          </div>
          {saved && <div className="success">Record saved and added to the live dashboard.</div>}
        </form>
      </section>

      {recentlyAdded.length > 0 && (
        <section className="card">
          <div className="card-head"><div><h2>Added this session</h2></div><span className="count-chip">{recentlyAdded.length}</span></div>
          <RecordsTable records={recentlyAdded} />
        </section>
      )}

      <section className="card">
        <div className="card-head"><h2>Available categories</h2></div>
        <div className="cat-pills">{wasteTypes.map((x, i) => <span key={x} className="cat-pill" style={{ borderColor: TYPE_COLORS[i % TYPE_COLORS.length] }}>{x}</span>)}</div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Analytics
   ══════════════════════════════════════════════════════════════ */
function Analytics({ records, wasteTypes }) {
  const total = records.reduce((s, r) => s + Number(r.quantity), 0);
  const avg = records.length ? total / records.length : 0;
  const byType = wasteTypes.map(type => ({ type, value: records.filter(r => r.type === type).reduce((s, r) => s + Number(r.quantity), 0) }));
  const max = Math.max(...byType.map(x => x.value), 1);
  const monthlyData = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const m = r.month || (r.date ? r.date.slice(0, 7) : null);
      if (!m) return;
      map[m] = (map[m] || 0) + Number(r.quantity);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([month, value]) => ({ month, value }));
  }, [records]);
  const peak = monthlyData.reduce((a, b) => (b.value > (a.value || 0) ? b : a), { value: 0, month: "—" });

  return (
    <div className="content">
      <div className="stats-grid">
        <Stat icon={<Recycle size={18} />} value={tons(total)} label="Total waste" note={`${records.length.toLocaleString()} records`} glow="rgba(61,206,122,.45)" ico="#146c3a" icoBg="#e9f8ef" />
        <Stat icon={<Table2 size={18} />} value={records.length.toLocaleString()} label="Total records" note="Jan – Oct 2026" glow="rgba(62,198,224,.4)" ico="#0b6e86" icoBg="#e7f6fb" />
        <Stat icon={<Activity size={18} />} value={avg.toFixed(4)} label="Average quantity" note="Tonnes per record" glow="rgba(232,162,58,.4)" ico="#9a6708" icoBg="#fff6e6" />
        <Stat icon={<Factory size={18} />} value={new Set(records.map(r => r.point)).size} label="Collection points" note="Across campus" glow="rgba(11,58,102,.35)" ico="#0b3a66" icoBg="#eaf0f6" />
      </div>
      <div className="two-col">
        <section className="card">
          <div className="card-head">
            <div><h2>Monthly trend</h2><span className="sub">Recovered tonnage · peak {peak.month}</span></div>
          </div>
          <MonthlyTrendChart data={monthlyData} />
        </section>
        <section className="card">
          <div className="card-head"><div><h2>Waste by type</h2><span className="sub">Quantity in tonnes</span></div></div>
          <div className="hbars">
            {byType.map((x, i) => (
              <div className="hbar" key={x.type}>
                <span>{x.type}</span>
                <div className="rail"><i style={{ width: `${(x.value / max) * 100}%`, background: `linear-gradient(90deg, ${TYPE_COLORS[i % TYPE_COLORS.length]}, #b6f27c)` }} /></div>
                <b>{x.value.toFixed(2)}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="card">
        <div className="card-head"><div><h2>Material portrait</h2><span className="sub">Every stream, photographed and measured</span></div></div>
        <MaterialGrid items={byType.map(x => ({ ...x, count: records.filter(r => r.type === x.type).length }))} total={total} />
      </section>
    </div>
  );
}

function MonthlyTrendChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="trend">
      {data.map(d => {
        const peak = d.value === max;
        const label = d.value >= 100 ? Math.round(d.value).toLocaleString() : d.value.toFixed(1);
        return (
          <div className={`trend-col${peak ? " peak" : ""}`} key={d.month} title={`${d.month}: ${d.value.toFixed(2)} Ton`}>
            <em>{label}</em>
            <span style={{ height: `${Math.max(8, (d.value / max) * 168)}px` }} />
            <small>{MONTH_NAMES[parseInt(d.month.split("-")[1], 10) - 1]?.slice(0, 3) || d.month}</small>
          </div>
        );
      })}
      {!data.length && <p className="muted">No monthly data yet.</p>}
    </div>
  );
}

function MaterialGrid({ items, total }) {
  return (
    <div className="media-grid">
      {items.map(x => (
        <article className="media-card" key={x.type}>
          <div className="shot">
            {WASTE_IMAGES[x.type]
              ? <img src={WASTE_IMAGES[x.type]} alt={x.type} />
              : <div className="fallback">{x.type.slice(0, 1)}</div>}
          </div>
          <div className="body">
            <h3>{x.type}</h3>
            <div className="media-stats">
              <div><strong>{Number(x.value ?? x.totalQty ?? 0).toFixed(2)}</strong><small>Tonnes</small></div>
              {total != null && <div><strong>{total > 0 ? ((x.value / total) * 100).toFixed(1) : 0}%</strong><small>Share</small></div>}
              <div><strong>{x.count}</strong><small>Records</small></div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Categories
   ══════════════════════════════════════════════════════════════ */
function Categories({ records, wasteTypes, addWasteType, removeWasteType }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const close = () => { setShow(false); setName(""); setErr(""); };
  const add = () => {
    const t = name.trim();
    if (!t) { setErr("Category name is required."); return; }
    if (/steel|glass/i.test(t)) { setErr("This category is not supported."); return; }
    if (wasteTypes.includes(t)) { setErr("Already exists."); return; }
    addWasteType(t); close();
  };
  const items = wasteTypes.map(t => ({
    type: t,
    value: records.filter(r => r.type === t).reduce((s, r) => s + Number(r.quantity), 0),
    count: records.filter(r => r.type === t).length,
  }));
  return (
    <div className="content">
      {show && (
        <Modal title="Add waste category" onClose={close}>
          <div className="modal-b">
            <label className="field"><span>Category name</span>
              <input autoFocus placeholder="e.g. Crushed Brick" value={name} onChange={e => { setName(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && add()} />
            </label>
            {err && <p className="modal-err">{err}</p>}
          </div>
          <div className="modal-f"><button className="btn btn-ghost" onClick={close}>Cancel</button><button className="btn btn-lime" onClick={add}>Add category</button></div>
        </Modal>
      )}
      <MaterialGrid items={items} />
      <section className="card" style={{ padding: 14 }}>
        <div className="card-head"><div><h2>Category ledger</h2><span className="sub">Units default to tonnes</span></div><button className="btn btn-lime" onClick={() => setShow(true)}><Plus size={15} /> Add category</button></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Category</th><th>Description</th><th>Unit</th><th>Records</th><th>Total (t)</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {wasteTypes.map(t => {
                const count = records.filter(r => r.type === t).length;
                const totalQty = records.filter(r => r.type === t).reduce((s, r) => s + Number(r.quantity), 0);
                return (
                  <tr key={t}>
                    <td><b>{t}</b></td>
                    <td className="muted">{t} waste material</td>
                    <td>Ton</td>
                    <td className="mono">{count.toLocaleString()}</td>
                    <td><b>{totalQty.toFixed(2)}</b></td>
                    <td><span className="pill good"><i />Active</span></td>
                    <td><button className="btn-danger" onClick={() => removeWasteType(t)}>Delete</button></td>
                  </tr>
                );
              })}
              {!wasteTypes.length && <tr><td colSpan="7" className="empty">No categories.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Collection points
   ══════════════════════════════════════════════════════════════ */
function CollectionPoints({ points, addPoint, removePoint }) {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ name: "", city: "", status: "Active" });
  const [err, setErr] = useState("");
  const close = () => { setShow(false); setForm({ name: "", city: "", status: "Active" }); setErr(""); };
  const add = () => {
    if (!form.name.trim()) { setErr("Point name is required."); return; }
    if (!form.city.trim()) { setErr("City is required."); return; }
    addPoint({ name: form.name.trim(), fullName: form.name.trim(), city: form.city.trim(), status: form.status });
    close();
  };
  const bbox = `${UNIVERSITY_CENTER.lng - 0.006}%2C${UNIVERSITY_CENTER.lat - 0.004}%2C${UNIVERSITY_CENTER.lng + 0.006}%2C${UNIVERSITY_CENTER.lat + 0.004}`;
  return (
    <div className="content">
      {show && (
        <Modal title="Add collection point" onClose={close}>
          <div className="modal-b">
            <label className="field"><span>Point name</span><input autoFocus placeholder="e.g. Faculty of Science" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
            <label className="field"><span>City</span><input placeholder="e.g. Delta University · Gamasa" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></label>
            <label className="field"><span>Status</span>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option>Active</option><option>Inactive</option></select>
            </label>
            {err && <p className="modal-err">{err}</p>}
          </div>
          <div className="modal-f"><button className="btn btn-ghost" onClick={close}>Cancel</button><button className="btn btn-lime" onClick={add}>Add point</button></div>
        </Modal>
      )}
      <div className="two-col even">
        <section className="card">
          <div className="card-head">
            <div><h2>Faculty network</h2><span className="sub">{points.length} points · tap a pin to focus</span></div>
            <button className="btn btn-lime" onClick={() => setShow(true)}><Plus size={15} /> Add point</button>
          </div>
          <div className="points-scroll">
            {points.map((p, i) => (
              <div className="point-row" key={p.id} onMouseEnter={() => setActive(p.id)} onMouseLeave={() => setActive(null)} style={{ background: active === p.id ? "#f4faf6" : "transparent", borderRadius: 12, paddingInline: 8 }}>
                <span className="pin">{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}><b>{p.name}</b><small>{p.city}</small></div>
                <span className={`pill ${p.status === "Active" ? "good" : "poor"}`}><i />{p.status}</span>
                <button className="btn-danger" onClick={() => removePoint(p.id)} title="Delete point"><X size={13} /></button>
              </div>
            ))}
            {!points.length && <p className="empty">No points found.</p>}
          </div>
        </section>
        <section className="card map-card">
          <div className="campus-map">
            <iframe
              title="Delta University campus map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${UNIVERSITY_CENTER.lat}%2C${UNIVERSITY_CENTER.lng}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="shade" />
            {points.map((p, i) => (
              <button key={p.id} type="button" className="faculty-pin" style={{ left: `${p.x ?? 25 + (i % 4) * 17}%`, top: `${p.y ?? 25 + Math.floor(i / 4) * 18}%`, transform: `translate(-50%, -50%) scale(${active === p.id ? 1.25 : 1})` }} title={p.name} aria-label={p.name} onClick={() => setActive(p.id)}>
                <span>{i + 1}</span>
              </button>
            ))}
            <div className="map-label">
              <img src="/delta-university-logo.png" alt="Delta University" />
              <div>
                <small>LIVE CAMPUS VIEW</small>
                <strong>Delta University</strong>
                <span>Gamasa · Dakahlia · Egypt</span>
              </div>
            </div>
            <a className="map-external" href={`https://www.openstreetmap.org/?mlat=${UNIVERSITY_CENTER.lat}&mlon=${UNIVERSITY_CENTER.lng}#map=17/${UNIVERSITY_CENTER.lat}/${UNIVERSITY_CENTER.lng}`} target="_blank" rel="noreferrer">Open full map ↗</a>
          </div>
          <div className="map-footer"><span>Faculty-based collection network</span><b>{points.filter(p => p.status === "Active").length} active points</b></div>
        </section>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Settings
   ══════════════════════════════════════════════════════════════ */
function Settings({ adminPin, setAdminPin, users, addUser, removeUser, toggleUserAdminAccess }) {
  const [tab, setTab] = useState("users");
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", role: "Operator", email: "", status: "Active", hasAdminAccess: false });
  const [userErr, setUserErr] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);

  const closeAddUser = () => { setShowAddUser(false); setUserForm({ name: "", role: "Operator", email: "", status: "Active", hasAdminAccess: false }); setUserErr(""); };
  const handleAddUser = () => {
    if (!userForm.name.trim()) { setUserErr("User name is required."); return; }
    if (!userForm.email.trim()) { setUserErr("Email is required."); return; }
    addUser({ name: userForm.name.trim(), role: userForm.role, email: userForm.email.trim(), status: userForm.status, hasAdminAccess: userForm.hasAdminAccess });
    closeAddUser();
  };
  const handleUpdatePin = (e) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.trim().length < 4) { setPinMsg("PIN must be at least 4 characters."); return; }
    setAdminPin(newPin.trim());
    setPinMsg("Admin PIN updated.");
    setNewPin("");
    setTimeout(() => setPinMsg(""), 3500);
  };
  const handleResetPin = () => {
    if (window.confirm("Reset Admin PIN to default (hesham)?")) {
      setAdminPin("hesham");
      setPinMsg("Admin PIN reset to default (hesham).");
      setTimeout(() => setPinMsg(""), 3500);
    }
  };

  return (
    <div className="content">
      {showAddUser && (
        <Modal title="Add team member" onClose={closeAddUser}>
          <div className="modal-b">
            <label className="field"><span>Full name</span><input autoFocus placeholder="e.g. Dr. Ahmed Hassan" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} /></label>
            <label className="field"><span>Email address</span><input type="email" placeholder="e.g. ahmed@georevivers.com" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} /></label>
            <label className="field"><span>Role</span>
              <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
            </label>
            <label className="field"><span>Status</span>
              <select value={userForm.status} onChange={e => setUserForm(f => ({ ...f, status: e.target.value }))}><option>Active</option><option>Inactive</option></select>
            </label>
            <label className="checkbox-field">
              <input type="checkbox" checked={userForm.hasAdminAccess} onChange={e => setUserForm(f => ({ ...f, hasAdminAccess: e.target.checked }))} />
              <span>Grant admin access</span>
            </label>
            {userErr && <p className="modal-err">{userErr}</p>}
          </div>
          <div className="modal-f"><button className="btn btn-ghost" onClick={closeAddUser}>Cancel</button><button className="btn btn-lime" onClick={handleAddUser}>Add member</button></div>
        </Modal>
      )}

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Admin control</h2>
            <span className="sub">Permissions, credentials, and the supervisor profile</span>
          </div>
          <span className="status-dot"><i /> Admin authorized</span>
        </div>
        <div className="settings-tabs">
          <button className={`tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}><Users size={14} /> Users &amp; roles <span className="badge">{users.length}</span></button>
          <button className={`tab ${tab === "security" ? "active" : ""}`} onClick={() => setTab("security")}><KeyRound size={14} /> Security &amp; PIN</button>
          <button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}><UserRound size={14} /> Admin profile</button>
        </div>

        {tab === "users" && (
          <div>
            <div className="banner">
              <ShieldCheck size={22} color="#1f8a4c" />
              <div style={{ flex: 1 }}>
                <strong>Access control</strong>
                <p>Authorized members can unlock the admin panel with the PIN configured below.</p>
              </div>
              <button className="btn btn-lime" onClick={() => setShowAddUser(true)}><Plus size={14} /> Add user</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Admin access</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><div className="user-cell"><span className="ua">{u.name.charAt(0).toUpperCase()}</span><b>{u.name}</b></div></td>
                      <td><span className="role-tag">{u.role}</span></td>
                      <td className="muted">{u.email}</td>
                      <td>
                        <button type="button" className={`perm ${u.hasAdminAccess ? "allowed" : "denied"}`} onClick={() => toggleUserAdminAccess && toggleUserAdminAccess(u.id)} title="Toggle admin access">
                          {u.hasAdminAccess ? "Authorized" : "Restricted"}
                        </button>
                      </td>
                      <td><span className={`pill ${u.status === "Active" ? "good" : "poor"}`}><i />{u.status}</span></td>
                      <td><button className="btn-danger" onClick={() => removeUser(u.id)}>Delete</button></td>
                    </tr>
                  ))}
                  {!users.length && <tr><td colSpan="6" className="empty">No team members registered.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "security" && (
          <div>
            <h3 style={{ fontFamily: "var(--display)", marginTop: 0 }}>Admin PIN</h3>
            <p className="muted" style={{ marginTop: -6 }}>Required to unlock records editing, the admin panel, and campus settings.</p>
            <div className="pin-box">
              <div><span className="muted" style={{ fontSize: 12 }}>Current PIN</span><div className="pin-digits">{showCurrentPin ? adminPin : "••••"}</div></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCurrentPin(p => !p)}>{showCurrentPin ? <EyeOff size={14} /> : <Eye size={14} />} {showCurrentPin ? "Hide" : "Show"}</button>
                <button type="button" className="btn btn-ghost" onClick={handleResetPin}><RotateCcw size={14} /> Reset default</button>
              </div>
            </div>
            <form onSubmit={handleUpdatePin} className="pin-form">
              <label className="field" style={{ maxWidth: 340, flex: 1 }}>
                <span>New PIN</span>
                <input type="password" placeholder="Minimum 4 characters" value={newPin} onChange={e => { setNewPin(e.target.value); setPinMsg(""); }} maxLength={16} />
              </label>
              <button type="submit" className="btn btn-primary">Update PIN</button>
            </form>
            {pinMsg && <div className="success">{pinMsg}</div>}
          </div>
        )}

        {tab === "profile" && (
          <div>
            <h3 style={{ fontFamily: "var(--display)", marginTop: 0 }}>Supervisor profile</h3>
            <div className="form-grid">
              <label className="field"><span>Full name</span><input defaultValue="Supervisor" /></label>
              <label className="field"><span>Email address</span><input defaultValue="supervisor@georevivers.com" /></label>
              <label className="field"><span>Phone number</span><input defaultValue="+20 100 123 4567" /></label>
              <label className="field"><span>Password</span><input type="password" defaultValue="********" /></label>
            </div>
            <button className="btn btn-lime" style={{ marginTop: 16 }}>Save changes</button>
          </div>
        )}
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Restricted + PIN
   ══════════════════════════════════════════════════════════════ */
function RestrictedAdminCard({ onUnlock, onBack }) {
  return (
    <div className="content">
      <section className="card restricted">
        <div className="shield"><ShieldCheck size={42} color="#0b3a66" /></div>
        <h2>Admin access required</h2>
        <p>This section is limited to supervisors. Verify with the admin PIN to continue.</p>
        <div className="restricted-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}><ArrowLeft size={15} /> Back to dashboard</button>
          <button type="button" className="btn btn-primary" onClick={onUnlock}><Unlock size={15} /> Enter PIN</button>
        </div>
      </section>
    </div>
  );
}

function PinModal({ onClose, onUnlock, users }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [selectedUser, setSelectedUser] = useState(() => {
    const u = users ? users.find(x => x.hasAdminAccess) : null;
    return u ? u.name : "";
  });
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!pin.trim()) { setErr("Please enter the admin PIN."); return; }
    const ok = onUnlock(pin.trim()) || pin.trim() === "hesham" || pin.trim() === "1234";
    if (ok) onClose();
    else { setErr("Incorrect PIN. Try again."); setPin(""); }
  };
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="pin-title">
        <div className="modal-h">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="stat-ico" style={{ margin: 0 }}><Sparkles size={16} /></span>
            <div><h3 id="pin-title">Admin verification</h3><small>Restricted authentication</small></div>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Close"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-b">
            <div className="info-note">
              <ShieldCheck size={18} color="#1f8a4c" />
              <div>
                <b>Authorized team members only</b>
                <p>Default PIN is <code>hesham</code> or <code>1234</code>.</p>
              </div>
            </div>
            {users && users.length > 0 && (
              <label className="field">
                <span>Team member</span>
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                  {users.map(u => (
                    <option key={u.id} value={u.name} disabled={!u.hasAdminAccess}>
                      {u.name} ({u.role}) — {u.hasAdminAccess ? "Authorized" : "Restricted"}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="field">
              <span>Security PIN</span>
              <input type="password" autoFocus maxLength={16} placeholder="••••" value={pin} onChange={e => { setPin(e.target.value); setErr(""); }} />
            </label>
            {err && <p className="modal-err">{err}</p>}
          </div>
          <div className="modal-f">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary"><Unlock size={15} /> Unlock</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-h"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button></div>
        {children}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
