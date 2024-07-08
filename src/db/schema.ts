import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, foreignKey } from 'drizzle-orm/sqlite-core';

export const article = sqliteTable("article", {
  id: integer("id"),
  title: text("title"),
  summary: text("summary"),
  url: text("url"),
  imageUrl: text("image_url"),
  createdAt: text('created_at')
  .default(sql`(CURRENT_TIMESTAMP)`)
  .notNull(),
});

export const department = sqliteTable("department", {
  id: integer("id"),
  name: text("name"),
  url: text("url"),
});

export const section = sqliteTable("section", {
  id: integer("id"),
  name: text("name"),
  url: text("url"),
  departmentId: integer("department_id")
    .references(() => department.id), // Foreign key to the department table
});

export const district = sqliteTable("district", {
  id: integer("id"),
  name: text("name"),
  url: text("url"),
  sectionId: integer("section_id")
    .references(() => section.id), // Foreign key to the section table
});

export const departmentDistrict = sqliteTable("department_district", {
  departmentId: integer("department_id")
    .references(() => department.id), // Foreign key to the department table
  districtId: integer("district_id")
    .references(() => district.id), // Foreign key to the district table
});

export const sectionDistrict = sqliteTable("section_district", {
  sectionId: integer("section_id")
    .references(() => section.id), // Foreign key to the section table
  districtId: integer("district_id")
    .references(() => district.id), // Foreign key to the district table
});

export const articleDepartment = sqliteTable("article_department", {
  articleId: integer("article_id")
    .references(() => article.id), // Foreign key to the article table
  departmentId: integer("department_id")
    .references(() => department.id), // Foreign key to the department table
});