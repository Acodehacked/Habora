"use client";

import { useState } from "react";
import {
  Archive,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My home", icon: Home, count: "1" },
  { label: "Things I own", icon: Package, count: "24" },
  { label: "Subscriptions", icon: CircleDollarSign, count: "8" },
  { label: "Documents", icon: FileText, count: "36" },
];

const reminders = [
  { icon: Wrench, color: "mint", title: "HVAC annual service", detail: "Due in 6 days", action: "Schedule" },
  { icon: CircleDollarSign, color: "coral", title: "Internet bill", detail: "$79.00 · due tomorrow", action: "Review" },
  { icon: ShieldCheck, color: "gold", title: "Laptop warranty", detail: "Expires in 18 days", action: "View" },
];

const assets = [
  { name: "Maple Street home", meta: "Property · Added 2 years ago", icon: Home, value: "$482,000", tone: "sage" },
  { name: "Bosch refrigerator", meta: "Appliance · Kitchen", icon: Archive, value: "Warranty active", tone: "blue" },
  { name: "Toyota Corolla", meta: "Vehicle · 2021", icon: Package, value: "Service in 31 days", tone: "peach" },
];

export default function HomePage() {
  const [active, setActive] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState(false);

  function addItem() {
    setToast(true);
    window.setTimeout(() => setToast(false), 2800);
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></div>
          <span>habora</span>
          <button className="close-nav" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <div className="workspace-switcher">
          <div className="avatar">JD</div>
          <div><strong>Jordan&apos;s space</strong><small>Personal workspace</small></div>
          <ChevronRight size={16} className="muted-icon" />
        </div>
        <nav className="primary-nav" aria-label="Main navigation">
          <span className="nav-label">Workspace</span>
          {navItems.map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-item ${active === label ? "active" : ""}`} onClick={() => { setActive(label); setMobileOpen(false); }}>
              <Icon size={18} /><span>{label}</span>{count && <em>{count}</em>}
            </button>
          ))}
          <span className="nav-label nav-label-spaced">Manage</span>
          <button className="nav-item" onClick={addItem}><CalendarDays size={18} /><span>Calendar</span></button>
          <button className="nav-item" onClick={addItem}><Wrench size={18} /><span>Maintenance</span></button>
          <button className="nav-item" onClick={addItem}><ClipboardList size={18} /><span>Tasks</span><em>3</em></button>
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><Settings size={18} /><span>Settings</span></button>
          <div className="help-card"><div className="help-icon"><LifeBuoy size={18} /></div><div><strong>Need a hand?</strong><small>We&apos;re here to help</small></div><ArrowUpRight size={15} /></div>
        </div>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{active}</strong></div>
          <div className="top-actions"><button className="icon-button search-button" aria-label="Search"><Search size={19} /></button><button className="icon-button" aria-label="Notifications"><Bell size={19} /><i /></button><div className="top-avatar">JD</div></div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div><p className="eyebrow">Tuesday, September 22, 2026</p><h1>Good morning, Jordan <span>✦</span></h1><p className="subhead">Here&apos;s what needs your attention today.</p></div>
            <button className="primary-button" onClick={addItem}><Plus size={18} /> Add something</button>
          </div>

          <section className="insight-banner"><div className="insight-symbol"><Sparkles size={21} /></div><div><strong>Small wins add up.</strong><p>You&apos;ve organized 68% of your household essentials. Keep going to make future-you&apos;s life easier.</p></div><div className="progress-ring"><span>68%</span></div></section>

          <div className="section-heading"><div><h2>At a glance</h2><p>Your household, beautifully organized.</p></div><button className="text-button">Customize <Settings size={15} /></button></div>
          <div className="stats-grid">
            <article className="stat-card stat-green"><div className="stat-icon"><Home size={19} /></div><p>Things I own</p><strong>24</strong><span><b>+3</b> this month</span></article>
            <article className="stat-card stat-yellow"><div className="stat-icon"><CircleDollarSign size={19} /></div><p>Monthly commitments</p><strong>$347</strong><span>across 8 subscriptions</span></article>
            <article className="stat-card stat-blue"><div className="stat-icon"><ShieldCheck size={19} /></div><p>Active warranties</p><strong>11</strong><span><b>2</b> expiring soon</span></article>
            <article className="stat-card stat-pink"><div className="stat-icon"><FileText size={19} /></div><p>Saved documents</p><strong>36</strong><span>all in one place</span></article>
          </div>

          <div className="dashboard-grid">
            <section className="panel reminders-panel"><div className="panel-heading"><div><h2>Up next</h2><p>Things that might need you soon.</p></div><button className="more-button">•••</button></div><div className="reminder-list">{reminders.map(({ icon: Icon, color, title, detail, action }) => <div className="reminder" key={title}><div className={`reminder-icon ${color}`}><Icon size={18} /></div><div className="reminder-copy"><strong>{title}</strong><span>{detail}</span></div><button className="small-button" onClick={addItem}>{action}</button></div>)}</div><button className="view-all">View all reminders <ArrowUpRight size={15} /></button></section>
            <section className="panel spending-panel"><div className="panel-heading"><div><h2>Monthly spending</h2><p>Your recurring commitments.</p></div><button className="period-button">This month <ChevronRight size={14} /></button></div><div className="spend-total"><strong>$347.20</strong><span><b>↓ 8.4%</b> vs last month</span></div><div className="chart" aria-label="Monthly spending chart"><div className="chart-y"><span>$400</span><span>$300</span><span>$200</span><span>$100</span><span>$0</span></div><div className="chart-bars">{[[44,"Jan"],[58,"Feb"],[49,"Mar"],[69,"Apr"],[61,"May"],[76,"Jun"],[67,"Jul"],[83,"Aug"],[73,"Sep"]].map(([height, month]) => <div className="bar-wrap" key={month as string}><div className="bar" style={{height: `${height}%`}} /><span>{month}</span></div>)}</div></div></section>
          </div>

          <section className="panel assets-panel"><div className="panel-heading"><div><h2>Recently added</h2><p>The latest things in your space.</p></div><button className="text-button">See all <ArrowUpRight size={15} /></button></div><div className="asset-list">{assets.map(({ name, meta, icon: Icon, value, tone }) => <div className="asset-row" key={name}><div className={`asset-icon ${tone}`}><Icon size={20} /></div><div className="asset-name"><strong>{name}</strong><span>{meta}</span></div><span className="asset-value">{value}</span><ChevronRight size={17} className="asset-chevron" /></div>)}</div></section>
          <footer className="footer"><span>Habora · A calmer way to manage life&apos;s details.</span><span><span className="online-dot" /> All systems normal</span></footer>
        </div>
      </section>
      {toast && <div className="toast"><div><Check size={16} /></div><span>Ready to add something new</span></div>}
    </main>
  );
}
