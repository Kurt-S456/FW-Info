import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const districtTable = sqliteTable("district", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  short: text("short").notNull(),
  url: text("url").notNull(),
});

export const sectionTable = sqliteTable("section", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  districtId: integer("district_id").notNull().references(() => districtTable.id),

});

export const departmentTable = sqliteTable("department", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  districtId: integer("district_id").notNull().references(() => sectionTable.id),
});

export const articleTable = sqliteTable("article", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  url: text("url"),
  imageUrl: text("image_url"),
  departmentId: integer("department_id").references(() => departmentTable.id),
  sectionId: integer("section_id").references(() => sectionTable.id),
  districtId: integer("district_id").references(() => districtTable.id),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const tagTable = sqliteTable("tag", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  short: text("short").notNull(),
  color: text("color"),
});

export const articleTagTable = sqliteTable("article_tag", {
  articleId: integer("article_id").notNull().references(() => articleTable.id),
  tagId: integer("tag_id").notNull().references(() => tagTable.id)
});

export type InsertArticle = typeof articleTable.$inferInsert;
export type SelectArticle = typeof articleTable.$inferSelect;

export type SelectDepartment = typeof departmentTable.$inferSelect;

export type SelectDistrict = typeof districtTable.$inferSelect;