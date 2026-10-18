import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard, Table2, PieChart, Layers, MapPin, Settings as SettingsIcon,
  Plus, Lock, Unlock, ShieldCheck, ArrowRight, ArrowLeft, Search, Bell, X, Trash2,
  Recycle, Activity, Factory, Menu, ChevronLeft, ChevronRight, Check, Eye, EyeOff,
  Compass, ExternalLink, Sparkles, Building2, TrendingUp, TrendingDown,
} from "lucide-react";
import "./styles.css";
import { initialRecords } from "./data.js";

/* ─── Constants & Configuration ─── */
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
  { id:1, name:"Supervisor Admin", role:"Supervisor", email:"supervisor@georevivers.com", status:"Active", hasAdminAccess:true },
  { id:2, name:"Eng. Operator 1",  role:"Operator",   email:"operator.1@georevivers.com", status:"Active", hasAdminAccess:false },
  { id:3, name:"Lab Operator 2",   role:"Operator",   email:"operator.2@georevivers.com", status:"Active", hasAdminAccess:false },
  { id:4, name:"Campus Viewer",    role:"Viewer",     email:"viewer@georevivers.com",     status:"Inactive", hasAdminAccess:false },
];

const PAGE_TITLES = {
  dashboard:  ["Sales Report", "Operations & Campus Waste Recovery"],
  records:    ["Ledger Records", "All verified waste collection entries"],
  add:        ["Add Waste Record", "Enter new campus collection data"],
  analytics:  ["Analytics & Reports", "Material trends and performance metrics"],
  categories: ["Waste Categories", "Material specifications and real photo gallery"],
  points:     ["Collection Points", "Campus locations and geospatial distribution"],
  settings:   ["Control & Settings", "Security, PIN access and team administration"],
};

function shortPoint(p) {
  return (p || "").replace(" - Delta University, Gamasa", "").replace(" - Faculty of Engineering, Delta University, Gamasa", "");
}

function formatDate(date) {
  if (!date) return "—";
  const [y, m, d] = date.split("-");
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m, 10) - 1] || m;
  return `${d} ${mon} ${y}`;
}

/* ══════════════════════════════════════════════════════════════
   App Root Component
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

  // Records state: strictly cleansed from steel and glass
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

  // Waste types: strictly cleansed from steel and glass
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

  const unlockAdmin = (pin) => {
    const ok = pin === adminPin || pin === "hesham" || pin === "1234";
    if (ok) setIsAdminUnlocked(true);
    return ok;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    if (page === "add") setPage("dashboard");
  };

  const toggleUserAdminAccess = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, hasAdminAccess: !u.hasAdminAccess } : u));
  };

  const addRecord = (r) => {
    if (!r || /steel|glass/i.test(r.type)) return;
    setRecords(p => [{ ...r, id: Date.now(), addedBy: "Admin" }, ...p]);
  };

  const removeRecord = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setRecords(p => p.filter(r => r.id !== id));
    }
  };

  const addWasteType = (t) => {
    if (!t || /steel|glass/i.test(t)) return;
    setWasteTypes(p => [...p.filter(x => !/steel|glass/i.test(x)), t]);
  };

  const removeWasteType = (t) => {
    if (window.confirm(`Delete waste category "${t}"?`)) {
      setWasteTypes(p => p.filter(x => x !== t));
    }
  };

  const addPoint = (pt) => setPoints(p => [...p, { ...pt, id: Date.now() }]);
  const removePoint = (id) => {
    if (window.confirm("Delete collection point?")) setPoints(p => p.filter(x => x.id !== id));
  };

  const addUser = (u) => setUsers(p => [...p, { ...u, id: Date.now() }]);
  const removeUser = (id) => {
    if (window.confirm("Delete user?")) setUsers(p => p.filter(x => x.id !== id));
  };

  if (page === "welcome") {
    return (
      <WelcomePage
        onEnter={() => setPage("dashboard")}
        onExploreMap={() => setPage("points")}
        records={records}
        wasteTypes={wasteTypes}
      />
    );
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
        onLockAdmin={lockAdmin}
      />

      <div className="main-wrapper">
        <Topbar
          page={page}
          setPage={setPage}
          onToggleMenu={() => setSidebarOpen(p => !p)}
          isAdminUnlocked={isAdminUnlocked}
          onOpenPinModal={() => setShowPinModal(true)}
          onLockAdmin={lockAdmin}
          recordsCount={records.length}
        />

        <div className="content-body">
          {page === "dashboard" && (
            <Dashboard
              records={records}
              setPage={setPage}
              wasteTypes={wasteTypes}
              points={points}
              isAdminUnlocked={isAdminUnlocked}
              onOpenPinModal={() => setShowPinModal(true)}
            />
          )}

          {page === "records" && (
            <WasteRecords
              records={records}
              removeRecord={removeRecord}
              setPage={setPage}
              isAdminUnlocked={isAdminUnlocked}
              onOpenPinModal={() => setShowPinModal(true)}
            />
          )}

          {page === "add" && (
            isAdminUnlocked ? (
              <AddRecord addRecord={addRecord} wasteTypes={wasteTypes} points={points} setPage={setPage} />
            ) : (
              <RestrictedCard onUnlock={() => setShowPinModal(true)} onBack={() => setPage("dashboard")} />
            )
          )}

          {page === "analytics" && (
            <Analytics records={records} wasteTypes={wasteTypes} points={points} />
          )}

          {page === "categories" && (
            <Categories
              records={records}
              wasteTypes={wasteTypes}
              addWasteType={addWasteType}
              removeWasteType={removeWasteType}
            />
          )}

          {page === "points" && (
            <CollectionPoints points={points} addPoint={addPoint} removePoint={removePoint} />
          )}

          {page === "settings" && (
            isAdminUnlocked ? (
              <Settings
                adminPin={adminPin}
                setAdminPin={setAdminPin}
                users={users}
                addUser={addUser}
                removeUser={removeUser}
                toggleUserAdminAccess={toggleUserAdminAccess}
              />
            ) : (
              <RestrictedCard onUnlock={() => setShowPinModal(true)} onBack={() => setPage("dashboard")} />
            )
          )}
        </div>
      </div>

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

/* ══════════════════════════════════════════════════════════════
   Sidebar Component (DealDeck Style)
   ══════════════════════════════════════════════════════════════ */
function Sidebar({ page, setPage, isOpen, onClose, isAdminUnlocked, onOpenPinModal, onLockAdmin }) {
  const navigate = (p) => {
    setPage(p);
    onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <button type="button" className="brand-wrap" onClick={() => navigate("welcome")}>
        <img src="/georevivers-logo.jpeg" alt="GeoRevivers" className="brand-logo-img" />
        <div className="brand-text">
          <h2>GeoRevivers</h2>
          <small>Delta University · Gamasa</small>
        </div>
      </button>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Menu</span>
        <button
          type="button"
          className={`nav-item ${page === "dashboard" ? "active" : ""}`}
          onClick={() => navigate("dashboard")}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`nav-item ${page === "records" ? "active" : ""}`}
          onClick={() => navigate("records")}
        >
          <Table2 size={18} />
          <span>Report & Records</span>
        </button>

        <button
          type="button"
          className={`nav-item ${page === "categories" ? "active" : ""}`}
          onClick={() => navigate("categories")}
        >
          <Layers size={18} />
          <span>Products / Waste</span>
        </button>

        <button
          type="button"
          className={`nav-item ${page === "analytics" ? "active" : ""}`}
          onClick={() => navigate("analytics")}
        >
          <PieChart size={18} />
          <span>Analytics</span>
        </button>

        <span className="nav-section-label">Operations</span>
        <button
          type="button"
          className={`nav-item ${page === "points" ? "active" : ""}`}
          onClick={() => navigate("points")}
        >
          <MapPin size={18} />
          <span>Collection Points</span>
        </button>

        <button
          type="button"
          className={`nav-item ${page === "add" ? "active" : ""}`}
          onClick={() => {
            if (isAdminUnlocked) navigate("add");
            else { onOpenPinModal(); onClose(); }
          }}
        >
          <Plus size={18} />
          <span>Add Record {isAdminUnlocked ? "" : "🔒"}</span>
        </button>

        <span className="nav-section-label">Tools</span>
        <button
          type="button"
          className={`nav-item ${page === "settings" ? "active" : ""}`}
          onClick={() => {
            if (isAdminUnlocked) navigate("settings");
            else { onOpenPinModal(); onClose(); }
          }}
        >
          <SettingsIcon size={18} />
          <span>Settings</span>
        </button>
      </nav>

      {/* DealDeck Bottom Card ("Upgrade Pro" equivalent -> Admin Mode Card) */}
      <div className={`sidebar-admin-card ${isAdminUnlocked ? "unlocked" : ""}`}>
        <div className="admin-card-icon">
          {isAdminUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
        </div>
        <h4>{isAdminUnlocked ? "Admin Unlocked" : "Supervisor Access"}</h4>
        <p>{isAdminUnlocked ? "Authorized control active. You can add or modify campus data." : "Enter supervisor PIN to unlock record creation and settings."}</p>
        {isAdminUnlocked ? (
          <button type="button" onClick={onLockAdmin}>
            <Lock size={14} /> Lock Admin Mode
          </button>
        ) : (
          <button type="button" onClick={() => { onOpenPinModal(); onClose(); }}>
            <Unlock size={14} /> Unlock Admin
          </button>
        )}
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════════
   Topbar Component (DealDeck Style)
   ══════════════════════════════════════════════════════════════ */
function Topbar({ page, setPage, onToggleMenu, isAdminUnlocked, onOpenPinModal, onLockAdmin, recordsCount }) {
  const [title, subtitle] = PAGE_TITLES[page] || ["Sales Report", "GeoRevivers Operations"];
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="button" className="hamburger-btn" onClick={onToggleMenu} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <div className="topbar-left">
          <h1>{title}</h1>
          <small>{todayFormatted} · Delta University, Gamasa</small>
        </div>
      </div>

      <div className="topbar-right">
        {isAdminUnlocked ? (
          <button type="button" className="admin-mode-badge unlocked" onClick={onLockAdmin} title="Click to lock admin session">
            <Unlock size={13} /> Admin Mode
          </button>
        ) : (
          <button type="button" className="admin-mode-badge locked" onClick={onOpenPinModal} title="Unlock supervisor panel">
            <Lock size={13} /> Unlock Admin
          </button>
        )}

        <button type="button" className="topbar-icon-btn" onClick={() => setPage("records")} title="Search records">
          <Search size={18} />
        </button>

        <button type="button" className="topbar-icon-btn" title="System Notifications">
          <Bell size={18} />
          <span className="notif-badge" />
        </button>

        <div className="user-profile-pill" onClick={() => { if (isAdminUnlocked) setPage("settings"); else onOpenPinModal(); }}>
          <div className="user-avatar">{isAdminUnlocked ? "S" : "V"}</div>
          <div className="user-meta">
            <span className="user-name">{isAdminUnlocked ? "Supervisor Admin" : "Guest Viewer"}</span>
            <span className="user-role">Delta University</span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   Dashboard Component (Pixel-Matching DealDeck Template)
   ══════════════════════════════════════════════════════════════ */
function Dashboard({ records, setPage, wasteTypes, points, isAdminUnlocked, onOpenPinModal }) {
  const totalTons = useMemo(() => records.reduce((s, r) => s + Number(r.quantity || 0), 0), [records]);
  const aggregatesTons = useMemo(() => {
    return records
      .filter(r => r.type !== "Plastic")
      .reduce((s, r) => s + Number(r.quantity || 0), 0);
  }, [records]);

  // Materials breakdown
  const materialStats = useMemo(() => {
    return wasteTypes.map(t => {
      const recs = records.filter(r => r.type === t);
      const total = recs.reduce((s, r) => s + Number(r.quantity || 0), 0);
      return {
        type: t,
        total,
        count: recs.length,
        share: totalTons > 0 ? (total / totalTons) * 100 : 0,
      };
    });
  }, [wasteTypes, records, totalTons]);

  // Monthly dual data for "Customer Habbits" dual bar chart
  const monthlyData = useMemo(() => {
    const months = ["01","02","03","04","05","06","07","08","09","10"];
    const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];
    return months.map((m, idx) => {
      const monthKey = `2026-${m}`;
      const recs = records.filter(r => (r.month === monthKey || (r.date && r.date.startsWith(monthKey))));
      const collected = recs.reduce((s, r) => s + Number(r.quantity || 0), 0);
      const processed = collected * 0.912; // Recovery processing ratio
      return {
        monthKey,
        label: names[idx],
        collected: Number(collected.toFixed(2)),
        processed: Number(processed.toFixed(2)),
      };
    });
  }, [records]);

  // Max value for dual bar chart normalization
  const maxBarValue = useMemo(() => {
    const vals = monthlyData.flatMap(d => [d.collected, d.processed]);
    return Math.max(...vals, 1);
  }, [monthlyData]);

  const [activeTooltipMonth, setActiveTooltipMonth] = useState("Apr");

  return (
    <>
      <div className="dashboard-main-grid">
        {/* Left Column (65%) */}
        <div className="col-left">
          {/* DealDeck 2x2 Metric Cards Grid */}
          <div className="metrics-2x2-grid">
            {/* Card 1: Highlight Card (Royal Blue Gradient) */}
            <div className="metric-card highlight-card">
              <div className="metric-card-top">
                <div className="metric-icon-circle">
                  <Recycle size={20} />
                </div>
                <span className="trend-pill">+2,08%</span>
              </div>
              <div className="metric-card-bottom">
                <small>Total Waste Processed</small>
                <div className="metric-val-wrap">
                  <span className="metric-number">{totalTons.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ton</span>
                  <span className="metric-subtext">Delta University Campus</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Records */}
            <div className="metric-card">
              <div className="metric-card-top">
                <div className="metric-icon-circle">
                  <Table2 size={20} />
                </div>
                <span className="trend-pill positive">+12,4%</span>
              </div>
              <div className="metric-card-bottom">
                <small>Total Ledger Records</small>
                <div className="metric-val-wrap">
                  <span className="metric-number">{records.length.toLocaleString()}</span>
                  <span className="metric-subtext">Verified 2026 Dataset</span>
                </div>
              </div>
            </div>

            {/* Card 3: Collection Points */}
            <div className="metric-card">
              <div className="metric-card-top">
                <div className="metric-icon-circle">
                  <MapPin size={20} />
                </div>
                <span className="trend-pill negative">-2,08%</span>
              </div>
              <div className="metric-card-bottom">
                <small>Active Collection Points</small>
                <div className="metric-val-wrap">
                  <span className="metric-number">{points.length} Points</span>
                  <span className="metric-subtext">Faculties & Testing Labs</span>
                </div>
              </div>
            </div>

            {/* Card 4: Recycled Aggregates */}
            <div className="metric-card">
              <div className="metric-card-top">
                <div className="metric-icon-circle">
                  <Factory size={20} />
                </div>
                <span className="trend-pill positive">+12,1%</span>
              </div>
              <div className="metric-card-bottom">
                <small>Recycled Aggregates</small>
                <div className="metric-val-wrap">
                  <span className="metric-number">{aggregatesTons.toFixed(2)} Ton</span>
                  <span className="metric-subtext">Concrete, Ceramic & Asphalt</span>
                </div>
              </div>
            </div>
          </div>

          {/* DealDeck "Customer Habbits" style Dual Bar Chart */}
          <div className="chart-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <h3>Campus Material Flow</h3>
                <p>Track your monthly collected vs processed quantities</p>
              </div>
              <button type="button" className="chart-dropdown-btn">
                <span>This year (2026)</span>
                <ChevronRight size={14} style={{ transform: "rotate(90deg)" }} />
              </button>
            </div>

            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot gray" />
                <span>Collected waste</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot blue" />
                <span>Processed aggregates</span>
              </div>
            </div>

            <div className="dual-bars-container">
              {monthlyData.map((d) => {
                const collectedHeight = Math.max(12, (d.collected / maxBarValue) * 160);
                const processedHeight = Math.max(8, (d.processed / maxBarValue) * 160);
                const isTooltipActive = activeTooltipMonth === d.label;

                return (
                  <div
                    className="dual-bar-column"
                    key={d.monthKey}
                    onMouseEnter={() => setActiveTooltipMonth(d.label)}
                    onClick={() => setActiveTooltipMonth(d.label)}
                  >
                    {isTooltipActive && (
                      <div className="bar-floating-tooltip">
                        <div className="tooltip-row">
                          <span className="tooltip-dot" style={{ background: "#ffffff" }} />
                          <span>{d.collected.toFixed(2)} t Collected</span>
                        </div>
                        <div className="tooltip-row">
                          <span className="tooltip-dot" style={{ background: "#3b5bf5" }} />
                          <span>{d.processed.toFixed(2)} t Processed</span>
                        </div>
                      </div>
                    )}
                    <div className="bars-pair">
                      <div className="single-bar collected" style={{ height: `${collectedHeight}px` }} title={`Collected: ${d.collected} t`} />
                      <div className="single-bar processed" style={{ height: `${processedHeight}px` }} title={`Processed: ${d.processed} t`} />
                    </div>
                    <span className="month-label">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (35%) */}
        <div className="col-right">
          {/* DealDeck "Product Statistic" Concentric Rings Card */}
          <div className="rings-card">
            <div className="card-header-row" style={{ marginBottom: 12 }}>
              <div className="card-title-group">
                <h3>Product Statistic</h3>
                <p>Track your recovery breakdown</p>
              </div>
              <button type="button" className="chart-dropdown-btn">
                <span>Overall</span>
                <ChevronRight size={14} style={{ transform: "rotate(90deg)" }} />
              </button>
            </div>

            <div className="rings-visual-row">
              {/* Concentric 3-Ring SVG Gauge */}
              <div className="rings-svg-wrap">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  {/* Track backgrounds */}
                  <circle cx="70" cy="70" r="56" fill="none" stroke="#f1f5f9" strokeWidth="9" />
                  <circle cx="70" cy="70" r="44" fill="none" stroke="#f1f5f9" strokeWidth="9" />
                  <circle cx="70" cy="70" r="32" fill="none" stroke="#f1f5f9" strokeWidth="9" />

                  {/* Ring 1 (Outer - Royal Blue - Concrete: ~40% circle) */}
                  <circle
                    cx="70" cy="70" r="56"
                    fill="none" stroke="#3b5bf5" strokeWidth="9"
                    strokeDasharray="351.8" strokeDashoffset="120"
                    strokeLinecap="round"
                  />
                  {/* Ring 2 (Middle - Coral/Orange - Ceramic: ~30% circle) */}
                  <circle
                    cx="70" cy="70" r="44"
                    fill="none" stroke="#f97316" strokeWidth="9"
                    strokeDasharray="276.4" strokeDashoffset="110"
                    strokeLinecap="round"
                  />
                  {/* Ring 3 (Inner - Soft Blue - Plastic & Asphalt: ~25% circle) */}
                  <circle
                    cx="70" cy="70" r="32"
                    fill="none" stroke="#93c5fd" strokeWidth="9"
                    strokeDasharray="201.0" strokeDashoffset="90"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="rings-stat-box">
                <span className="rings-big-val">{totalTons.toFixed(1)}</span>
                <span className="rings-sub">Total Tonnes Recovered</span>
                <span className="trend-pill positive" style={{ marginTop: 4 }}>+5,34%</span>
              </div>
            </div>

            {/* Material Rows (DealDeck Style) */}
            <div className="materials-list">
              {materialStats.map((m, idx) => {
                const trends = ["+1,8%", "+2,3%", "-1,04%", "+3,6%"];
                const icons = [<Recycle size={15} />, <Layers size={15} />, <Factory size={15} />, <Building2 size={15} />];
                const trend = trends[idx % trends.length];
                const isPos = !trend.startsWith("-");

                return (
                  <div className="material-row-item" key={m.type}>
                    <div className="mat-item-left">
                      <div className="mat-icon-wrap">{icons[idx % icons.length]}</div>
                      <span className="mat-name">{m.type}</span>
                    </div>
                    <div className="mat-item-right">
                      <span className="mat-tons">{m.total.toFixed(1)} t</span>
                      <span className={`trend-pill ${isPos ? "positive" : "negative"}`}>{trend}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DealDeck "Customer Growth" Location Distribution Card */}
          <div className="network-card">
            <div className="card-header-row" style={{ marginBottom: 6 }}>
              <div className="card-title-group">
                <h3>Campus Network</h3>
                <p>Track distribution by faculties</p>
              </div>
              <button type="button" className="chart-dropdown-btn">
                <span>Today</span>
                <ChevronRight size={14} style={{ transform: "rotate(90deg)" }} />
              </button>
            </div>

            <div className="network-content-row">
              <div className="bubble-cluster-wrap">
                <div className="bubble-circle bubble-1">2.417</div>
                <div className="bubble-circle bubble-2">287</div>
                <div className="bubble-circle bubble-3">812</div>
              </div>

              <div className="network-faculties-list">
                {points.slice(0, 4).map((pt, i) => (
                  <div className="faculty-row" key={pt.id}>
                    <div className="faculty-name-wrap">
                      <span className="faculty-pin" />
                      <span className="faculty-title">{pt.name.replace("Faculty of ", "")}</span>
                    </div>
                    <span className="faculty-tons">{(totalTons / 14 * (1.3 - i * 0.18)).toFixed(1)} t</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Photo Cards Section (with the 4 verified images) */}
      <section className="materials-photo-section">
        <div className="section-headline">
          <h3>Material Categories & Field Assets</h3>
          <p>Verified physical waste classifications used for sustainable ground revitalization</p>
        </div>

        <div className="material-cards-grid">
          {wasteTypes.map((t) => {
            const count = records.filter(r => r.type === t).length;
            const tonsVal = records.filter(r => r.type === t).reduce((s, r) => s + Number(r.quantity || 0), 0);
            const share = totalTons > 0 ? ((tonsVal / totalTons) * 100).toFixed(1) : 0;

            return (
              <article className="mat-photo-card" key={t}>
                <div className="mat-photo-wrap">
                  {WASTE_IMAGES[t] && (
                    <img src={WASTE_IMAGES[t]} alt={t} className="mat-photo-img" />
                  )}
                  <span className="mat-photo-badge">{share}% Share</span>
                </div>
                <div className="mat-photo-body">
                  <h4 className="mat-photo-title">{t}</h4>
                  <div className="mat-photo-stats">
                    <div className="mat-stat-col">
                      <strong>{tonsVal.toFixed(2)}</strong>
                      <small>Tonnes</small>
                    </div>
                    <div className="mat-stat-col">
                      <strong>{count}</strong>
                      <small>Records</small>
                    </div>
                    <div className="mat-stat-col">
                      <span className="trend-pill positive">Active</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   Waste Records Ledger Page (DealDeck Style)
   ══════════════════════════════════════════════════════════════ */
function WasteRecords({ records, removeRecord, setPage, isAdminUnlocked, onOpenPinModal }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 25;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter(r =>
      (r.type || "").toLowerCase().includes(q) ||
      (r.point || "").toLowerCase().includes(q) ||
      (r.condition || "").toLowerCase().includes(q) ||
      (r.date || "").toLowerCase().includes(q)
    );
  }, [records, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={16} color="#94a3b8" />
          <input
            placeholder="Search material type, faculty point, condition or date…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="trend-pill" style={{ background: "#f1f5f9", color: "#475569", padding: "8px 14px" }}>
            {filtered.length.toLocaleString()} total entries
          </span>

          {isAdminUnlocked ? (
            <button type="button" className="btn-primary" onClick={() => setPage("add")}>
              <Plus size={16} /> Add Record
            </button>
          ) : (
            <button type="button" className="btn-secondary" onClick={onOpenPinModal}>
              <Lock size={15} /> Add Record (Admin)
            </button>
          )}
        </div>
      </div>

      <div className="table-wrap">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Waste Type</th>
              <th>Quantity</th>
              <th>Collection Point</th>
              <th>Condition</th>
              <th>Added By</th>
              {isAdminUnlocked && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.id}>
                <td><span className="cell-date">{formatDate(r.date)}</span></td>
                <td><span className="cell-type">{r.type}</span></td>
                <td><span className="cell-qty">{Number(r.quantity).toFixed(4)} <small style={{ fontSize: 11, color: "#64748b" }}>Ton</small></span></td>
                <td><span className="cell-point">{shortPoint(r.point)}</span></td>
                <td>
                  <span className={`status-pill ${(r.condition || "").toLowerCase().replace(/\s+/g, "-")}`}>
                    {r.condition}
                  </span>
                </td>
                <td style={{ color: "#64748b", fontSize: 12 }}>{r.addedBy || "System"}</td>
                {isAdminUnlocked && (
                  <td>
                    <button type="button" className="btn-delete" onClick={() => removeRecord(r.id)} title="Delete entry">
                      <Trash2 size={15} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!paged.length && (
              <tr>
                <td colSpan={isAdminUnlocked ? 7 : 6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-wrap">
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="page-number-info">Page {currentPage} of {totalPages}</span>
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Categories Page (Showcasing 4 Photos + Management)
   ══════════════════════════════════════════════════════════════ */
function Categories({ records, wasteTypes, addWasteType, removeWasteType }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const close = () => { setShow(false); setName(""); setErr(""); };

  const add = () => {
    const t = name.trim();
    if (!t) { setErr("Category name is required."); return; }
    if (/steel|glass/i.test(t)) { setErr("This material category is not allowed."); return; }
    if (wasteTypes.includes(t)) { setErr("Already exists."); return; }
    addWasteType(t); close();
  };

  const totalTons = records.reduce((s, r) => s + Number(r.quantity || 0), 0);

  return (
    <>
      {show && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Waste Category</h3>
              <button type="button" className="modal-close-btn" onClick={close}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <label className="form-field">
                <span>Material Name</span>
                <input
                  autoFocus
                  placeholder="e.g. Crushed Brick"
                  value={name}
                  onChange={e => { setName(e.target.value); setErr(""); }}
                  onKeyDown={e => e.key === "Enter" && add()}
                />
              </label>
              {err && <p style={{ color: "#ef4444", fontSize: 12, margin: 0, fontWeight: 700 }}>{err}</p>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={close}>Cancel</button>
              <button type="button" className="btn-primary" onClick={add}>✓ Add Category</button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Photo Cards Grid */}
      <div className="material-cards-grid" style={{ marginBottom: 24 }}>
        {wasteTypes.map((t) => {
          const count = records.filter(r => r.type === t).length;
          const tonsVal = records.filter(r => r.type === t).reduce((s, r) => s + Number(r.quantity || 0), 0);
          const share = totalTons > 0 ? ((tonsVal / totalTons) * 100).toFixed(1) : 0;

          return (
            <article className="mat-photo-card" key={t}>
              <div className="mat-photo-wrap">
                {WASTE_IMAGES[t] && (
                  <img src={WASTE_IMAGES[t]} alt={t} className="mat-photo-img" />
                )}
                <span className="mat-photo-badge">{share}% Share</span>
              </div>
              <div className="mat-photo-body">
                <h4 className="mat-photo-title">{t}</h4>
                <div className="mat-photo-stats">
                  <div className="mat-stat-col">
                    <strong>{tonsVal.toFixed(2)}</strong>
                    <small>Tonnes</small>
                  </div>
                  <div className="mat-stat-col">
                    <strong>{count}</strong>
                    <small>Records</small>
                  </div>
                  <div className="mat-stat-col">
                    <span className="trend-pill positive">Active</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Management Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, fontFamily: "var(--font-display)" }}>Category Catalog</h3>
            <small style={{ color: "var(--text-muted)" }}>Default unit: Metric Tonnes (t)</small>
          </div>
          <button type="button" className="btn-primary" onClick={() => setShow(true)}>
            <Plus size={16} /> Add Category
          </button>
        </div>

        <div className="table-wrap">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Standard Unit</th>
                <th>Records</th>
                <th>Total Tonnes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wasteTypes.map(t => {
                const count = records.filter(r => r.type === t).length;
                const total = records.filter(r => r.type === t).reduce((s, r) => s + Number(r.quantity || 0), 0);
                return (
                  <tr key={t}>
                    <td><b className="cell-type">{t}</b></td>
                    <td style={{ color: "#64748b" }}>{t} waste aggregate for soil stabilization</td>
                    <td><span className="cell-date">Metric Ton</span></td>
                    <td><strong>{count.toLocaleString()}</strong></td>
                    <td><span className="cell-qty">{total.toFixed(2)} Ton</span></td>
                    <td><span className="status-pill processed">Active</span></td>
                    <td>
                      <button type="button" className="btn-delete" onClick={() => removeWasteType(t)}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   Analytics Page (DealDeck Style)
   ══════════════════════════════════════════════════════════════ */
function Analytics({ records, wasteTypes, points }) {
  const total = records.reduce((s, r) => s + Number(r.quantity || 0), 0);

  return (
    <div className="dashboard-main-grid">
      <div className="col-left">
        <div className="chart-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Monthly Aggregation Analysis</h3>
              <p>10-Month distribution from Delta University operations</p>
            </div>
            <span className="trend-pill positive">+14.2% overall recovery</span>
          </div>

          <div style={{ padding: "20px 0" }}>
            {wasteTypes.map((t) => {
              const recs = records.filter(r => r.type === t);
              const val = recs.reduce((s, r) => s + Number(r.quantity || 0), 0);
              const pct = total > 0 ? (val / total) * 100 : 0;

              return (
                <div key={t} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 700 }}>
                    <span>{t}</span>
                    <span>{val.toFixed(2)} Ton ({pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{ height: 10, background: "#f1f5f9", borderRadius: 20, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "var(--primary)", borderRadius: 20 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="col-right">
        <div className="rings-card">
          <div className="card-title-group" style={{ marginBottom: 16 }}>
            <h3>Recovery Summary</h3>
            <p>Certified circular output</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Estimated Ground Improvement Area</span>
              <strong style={{ display: "block", fontSize: 24, marginTop: 4, color: "var(--primary)", fontFamily: "var(--font-display)" }}>
                {(total * 14.5).toFixed(0)} m²
              </strong>
            </div>

            <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>CO₂ Emissions Prevented</span>
              <strong style={{ display: "block", fontSize: 24, marginTop: 4, color: "#10b981", fontFamily: "var(--font-display)" }}>
                {(total * 0.42).toFixed(1)} Metric Tons
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Collection Points Page
   ══════════════════════════════════════════════════════════════ */
function CollectionPoints({ points, addPoint, removePoint }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const close = () => { setShow(false); setName(""); setErr(""); };

  const add = () => {
    if (!name.trim()) { setErr("Point name is required."); return; }
    addPoint({
      name: name.trim(),
      fullName: `${name.trim()} - Delta University, Gamasa`,
      city: "Delta University · Gamasa",
      status: "Active",
      x: 50,
      y: 50,
    });
    close();
  };

  return (
    <>
      {show && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Collection Point</h3>
              <button type="button" className="modal-close-btn" onClick={close}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <label className="form-field">
                <span>Facility / Station Name</span>
                <input
                  autoFocus
                  placeholder="e.g. Faculty of Science"
                  value={name}
                  onChange={e => { setName(e.target.value); setErr(""); }}
                  onKeyDown={e => e.key === "Enter" && add()}
                />
              </label>
              {err && <p style={{ color: "#ef4444", fontSize: 12, margin: 0, fontWeight: 700 }}>{err}</p>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={close}>Cancel</button>
              <button type="button" className="btn-primary" onClick={add}>✓ Add Point</button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-main-grid">
        <div className="col-left">
          <div className="table-card">
            <div className="table-toolbar">
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 17, fontFamily: "var(--font-display)" }}>Campus Points ({points.length})</h3>
                <small style={{ color: "var(--text-muted)" }}>Delta University for Science & Technology, Gamasa</small>
              </div>
              <button type="button" className="btn-primary" onClick={() => setShow(true)}>
                <Plus size={16} /> Add Point
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {points.map((pt) => (
                <div key={pt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", border: "1px solid #e2e8f0" }}>
                      <MapPin size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 13.5, color: "var(--text-main)", display: "block" }}>{pt.name}</strong>
                      <small style={{ color: "#64748b" }}>{pt.city}</small>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="status-pill processed">{pt.status}</span>
                    <button type="button" className="btn-delete" onClick={() => removePoint(pt.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-right">
          <div className="chart-card" style={{ padding: 14 }}>
            <div style={{ padding: "10px 10px 16px" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 16, fontFamily: "var(--font-display)" }}>Delta Campus Map</h3>
              <small style={{ color: "#64748b" }}>Gamasa, International Coastal Road, Dakahlia</small>
            </div>
            <div style={{ height: 380, borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <iframe
                title="Delta University Map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${UNIVERSITY_CENTER.lng-0.008}%2C${UNIVERSITY_CENTER.lat-0.005}%2C${UNIVERSITY_CENTER.lng+0.008}%2C${UNIVERSITY_CENTER.lat+0.005}&layer=mapnik&marker=${UNIVERSITY_CENTER.lat}%2C${UNIVERSITY_CENTER.lng}`}
                style={{ width: "100%", height: "100%", border: 0 }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   Admin Panel: Add Record (DealDeck Style)
   ══════════════════════════════════════════════════════════════ */
function AddRecord({ addRecord, wasteTypes, points, setPage }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    date: today,
    type: wasteTypes[0] || "Plastic",
    quantity: "",
    point: points[0]?.fullName || points[0]?.name || "",
    condition: "Collected waste",
    time: "10:30",
    notes: "",
  });
  const [success, setSuccess] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.date || !form.type || !form.quantity || !form.point || !form.condition) return;
    if (/steel|glass/i.test(form.type)) return;

    addRecord({
      ...form,
      quantity: Number(form.quantity),
      month: form.date.slice(0, 7),
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
    setForm(f => ({ ...f, quantity: "", notes: "" }));
  };

  return (
    <div className="table-card" style={{ maxWidth: 860, margin: "0 auto" }}>
      <div className="table-toolbar">
        <div>
          <span className="trend-pill" style={{ background: "#e0f2fe", color: "#0369a1", marginBottom: 6 }}>
            🛡️ Supervisor Portal
          </span>
          <h2 style={{ margin: "4px 0", fontSize: 20, fontFamily: "var(--font-display)" }}>Add New Waste Collection Record</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
            Entries immediately update live dashboard statistics, charts and campus totals.
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => setPage("records")}>
          ← View All Records
        </button>
      </div>

      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="form-field">
            <span>Material Category</span>
            <select value={form.type} onChange={e => update("type", e.target.value)}>
              {wasteTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <label className="form-field">
            <span>Collection Date</span>
            <input type="date" value={form.date} onChange={e => update("date", e.target.value)} required />
          </label>

          <label className="form-field">
            <span>Quantity (Metric Tonnes)</span>
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              placeholder="e.g. 0.0475"
              value={form.quantity}
              onChange={e => update("quantity", e.target.value)}
              required
            />
          </label>

          <label className="form-field">
            <span>Collection Point</span>
            <select value={form.point} onChange={e => update("point", e.target.value)}>
              {points.map(p => <option key={p.id} value={p.fullName || p.name}>{p.name}</option>)}
            </select>
          </label>

          <label className="form-field">
            <span>Material Condition</span>
            <select value={form.condition} onChange={e => update("condition", e.target.value)}>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="form-field">
            <span>Collection Time</span>
            <input type="time" value={form.time} onChange={e => update("time", e.target.value)} />
          </label>

          <label className="form-field" style={{ gridColumn: "1 / -1" }}>
            <span>Notes / Laboratory Remarks</span>
            <input
              placeholder="e.g. Collected from Engineering Workshop #2, moisture within optimal range"
              value={form.notes}
              onChange={e => update("notes", e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
          <button type="reset" className="btn-secondary" onClick={() => setForm(f => ({ ...f, quantity: "", notes: "" }))}>
            Reset Form
          </button>
          <button type="submit" className="btn-primary">
            ✓ Submit &amp; Save Record
          </button>
        </div>

        {success && (
          <div style={{ marginTop: 18, padding: "12px 16px", borderRadius: 12, background: "#dcfce7", color: "#15803d", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={16} /> Record saved successfully! Live dashboard statistics have been recalculated.
          </div>
        )}
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Restricted Access Card
   ══════════════════════════════════════════════════════════════ */
function RestrictedCard({ onUnlock, onBack }) {
  return (
    <div className="table-card" style={{ maxWidth: 520, margin: "60px auto", textAlign: "center", padding: "48px 32px" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Lock size={28} />
      </div>
      <h2 style={{ margin: "0 0 8px", fontSize: 22, fontFamily: "var(--font-display)" }}>Restricted Administrator Area</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.5, margin: "0 0 24px" }}>
        This section is reserved for supervisors and authorized laboratory managers. Please enter your administrator PIN to proceed.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <button type="button" className="btn-secondary" onClick={onBack}>← Back to Dashboard</button>
        <button type="button" className="btn-primary" onClick={onUnlock}>🔓 Enter Security PIN</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Settings & PIN Management Page
   ══════════════════════════════════════════════════════════════ */
function Settings({ adminPin, setAdminPin, users, addUser, removeUser, toggleUserAdminAccess }) {
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);

  const handleUpdatePin = (e) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      setPinMsg("PIN must be at least 4 characters.");
      return;
    }
    setAdminPin(newPin.trim());
    setPinMsg("Admin PIN updated successfully!");
    setNewPin("");
    setTimeout(() => setPinMsg(""), 3000);
  };

  return (
    <div className="dashboard-main-grid">
      <div className="col-left">
        <div className="table-card">
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "var(--font-display)" }}>Administrator Security PIN</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 20px" }}>
            The PIN is required to unlock administrative actions, record editing, and campus settings.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "16px 20px", borderRadius: 14, border: "1px solid #e2e8f0", marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Current Active PIN:</span>
              <strong style={{ display: "block", fontSize: 18, letterSpacing: 4, fontFamily: "var(--font-mono)", marginTop: 2 }}>
                {showCurrentPin ? adminPin : "••••"}
              </strong>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setShowCurrentPin(p => !p)}>
                {showCurrentPin ? "Hide" : "Show"}
              </button>
              <button type="button" className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setAdminPin("hesham")}>
                Reset (hesham)
              </button>
            </div>
          </div>

          <form onSubmit={handleUpdatePin} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <label className="form-field" style={{ flex: 1 }}>
              <span>Set New Security PIN</span>
              <input
                type="password"
                placeholder="Enter new 4+ character PIN"
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
              />
            </label>
            <button type="submit" className="btn-primary" style={{ height: 44 }}>
              Update PIN
            </button>
          </form>
          {pinMsg && <p style={{ color: "#15803d", fontSize: 12.5, fontWeight: 700, marginTop: 10 }}>{pinMsg}</p>}
        </div>
      </div>

      <div className="col-right">
        <div className="rings-card">
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "var(--font-display)" }}>Authorized Team</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 16px" }}>
            Personnel with supervisor credentials
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {users.map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12.5 }}>
                <div>
                  <strong style={{ display: "block", color: "var(--text-main)" }}>{u.name}</strong>
                  <small style={{ color: "#64748b" }}>{u.role}</small>
                </div>
                <button
                  type="button"
                  onClick={() => toggleUserAdminAccess(u.id)}
                  style={{
                    border: 0,
                    borderRadius: 20,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: u.hasAdminAccess ? "#dcfce7" : "#f1f5f9",
                    color: u.hasAdminAccess ? "#15803d" : "#64748b",
                  }}
                >
                  {u.hasAdminAccess ? "✓ Authorized" : "Restricted"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PIN Security Modal
   ══════════════════════════════════════════════════════════════ */
function PinModal({ onClose, onUnlock, users }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!pin.trim()) { setErr("Please enter the security PIN."); return; }

    const ok = onUnlock(pin.trim());
    if (ok) {
      onClose();
    } else {
      setErr("Incorrect PIN code. Default is 'hesham' or '1234'.");
      setPin("");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e0f2fe", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15.5 }}>Supervisor Authentication</h3>
              <small style={{ color: "var(--text-muted)" }}>Restricted Administrator Access</small>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
              🔒 Default supervisor PIN code is <code>hesham</code> (or <code>1234</code>). Configurable in Settings.
            </div>

            <label className="form-field">
              <span>Enter Security PIN</span>
              <input
                type="password"
                autoFocus
                placeholder="••••"
                maxLength={16}
                value={pin}
                onChange={e => { setPin(e.target.value); setErr(""); }}
                className="pin-input-big"
              />
            </label>
            {err && <p style={{ color: "#ef4444", fontSize: 12, margin: 0, fontWeight: 700 }}>{err}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">🔓 Unlock Mode</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Breathtaking Welcome Page (DealDeck Light Aesthetic)
   ══════════════════════════════════════════════════════════════ */
function WelcomePage({ onEnter, onExploreMap, records, wasteTypes }) {
  const total = records.reduce((s, r) => s + Number(r.quantity || 0), 0);

  return (
    <div className="welcome-page">
      <div className="welcome-ambient-glow" />

      {/* Navigation */}
      <header className="welcome-navbar">
        <div className="welcome-brand-group">
          <img src="/georevivers-logo.jpeg" alt="GeoRevivers" className="welcome-brand-logo" />
          <div className="welcome-brand-text">
            <h2>GeoRevivers</h2>
            <small>Delta University for Science &amp; Technology</small>
          </div>
        </div>

        <div className="welcome-nav-right">
          <button type="button" className="btn-secondary" onClick={onExploreMap}>
            <MapPin size={15} /> Campus Network
          </button>
          <button type="button" className="btn-primary" onClick={onEnter}>
            Enter Dashboard <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="welcome-hero-container">
        <div className="welcome-copy-col">
          <div className="welcome-eyebrow">
            <Sparkles size={14} color="#3b5bf5" />
            <span>Sustainable Ground Improvement &amp; Circular Campus</span>
          </div>

          <h1 className="welcome-headline">
            Reviving Resources. <br />
            <span>Restoring Tomorrow.</span>
          </h1>

          <p className="welcome-desc">
            GeoRevivers turns every construction and organic byproduct across Delta University into certified geotechnical assets—powering sustainable ground improvement with zero waste.
          </p>

          <div className="welcome-action-row">
            <button type="button" className="btn-primary" style={{ padding: "14px 28px", fontSize: 14.5 }} onClick={onEnter}>
              Open Command Dashboard <ArrowRight size={16} />
            </button>
            <button type="button" className="btn-secondary" style={{ padding: "14px 24px", fontSize: 14.5 }} onClick={onExploreMap}>
              Explore 14 Collection Points
            </button>
          </div>

          <div className="welcome-metrics-strip">
            <div className="welcome-metric-col">
              <strong>14</strong>
              <span>Collection Points</span>
            </div>
            <div className="welcome-metric-col">
              <strong>{records.length.toLocaleString()}</strong>
              <span>Verified Records</span>
            </div>
            <div className="welcome-metric-col">
              <strong>{total.toFixed(1)} t</strong>
              <span>Total Processed</span>
            </div>
            <div className="welcome-metric-col">
              <strong>4</strong>
              <span>Core Materials</span>
            </div>
          </div>
        </div>

        {/* Right Visual: Original GeoRevivers Emblem + Delta University Logo Beneath */}
        <div className="welcome-visual-col">
          <div className="welcome-emblem-wrap">
            {/* Ambient Background Glow */}
            <div className="emblem-glow-ring" />

            {/* Orbit Card Top Left */}
            <div className="floating-orbit-card orbit-card-1">
              <div className="orbit-icon-circle green"><Sparkles size={16} /></div>
              <div>
                <small>Circular Impact</small>
                <strong>98.4% Recovery Rate</strong>
              </div>
            </div>

            {/* Orbit Card Top Right */}
            <div className="floating-orbit-card orbit-card-2">
              <div className="orbit-icon-circle blue"><Recycle size={16} /></div>
              <div>
                <small>Total Operations</small>
                <strong>{total.toFixed(1)} Tonne Ledger</strong>
              </div>
            </div>

            {/* Orbit Card Bottom Left */}
            <div className="floating-orbit-card orbit-card-3">
              <div className="orbit-icon-circle purple"><MapPin size={16} /></div>
              <div>
                <small>Campus Network</small>
                <strong>14 Active Stations</strong>
              </div>
            </div>

            {/* Centerpiece Pedestal Card */}
            <div className="emblem-pedestal-card">
              {/* 1. Original GeoRevivers Logo */}
              <div className="original-logo-frame">
                <img
                  src="/georevivers-logo.jpeg"
                  alt="GeoRevivers - Improve Soil · Redesign Ground"
                  className="original-georevivers-logo"
                />
              </div>

              {/* 2. University Logo nestled directly beneath */}
              <div className="university-sub-badge">
                <img
                  src="/delta-university-logo.png"
                  alt="Delta University for Science and Technology"
                  className="university-sub-logo"
                />
                <div className="university-sub-text">
                  <strong>Delta University</strong>
                  <small>For Science &amp; Technology · Gamasa</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Rich Sections */}
      <div className="welcome-sections-wrap">
        {/* Section 1: The 4 Physical Materials with Real Photos */}
        <section>
          <div className="welcome-section-header">
            <span><Layers size={13} /> Physical Materials Catalog</span>
            <h2>Certified Ground Improvement Aggregates</h2>
            <p>
              Direct photographic documentation of the 4 verified byproduct streams converted into high-performance soil stabilization assets across Delta University.
            </p>
          </div>

          <div className="material-cards-grid">
            {wasteTypes.map((t) => {
              const count = records.filter(r => r.type === t).length;
              const tonsVal = records.filter(r => r.type === t).reduce((s, r) => s + Number(r.quantity || 0), 0);
              const share = total > 0 ? ((tonsVal / total) * 100).toFixed(1) : 0;

              return (
                <article className="mat-photo-card" key={t}>
                  <div className="mat-photo-wrap">
                    {WASTE_IMAGES[t] && (
                      <img src={WASTE_IMAGES[t]} alt={t} className="mat-photo-img" />
                    )}
                    <span className="mat-photo-badge">{share}% Share</span>
                  </div>
                  <div className="mat-photo-body">
                    <h4 className="mat-photo-title">{t}</h4>
                    <div className="mat-photo-stats">
                      <div className="mat-stat-col">
                        <strong>{tonsVal.toFixed(2)}</strong>
                        <small>Tonnes</small>
                      </div>
                      <div className="mat-stat-col">
                        <strong>{count}</strong>
                        <small>Records</small>
                      </div>
                      <div className="mat-stat-col">
                        <span className="trend-pill positive">Active</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Section 2: 3-Pillar Operations Workflow */}
        <section>
          <div className="welcome-section-header">
            <span><Compass size={13} /> Methodology &amp; Engineering</span>
            <h2>How GeoRevivers Closes the Campus Loop</h2>
            <p>
              From collection at university faculty points to certified sub-base stabilization on the Mediterranean coastal soil of Gamasa.
            </p>
          </div>

          <div className="welcome-workflow-grid">
            <div className="workflow-card">
              <div className="workflow-step-badge">01</div>
              <h3>Faculty Point Collection</h3>
              <p>
                Continuous tracking across 14 dedicated collection points spanning all faculties, labs, and coastal road maintenance zones.
              </p>
            </div>

            <div className="workflow-card">
              <div className="workflow-step-badge">02</div>
              <h3>Laboratory Crushing &amp; Sizing</h3>
              <p>
                Mechanical crushing of ceramics, concrete, and asphalt at the Faculty of Engineering Materials Testing Lab into standardized aggregate fractions.
              </p>
            </div>

            <div className="workflow-card">
              <div className="workflow-step-badge">03</div>
              <h3>Soil &amp; Sub-Base Revitalization</h3>
              <p>
                Direct geotechnical insertion for ground improvement, moisture mitigation, and pavement foundation stabilization across the campus.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Bottom Call to Action Banner */}
        <div className="welcome-cta-banner">
          <div className="cta-banner-text">
            <h2>Ready to inspect the live operation?</h2>
            <p>
              Access the complete DealDeck-styled command center with 3,515 verified Excel records, material flow trends, and faculty network analytics.
            </p>
          </div>
          <button type="button" className="cta-banner-btn" onClick={onEnter}>
            Enter Command Dashboard <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="welcome-footer">
        GeoRevivers Environmental Operations System · Delta University for Science &amp; Technology · Gamasa, Egypt
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
