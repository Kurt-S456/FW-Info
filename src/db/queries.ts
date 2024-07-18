
import { db } from './index';
import { eq, sql } from 'drizzle-orm';
import { articleTable, InsertArticle, SelectArticle } from './schema';

export async function getArticles(page = 1, size = 10) : Promise<Array<SelectArticle>> {
 return await db.select().from(articleTable).limit(size).offset((page - 1) * size);   
}

export async function createArticle(data: InsertArticle): Promise<void> {
    await db.insert(articleTable).values(data);
}

export async function articleExists(title: string) {
    const result = await db.select({ count: sql<number>`count(*)` }).from(articleTable).where(eq(articleTable.title, title));
    return result[0].count > 0;
}

export async function createArticles(articles: Array<InsertArticle>) {
    for (const article of articles) {
            await createArticle(article);
    }
}


