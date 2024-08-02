
import { db } from './index';
import {and, desc, eq, like, sql} from 'drizzle-orm';
import { articleTable, InsertArticle, SelectArticle } from './schema';
import {ArticleSearchDTO} from "../dto/article";

export async function getArticles(searchParams: ArticleSearchDTO,page: number = 1, size: number = 10) : Promise<Array<SelectArticle>> {
    console.log(searchParams);
    const conditions = [];

    if (searchParams.title) {
        conditions.push(like(articleTable.title, `%${searchParams.title}%`));
    }
    if (searchParams.districtId) {
        conditions.push(eq(articleTable.districtId, searchParams.districtId));
    }

    const query = db.select()
        .from(articleTable)
        .limit(size)
        .offset((page - 1) * size)
        .orderBy(desc(articleTable.createdAt));

    if (conditions.length > 0) {
        query.where(and(...conditions));
    }

    return query;
}

export async function createArticle(data: InsertArticle): Promise<void> {
    await db.insert(articleTable).values(data);
}

export async function articleExists(title: string, districtId: number): Promise<boolean> {
    const result = await db.select({ count: sql<number>`count(*)` })
                            .from(articleTable)
                            .where(
                                eq(articleTable.title, title) 
                                && eq(articleTable.districtId, districtId)
                            );

    return result[0].count > 0;
}

export async function createArticles(articles: Array<InsertArticle>) {
    for (const article of articles) {
            await createArticle(article);
    }
}


