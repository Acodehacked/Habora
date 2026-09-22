import {
  date,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const assetKind = pgEnum("asset_kind", [
  "property",
  "appliance",
  "vehicle",
  "subscription",
  "document",
  "other",
]);

export const repairStatus = pgEnum("repair_status", [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  kind: assetKind("kind").notNull().default("other"),
  description: text("description"),
  purchaseDate: date("purchase_date"),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  assetId: uuid("asset_id").references(() => assets.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  dueDate: date("due_date").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  recurrence: text("recurrence"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const repairs = pgTable("repairs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  assetId: uuid("asset_id").references(() => assets.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  provider: text("provider"),
  scheduledDate: date("scheduled_date"),
  cost: numeric("cost", { precision: 12, scale: 2 }),
  status: repairStatus("status").notNull().default("planned"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  provider: text("provider"),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  nextBillingDate: date("next_billing_date"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  assetId: uuid("asset_id").references(() => assets.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  documentType: text("document_type").notNull().default("other"),
  storagePath: text("storage_path"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
export type Repair = typeof repairs.$inferSelect;
export type NewRepair = typeof repairs.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;