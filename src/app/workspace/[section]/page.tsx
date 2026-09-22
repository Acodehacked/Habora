"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Archive, CalendarDays, Check, ChevronRight, CircleDollarSign, FileText, Home, LoaderCircle, LogOut, Package, Plus, Sparkles, Trash2, Wrench } from "lucide-react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AssetKind = "property" | "appliance" | "vehicle" | "subscription" | "document" | "other";
type Asset = { id: string; name: string; kind: AssetKind; description: string | null; purchase_price: number | null; created_at: string };
type Reminder = { id: string; title: string; due_date: string; recurrence: string | null; completed_at: string | null };

const titles: Record<string, string> = { home: "My home", assets: "Things I own", subscriptions: "Subscriptions", documents: "Documents", calendar: "Calendar", maintenance: "Maintenance", tasks: "Tasks" };
const descriptions: Record<string, string> = { home: "Properties and household essentials.", assets: "Every item you own or want to keep track of.", subscriptions: "Recurring services and monthly commitments.", documents: "Receipts, warranties, manuals, and important files.", calendar: "A clear view of what is coming up.", maintenance: "Service visits and care for the things you own.", tasks: "Responsibilities that still need your attention." };
const icons: Record<string, typeof Home> = { home: Home, assets: Package, subscriptions: CircleDollarSign, documents: FileText, calendar: CalendarDays, maintenance: Wrench, tasks: Check };

function formatDate(value: string) { return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`)); }
function kindLabel(kind: AssetKind) { return kind.charAt(0).toUpperCase() + kind.slice(1); }

export default function WorkspaceSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section;
  const supabase = useMemo(() => createClient(), []);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const Icon = icons[section] ?? Package;

  async function load() {
    setLoading(true);
    const [{ data: userData }, { data: assetData }, { data: reminderData }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("assets").select("id,name,kind,description,purchase_price,created_at").order("created_at", { ascending: false }),
      supabase.from("reminders").select("id,title,due_date,recurrence,completed_at").order("due_date", { ascending: true }),
    ]);
    setEmail(userData.user?.email ?? "");
    setAssets((assetData ?? []) as Asset[]);
    setReminders((reminderData ?? []) as Reminder[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, [section]);
  function notify(value: string) { setToast(value); window.setTimeout(() => setToast(""), 2500); }
  async function deleteAsset(id: string) { const { error } = await supabase.from("assets").delete().eq("id", id); if (error) notify(error.message); else { notify("Record removed"); await load(); } }
  async function completeReminder(id: string) { const { error } = await supabase.from("reminders").update({ completed_at: new Date().toISOString() }).eq("id", id); if (error) notify(error.message); else { notify("Task completed"); await load(); } }
  async function signOut() { await supabase.auth.signOut(); window.location.assign("/login"); }

  const filteredAssets = assets.filter((asset) => {
    if (section === "home") return asset.kind === "property";
    if (section === "subscriptions") return asset.kind === "subscription";
    if (section === "documents") return asset.kind === "document";
    if (section === "assets") return !["subscription", "document"].includes(asset.kind);
    return true;
  });
  const showReminders = ["calendar", "maintenance", "tasks"].includes(section);
  const visibleReminders = reminders.filter((reminder) => section === "tasks" ? !reminder.completed_at : true);
  const firstName = email.split("@")[0] || "there";

  return <main className="section-shell"><aside className="section-sidebar"><a className="brand-row section-brand" href="/"><span className="brand-mark"><Sparkles size={18} /></span><span>habora</span></a><div className="workspace-switcher"><div className="avatar">{firstName.slice(0, 2).toUpperCase()}</div><div><strong>{firstName}&apos;s space</strong><small>Personal workspace</small></div></div><a className="section-back" href="/"><ArrowLeft size={16} /> Overview</a><div className="section-sidebar-bottom"><button className="nav-item" onClick={() => void signOut()}><LogOut size={18} /><span>Sign out</span></button></div></aside><section className="section-content"><header className="section-topbar"><div><p className="eyebrow">Workspace</p><h1>{titles[section] ?? "Workspace"}</h1><p className="subhead">{descriptions[section] ?? "Your Habora records."}</p></div><a className="primary-button" href="/"><Plus size={17} /> Add something</a></header><div className="section-main"><div className="section-summary"><div className="section-summary-icon"><Icon size={21} /></div><div><strong>{showReminders ? visibleReminders.length : filteredAssets.length}</strong><span>{showReminders ? "open items" : "records in this view"}</span></div></div>{loading ? <div className="inline-state"><LoaderCircle size={18} className="spin" /> Loading your records...</div> : showReminders ? <div className="section-list">{visibleReminders.length === 0 ? <div className="section-empty">Nothing here yet. Add reminders from the dashboard.</div> : visibleReminders.map((reminder) => <article className="section-record" key={reminder.id}><div className="record-icon mint"><Check size={18} /></div><div className="record-copy"><strong>{reminder.title}</strong><span>Due {formatDate(reminder.due_date)}{reminder.recurrence ? ` · ${reminder.recurrence}` : ""}</span></div>{!reminder.completed_at && <button className="small-button" onClick={() => void completeReminder(reminder.id)}>Complete</button>}</article>)}</div> : <div className="section-list">{filteredAssets.length === 0 ? <div className="section-empty">Nothing here yet. Add a record from the dashboard.</div> : filteredAssets.map((asset) => <article className="section-record" key={asset.id}><div className="record-icon blue"><Archive size={18} /></div><div className="record-copy"><strong>{asset.name}</strong><span>{kindLabel(asset.kind)}{asset.description ? ` · ${asset.description}` : ""}</span></div>{asset.purchase_price && <b className="record-amount">${Number(asset.purchase_price).toFixed(2)}</b>}<button className="delete-button" onClick={() => void deleteAsset(asset.id)} aria-label={`Delete ${asset.name}`}><Trash2 size={15} /></button></article>)}</div>}</div>{toast && <div className="toast"><div><Check size={16} /></div><span>{toast}</span></div>}</section></main>;
}
