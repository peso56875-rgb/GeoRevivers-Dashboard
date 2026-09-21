import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { initialRecords } from "./data.js";

const DEFAULT_WASTE_TYPES = [
  "Crushed Ceramic","Crushed Concrete","Crushed Asphalt",
  "Crushed Glass","Steel","Plastic",
];
const CONDITIONS = ["Good", "Medium", "Poor"];
const ROLES = ["Supervisor", "Operator", "Viewer", "Admin"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const UNIVERSITY_CENTER = { lat: 31.4425975, lng: 31.4938895 };
const DEFAULT_POINTS = [
  { id:1,  name:"Faculty of Medicine",                city:"Delta University · Gamasa", status:"Active", x:45, y:24 },
  { id:2,  name:"Faculty of Oral & Dental Medicine",  city:"Delta University · Gamasa", status:"Active", x:57, y:31 },
  { id:3,  name:"Faculty of Pharmacy",                city:"Delta University · Gamasa", status:"Active", x:69, y:39 },
  { id:4,  name:"Faculty of Physical Therapy",        city:"Delta University · Gamasa", status:"Active", x:37, y:42 },
  { id:5,  name:"Faculty of Applied Health Sciences", city:"Delta University · Gamasa", status:"Active", x:50, y:52 },
  { id:6,  name:"Faculty of Engineering",             city:"Delta University · Gamasa", status:"Active", x:64, y:57 },
  { id:7,  name:"Faculty of Artificial Intelligence", city:"Delta University · Gamasa", status:"Active", x:76, y:49 },
  { id:8,  name:"Faculty of Business Administration", city:"Delta University · Gamasa", status:"Active", x:30, y:60 },
  { id:9,  name:"Faculty of Arts",                    city:"Delta University · Gamasa", status:"Active", x:42, y:70 },
  { id:10, name:"Faculty of Nursing",                 city:"Delta University · Gamasa", status:"Active", x:56, y:76 },
  { id:11, name:"Faculty of Veterinary Medicine",     city:"Delta University · Gamasa", status:"Active", x:70, y:69 },
  { id:12, name:"Faculty of Energy Engineering",      city:"Delta University · Gamasa", status:"Active", x:82, y:62 },
];
const DEFAULT_USERS = [
  { id:1, name:"Supervisor", role:"Supervisor", email:"supervisor@georevivers.com", status:"Active", hasAdminAccess:true },
  { id:2, name:"Operator 1", role:"Operator",   email:"operator.1@georevivers.com", status:"Active", hasAdminAccess:false },
  { id:3, name:"Operator 2", role:"Operator",   email:"operator.2@georevivers.com", status:"Active", hasAdminAccess:false },
  { id:4, name:"Viewer",     role:"Viewer",     email:"viewer@georevivers.com",     status:"Inactive", hasAdminAccess:false },
];

function App() {
  const [page, setPage] = useState("welcome");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState(() => {
    try { const s = localStorage.getItem("gr_admin_pin"); if (s) return s; } catch {}
    return "1234";
  });
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try { return localStorage.getItem("gr_admin_unlocked") === "true"; } catch {}
    return false;
  });
  const [records, setRecords] = useState(() => {
    try {
      const s = localStorage.getItem("georevivers_records_v3");
      if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length >= 20) return p; }
    } catch {}
    return initialRecords;
  });
  const [wasteTypes, setWasteTypes] = useState(() => {
    try { const s = localStorage.getItem("gr_waste_types"); if (s) return JSON.parse(s); } catch {}
    return DEFAULT_WASTE_TYPES;
  });
  const [points, setPoints] = useState(() => {
    try { const s = localStorage.getItem("gr_delta_faculty_points_v1"); if (s) return JSON.parse(s); } catch {}
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
  useEffect(() => { localStorage.setItem("georevivers_records_v3", JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem("gr_waste_types", JSON.stringify(wasteTypes)); }, [wasteTypes]);
  useEffect(() => { localStorage.setItem("gr_delta_faculty_points_v1", JSON.stringify(points)); }, [points]);
  useEffect(() => { localStorage.setItem("gr_users", JSON.stringify(users)); }, [users]);
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const unlockAdmin = (pin) => {
    if (pin === adminPin) {
      setIsAdminUnlocked(true);
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    if (page === "add") setPage("dashboard");
  };

  const toggleUserAdminAccess = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, hasAdminAccess: !u.hasAdminAccess } : u));
  };

  const addRecord    = (r) => { setRecords(p => [{ ...r, id: Date.now(), addedBy:"Supervisor" }, ...p]); setPage("records"); };
  const removeRecord = (id) => { if (window.confirm("Delete this waste record?")) setRecords(p => p.filter(r => r.id !== id)); };
  const addWasteType    = (t) => setWasteTypes(p => [...p, t]);
  const removeWasteType = (t) => { if (window.confirm(`Delete "${t}"?`)) setWasteTypes(p => p.filter(x => x !== t)); };
  const addPoint    = (pt) => setPoints(p => [...p, { ...pt, id: Date.now() }]);
  const removePoint = (id) => { if (window.confirm("Delete this point?")) setPoints(p => p.filter(x => x.id !== id)); };
  const addUser    = (u) => setUsers(p => [...p, { ...u, id: Date.now() }]);
  const removeUser = (id) => { if (window.confirm("Delete this user?")) setUsers(p => p.filter(x => x.id !== id)); };

  if (page === "welcome") {
    return <WelcomePage onEnter={() => setPage("dashboard")} onExploreMap={() => setPage("points")} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdminUnlocked={isAdminUnlocked}
        onOpenPinModal={() => setShowPinModal(true)}
      />
      <main className="main">
        <Topbar
          setPage={setPage}
          onToggleMenu={() => setSidebarOpen(p => !p)}
          isMenuOpen={sidebarOpen}
          isAdminUnlocked={isAdminUnlocked}
          onOpenPinModal={() => setShowPinModal(true)}
          onLockAdmin={lockAdmin}
        />
        {page==="dashboard"  && <Dashboard records={records} setPage={setPage} wasteTypes={wasteTypes} isAdminUnlocked={isAdminUnlocked} onOpenPinModal={()=>setShowPinModal(true)} />}
        {page==="records"    && <WasteRecords records={records} removeRecord={removeRecord} setPage={setPage} isAdminUnlocked={isAdminUnlocked} onOpenPinModal={()=>setShowPinModal(true)} />}
        {page==="add"        && (isAdminUnlocked ? <AddRecord addRecord={addRecord} wasteTypes={wasteTypes} points={points} /> : <RestrictedAdminCard onUnlock={()=>setShowPinModal(true)} onBack={()=>setPage("dashboard")} />)}
        {page==="analytics"  && <Analytics records={records} wasteTypes={wasteTypes} />}
        {page==="categories" && <Categories records={records} wasteTypes={wasteTypes} addWasteType={addWasteType} removeWasteType={removeWasteType} />}
        {page==="points"     && <CollectionPoints points={points} addPoint={addPoint} removePoint={removePoint} />}
        {page==="users"      && <UsersRoles users={users} addUser={addUser} removeUser={removeUser} toggleUserAdminAccess={toggleUserAdminAccess} />}
        {page==="settings"   && <Settings adminPin={adminPin} setAdminPin={setAdminPin} />}
      </main>
      {showPinModal && (
        <PinModal
          onClose={() => setShowPinModal(false)}
          onUnlock={unlockAdmin}
          users={users}
        />
      )}
    </div>
  );
}

function WelcomePage({ onEnter, onExploreMap }) {
  return (
    <main className="welcome-page">
      <div className="welcome-orbit orbit-one" aria-hidden="true" />
      <div className="welcome-orbit orbit-two" aria-hidden="true" />
      <nav className="welcome-nav" aria-label="Welcome navigation">
        <button className="welcome-brand" type="button" aria-label="GeoRevivers home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src="/georevivers-logo.jpeg" alt="GeoRevivers" />
        </button>
        <div className="welcome-nav-actions">
          <button type="button" className="welcome-link" onClick={onExploreMap}>Campus points</button>
          <button type="button" className="welcome-nav-cta" onClick={onEnter}>Open dashboard</button>
        </div>
      </nav>

      <section className="welcome-hero">
        <div className="welcome-copy">
          <span className="eyebrow"><i /> Smart campus waste intelligence</span>
          <h1>Reviving resources.<br /><em>Restoring tomorrow.</em></h1>
          <p>GeoRevivers turns every collection point into actionable environmental insight—helping Delta University build a cleaner, more circular campus.</p>
          <div className="welcome-actions">
            <button type="button" className="welcome-primary" onClick={onEnter}>
              Enter the dashboard <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="welcome-secondary" onClick={onExploreMap}>
              Explore campus map
            </button>
          </div>
          <div className="welcome-trust">
            <div><strong>12</strong><span>Faculty collection points</span></div>
            <div><strong>24/7</strong><span>Environmental visibility</span></div>
            <div><strong>1</strong><span>Connected green campus</span></div>
          </div>
        </div>

        <div className="welcome-visual" aria-label="GeoRevivers circular campus illustration">
          <div className="visual-grid" aria-hidden="true" />
          <div className="eco-disc">
            <div className="eco-disc-inner">
              <img src="/georevivers-logo.jpeg" alt="GeoRevivers - Improve Soil · Redesign Ground" className="welcome-hero-logo" />
            </div>
          </div>
          <div className="floating-card impact-card"><span>Campus impact</span><strong>Cleaner by design</strong><i className="mini-line" /></div>
          <div className="floating-card location-card">
            <img src="/delta-university-logo.png" alt="Delta University" className="location-delta-logo" />
            <div><strong>Delta University</strong><small>Gamasa, Egypt</small></div>
          </div>
          <div className="leaf-shape leaf-a" aria-hidden="true" />
          <div className="leaf-shape leaf-b" aria-hidden="true" />
        </div>
      </section>

      <footer className="welcome-footer">
        <span>GeoRevivers Environmental Management System</span>
        <span>Delta University for Science &amp; Technology · Gamasa</span>
      </footer>
    </main>
  );
}

function Sidebar({ page, setPage, isOpen, onClose, isAdminUnlocked, onOpenPinModal }) {
  const items = [
    ["welcome","←","Welcome"],["dashboard","⌂","Dashboard"],["records","▤","Waste Records"],
    ["analytics","◔","Analytics & Reports"],["categories","◈","Waste Categories"],
    ["points","⌖","Collection Points"],
    ...(isAdminUnlocked ? [["add","+","Admin Panel"]] : []),
    ["users","♙","Users & Roles"],["settings","⚙","Settings"],
  ];
  return (
    <>
      <div className={`sidebar-backdrop ${isOpen?"open":""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${isOpen?"open":""}`}>
        <div className="sidebar-header">
          <div className="brand"><img src="/georevivers-logo.jpeg" alt="GeoRevivers" /></div>
          <button type="button" className="close-sidebar-btn" onClick={onClose} aria-label="Close menu">✕</button>
        </div>
        <nav>
          {items.map(([id,icon,label]) => (
            <button key={id} className={`nav-item ${page===id?"active":""}`} onClick={() => { setPage(id); onClose(); }}>
              <span className="nav-icon">{icon}</span><span>{label}</span>
              {id==="add" && <span className="lock">🔒</span>}
            </button>
          ))}
          {!isAdminUnlocked && (
            <button
              type="button"
              className="sidebar-unlock-btn"
              onClick={() => { onOpenPinModal(); onClose(); }}
              title="Unlock Admin Panel"
            >
              <span className="sidebar-unlock-icon">🔒</span>
              <span>Unlock Admin Panel</span>
            </button>
          )}
        </nav>
        <div className="side-message">
          <div className="leaf">♻</div><b>Improving Soil Today</b><span>For a Better Tomorrow</span>
        </div>
      </aside>
    </>
  );
}

function Topbar({ setPage, onToggleMenu, isMenuOpen, isAdminUnlocked, onOpenPinModal, onLockAdmin }) {
  return (
    <header className="topbar">
      <div className="topbar-brand" onClick={() => setPage && setPage("dashboard")} role="button" tabIndex={0} title="GeoRevivers - Home">
        <img src="/georevivers-logo.jpeg" alt="GeoRevivers" className="topbar-logo" />
      </div>
      <div className="top-actions">
        {isAdminUnlocked ? (
          <button
            type="button"
            className="admin-badge-btn unlocked"
            onClick={onLockAdmin}
            title="Admin Panel Unlocked - Click to lock"
          >
            <span className="badge-pulse" />
            <span className="badge-text">Admin Mode 🔓</span>
            <span className="badge-action">Lock</span>
          </button>
        ) : (
          <button
            type="button"
            className="admin-badge-btn locked"
            onClick={onOpenPinModal}
            title="Unlock Admin Panel (PIN Required)"
          >
            <span className="badge-lock-icon">🔒</span>
            <span className="badge-text">Admin Access</span>
          </button>
        )}
        <span className="bell">♧<i>3</i></span>
        <div className="avatar">{isAdminUnlocked ? "S" : "V"}</div>
        <div className="user-meta">
          <strong>{isAdminUnlocked ? "Supervisor" : "Guest"}</strong>
          <span>{isAdminUnlocked ? "Admin Authorized" : "Read-Only"}</span>
        </div>
        <button type="button" className={`hamburger-btn ${isMenuOpen?"active":""}`} onClick={onToggleMenu} aria-label="Toggle menu">
          <span className="bar"></span><span className="bar"></span><span className="bar"></span>
        </button>
      </div>
    </header>
  );
}

function Dashboard({ records, setPage, wasteTypes, isAdminUnlocked, onOpenPinModal }) {
  const [filterType, setFilterType]   = useState("");
  const [filterDay, setFilterDay]     = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear]   = useState("");
  const [applied, setApplied] = useState({ type:"", day:"", month:"", year:"" });

  const handleTypeChange  = (v) => { setFilterType(v);  setApplied(p => ({ ...p, type:v })); };
  const handleDayChange   = (v) => { setFilterDay(v);   setApplied(p => ({ ...p, day:v })); };
  const handleMonthChange = (v) => { setFilterMonth(v); setApplied(p => ({ ...p, month:v })); };
  const handleYearChange  = (v) => { setFilterYear(v);  setApplied(p => ({ ...p, year:v })); };
  const handleApply = () => setApplied({ type:filterType, day:filterDay, month:filterMonth, year:filterYear });
  const handleReset = () => { setFilterType(""); setFilterDay(""); setFilterMonth(""); setFilterYear(""); setApplied({ type:"",day:"",month:"",year:"" }); };

  const isFiltered = Boolean(
    (applied.type  && applied.type  !== "All Waste Types") ||
    (applied.day   && applied.day   !== "All Days") ||
    (applied.month && applied.month !== "All Months") ||
    (applied.year  && applied.year  !== "All Years")
  );

  const filtered = useMemo(() => records.filter(r => {
    if (!r.date) return false;
    const [yr, mn, dy] = r.date.split("-");
    if (applied.type  && applied.type  !== "All Waste Types" && r.type.toLowerCase() !== applied.type.toLowerCase()) return false;
    if (applied.day   && applied.day   !== "All Days"        && parseInt(dy,10) !== parseInt(applied.day,10)) return false;
    if (applied.month && applied.month !== "All Months") {
      const idx = MONTH_NAMES.findIndex(m => m.toLowerCase() === applied.month.toLowerCase());
      if (idx !== -1 && parseInt(mn,10) !== idx+1) return false;
    }
    if (applied.year  && applied.year  !== "All Years"       && yr !== applied.year) return false;
    return true;
  }), [records, applied]);

  const total = filtered.reduce((s,r) => s + Number(r.quantity), 0);
  const categories = wasteTypes.map(type => ({ type, total: filtered.filter(r=>r.type===type).reduce((s,r)=>s+Number(r.quantity),0) }));
  const max = Math.max(...categories.map(c=>c.total), 1);

  return (
    <div className="content">
      <div className="stats-grid">
        <StatCard icon="♻" value={total.toFixed(2)} label="Total Waste (Ton)"    note={isFiltered?`Filtered (${filtered.length} records)`:"+12.5% vs last month"} />
        <StatCard icon="▤" value={filtered.length}   label="Total Records"        note={isFiltered?`of ${records.length} total`:"+8.7% vs last month"} />
        <StatCard icon="⌖" value={new Set(filtered.map(r=>r.point)).size} label="Collection Points" note="+6.3% vs last month" />
        <StatCard icon="◈" value={new Set(filtered.map(r=>r.type)).size}  label="Active Categories" note="All categories" />
      </div>
      <div className="two-col">
        <section className="card">
          <div className="section-title"><h2>Waste Distribution</h2><span>By Quantity</span></div>
          <div className="donut-layout">
            <Donut categories={categories} total={total} />
            <div className="legend">
              {categories.map((c,i) => (
                <div className="legend-row" key={c.type}>
                  <span className={`dot d${i}`} /><span>{c.type}</span>
                  <b>{total?((c.total/total)*100).toFixed(1):"0.0"}%</b>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="card">
          <div className="section-title"><h2>Recent Waste Records</h2><button className="outline-btn" onClick={()=>setPage("records")}>View All</button></div>
          <RecordsTable records={filtered.slice(0,5)} compact />
        </section>
      </div>
      <section className="card quick-filter">
        <div className="section-title">
          <div>
            <h2>Quick Filter</h2>
            <span style={{display:"block",marginTop:"2px"}}>{isFiltered?`Showing ${filtered.length} of ${records.length} records`:"Filter dashboard data"}</span>
          </div>
          {isFiltered && <button type="button" className="outline-btn reset-tag-btn" onClick={handleReset}>↺ Reset Filter</button>}
        </div>
        <FilterBar
          filterType={filterType}   setFilterType={handleTypeChange}
          filterDay={filterDay}     setFilterDay={handleDayChange}
          filterMonth={filterMonth} setFilterMonth={handleMonthChange}
          filterYear={filterYear}   setFilterYear={handleYearChange}
          onApply={handleApply} onReset={handleReset}
          isFiltered={isFiltered} records={records} wasteTypes={wasteTypes}
        />
      </section>
      <section className="card">
        <div className="section-title">
          <h2>Waste Quantity by Category</h2>
          {isAdminUnlocked ? (
            <button className="green-btn" onClick={()=>setPage("add")}>＋ Add Record</button>
          ) : (
            <button type="button" className="outline-btn admin-prompt-btn" onClick={onOpenPinModal} title="Unlock Admin to add records">🔒 Add Record (Admin)</button>
          )}
        </div>
        <div className="bar-chart">
          {categories.map(c => (
            <div className="bar-item" key={c.type}>
              <div className="bar-value">{c.total.toFixed(1)}</div>
              <div className="bar-track"><div className="bar-fill" style={{height:`${total>0?(c.total/max)*100:0}%`}} /></div>
              <small>{c.type.replace("Crushed ","")}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label, note }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span><small>{note}</small></div></div>;
}

function Donut({ categories, total }) {
  const C = 2*Math.PI*50; let offset=0;
  return (
    <div className="donut">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" className="donut-bg" />
        {total>0 && categories.map((c,i) => {
          const dash=(total?c.total/total:0)*C;
          const el=<circle key={c.type} cx="60" cy="60" r="50" className={`donut-segment s${i}`} strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={-offset} />;
          offset+=dash; return el;
        })}
      </svg>
      <div className="donut-center"><b>{total.toFixed(2)}</b><span>Ton</span></div>
    </div>
  );
}

function FilterBar({ filterType, setFilterType, filterDay, setFilterDay, filterMonth, setFilterMonth, filterYear, setFilterYear, onApply, onReset, isFiltered, records=[], wasteTypes=[] }) {
  const years = useMemo(() => {
    const s = new Set(["2026","2025","2024"]);
    records.forEach(r => r.date && s.add(r.date.split("-")[0]));
    return Array.from(s).sort((a,b)=>b-a);
  }, [records]);
  return (
    <div className="filter-grid">
      <Select label="Waste Type" options={["All Waste Types",...wasteTypes]} value={filterType} onChange={e=>setFilterType(e.target.value)} />
      <Select label="Day"        options={["All Days",...Array.from({length:31},(_,i)=>String(i+1))]} value={filterDay} onChange={e=>setFilterDay(e.target.value)} />
      <Select label="Month"      options={["All Months",...MONTH_NAMES]} value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} />
      <Select label="Year"       options={["All Years",...years]} value={filterYear} onChange={e=>setFilterYear(e.target.value)} />
      <div className="filter-actions">
        <button type="button" className="green-btn filter-btn" onClick={onApply}>⌕ Apply Filter</button>
        {isFiltered && <button type="button" className="outline-btn reset-btn" onClick={onReset}>↺ Reset</button>}
      </div>
    </div>
  );
}

function Select({ label, options, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value||""} onChange={e=>{ if(typeof onChange==="function") onChange(e); }}>
        <option value="">Select {label}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function WasteRecords({ records, removeRecord, setPage, isAdminUnlocked, onOpenPinModal }) {
  const [search, setSearch] = useState("");
  const filtered = records.filter(r=>`${r.type} ${r.point} ${r.condition} ${r.date}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="content">
      <div className="page-toolbar">
        <input className="search" placeholder="Search records..." value={search} onChange={e=>setSearch(e.target.value)} />
        {isAdminUnlocked ? (
          <button className="green-btn" onClick={()=>setPage("add")}>＋ Add Record</button>
        ) : (
          <button type="button" className="outline-btn admin-prompt-btn" onClick={onOpenPinModal} title="Unlock Admin to add records">🔒 Add Record (Admin)</button>
        )}
      </div>
      <section className="card table-card"><RecordsTable records={filtered} onDelete={isAdminUnlocked ? removeRecord : null} /></section>
    </div>
  );
}

function RecordsTable({ records, onDelete, compact=false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>
          <th>Date</th><th>Waste Type</th><th>Quantity (Ton)</th><th>Collection Point</th><th>Condition</th><th>Added By</th>
          {onDelete && <th>Actions</th>}
        </tr></thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td>{formatDate(r.date)}</td><td>{r.type}</td><td>{Number(r.quantity).toFixed(2)}</td><td>{r.point}</td>
              <td><span className={`badge ${r.condition.toLowerCase()}`}>{r.condition}</span></td><td>{r.addedBy}</td>
              {onDelete && <td><button className="delete-btn" onClick={()=>onDelete(r.id)}>Delete</button></td>}
            </tr>
          ))}
          {!records.length && <tr><td colSpan="7" className="empty">No records found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function AddRecord({ addRecord, wasteTypes, points }) {
  const today = new Date().toISOString().slice(0,10);
  const [form, setForm] = useState({ date:today, type:"", quantity:"", point:"", condition:"" });
  const [saved, setSaved] = useState(false);
  const update = (k,v) => setForm(f=>({...f,[k]:v}));
  const submit = e => {
    e.preventDefault();
    if(!form.date||!form.type||!form.quantity||!form.point||!form.condition) return;
    addRecord({...form, quantity:Number(form.quantity)});
    setSaved(true);
  };
  return (
    <div className="content">
      <section className="card admin-card">
        <div className="admin-intro"><h2>Add Waste Record</h2><p>Enter the collection data. The dashboard will update automatically after saving.</p></div>
        <form onSubmit={submit}>
          <div className="quick-entry">
            <Select label="Waste Type" options={wasteTypes} value={form.type} onChange={e=>update("type",e.target.value)} />
            <Select label="Day" options={Array.from({length:31},(_,i)=>String(i+1))} value={form.date.slice(8,10).replace(/^0/,"")} onChange={e=>update("date",`${form.date.slice(0,8)}${String(e.target.value).padStart(2,"0")}`)} />
            <Select label="Month" options={["01 - January","02 - February","03 - March","04 - April","05 - May","06 - June","07 - July","08 - August","09 - September","10 - October","11 - November","12 - December"]} value={form.date.slice(5,7)} onChange={e=>update("date",`${form.date.slice(0,5)}${e.target.value.slice(0,2)}-${form.date.slice(8)}`)} />
            <Select label="Year" options={["2026","2027","2028","2029","2030"]} value={form.date.slice(0,4)} onChange={e=>update("date",`${e.target.value}-${form.date.slice(5)}`)} />
          </div>
          <div className="form-grid">
            <label className="field"><span>Quantity (Ton)</span><input type="number" min="0" step="0.01" placeholder="Enter quantity" value={form.quantity} onChange={e=>update("quantity",e.target.value)} /></label>
            <Select label="Collection Point" options={points.map(p=>p.name)} value={form.point} onChange={e=>update("point",e.target.value)} />
            <Select label="Condition" options={CONDITIONS} value={form.condition} onChange={e=>update("condition",e.target.value)} />
          </div>
          <div className="form-actions">
            <button type="reset" className="outline-btn" onClick={()=>setForm({date:today,type:"",quantity:"",point:"",condition:""})}>Clear</button>
            <button type="submit" className="green-btn">✓ Save Record</button>
          </div>
          {saved && <div className="success">Record saved successfully.</div>}
        </form>
      </section>
      <section className="card category-mini">
        <h2>Waste Categories</h2>
        <div className="category-pills">{wasteTypes.map((x,i)=><span key={x} className={`pill p${i}`}>{x}</span>)}</div>
      </section>
    </div>
  );
}

function Analytics({ records, wasteTypes }) {
  const total = records.reduce((s,r)=>s+Number(r.quantity),0);
  const avg   = records.length ? total/records.length : 0;
  const byType= wasteTypes.map(type=>({type,value:records.filter(r=>r.type===type).reduce((s,r)=>s+Number(r.quantity),0)}));
  const max   = Math.max(...byType.map(x=>x.value),1);
  return (
    <div className="content">
      <div className="stats-grid">
        <StatCard icon="♻" value={total.toFixed(2)} label="Total Waste (Ton)"    note="+12.5% vs last month" />
        <StatCard icon="▤" value={records.length}    label="Total Records"        note="+8.7% vs last month" />
        <StatCard icon="◒" value={avg.toFixed(2)}    label="Avg. Quantity (Ton)"  note="+5.4% vs last month" />
        <StatCard icon="⌖" value={new Set(records.map(r=>r.point)).size} label="Collection Points" note="+6.3% vs last month" />
      </div>
      <div className="two-col">
        <section className="card"><div className="section-title"><h2>Waste Trend</h2><span>Quantity (Ton)</span></div><TrendChart records={records} /></section>
        <section className="card">
          <div className="section-title"><h2>Waste by Type</h2><span>Quantity (Ton)</span></div>
          <div className="horizontal-bars">
            {byType.map(x=><div className="hbar" key={x.type}><span>{x.type.replace("Crushed ","")}</span><div><i style={{width:`${(x.value/max)*100}%`}} /></div><b>{x.value.toFixed(1)}</b></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}

function TrendChart({ records }) {
  const data=[...records].slice(0,10).reverse();
  const max=Math.max(...data.map(r=>Number(r.quantity)),1);
  return <div className="trend-chart">{data.map(r=><div className="trend-col" key={r.id}><span style={{height:`${(Number(r.quantity)/max)*150}px`}}></span><small>{new Date(r.date).getDate()}/{new Date(r.date).getMonth()+1}</small></div>)}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  );
}

function Categories({ records, wasteTypes, addWasteType, removeWasteType }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [err,  setErr]  = useState("");
  const close = () => { setShow(false); setName(""); setErr(""); };
  const add = () => {
    const t = name.trim();
    if(!t){ setErr("Category name is required."); return; }
    if(wasteTypes.includes(t)){ setErr("Already exists."); return; }
    addWasteType(t); close();
  };
  return (
    <div className="content">
      {show && <Modal title="Add Waste Category" onClose={close}>
        <div className="modal-body">
          <label className="field"><span>Category Name</span>
            <input autoFocus placeholder="e.g. Crushed Brick" value={name} onChange={e=>{setName(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&add()} />
          </label>
          {err && <p className="modal-err">{err}</p>}
        </div>
        <div className="modal-footer"><button className="outline-btn" onClick={close}>Cancel</button><button className="green-btn" onClick={add}>✓ Add Category</button></div>
      </Modal>}
      <section className="card table-card">
        <div className="section-title"><h2>Waste Categories</h2><button className="green-btn" onClick={()=>setShow(true)}>＋ Add Category</button></div>
        <table>
          <thead><tr><th>Category Name</th><th>Description</th><th>Default Unit</th><th>Records</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {wasteTypes.map(t=><tr key={t}><td><b>{t}</b></td><td>{t} waste material</td><td>Ton</td><td>{records.filter(r=>r.type===t).length}</td><td><span className="badge good">Active</span></td><td><button className="delete-btn" onClick={()=>removeWasteType(t)}>Delete</button></td></tr>)}
            {!wasteTypes.length && <tr><td colSpan="6" className="empty">No categories.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function CollectionPoints({ points, addPoint, removePoint }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name:"", city:"", status:"Active" });
  const [err,  setErr]  = useState("");
  const close = () => { setShow(false); setForm({name:"",city:"",status:"Active"}); setErr(""); };
  const add = () => {
    if(!form.name.trim()){ setErr("Point name is required."); return; }
    if(!form.city.trim()){ setErr("City is required."); return; }
    addPoint({ name:form.name.trim(), city:form.city.trim(), status:form.status }); close();
  };
  return (
    <div className="content">
      {show && <Modal title="Add Collection Point" onClose={close}>
        <div className="modal-body">
          <label className="field"><span>Point Name</span><input autoFocus placeholder="e.g. المستودع الغربي" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></label>
          <label className="field"><span>City</span><input placeholder="e.g. الإسكندرية" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} /></label>
          <label className="field"><span>Status</span><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Active</option><option>Inactive</option></select></label>
          {err && <p className="modal-err">{err}</p>}
        </div>
        <div className="modal-footer"><button className="outline-btn" onClick={close}>Cancel</button><button className="green-btn" onClick={add}>✓ Add Point</button></div>
      </Modal>}
      <div className="two-col">
        <section className="card">
          <div className="section-title"><h2>Points List</h2><button className="green-btn" onClick={()=>setShow(true)}>＋ Add Point</button></div>
          {points.map(p=>(
            <div className="point-row" key={p.id}>
              <span className="point-pin">⌖</span>
              <div style={{flex:1}}><b>{p.name}</b><small>{p.city}</small></div>
              <span className={`badge ${p.status==="Active"?"good":"poor"}`}>{p.status}</span>
              <button className="delete-btn" style={{marginLeft:"8px"}} onClick={()=>removePoint(p.id)}>✕</button>
            </div>
          ))}
          {!points.length && <p style={{textAlign:"center",padding:"20px",color:"#aaa"}}>No points found.</p>}
        </section>
        <section className="card map-card">
          <div className="campus-map">
            <iframe
              title="Delta University campus map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${UNIVERSITY_CENTER.lng-0.006}%2C${UNIVERSITY_CENTER.lat-0.004}%2C${UNIVERSITY_CENTER.lng+0.006}%2C${UNIVERSITY_CENTER.lat+0.004}&layer=mapnik&marker=${UNIVERSITY_CENTER.lat}%2C${UNIVERSITY_CENTER.lng}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="campus-map-shade" aria-hidden="true" />
            {points.map((p,i)=><button key={p.id} type="button" className="faculty-pin" style={{left:`${p.x ?? 25+(i%4)*17}%`,top:`${p.y ?? 25+Math.floor(i/4)*18}%`}} aria-label={p.name} title={p.name}><span>{i+1}</span></button>)}
            <div className="map-label">
              <div className="map-label-header">
                <img src="/delta-university-logo.png" alt="Delta University" className="map-delta-logo" />
                <div className="map-label-text">
                  <small>LIVE CAMPUS VIEW</small>
                  <strong>Delta University</strong>
                  <span>Gamasa · Dakahlia · Egypt</span>
                </div>
              </div>
            </div>
            <a className="map-external" href={`https://www.openstreetmap.org/?mlat=${UNIVERSITY_CENTER.lat}&mlon=${UNIVERSITY_CENTER.lng}#map=17/${UNIVERSITY_CENTER.lat}/${UNIVERSITY_CENTER.lng}`} target="_blank" rel="noreferrer">Open full map ↗</a>
          </div>
          <div className="map-footer"><span><i /> Faculty-based collection network</span><b>{points.length} active points</b></div>
        </section>
      </div>
    </div>
  );
}

function UsersRoles({ users, addUser, removeUser, toggleUserAdminAccess }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name:"", role:"Operator", email:"", status:"Active", hasAdminAccess:false });
  const [err,  setErr]  = useState("");
  const close = () => { setShow(false); setForm({name:"",role:"Operator",email:"",status:"Active", hasAdminAccess:false}); setErr(""); };
  const add = () => {
    if(!form.name.trim()){ setErr("User name is required."); return; }
    if(!form.email.trim()){ setErr("Email is required."); return; }
    addUser({ name:form.name.trim(), role:form.role, email:form.email.trim(), status:form.status, hasAdminAccess:form.hasAdminAccess }); close();
  };
  return (
    <div className="content">
      {show && <Modal title="Add User" onClose={close}>
        <div className="modal-body">
          <label className="field"><span>User Name</span><input autoFocus placeholder="e.g. Ahmed Ali" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></label>
          <label className="field"><span>Email</span><input type="email" placeholder="e.g. ahmed@georevivers.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></label>
          <label className="field"><span>Role</span><select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></label>
          <label className="field"><span>Status</span><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Active</option><option>Inactive</option></select></label>
          <label className="checkbox-field">
            <input type="checkbox" checked={form.hasAdminAccess} onChange={e=>setForm(f=>({...f,hasAdminAccess:e.target.checked}))} />
            <span>Grant Admin Panel Access (صلاحية لوحة الأدمن)</span>
          </label>
          {err && <p className="modal-err">{err}</p>}
        </div>
        <div className="modal-footer"><button className="outline-btn" onClick={close}>Cancel</button><button className="green-btn" onClick={add}>✓ Add User</button></div>
      </Modal>}
      <section className="card table-card">
        <div className="section-title">
          <div>
            <h2>Users &amp; Roles</h2>
            <span style={{display:"block",marginTop:"2px"}}>Manage team members and grant/revoke Admin Panel permissions</span>
          </div>
          <button className="green-btn" onClick={()=>setShow(true)}>＋ Add User</button>
        </div>
        <table>
          <thead><tr><th>User Name</th><th>Role</th><th>Email</th><th>Admin Panel Access</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id}>
                <td><b>{u.name}</b></td>
                <td>{u.role}</td>
                <td>{u.email}</td>
                <td>
                  <button
                    type="button"
                    className={`perm-badge ${u.hasAdminAccess ? "allowed" : "denied"}`}
                    onClick={() => toggleUserAdminAccess && toggleUserAdminAccess(u.id)}
                    title="Click to toggle Admin Panel access permission"
                  >
                    {u.hasAdminAccess ? "✓ Authorized" : "✕ Restricted"}
                  </button>
                </td>
                <td><span className={`badge ${u.status==="Active"?"good":"poor"}`}>{u.status}</span></td>
                <td><button className="delete-btn" onClick={()=>removeUser(u.id)}>Delete</button></td>
              </tr>
            ))}
            {!users.length && <tr><td colSpan="6" className="empty">No users found.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Settings({ adminPin, setAdminPin }) {
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);

  const handleUpdatePin = (e) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.trim().length < 4) {
      setPinMsg("PIN must be at least 4 characters.");
      return;
    }
    setAdminPin(newPin.trim());
    setPinMsg("Admin PIN updated successfully! ✓");
    setNewPin("");
    setTimeout(() => setPinMsg(""), 3500);
  };

  const handleResetPin = () => {
    if (window.confirm("Reset Admin PIN to default (1234)?")) {
      setAdminPin("1234");
      setPinMsg("Admin PIN reset to 1234 ✓");
      setTimeout(() => setPinMsg(""), 3500);
    }
  };

  return (
    <div className="content">
      <section className="card settings-card">
        <div className="tabs"><b>Security &amp; PIN</b><span>Profile</span><span>System Settings</span><span>Backup</span></div>
        <div className="settings-section">
          <div className="section-title">
            <div>
              <h3>Admin Panel Access PIN</h3>
              <p style={{margin:"4px 0 0",color:"var(--muted)",fontSize:"12px"}}>Set the secret PIN code required to unlock and display the Admin Panel for authorized personnel.</p>
            </div>
          </div>
          <div className="pin-current-box">
            <span>Current PIN:</span>
            <strong>{showCurrentPin ? adminPin : "••••"}</strong>
            <button type="button" className="outline-btn pin-show-btn" onClick={()=>setShowCurrentPin(p=>!p)}>
              {showCurrentPin ? "Hide" : "Show"}
            </button>
            <button type="button" className="outline-btn pin-reset-btn" onClick={handleResetPin} title="Reset to default 1234">
              ↺ Reset (1234)
            </button>
          </div>
          <form onSubmit={handleUpdatePin} className="pin-change-form">
            <label className="field" style={{maxWidth:"320px"}}>
              <span>Set New Admin PIN</span>
              <input
                type="password"
                placeholder="Enter new PIN (min 4 characters)"
                value={newPin}
                onChange={e => { setNewPin(e.target.value); setPinMsg(""); }}
                maxLength={12}
              />
            </label>
            <button type="submit" className="green-btn" style={{alignSelf:"flex-end",height:"42px"}}>Update PIN</button>
          </form>
          {pinMsg && <div className="success" style={{marginTop:"12px"}}>{pinMsg}</div>}
        </div>
        <hr style={{margin:"28px 0",border:"0",borderTop:"1px solid var(--line)"}} />
        <div className="settings-section">
          <h3>Profile Settings</h3>
          <div className="form-grid">
            <label className="field"><span>Full Name</span><input defaultValue="Supervisor" /></label>
            <label className="field"><span>Email</span><input defaultValue="supervisor@georevivers.com" /></label>
            <label className="field"><span>Phone</span><input defaultValue="+20 100 123 4567" /></label>
            <label className="field"><span>Password</span><input type="password" defaultValue="********" /></label>
          </div>
          <button className="green-btn" style={{marginTop:"16px"}}>Save Profile</button>
        </div>
      </section>
    </div>
  );
}

function RestrictedAdminCard({ onUnlock, onBack }) {
  return (
    <div className="content">
      <section className="card restricted-card">
        <div className="restricted-content">
          <div className="restricted-shield">🔒</div>
          <h2>Admin Panel Restricted</h2>
          <p>This panel is restricted to authorized team members chosen in Users &amp; Roles. Please verify your identity with the Admin PIN to access collection controls.</p>
          <div className="restricted-actions">
            <button type="button" className="outline-btn" onClick={onBack}>← Return to Dashboard</button>
            <button type="button" className="green-btn" onClick={onUnlock}>🔓 Enter Admin PIN</button>
          </div>
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
    if (!pin.trim()) {
      setErr("Please enter the Admin PIN.");
      return;
    }
    const ok = onUnlock(pin.trim());
    if (ok) {
      onClose();
    } else {
      setErr("Incorrect PIN. (Default PIN: 1234)");
      setPin("");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box pin-modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="pin-header-title">
            <span className="pin-shield-icon">🛡️</span>
            <div>
              <h3>Admin Access Verification</h3>
              <small>Enter PIN to unlock Admin Panel</small>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} type="button">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body pin-modal-body">
            <div className="pin-authorized-info">
              <span className="pin-info-icon">ℹ️</span>
              <div>
                <b>Restricted to Authorized Personnel</b>
                <p>Configured in Users &amp; Roles. Default PIN is <code>1234</code>.</p>
              </div>
            </div>

            {users && users.length > 0 && (
              <label className="field">
                <span>Authorized User Profile</span>
                <select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)}>
                  {users.map(u => (
                    <option key={u.id} value={u.name} disabled={!u.hasAdminAccess}>
                      {u.name} ({u.role}) — {u.hasAdminAccess ? "✓ Authorized" : "✕ Restricted"}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="field">
              <span>Security PIN Code</span>
              <input
                type="password"
                autoFocus
                maxLength={12}
                placeholder="Enter PIN (e.g. 1234)"
                value={pin}
                onChange={e => { setPin(e.target.value); setErr(""); }}
                className="pin-input"
              />
            </label>
            {err && <p className="modal-err pin-err">{err}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="outline-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="green-btn pin-submit-btn">🔓 Unlock Panel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
}

createRoot(document.getElementById("root")).render(<App />);
