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

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;