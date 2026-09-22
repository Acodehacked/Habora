"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Archive, ArrowLeft, CalendarDays, Check, CircleDollarSign, FileText, Home, LoaderCircle, LogOut, Package, Pencil, Plus, Search, Sparkles, Trash2, Wrench, X } from "lucide-react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AssetKind = "property" | "appliance" | "vehicle" | "subscription" | "document" | "other";
type Asset = { id: string; name: string; kind: AssetKind; description: string | null; purchase_price: number | null; created_at: string };
type Reminder = { id: string; title: string; due_date: string; recurrence: string | null; completed_at: string | null; asset_id: string | null };
type RepairStatus = "planned" | "in_progress" | "completed" | "cancelled";
type Repair = { id: string; title: string; description: string | null; provider: string | null; scheduled_date: string | null; cost: number | null; status: RepairStatus; asset_id: string | null };
type Subscription = { id: string; name: string; provider: string | null; amount: number | null; billing_cycle: string; next_billing_date: string | null; status: string; notes: string | null };
type DocumentRecord = { id: string; name: string; document_type: string; notes: string | null; storage_path: string | null; asset_id: string | null; created_at: string };
type Modal = "asset" | "reminder" | "repair" | "subscription" | "document" | null;

const titles: Record<string, string> = { home: "My home", assets: "Things I own", subscriptions: "Subscriptions", documents: "Documents", calendar: "Calendar", maintenance: "Maintenance", tasks: "Tasks" };
const descriptions: Record<string, string> = { home: "Properties and household essentials.", assets: "Every item you own or want to keep track of.", subscriptions: "Recurring services and monthly commitments.", documents: "Receipts, warranties, manuals, and important files.", calendar: "A clear view of what is coming up.", maintenance: "Repairs and service work for the things you own.", tasks: "Responsibilities that still need your attention." };
const icons: Record<string, typeof Home> = { home: Home, assets: Package, subscriptions: CircleDollarSign, documents: FileText, calendar: CalendarDays, maintenance: Wrench, tasks: Check };
const kindLabels: Record<AssetKind, string> = { property: "Property", appliance: "Appliance", vehicle: "Vehicle", subscription: "Subscription", document: "Document", other: "Other" };
const statusLabels: Record<RepairStatus, string> = { planned: "Planned", in_progress: "In progress", completed: "Completed", cancelled: "Cancelled" };

function formatDate(value: string) { return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`)); }
function dateKey(value: string) { return value.slice(0, 10); }

export default function WorkspaceSectionPage() {
  const { section } = useParams<{ section: string }>();
  const supabase = useMemo(() => createClient(), []);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [search, setSearch] = useState("");
  const Icon = icons[section] ?? Package;

  async function load() {
    setLoading(true);
    const [{ data: userData }, { data: assetData }, { data: reminderData }, { data: repairData }, { data: subscriptionData }, { data: documentData }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("assets").select("id,name,kind,description,purchase_price,created_at").order("created_at", { ascending: false }),
      supabase.from("reminders").select("id,title,due_date,recurrence,completed_at,asset_id").order("due_date", { ascending: true }),
      supabase.from("repairs").select("id,title,description,provider,scheduled_date,cost,status,asset_id").order("scheduled_date", { ascending: true }),
      supabase.from("subscriptions").select("id,name,provider,amount,billing_cycle,next_billing_date,status,notes").order("next_billing_date", { ascending: true }),
      supabase.from("documents").select("id,name,document_type,notes,storage_path,asset_id,created_at").order("created_at", { ascending: false }),
    ]);
    setEmail(userData.user?.email ?? "");
    setAssets((assetData ?? []) as Asset[]);
    setReminders((reminderData ?? []) as Reminder[]);
    setRepairs((repairData ?? []) as Repair[]);
    setSubscriptions((subscriptionData ?? []) as Subscription[]);
    setDocuments((documentData ?? []) as DocumentRecord[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, [section]);
  function notify(value: string) { setToast(value); window.setTimeout(() => setToast(""), 2800); }
  function openAsset(asset?: Asset) { setEditingAsset(asset ?? null); setModal("asset"); }
  function closeModal() { if (!saving) { setModal(null); setEditingAsset(null); } }

  async function saveAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget); const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); notify("Your session has expired. Please sign in again."); return; }
    const values = { name: String(form.get("name")), kind: String(form.get("kind")), description: String(form.get("description") || "") || null, purchase_price: form.get("purchase_price") ? Number(form.get("purchase_price")) : null };
    const result = editingAsset ? await supabase.from("assets").update(values).eq("id", editingAsset.id) : await supabase.from("assets").insert({ ...values, user_id: user.id });
    setSaving(false); if (result.error) { notify(result.error.message); return; }
    closeModal(); notify(editingAsset ? "Asset updated" : "Asset added"); await load();
  }
  async function saveReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget); const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); notify("Your session has expired. Please sign in again."); return; }
    const values = { title: String(form.get("title")), due_date: String(form.get("due_date")), recurrence: String(form.get("recurrence") || "") || null, asset_id: String(form.get("asset_id") || "") || null };
    const { error } = await supabase.from("reminders").insert({ ...values, user_id: user.id });
    setSaving(false); if (error) { notify(error.message); return; }
    closeModal(); notify("Reminder created"); await load();
  }
  async function saveRepair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget); const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); notify("Your session has expired. Please sign in again."); return; }
    const values = { title: String(form.get("title")), description: String(form.get("description") || "") || null, provider: String(form.get("provider") || "") || null, scheduled_date: String(form.get("scheduled_date") || "") || null, cost: form.get("cost") ? Number(form.get("cost")) : null, status: String(form.get("status")), asset_id: String(form.get("asset_id") || "") || null };
    const { error } = await supabase.from("repairs").insert({ ...values, user_id: user.id });
    setSaving(false); if (error) { notify(error.message); return; }
    closeModal(); notify("Repair added"); await load();
  }
  async function saveSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget); const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); notify("Your session has expired. Please sign in again."); return; }
    const values = { name: String(form.get("name")), provider: String(form.get("provider") || "") || null, amount: form.get("amount") ? Number(form.get("amount")) : null, billing_cycle: String(form.get("billing_cycle")), next_billing_date: String(form.get("next_billing_date") || "") || null, status: String(form.get("status")), notes: String(form.get("notes") || "") || null };
    const { error } = await supabase.from("subscriptions").insert({ ...values, user_id: user.id });
    setSaving(false); if (error) { notify(error.message); return; }
    closeModal(); notify("Subscription added"); await load();
  }
  async function saveDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget); const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); notify("Your session has expired. Please sign in again."); return; }
    const file = form.get("file"); let storagePath: string | null = null;
    if (file instanceof File && file.size > 0) {
      storagePath = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const upload = await supabase.storage.from("documents").upload(storagePath, file, { upsert: false });
      if (upload.error) { setSaving(false); notify(upload.error.message); return; }
    }
    const { error } = await supabase.from("documents").insert({ user_id: user.id, name: String(form.get("name")), document_type: String(form.get("document_type")), notes: String(form.get("notes") || "") || null, asset_id: String(form.get("asset_id") || "") || null, storage_path: storagePath });
    setSaving(false); if (error) { notify(error.message); return; }
    closeModal(); notify("Document saved"); await load();
  }
  async function deleteAsset(id: string) { const { error } = await supabase.from("assets").delete().eq("id", id); if (error) notify(error.message); else { notify("Asset removed"); await load(); } }
  async function deleteReminder(id: string) { const { error } = await supabase.from("reminders").delete().eq("id", id); if (error) notify(error.message); else { notify("Reminder removed"); await load(); } }
  async function deleteRepair(id: string) { const { error } = await supabase.from("repairs").delete().eq("id", id); if (error) notify(error.message); else { notify("Repair removed"); await load(); } }
  async function deleteSubscription(id: string) { const { error } = await supabase.from("subscriptions").delete().eq("id", id); if (error) notify(error.message); else { notify("Subscription removed"); await load(); } }
  async function deleteDocument(document: DocumentRecord) { if (document.storage_path) await supabase.storage.from("documents").remove([document.storage_path]); const { error } = await supabase.from("documents").delete().eq("id", document.id); if (error) notify(error.message); else { notify("Document removed"); await load(); } }
  async function toggleReminder(reminder: Reminder) { const { error } = await supabase.from("reminders").update({ completed_at: reminder.completed_at ? null : new Date().toISOString() }).eq("id", reminder.id); if (error) notify(error.message); else { notify(reminder.completed_at ? "Task reopened" : "Task completed"); await load(); } }
  async function updateRepairStatus(repair: Repair, status: RepairStatus) { const { error } = await supabase.from("repairs").update({ status }).eq("id", repair.id); if (error) notify(error.message); else { notify("Repair status updated"); await load(); } }
  async function signOut() { const { error } = await supabase.auth.signOut(); if (error) notify(`Could not sign out: ${error.message}`); else window.location.assign("/login"); }

  const filteredAssets = assets.filter((asset) => {
    if (section === "home") return asset.kind === "property";
    if (section === "subscriptions") return asset.kind === "subscription";
    if (section === "documents") return asset.kind === "document";
    if (section === "assets") return !["subscription", "document"].includes(asset.kind);
    return true;
  }).filter((asset) => `${asset.name} ${asset.description ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const showReminders = ["calendar", "tasks"].includes(section);
  const visibleReminders = reminders.filter((reminder) => section === "tasks" ? !reminder.completed_at : true).filter((reminder) => reminder.title.toLowerCase().includes(search.toLowerCase()));
  const visibleRepairs = repairs.filter((repair) => `${repair.title} ${repair.provider ?? ""} ${repair.description ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const visibleSubscriptions = subscriptions.filter((subscription) => `${subscription.name} ${subscription.provider ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const visibleDocuments = documents.filter((document) => `${document.name} ${document.document_type} ${document.notes ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const calendarGroups = visibleReminders.reduce<Record<string, Reminder[]>>((groups, reminder) => { const key = dateKey(reminder.due_date); groups[key] = [...(groups[key] ?? []), reminder]; return groups; }, {});
  const firstName = email.split("@")[0] || "there";
  const count = section === "maintenance" ? visibleRepairs.length : section === "subscriptions" ? visibleSubscriptions.length : section === "documents" ? visibleDocuments.length : showReminders ? visibleReminders.length : filteredAssets.length;
  const addLabel = section === "maintenance" ? "Add repair" : section === "subscriptions" ? "Add subscription" : section === "documents" ? "Add document" : showReminders ? "Add reminder" : "Add record";

  if (section === "subscriptions") return <DedicatedPage title="Subscriptions" description={descriptions.subscriptions} firstName={firstName} email={email} icon={CircleDollarSign} count={count} search={search} setSearch={setSearch} onSignOut={signOut} onAdd={() => setModal("subscription")} addLabel={addLabel} toast={toast} list={<SubscriptionList subscriptions={visibleSubscriptions} onDelete={deleteSubscription} />} modal={modal === "subscription" ? <SubscriptionModal saving={saving} onClose={closeModal} onSubmit={saveSubscription} /> : null} />;
  if (section === "documents") return <DedicatedPage title="Documents" description={descriptions.documents} firstName={firstName} email={email} icon={FileText} count={count} search={search} setSearch={setSearch} onSignOut={signOut} onAdd={() => setModal("document")} addLabel={addLabel} toast={toast} list={<DocumentList documents={visibleDocuments} assets={assets} onDelete={deleteDocument} />} modal={modal === "document" ? <DocumentModal assets={assets} saving={saving} onClose={closeModal} onSubmit={saveDocument} /> : null} />;

  return <main className="section-shell"><aside className="section-sidebar"><a className="brand-row section-brand" href="/"><span className="brand-mark"><Sparkles size={18} /></span><span>habora</span></a><div className="workspace-switcher"><div className="avatar">{firstName.slice(0, 2).toUpperCase()}</div><div><strong>{firstName}&apos;s space</strong><small>Personal workspace</small></div></div><a className="section-back" href="/"><ArrowLeft size={16} /> Overview</a><div className="section-sidebar-bottom"><button className="nav-item" onClick={() => void signOut()}><LogOut size={18} /><span>Sign out</span></button></div></aside><section className="section-content"><header className="section-topbar"><div><p className="eyebrow">Workspace</p><h1>{titles[section] ?? "Workspace"}</h1><p className="subhead">{descriptions[section] ?? "Your Habora records."}</p></div><button className="primary-button" onClick={() => section === "maintenance" ? setModal("repair") : showReminders ? setModal("reminder") : openAsset()}><Plus size={17} /> {addLabel}</button></header><div className="section-main"><div className="section-toolbar"><div className="section-summary"><div className="section-summary-icon"><Icon size={21} /></div><div><strong>{count}</strong><span>{section === "maintenance" || showReminders ? "items in this view" : "records in this view"}</span></div></div><label className="section-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this view" aria-label="Search this view" /></label></div>{loading ? <div className="inline-state"><LoaderCircle size={18} className="spin" /> Loading your records...</div> : section === "maintenance" ? <RepairList repairs={visibleRepairs} assets={assets} onStatus={updateRepairStatus} onDelete={deleteRepair} /> : showReminders ? section === "calendar" ? <CalendarView groups={calendarGroups} onToggle={toggleReminder} onDelete={deleteReminder} /> : <ReminderList reminders={visibleReminders} onToggle={toggleReminder} onDelete={deleteReminder} /> : <AssetList assets={filteredAssets} onEdit={openAsset} onDelete={deleteAsset} />}</div>{toast && <div className="toast"><div><Check size={16} /></div><span>{toast}</span></div>}{modal === "asset" && <AssetModal asset={editingAsset} saving={saving} onClose={closeModal} onSubmit={saveAsset} />}{modal === "reminder" && <ReminderModal assets={assets} saving={saving} onClose={closeModal} onSubmit={saveReminder} />}{modal === "repair" && <RepairModal assets={assets} saving={saving} onClose={closeModal} onSubmit={saveRepair} />}</section></main>;
}

function DedicatedPage({ title, description, firstName, icon: Icon, count, search, setSearch, onSignOut, onAdd, addLabel, toast, list, modal }: { title: string; description: string; firstName: string; email: string; icon: typeof Home; count: number; search: string; setSearch: (value: string) => void; onSignOut: () => void; onAdd: () => void; addLabel: string; toast: string; list: React.ReactNode; modal: React.ReactNode }) {
  return <main className="section-shell"><aside className="section-sidebar"><a className="brand-row section-brand" href="/"><span className="brand-mark"><Sparkles size={18} /></span><span>habora</span></a><div className="workspace-switcher"><div className="avatar">{firstName.slice(0, 2).toUpperCase()}</div><div><strong>{firstName}&apos;s space</strong><small>Personal workspace</small></div></div><a className="section-back" href="/"><ArrowLeft size={16} /> Overview</a><div className="section-sidebar-bottom"><button className="nav-item" onClick={() => void onSignOut()}><LogOut size={18} /><span>Sign out</span></button></div></aside><section className="section-content"><header className="section-topbar"><div><p className="eyebrow">Workspace</p><h1>{title}</h1><p className="subhead">{description}</p></div><button className="primary-button" onClick={onAdd}><Plus size={17} /> {addLabel}</button></header><div className="section-main"><div className="section-toolbar"><div className="section-summary"><div className="section-summary-icon"><Icon size={21} /></div><div><strong>{count}</strong><span>records in this view</span></div></div><label className="section-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this view" aria-label="Search this view" /></label></div>{list}</div>{toast && <div className="toast"><div><Check size={16} /></div><span>{toast}</span></div>}{modal}</section></main>;
}

function SubscriptionList({ subscriptions, onDelete }: { subscriptions: Subscription[]; onDelete: (id: string) => void }) { return <div className="section-list">{subscriptions.length === 0 ? <Empty text="No subscriptions yet. Add your first recurring service." /> : subscriptions.map((subscription) => <article className="section-record" key={subscription.id}><div className="record-icon blue"><CircleDollarSign size={18} /></div><div className="record-copy"><strong>{subscription.name}</strong><span>{subscription.provider ?? "No provider"} · {subscription.billing_cycle}{subscription.next_billing_date ? ` · Next ${formatDate(subscription.next_billing_date)}` : ""}</span></div>{subscription.amount !== null && <b className="record-amount">${Number(subscription.amount).toFixed(2)}</b>}<button className="delete-button" onClick={() => onDelete(subscription.id)} aria-label={`Delete ${subscription.name}`}><Trash2 size={15} /></button></article>)}</div>; }
function DocumentList({ documents, assets, onDelete }: { documents: DocumentRecord[]; assets: Asset[]; onDelete: (document: DocumentRecord) => void }) { const assetNames = new Map(assets.map((asset) => [asset.id, asset.name])); return <div className="section-list">{documents.length === 0 ? <Empty text="No documents yet. Add a receipt, warranty, or manual." /> : documents.map((document) => <article className="section-record" key={document.id}><div className="record-icon mint"><FileText size={18} /></div><div className="record-copy"><strong>{document.name}</strong><span>{document.document_type}{document.asset_id && assetNames.get(document.asset_id) ? ` · ${assetNames.get(document.asset_id)}` : ""}{document.storage_path ? " · File attached" : ""}</span></div><button className="delete-button" onClick={() => onDelete(document)} aria-label={`Delete ${document.name}`}><Trash2 size={15} /></button></article>)}</div>; }

function AssetList({ assets, onEdit, onDelete }: { assets: Asset[]; onEdit: (asset: Asset) => void; onDelete: (id: string) => void }) { return <div className="section-list">{assets.length === 0 ? <Empty text="No records here yet. Add your first one to get started." /> : assets.map((asset) => <article className="section-record" key={asset.id}><div className="record-icon blue"><Archive size={18} /></div><div className="record-copy"><strong>{asset.name}</strong><span>{kindLabels[asset.kind]}{asset.description ? ` · ${asset.description}` : ""}</span></div>{asset.purchase_price && <b className="record-amount">${Number(asset.purchase_price).toFixed(2)}</b>}<button className="icon-action" onClick={() => onEdit(asset)} aria-label={`Edit ${asset.name}`}><Pencil size={15} /></button><button className="delete-button" onClick={() => onDelete(asset.id)} aria-label={`Delete ${asset.name}`}><Trash2 size={15} /></button></article>)}</div>; }
function ReminderList({ reminders, onToggle, onDelete }: { reminders: Reminder[]; onToggle: (reminder: Reminder) => void; onDelete: (id: string) => void }) { return <div className="section-list">{reminders.length === 0 ? <Empty text="No reminders here yet. Add one to stay ahead." /> : reminders.map((reminder) => <ReminderRow key={reminder.id} reminder={reminder} onToggle={onToggle} onDelete={onDelete} />)}</div>; }
function CalendarView({ groups, onToggle, onDelete }: { groups: Record<string, Reminder[]>; onToggle: (reminder: Reminder) => void; onDelete: (id: string) => void }) { const days = Object.keys(groups).sort(); return <div className="calendar-list">{days.length === 0 ? <Empty text="Your calendar is clear. Add a reminder to schedule something." /> : days.map((day) => <section className="calendar-day" key={day}><h3>{formatDate(day)}</h3>{groups[day].map((reminder) => <ReminderRow key={reminder.id} reminder={reminder} onToggle={onToggle} onDelete={onDelete} />)}</section>)}</div>; }
function ReminderRow({ reminder, onToggle, onDelete }: { reminder: Reminder; onToggle: (reminder: Reminder) => void; onDelete: (id: string) => void }) { return <article className={`section-record ${reminder.completed_at ? "record-complete" : ""}`}><button className="check-action" onClick={() => onToggle(reminder)} aria-label={reminder.completed_at ? "Reopen reminder" : "Complete reminder"}><Check size={16} /></button><div className="record-copy"><strong>{reminder.title}</strong><span>Due {formatDate(reminder.due_date)}{reminder.recurrence ? ` · ${reminder.recurrence}` : ""}</span></div><button className="delete-button" onClick={() => onDelete(reminder.id)} aria-label={`Delete ${reminder.title}`}><Trash2 size={15} /></button></article>; }
function RepairList({ repairs, assets, onStatus, onDelete }: { repairs: Repair[]; assets: Asset[]; onStatus: (repair: Repair, status: RepairStatus) => void; onDelete: (id: string) => void }) { const assetNames = new Map(assets.map((asset) => [asset.id, asset.name])); return <div className="section-list">{repairs.length === 0 ? <Empty text="No repairs yet. Add a repair or service visit to start tracking it." /> : repairs.map((repair) => <article className="section-record" key={repair.id}><div className="record-icon mint"><Wrench size={18} /></div><div className="record-copy"><strong>{repair.title}</strong><span>{repair.scheduled_date ? `Scheduled ${formatDate(repair.scheduled_date)}` : "No date set"}{repair.provider ? ` · ${repair.provider}` : ""}{repair.asset_id && assetNames.get(repair.asset_id) ? ` · ${assetNames.get(repair.asset_id)}` : ""}</span></div>{repair.cost !== null && <b className="record-amount">${Number(repair.cost).toFixed(2)}</b>}<select className="status-select" value={repair.status} onChange={(event) => onStatus(repair, event.target.value as RepairStatus)} aria-label={`Status for ${repair.title}`}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="delete-button" onClick={() => onDelete(repair.id)} aria-label={`Delete ${repair.title}`}><Trash2 size={15} /></button></article>)}</div>; }
function Empty({ text }: { text: string }) { return <div className="section-empty">{text}</div>; }

function AssetModal({ asset, saving, onClose, onSubmit }: { asset: Asset | null; saving: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <Modal title={asset ? "Edit asset" : "Add asset"} onClose={onClose}><form className="data-form" onSubmit={onSubmit}><label>Name<input name="name" defaultValue={asset?.name ?? ""} placeholder="e.g. Samsung Fridge" required /></label><label>Type<select name="kind" defaultValue={asset?.kind ?? "other"}>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Notes<input name="description" defaultValue={asset?.description ?? ""} placeholder="Room, provider, warranty detail" /></label><label>Amount <span className="optional">optional</span><input name="purchase_price" type="number" min="0" step="0.01" defaultValue={asset?.purchase_price ?? ""} placeholder="0.00" /></label><SubmitButton saving={saving} label={asset ? "Save changes" : "Add asset"} /></form></Modal>; }
function ReminderModal({ assets, saving, onClose, onSubmit }: { assets: Asset[]; saving: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <Modal title="Add reminder" onClose={onClose}><form className="data-form" onSubmit={onSubmit}><label>What needs doing?<input name="title" placeholder="e.g. HVAC annual service" required /></label><label>Due date<input name="due_date" type="date" required /></label><label>Related item <span className="optional">optional</span><select name="asset_id" defaultValue=""><option value="">No linked item</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label><label>Repeats <span className="optional">optional</span><select name="recurrence" defaultValue=""><option value="">Does not repeat</option><option value="monthly">Monthly</option><option value="quarterly">Every 3 months</option><option value="yearly">Yearly</option></select></label><SubmitButton saving={saving} label="Create reminder" /></form></Modal>; }
function RepairModal({ assets, saving, onClose, onSubmit }: { assets: Asset[]; saving: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <Modal title="Add repair" onClose={onClose}><form className="data-form" onSubmit={onSubmit}><label>Repair or service<input name="title" placeholder="e.g. Fix leaking kitchen tap" required /></label><label>Details <span className="optional">optional</span><input name="description" placeholder="What needs to be fixed?" /></label><label>Provider <span className="optional">optional</span><input name="provider" placeholder="Company or technician" /></label><label>Related item <span className="optional">optional</span><select name="asset_id" defaultValue=""><option value="">No linked item</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label><label>Scheduled date <span className="optional">optional</span><input name="scheduled_date" type="date" /></label><label>Estimated cost <span className="optional">optional</span><input name="cost" type="number" min="0" step="0.01" placeholder="0.00" /></label><label>Status<select name="status" defaultValue="planned">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><SubmitButton saving={saving} label="Add repair" /></form></Modal>; }
function SubscriptionModal({ saving, onClose, onSubmit }: { saving: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <Modal title="Add subscription" onClose={onClose}><form className="data-form" onSubmit={onSubmit}><label>Name<input name="name" placeholder="e.g. Internet plan" required /></label><label>Provider <span className="optional">optional</span><input name="provider" placeholder="Company or service" /></label><label>Amount <span className="optional">optional</span><input name="amount" type="number" min="0" step="0.01" placeholder="0.00" /></label><label>Billing cycle<select name="billing_cycle" defaultValue="monthly"><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="weekly">Weekly</option><option value="one_time">One time</option></select></label><label>Next billing date <span className="optional">optional</span><input name="next_billing_date" type="date" /></label><label>Status<select name="status" defaultValue="active"><option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option></select></label><label>Notes <span className="optional">optional</span><input name="notes" placeholder="Plan details or cancellation notes" /></label><SubmitButton saving={saving} label="Add subscription" /></form></Modal>; }
function DocumentModal({ assets, saving, onClose, onSubmit }: { assets: Asset[]; saving: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <Modal title="Add document" onClose={onClose}><form className="data-form" onSubmit={onSubmit}><label>Document name<input name="name" placeholder="e.g. Fridge warranty" required /></label><label>Type<select name="document_type" defaultValue="other"><option value="receipt">Receipt</option><option value="warranty">Warranty</option><option value="manual">Manual</option><option value="contract">Contract</option><option value="other">Other</option></select></label><label>Related item <span className="optional">optional</span><select name="asset_id" defaultValue=""><option value="">No linked item</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label><label>File <span className="optional">optional</span><input name="file" type="file" /></label><label>Notes <span className="optional">optional</span><input name="notes" placeholder="Useful context" /></label><SubmitButton saving={saving} label="Save document" /></form></Modal>; }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="workspace-modal-title"><div className="modal-heading"><div><p className="eyebrow">Your space</p><h2 id="workspace-modal-title">{title}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>{children}</section></div>; }
function SubmitButton({ saving, label }: { saving: boolean; label: string }) { return <button className="primary-button form-submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="spin" /> : <Plus size={16} />}{saving ? "Saving..." : label}</button>; }
