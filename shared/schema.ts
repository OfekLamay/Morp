import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  permissionGroup: text("permission_group").notNull(), // "Merkaz", "Kabam", "System Administrator"
  isManager: boolean("is_manager").default(false),
  kabam: text("kabam").default(""),
  unit: text("unit").default(""),
  unitsUnder: text("units_under").default(""),
  parentUnit: text("parent_unit").default(""),
  lastLogin: timestamp("last_login"),
  ticketsManaging: integer("tickets_managing").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
  createdAt: true,
});

/*
{
  id: 2,
  username: "kabamuser1",
  fullName: "David Cohen",
  permissionGroup: "Kabam",
  isManager: true,
  kabam: "Kabam 98",
  unit: "Unit 98",
  unitsUnder: "Unit 98,Unit 8200", // or as an array
  parentUnit: "Unit 81",
  // ...other fields
}
*/

// Media database
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  releaseDate: timestamp("release_date").notNull(),
  acquiringDate: timestamp("acquiring_date").notNull(),
  userGatheredFrom: text("user_gathered_from").notNull(),
  userGatheredFromId: text("user_gathered_from_id").notNull(),
  objectList: json("object_list").$type<string[]>().notNull(),
  mediaFile: text("media_file").notNull(),  // Path or URL to the media file
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
});

// Rules database
export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  creationDate: timestamp("creation_date").defaultNow(),
  itemsList: json("items_list").$type<string[]>().notNull(),
  description: text("description").notNull(),
  enforcement: text("enforcement").notNull(), // "ACTIVE", "SILENT"
  userCreated: text("user_created").notNull(),
  managerApproved: text("manager_approved").default(""),
  severity: integer("severity").notNull(), // 1-10
  usersRelatedTo: json("users_related_to").$type<string[]>().default([]),
  enabled: boolean("enabled").default(true), // ENABLED/DISABLED
});

export const insertRuleSchema = createInsertSchema(rules).omit({
  id: true,
  creationDate: true,
});

// Tickets database
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  creationDate: timestamp("creation_date").defaultNow(),
  expirationDate: timestamp("expiration_date").notNull(),
  userGatheredFrom: text("user_gathered_from").notNull(),
  userManaging: text("user_managing").default("not related yet"),
  relatedRulesList: json("related_rules_list").$type<number[]>().notNull(),
  severity: integer("severity").notNull(),
  usersRelatedTo: json("users_related_to").$type<string[]>().default([]),
  status: text("status").notNull().default("not related yet"), // done, in progress, FP, waiting for identification, not related yet, reopened
  isTruePositive: boolean("is_true_positive").default(false), // FP/TP
  kabamRelated: text("kabam_related").default("need to be related"),
  unitRelated: text("unit_related").default("need to be related"),
  imageUrl: text("image_url").default(""), // Path or URL to the image
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  creationDate: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

// Unit table (example, if you have one)
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentUnit: text("parent_unit").default(""),
});
