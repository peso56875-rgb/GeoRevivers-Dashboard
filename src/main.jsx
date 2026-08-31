import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const WASTE_TYPES = [
  "Crushed Ceramic",
  "Crushed Concrete",
  "Crushed Asphalt",
  "Crushed Glass",
  "Steel",
  "Plastic",
];

const CONDITIONS = ["Good", "Medium", "Poor"];

const initialRecords = [
  { id: 1, date: "2026-08-30", type: "Crushed Concrete", quantity: 12.5, point: "Point A", condition: "Good", addedBy: "Supervisor" },
  { id: 2, date: "2026-08-29", type: "Crushed Ceramic", quantity: 8.75, point: "Point B", condition: "Medium", addedBy: "Supervisor" },
  { id: 3, date: "2026-08-28", type: "Steel", quantity: 5.2, point: "Point C", condition: "Good", addedBy: "Operator 1" },
  { id: 4, date: "2026-08-27", type: "Plastic", quantity: 3.1, point: "Point A", condition: "Poor", addedBy: "Operator 1" },
  { id: 5, date: "2026-08-26", type: "Crushed Glass", quantity: 6.8, point: "Point D", condition: "Good", addedBy: "Supervisor" },
  { id: 6, date: "2026-08-25", type: "Crushed Asphalt", quantity: 7.9, point: "Point E", condition: "Medium", addedBy: "Operator 2" },
  { id: 7, date: "2026-08-24", type: "Crushed Concrete", quantity: 10.4, point: "Point A", condition: "Good", addedBy: "Operator 2" },
];

const points = [
  { name: "Point A", city: "Cairo, Egypt", status: "Active" },
  { name: "Point B", city: "Giza, Egypt", status: "Active" },
  { name: "Point C", city: "Alexandria, Egypt", status: "Active" },
  { name: "Point D", city: "10th of Ramadan, Egypt", status: "Active" },
  { name: "Point E", city: "New Cairo, Egypt", status: "Active" },
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [records, setRecords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("georevivers_records")) || initialRecords;
    } catch {
      return initialRecords;
    }
  });

  useEffect(() => {
    localStorage.setItem("georevivers_records", JSON.stringify(records));
  }, [records]);

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addRecord = (record) => {
    setRecords((prev) => [{ ...record, id: Date.now(), addedBy: "Supervisor" }, ...prev]);
    setPage("records");
  };

  const removeRecord = (id) => {
    if (window.confirm("Delete this waste record?")) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="app-shell">
      <Sidebar 
        page={page} 
        setPage={setPage} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <main className="main">
        <Topbar 
          page={page} 
          onToggleMenu={() => setSidebarOpen((prev) => !prev)} 
          isMenuOpen={sidebarOpen} 
        />
        {page === "dashboard" && <Dashboard records={records} setPage={setPage} />}
        {page === "records" && <WasteRecords records={records} removeRecord={removeRecord} setPage={setPage} />}
        {page === "add" && <AddRecord addRecord={addRecord} />}
        {page === "analytics" && <Analytics records={records} />}
        {page === "categories" && <Categories records={records} />}
        {page === "points" && <CollectionPoints points={points} />}
        {page === "users" && <UsersRoles />}
        {page === "settings" && <Settings />}
      </main>
    </div>
  );
}

function Sidebar({ page, setPage, isOpen, onClose }) {
  const items = [
    ["dashboard", "⌂", "Dashboard"],
    ["records", "▤", "Waste Records"],
    ["analytics", "◔", "Analytics & Reports"],
    ["categories", "◈", "Waste Categories"],
    ["points", "⌖", "Collection Points"],
    ["add", "+", "Admin Panel"],
    ["users", "♙", "Users & Roles"],
    ["settings", "⚙", "Settings"],
  ];

  return (
    <>
      <div 
        className={`sidebar-backdrop ${isOpen ? "open" : ""}`} 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <img src="/georevivers-logo.jpeg" alt="GeoRevivers" />
          </div>
          <button 
            type="button" 
            className="close-sidebar-btn" 
            onClick={onClose} 
            title="إغلاق القائمة (Close Menu)" 
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav>
          {items.map(([id, icon, label]) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => {
                setPage(id);
                onClose();
              }}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
              {id === "add" && <span className="lock">🔒</span>}
            </button>
          ))}
        </nav>
        <div className="side-message">
          <div className="leaf">♻</div>
          <b>Improving Soil Today</b>
          <span>For a Better Tomorrow</span>
        </div>
      </aside>
    </>
  );
}

function Topbar({ page, onToggleMenu, isMenuOpen }) {
  const titles = {
    dashboard: ["Dashboard", "Overview of waste records and analytics"],
    records: ["Waste Records", "All registered waste collection records"],
    add: ["Admin Panel", "Add a new waste record"],
    analytics: ["Analytics & Reports", "Detailed insights and reports"],
    categories: ["Waste Categories", "Manage material categories"],
    points: ["Collection Points", "Manage collection locations"],
    users: ["Users & Roles", "Manage system users and permissions"],
    settings: ["Settings", "System settings and profile"],
  };
  const [title, subtitle] = titles[page] || ["Dashboard", "GeoRevivers"];

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="top-actions">
        <span className="bell">♧<i>3</i></span>
        <div className="avatar">S</div>
        <div className="user-meta">
          <strong>Supervisor</strong>
          <span>Admin</span>
        </div>
        <span>⌄</span>
        <button
          type="button"
          className={`hamburger-btn ${isMenuOpen ? "active" : ""}`}
          onClick={onToggleMenu}
          title="القائمة الجانبية (Menu)"
          aria-label="Toggle navigation menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </header>
  );
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function Dashboard({ records, setPage }) {
  const [filterType, setFilterType] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    type: "",
    day: "",
    month: "",
    year: "",
  });

  const handleApplyFilter = () => {
    setAppliedFilters({
      type: filterType,
      day: filterDay,
      month: filterMonth,
      year: filterYear,
    });
  };

  const handleResetFilter = () => {
    setFilterType("");
    setFilterDay("");
    setFilterMonth("");
    setFilterYear("");
    setAppliedFilters({
      type: "",
      day: "",
      month: "",
      year: "",
    });
  };

  const isFiltered = Boolean(
    (appliedFilters.type && appliedFilters.type !== "All Waste Types") ||
    (appliedFilters.day && appliedFilters.day !== "All Days") ||
    (appliedFilters.month && appliedFilters.month !== "All Months") ||
    (appliedFilters.year && appliedFilters.year !== "All Years")
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (!r.date) return false;
      const parts = r.date.split("-");
      const rYear = parts[0];
      const rMonthNum = parseInt(parts[1], 10);
      const rDayNum = parseInt(parts[2], 10);

      // Waste Type
      if (
        appliedFilters.type &&
        appliedFilters.type !== "All Waste Types" &&
        r.type !== appliedFilters.type
      ) {
        return false;
      }

      // Day
      if (
        appliedFilters.day &&
        appliedFilters.day !== "All Days"
      ) {
        if (rDayNum !== parseInt(appliedFilters.day, 10)) {
          return false;
        }
      }

      // Month
      if (
        appliedFilters.month &&
        appliedFilters.month !== "All Months"
      ) {
        const monthIdx = MONTH_NAMES.indexOf(appliedFilters.month);
        if (monthIdx !== -1) {
          if (rMonthNum !== monthIdx + 1) return false;
        } else {
          if (rMonthNum !== parseInt(appliedFilters.month, 10)) return false;
        }
      }

      // Year
      if (
        appliedFilters.year &&
        appliedFilters.year !== "All Years"
      ) {
        if (rYear !== String(appliedFilters.year)) return false;
      }

      return true;
    });
  }, [records, appliedFilters]);

  const total = filteredRecords.reduce((s, r) => s + Number(r.quantity), 0);
  const categories = WASTE_TYPES.map((type) => ({
    type,
    total: filteredRecords.filter((r) => r.type === type).reduce((s, r) => s + Number(r.quantity), 0),
  }));
  const max = Math.max(...categories.map((c) => c.total), 1);

  return (
    <div className="content">
      <div className="stats-grid">
        <StatCard 
          icon="♻" 
          value={total.toFixed(2)} 
          label="Total Waste (Ton)" 
          note={isFiltered ? `Filtered total (${filteredRecords.length} records)` : "+12.5% vs last month"} 
        />
        <StatCard 
          icon="▤" 
          value={filteredRecords.length} 
          label="Total Records" 
          note={isFiltered ? `Out of ${records.length} total records` : "+8.7% vs last month"} 
        />
        <StatCard 
          icon="⌖" 
          value={new Set(filteredRecords.map((r) => r.point)).size} 
          label="Collection Points" 
          note={isFiltered ? "Active points in filter" : "+6.3% vs last month"} 
        />
        <StatCard 
          icon="◈" 
          value={new Set(filteredRecords.map((r) => r.type)).size} 
          label="Active Categories" 
          note={isFiltered ? "Categories in filter" : "All categories"} 
        />
      </div>

      <div className="two-col">
        <section className="card">
          <div className="section-title">
            <h2>Waste Distribution</h2>
            <span>{isFiltered ? "Filtered by Quantity" : "By Quantity"}</span>
          </div>
          <div className="donut-layout">
            <Donut categories={categories} total={total} />
            <div className="legend">
              {categories.map((c, i) => (
                <div className="legend-row" key={c.type}>
                  <span className={`dot d${i}`} />
                  <span>{c.type}</span>
                  <b>{total ? ((c.total / total) * 100).toFixed(1) : "0.0"}%</b>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-title">
            <h2>Recent Waste Records</h2>
            <button className="outline-btn" onClick={() => setPage("records")}>View All</button>
          </div>
          <RecordsTable records={filteredRecords.slice(0, 5)} compact />
        </section>
      </div>

      <section className="card quick-filter">
        <div className="section-title">
          <div>
            <h2>Quick Filter</h2>
            <span style={{ display: "block", marginTop: "2px" }}>
              {isFiltered ? `Showing ${filteredRecords.length} of ${records.length} records matching filter` : "Filter dashboard data"}
            </span>
          </div>
          {isFiltered && (
            <button 
              type="button" 
              className="outline-btn reset-tag-btn" 
              onClick={handleResetFilter}
            >
              ↺ Reset Filter
            </button>
          )}
        </div>
        <FilterBar 
          filterType={filterType}
          setFilterType={setFilterType}
          filterDay={filterDay}
          setFilterDay={setFilterDay}
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
          filterYear={filterYear}
          setFilterYear={setFilterYear}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
          isFiltered={isFiltered}
          records={records}
        />
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Waste Quantity by Category</h2>
          <button className="green-btn" onClick={() => setPage("add")}>＋ Add Record</button>
        </div>
        <div className="bar-chart">
          {categories.map((c) => (
            <div className="bar-item" key={c.type}>
              <div className="bar-value">{c.total.toFixed(1)}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ height: `${total > 0 ? (c.total / max) * 100 : 0}%` }} />
              </div>
              <small>{c.type.replace("Crushed ", "")}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label, note }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div><strong>{value}</strong><span>{label}</span><small>{note}</small></div>
    </div>
  );
}

function Donut({ categories, total }) {
  const circumference = 2 * Math.PI * 50;
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" className="donut-bg" />
        {total > 0 && categories.map((c, i) => {
          const pct = total ? c.total / total : 0;
          const dash = pct * circumference;
          const el = <circle key={c.type} cx="60" cy="60" r="50" className={`donut-segment s${i}`}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset} />;
          offset += dash;
          return el;
        })}
      </svg>
      <div className="donut-center"><b>{total.toFixed(2)}</b><span>Ton</span></div>
    </div>
  );
}

function FilterBar({
  filterType,
  setFilterType,
  filterDay,
  setFilterDay,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  onApply,
  onReset,
  isFiltered,
  records = [],
}) {
  const availableYears = useMemo(() => {
    const yrs = new Set(["2026", "2025", "2024"]);
    records.forEach((r) => {
      if (r.date) yrs.add(r.date.split("-")[0]);
    });
    return Array.from(yrs).sort((a, b) => b - a);
  }, [records]);

  return (
    <div className="filter-grid">
      <Select 
        label="Waste Type" 
        options={["All Waste Types", ...WASTE_TYPES]} 
        value={filterType} 
        onChange={(e) => setFilterType(e.target.value)} 
      />
      <Select 
        label="Day" 
        options={["All Days", ...Array.from({ length: 31 }, (_, i) => String(i + 1))]} 
        value={filterDay} 
        onChange={(e) => setFilterDay(e.target.value)} 
      />
      <Select 
        label="Month" 
        options={["All Months", ...MONTH_NAMES]} 
        value={filterMonth} 
        onChange={(e) => setFilterMonth(e.target.value)} 
      />
      <Select 
        label="Year" 
        options={["All Years", ...availableYears]} 
        value={filterYear} 
        onChange={(e) => setFilterYear(e.target.value)} 
      />
      <div className="filter-actions">
        <button type="button" className="green-btn filter-btn" onClick={onApply}>
          ⌕ Apply Filter
        </button>
        {isFiltered && (
          <button type="button" className="outline-btn reset-btn" onClick={onReset} title="Clear filter">
            ↺ Reset
          </button>
        )}
      </div>
    </div>
  );
}

function Select({ label, options, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select 
        value={value || ""} 
        onChange={(e) => {
          if (typeof onChange === "function") {
            onChange(e);
          }
        }}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function WasteRecords({ records, removeRecord, setPage }) {
  const [search, setSearch] = useState("");
  const filtered = records.filter((r) =>
    `${r.type} ${r.point} ${r.condition} ${r.date}`.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="content">
      <div className="page-toolbar">
        <input className="search" placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="green-btn" onClick={() => setPage("add")}>＋ Add Record</button>
      </div>
      <section className="card table-card">
        <RecordsTable records={filtered} onDelete={removeRecord} />
      </section>
    </div>
  );
}

function RecordsTable({ records, onDelete, compact = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>
          <th>Date</th><th>Waste Type</th><th>Quantity (Ton)</th><th>Collection Point</th><th>Condition</th><th>Added By</th>{onDelete && <th>Actions</th>}
        </tr></thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{formatDate(r.date)}</td><td>{r.type}</td><td>{Number(r.quantity).toFixed(2)}</td><td>{r.point}</td>
              <td><span className={`badge ${r.condition.toLowerCase()}`}>{r.condition}</span></td><td>{r.addedBy}</td>
              {onDelete && <td><button className="delete-btn" onClick={() => onDelete(r.id)}>Delete</button></td>}
            </tr>
          ))}
          {!records.length && <tr><td colSpan="7" className="empty">No records found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function AddRecord({ addRecord }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, type: "", quantity: "", point: "", condition: "" });
  const [saved, setSaved] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.date || !form.type || !form.quantity || !form.point || !form.condition) return;
    addRecord({ ...form, quantity: Number(form.quantity) });
    setSaved(true);
  };

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="content">
      <section className="card admin-card">
        <div className="admin-intro">
          <h2>Add Waste Record</h2>
          <p>Enter the collection data. The dashboard will update automatically after saving.</p>
        </div>
        <form onSubmit={submit}>
          <div className="quick-entry">
            <Select label="Waste Type" options={WASTE_TYPES} value={form.type} onChange={(e) => update("type", e.target.value)} />
            <Select label="Day" options={Array.from({ length: 31 }, (_, i) => String(i + 1))} value={form.date.slice(8, 10).replace(/^0/, "")} onChange={(e) => update("date", `${form.date.slice(0, 8)}${String(e.target.value).padStart(2, "0")}`)} />
            <Select label="Month" options={["01 - January","02 - February","03 - March","04 - April","05 - May","06 - June","07 - July","08 - August","09 - September","10 - October","11 - November","12 - December"]} value={form.date.slice(5, 7)} onChange={(e) => update("date", `${form.date.slice(0, 5)}${e.target.value.slice(0, 2)}-${form.date.slice(8)}`)} />
            <Select label="Year" options={["2026","2027","2028","2029","2030"]} value={form.date.slice(0, 4)} onChange={(e) => update("date", `${e.target.value}-${form.date.slice(5)}`)} />
          </div>
          <div className="form-grid">
            <label className="field"><span>Quantity (Ton)</span><input type="number" min="0" step="0.01" placeholder="Enter quantity" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} /></label>
            <Select label="Collection Point" options={points.map(p => p.name)} value={form.point} onChange={(e) => update("point", e.target.value)} />
            <Select label="Condition" options={CONDITIONS} value={form.condition} onChange={(e) => update("condition", e.target.value)} />
          </div>
          <div className="form-actions">
            <button type="reset" className="outline-btn" onClick={() => setForm({ date: today, type: "", quantity: "", point: "", condition: "" })}>Clear</button>
            <button type="submit" className="green-btn">✓ Save Record</button>
          </div>
          {saved && <div className="success">Record saved successfully.</div>}
        </form>
      </section>

      <section className="card category-mini">
        <h2>Waste Categories</h2>
        <div className="category-pills">{WASTE_TYPES.map((x, i) => <span key={x} className={`pill p${i}`}>{x}</span>)}</div>
      </section>
    </div>
  );
}

function Analytics({ records }) {
  const total = records.reduce((s, r) => s + Number(r.quantity), 0);
  const avg = records.length ? total / records.length : 0;
  const byType = WASTE_TYPES.map(type => ({ type, value: records.filter(r => r.type === type).reduce((s,r)=>s+Number(r.quantity),0) }));
  const max = Math.max(...byType.map(x => x.value), 1);

  return (
    <div className="content">
      <div className="stats-grid">
        <StatCard icon="♻" value={total.toFixed(2)} label="Total Waste (Ton)" note="+12.5% vs last month" />
        <StatCard icon="▤" value={records.length} label="Total Records" note="+8.7% vs last month" />
        <StatCard icon="◒" value={avg.toFixed(2)} label="Avg. Quantity (Ton)" note="+5.4% vs last month" />
        <StatCard icon="⌖" value={new Set(records.map(r=>r.point)).size} label="Collection Points" note="+6.3% vs last month" />
      </div>
      <div className="two-col">
        <section className="card">
          <div className="section-title"><h2>Waste Trend</h2><span>Quantity (Ton)</span></div>
          <TrendChart records={records} />
        </section>
        <section className="card">
          <div className="section-title"><h2>Waste by Type</h2><span>Quantity (Ton)</span></div>
          <div className="horizontal-bars">
            {byType.map(x => <div className="hbar" key={x.type}><span>{x.type.replace("Crushed ","")}</span><div><i style={{width:`${(x.value/max)*100}%`}} /></div><b>{x.value.toFixed(1)}</b></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}

function TrendChart({ records }) {
  const data = [...records].slice(0, 10).reverse();
  const max = Math.max(...data.map(r=>Number(r.quantity)), 1);
  return <div className="trend-chart">{data.map((r,i)=><div className="trend-col" key={r.id}><span style={{height:`${(Number(r.quantity)/max)*150}px`}}></span><small>{new Date(r.date).getDate()}/{new Date(r.date).getMonth()+1}</small></div>)}</div>;
}

function Categories({ records }) {
  return <div className="content">
    <section className="card table-card">
      <div className="section-title"><h2>Waste Categories</h2><button className="green-btn">＋ Add Category</button></div>
      <table><thead><tr><th>Category Name</th><th>Description</th><th>Default Unit</th><th>Records</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>{WASTE_TYPES.map(t => <tr key={t}><td><b>{t}</b></td><td>{t} waste material</td><td>Ton</td><td>{records.filter(r=>r.type===t).length}</td><td><span className="badge good">Active</span></td><td><button className="link-btn">Edit</button></td></tr>)}</tbody></table>
    </section>
  </div>;
}

function CollectionPoints({ points }) {
  return <div className="content">
    <div className="two-col">
      <section className="card">
        <div className="section-title"><h2>Points List</h2><button className="green-btn">＋ Add Point</button></div>
        {points.map((p,i)=><div className="point-row" key={p.name}><span className="point-pin">⌖</span><div><b>{p.name}</b><small>{p.city}</small></div><span className="badge good">{p.status}</span></div>)}
      </section>
      <section className="card map-card"><div className="fake-map"><div className="map-grid" />{points.map((p,i)=><span key={p.name} className="map-pin" style={{left:`${18+i*16}%`,top:`${25+(i%3)*20}%`}}>⌖</span>)}<div className="map-label">Collection Points Map</div></div></section>
    </div>
  </div>;
}

function UsersRoles() {
  const users = [["Supervisor","Supervisor","Active"],["Operator 1","Operator","Active"],["Operator 2","Operator","Active"],["Viewer","Viewer","Inactive"]];
  return <div className="content"><section className="card table-card"><div className="section-title"><h2>Users & Roles</h2><button className="green-btn">＋ Add User</button></div>
    <table><thead><tr><th>User Name</th><th>Role</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>{users.map(u=><tr key={u[0]}><td><b>{u[0]}</b></td><td>{u[1]}</td><td>{u[0].toLowerCase().replace(" ",".")}@georevivers.com</td><td><span className={`badge ${u[2]==="Active"?"good":"poor"}`}>{u[2]}</span></td><td><button className="link-btn">Edit</button></td></tr>)}</tbody></table>
  </section></div>;
}

function Settings() {
  return <div className="content"><section className="card settings-card">
    <div className="tabs"><b>Profile</b><span>System Settings</span><span>Backup & Data</span><span>Notifications</span></div>
    <div className="form-grid">
      <label className="field"><span>Full Name</span><input defaultValue="Supervisor" /></label>
      <label className="field"><span>Email</span><input defaultValue="supervisor@georevivers.com" /></label>
      <label className="field"><span>Phone</span><input defaultValue="+20 100 123 4567" /></label>
      <label className="field"><span>Password</span><input type="password" defaultValue="********" /></label>
    </div>
    <button className="green-btn">Save Changes</button>
  </section></div>;
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

createRoot(document.getElementById("root")).render(<App />);
