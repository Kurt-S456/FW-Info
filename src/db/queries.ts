
import { db } from './index';
import { asc, count, eq, getTableColumns, gt, sql } from 'drizzle-orm';
import { articleTable, departmentTable, InsertArticle, SelectArticle, SelectDepartment } from './schema';

export async function getArticles(page = 1, size = 10) : Promise<Array<SelectArticle>> {
 return await db.select().from(articleTable).limit(size).offset((page - 1) * size);   
}

export async function createArticle(data: InsertArticle): Promise<void> {
    await db.insert(articleTable).values(data);
}

export async function getDepartments() : Promise<Array<SelectDepartment>> {
    return await db.select().from(departmentTable);
}

export async function articleExists(title: string) {
    const result = await db.select({ count: sql<number>`count(*)` }).from(articleTable).where(eq(articleTable.title, title));
    console.log(result);
    return result[0].count > 0;
}

export async function createArticles(articles: Array<InsertArticle>) {
    console.log(`Creating articles ${articles}`);
    for (const article of articles) {
        if (!await articleExists(article.title)) {
            console.log(`Creating article ${article.title}`);
            await createArticle(article);
        }
    }
}


