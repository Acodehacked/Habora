"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Archive, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check, ChevronRight,
  CircleDollarSign, ClipboardList, FileText, Home, LayoutDashboard,
  LifeBuoy, LoaderCircle, LogOut, Menu, Package, Plus, Search,
  ShieldCheck, Sparkles, Trash2, Wrench, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AssetKind = "property" | "appliance" | "vehicle" | "subscription" | "document" | "other";
type Asset = { id: string; name: string; kind: AssetKind; description: string | null; purchase_price: number | null; created_at: string };
type Reminder = { id: string; title: string; due_date: string; recurrence: string | null; completed_at: string | null };

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/" }, { label: "My home", icon: Home, href: "/workspace/home" },
  { label: "Things I own", icon: Package, href: "/workspace/assets" }, { label: "Subscriptions", icon: CircleDollarSign, href: "/workspace/subscriptions" },
  { label: "Documents", icon: FileText, href: "/workspace/documents" },
];
const kindLabels: Record<AssetKind, string> = { property: "Property", appliance: "Appliance", vehicle: "Vehicle", subscription: "Subscription", document: "Document", other: "Other" };

function iconForKind(kind: AssetKind) {
  if (kind === "property") return Home;
  if (kind === "appliance") return Archive;
  if (kind === "subscription") return CircleDollarSign;
  if (kind === "document") return FileText;
  return Package;
}
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`)); }

export default function HomePage() {
  const supabase = useMemo(() => createClient(), []);
  const [active, setActive] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<"asset" | "reminder" | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  async function loadData() {
    setLoading(true);
    const [{ data: userData }, { data: assetData }, { data: reminderData }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("assets").select("id,name,kind,description,purchase_price,created_at").order("created_at", { ascending: false }),
      supabase.from("reminders").select("id,title,due_date,recurrence,completed_at").is("completed_at", null).order("due_date", { ascending: true }).limit(5),
    ]);
    setUserEmail(userData.user?.email ?? "");
    setAssets((assetData ?? []) as Asset[]);
    setReminders((reminderData ?? []) as Reminder[]);
    setLoading(false);
  }
  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthenticated(Boolean(user));
      if (user) await loadData();
      else setLoading(false);
    }
    void initialize();
  }, []);
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2800); }

  async function addAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget); const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); notify("Your session has expired. Please sign in again."); return; }
    const { error } = await supabase.from("assets").insert({ user_id: user.id, name: String(form.get("name")), kind: String(form.get("kind")), description: String(form.get("description") || "") || null, purchase_price: form.get("purchase_price") ? Number(form.get("purchase_price")) : null });
    setSaving(false); if (error) { notify(error.message); return; }
    setModal(null); notify("Added to your space"); await loadData();
  }
  async function addReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget); const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); notify("Your session has expired. Please sign in again."); return; }
    const { error } = await supabase.from("reminders").insert({ user_id: user.id, title: String(form.get("title")), due_date: String(form.get("due_date")), recurrence: String(form.get("recurrence") || "") || null });
    setSaving(false); if (error) { notify(error.message); return; }
    setModal(null); notify("Reminder created"); await loadData();
  }
  async function completeReminder(id: string) { const { error } = await supabase.from("reminders").update({ completed_at: new Date().toISOString() }).eq("id", id); if (error) notify(error.message); else { notify("Marked complete"); await loadData(); } }
  async function deleteAsset(id: string) { const { error } = await supabase.from("assets").delete().eq("id", id); if (error) notify(error.message); else { notify("Removed from your space"); await loadData(); } }
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) { notify(`Could not sign out: ${error.message}`); return; }
    window.location.assign("/login");
  }

  const filteredAssets = assets.filter((asset) => `${asset.name} ${asset.kind} ${asset.description ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const firstName = userEmail.split("@")[0] || "there";
  const totalSpend = assets.filter((asset) => asset.kind === "subscription").reduce((sum, asset) => sum + Number(asset.purchase_price ?? 0), 0);
  const openModal = (type: "asset" | "reminder") => setModal(type);

  if (authenticated === null) return <div className="route-loading"><LoaderCircle size={22} className="spin" /></div>;
  if (!authenticated) return <LandingPage />;

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row"><div className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></div><span>habora</span><button className="close-nav" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
        <div className="workspace-switcher"><div className="avatar">{firstName.slice(0, 2).toUpperCase()}</div><div><strong>{firstName}&apos;s space</strong><small>Personal workspace</small></div><ChevronRight size={16} className="muted-icon" /></div>
        <nav className="primary-nav" aria-label="Main navigation"><span className="nav-label">Workspace</span>{navItems.map(({ label, icon: Icon, href }) => <a key={label} className={`nav-item ${active === label ? "active" : ""}`} href={href}><Icon size={18} /><span>{label}</span>{label === "Things I own" && <em>{assets.length}</em>}</a>)}<span className="nav-label nav-label-spaced">Manage</span><a className="nav-item" href="/workspace/calendar"><CalendarDays size={18} /><span>Calendar</span></a><a className="nav-item" href="/workspace/maintenance"><Wrench size={18} /><span>Maintenance</span></a><a className="nav-item" href="/workspace/tasks"><ClipboardList size={18} /><span>Tasks</span><em>{reminders.length}</em></a></nav>
        <div className="sidebar-bottom"><button className="nav-item" onClick={() => void signOut()}><LogOut size={18} /><span>Sign out</span></button><div className="help-card"><div className="help-icon"><LifeBuoy size={18} /></div><div><strong>Need a hand?</strong><small>We&apos;re here to help</small></div><ArrowUpRight size={15} /></div></div>
      </aside>
      <section className="content-area">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={22} /></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{active}</strong></div><div className="top-actions"><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your space" aria-label="Search your space" /></label><button className="icon-button" aria-label="Notifications"><Bell size={19} /><i /></button><div className="top-avatar">{firstName.slice(0, 2).toUpperCase()}</div></div></header>
        <div className="page-content"><div className="welcome-row"><div><p className="eyebrow">{new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(new Date())}</p><h1>Good morning, {firstName} <span>✦</span></h1><p className="subhead">Here&apos;s what needs your attention today.</p></div><button className="primary-button" onClick={() => openModal("asset")}><Plus size={18} /> Add something</button></div>
          <section className="insight-banner"><div className="insight-symbol"><Sparkles size={21} /></div><div><strong>Small wins add up.</strong><p>{assets.length ? `You have ${assets.length} item${assets.length === 1 ? "" : "s"} organized in your space.` : "Start by adding the first thing you own or pay for."}</p></div><div className="progress-ring"><span>{Math.min(99, assets.length * 12)}%</span></div></section>
          <div className="section-heading"><div><h2>At a glance</h2><p>Your household, beautifully organized.</p></div><button className="text-button" onClick={() => openModal("asset")}>Add record <Plus size={15} /></button></div>
          <div className="stats-grid"><article className="stat-card stat-green"><div className="stat-icon"><Home size={19} /></div><p>Things I own</p><strong>{assets.length}</strong><span>tracked in your space</span></article><article className="stat-card stat-yellow"><div className="stat-icon"><CircleDollarSign size={19} /></div><p>Monthly commitments</p><strong>${totalSpend.toFixed(0)}</strong><span>from subscriptions</span></article><article className="stat-card stat-blue"><div className="stat-icon"><ShieldCheck size={19} /></div><p>Upcoming reminders</p><strong>{reminders.length}</strong><span>need your attention</span></article><article className="stat-card stat-pink"><div className="stat-icon"><FileText size={19} /></div><p>Saved documents</p><strong>{assets.filter((asset) => asset.kind === "document").length}</strong><span>all in one place</span></article></div>
          <div className="dashboard-grid"><section className="panel reminders-panel"><div className="panel-heading"><div><h2>Up next</h2><p>Things that might need you soon.</p></div><button className="more-button" onClick={() => openModal("reminder")} aria-label="Add reminder"><Plus size={17} /></button></div><div className="reminder-list">{loading ? <Loading /> : reminders.length === 0 ? <EmptyState text="No upcoming reminders yet." action="Add reminder" onClick={() => openModal("reminder")} /> : reminders.map((reminder) => <div className="reminder" key={reminder.id}><div className="reminder-icon mint"><Wrench size={18} /></div><div className="reminder-copy"><strong>{reminder.title}</strong><span>Due {formatDate(reminder.due_date)}{reminder.recurrence ? ` · ${reminder.recurrence}` : ""}</span></div><button className="small-button" onClick={() => void completeReminder(reminder.id)}>Done</button></div>)}</div><button className="view-all" onClick={() => openModal("reminder")}>Add a reminder <ArrowUpRight size={15} /></button></section><section className="panel spending-panel"><div className="panel-heading"><div><h2>Monthly spending</h2><p>Your recurring commitments.</p></div><CircleDollarSign size={18} className="muted-icon" /></div><div className="spend-total"><strong>${totalSpend.toFixed(2)}</strong><span>tracked subscriptions</span></div><div className="spend-empty"><CircleDollarSign size={24} /><span>{totalSpend ? "Your subscription total is up to date." : "Add a subscription to track monthly costs."}</span></div></section></div>
          <section className="panel assets-panel"><div className="panel-heading"><div><h2>Recently added</h2><p>The latest things in your space.</p></div><button className="text-button" onClick={() => openModal("asset")}>Add asset <Plus size={15} /></button></div><div className="asset-list">{loading ? <Loading /> : filteredAssets.length === 0 ? <EmptyState text={search ? "No records match your search." : "Your space is ready for its first record."} action="Add something" onClick={() => openModal("asset")} /> : filteredAssets.slice(0, 6).map((asset) => { const Icon = iconForKind(asset.kind); return <div className="asset-row" key={asset.id}><div className="asset-icon sage"><Icon size={20} /></div><div className="asset-name"><strong>{asset.name}</strong><span>{kindLabels[asset.kind]}{asset.description ? ` · ${asset.description}` : ""}</span></div><span className="asset-value">{asset.purchase_price ? `$${Number(asset.purchase_price).toFixed(2)}` : "Tracked"}</span><button className="delete-button" onClick={() => void deleteAsset(asset.id)} aria-label={`Delete ${asset.name}`}><Trash2 size={15} /></button></div>; })}</div></section><footer className="footer"><span>Habora · A calmer way to manage life&apos;s details.</span><span><span className="online-dot" /> RLS protected</span></footer></div>
      </section>
      {toast && <div className="toast"><div><Check size={16} /></div><span>{toast}</span></div>}
      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><p className="eyebrow">Your space</p><h2 id="modal-title">{modal === "asset" ? "Add something" : "Create a reminder"}</h2></div><button className="icon-button" onClick={() => setModal(null)} aria-label="Close"><X size={19} /></button></div>{modal === "asset" ? <form className="data-form" onSubmit={addAsset}><label>Name<input name="name" placeholder="e.g. Bosch refrigerator" required /></label><label>Type<select name="kind" defaultValue="other">{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Notes<input name="description" placeholder="Location, provider, or useful detail" /></label><label>Amount <span className="optional">optional</span><input name="purchase_price" type="number" min="0" step="0.01" placeholder="0.00" /></label><button className="primary-button form-submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="spin" /> : <Plus size={16} />}{saving ? "Saving..." : "Add to Habora"}</button></form> : <form className="data-form" onSubmit={addReminder}><label>What needs doing?<input name="title" placeholder="e.g. HVAC annual service" required /></label><label>Due date<input name="due_date" type="date" required /></label><label>Repeats <span className="optional">optional</span><select name="recurrence" defaultValue=""><option value="">Does not repeat</option><option value="monthly">Monthly</option><option value="quarterly">Every 3 months</option><option value="yearly">Yearly</option></select></label><button className="primary-button form-submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="spin" /> : <Plus size={16} />}{saving ? "Saving..." : "Create reminder"}</button></form>}</section></div>}
    </main>
  );
}

function Loading() { return <div className="inline-state"><LoaderCircle size={17} className="spin" /> Loading your space...</div>; }
function EmptyState({ text, action, onClick }: { text: string; action: string; onClick: () => void }) { return <div className="empty-state"><span>{text}</span><button className="text-button" onClick={onClick}>{action} <Plus size={14} /></button></div>; }

function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav"><a className="landing-brand" href="/"><span className="brand-mark"><Sparkles size={18} /></span><strong>habora</strong></a><div className="landing-actions"><a className="landing-login" href="/login">Sign in</a><a className="primary-button landing-cta" href="/login">Get started <ArrowRight size={16} /></a></div></nav>
      <section className="landing-hero"><div className="landing-copy"><p className="eyebrow">A calmer way to manage life&apos;s details</p><h1>Everything you own, pay for, and maintain. <em>Finally together.</em></h1><p className="landing-description">Habora brings your home, appliances, subscriptions, bills, warranties, repairs, and important documents into one clear personal space.</p><div className="landing-buttons"><a className="primary-button" href="/login">Create your space <ArrowRight size={16} /></a><a className="landing-text-link" href="#how-it-works">See how it works <ChevronRight size={15} /></a></div></div><div className="landing-preview" aria-label="Preview of the Habora dashboard"><div className="preview-top"><span className="preview-dot coral" /><span className="preview-dot gold" /><span className="preview-dot mint" /><small>your space</small></div><div className="preview-welcome"><span>Good morning</span><strong>Your life, in one place.</strong></div><div className="preview-stats"><span><b>24</b>things tracked</span><span><b>8</b>commitments</span><span><b>3</b>up next</span></div><div className="preview-list"><div><span className="preview-icon mint"><Home size={15} /></span><p><strong>Maple Street home</strong><small>Property · Updated today</small></p><ChevronRight size={15} /></div><div><span className="preview-icon peach"><Wrench size={15} /></span><p><strong>HVAC annual service</strong><small>Due in 6 days</small></p><ChevronRight size={15} /></div><div><span className="preview-icon blue"><FileText size={15} /></span><p><strong>Insurance documents</strong><small>4 files saved</small></p><ChevronRight size={15} /></div></div></div></section>
      <section className="landing-proof" id="how-it-works"><div><span className="proof-number">01</span><strong>Collect the details</strong><p>Keep ownership records, receipts, warranties, and documents close.</p></div><div><span className="proof-number">02</span><strong>Remember on time</strong><p>Track bills, renewals, service visits, and every recurring responsibility.</p></div><div><span className="proof-number">03</span><strong>Feel in control</strong><p>See what matters next without searching across five different apps.</p></div></section>
      <footer className="landing-footer"><span>habora</span><span>Private by default · Secured with Supabase</span></footer>
    </main>
  );
}
