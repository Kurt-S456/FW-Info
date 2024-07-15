import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const districtTable = sqliteTable("district", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
});

export const sectionTable = sqliteTable("section", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  url: text("url"),
  districtId: integer("district_id").notNull().references(() => districtTable.id),
});

export const departmentTable = sqliteTable("department", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  sectionId: integer("section_id").notNull().references(() => sectionTable.id),
});

export const articleTable = sqliteTable("article", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  url: text("url"),
  imageUrl: text("image_url"),
  departmentId: integer("department_id").notNull().references(() => departmentTable.id),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type InsertArticle = typeof articleTable.$inferInsert;
export type SelectArticle = typeof articleTable.$inferSelect;

export type SelectDepartment = typeof departmentTable.$inferSelect;

export type SelectSection = typeof sectionTable.$inferSelect;

export type SelectDistrict = typeof districtTable.$inferSelect;

export function generateId(): number {
  return Math.floor(Math.random() * 1000000);
}