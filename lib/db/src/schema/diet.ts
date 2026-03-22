import { pgTable, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dietProfilesTable = pgTable("diet_profiles", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  userId: varchar("user_id").notNull().unique(),
  age: integer("age").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  weightKg: real("weight_kg").notNull(),
  heightCm: real("height_cm").notNull(),
  activityLevel: varchar("activity_level", { length: 20 }).notNull(),
  goal: varchar("goal", { length: 20 }).notNull(),
  restrictions: varchar("restrictions", { length: 500 }),
  tmb: real("tmb").notNull(),
  tdee: real("tdee").notNull(),
  targetCalories: real("target_calories").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDietProfileSchema = createInsertSchema(dietProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDietProfile = z.infer<typeof insertDietProfileSchema>;
export type DietProfile = typeof dietProfilesTable.$inferSelect;
