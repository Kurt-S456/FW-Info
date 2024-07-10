
import { db } from './index';
import { asc, count, eq, getTableColumns, gt, sql } from 'drizzle-orm';
import { articleTable, departmentTable, InsertArticle, SelectArticle, SelectDepartment } from './schema';

export async function getArticles(page = 1, size = 10) : Promise<Array<SelectArticle>> {
 return db.select().from(articleTable).limit(size).offset((page - 1) * size);   
}

export async function createArticle(data: InsertArticle): Promise<void> {
    db.insert(articleTable).values(data);
}

export async function getDepartments() : Promise<Array<SelectDepartment>> {
    return db.select().from(departmentTable);
}

export async function articleExists(title: string): Promise<boolean> {
    const result = await db.select({count: sql<number>`count(*)`})
                           .from(articleTable)
                           .where(eq(articleTable.title, title));

    if (result.length > 0 && result[0].count > 0) {
        return true;
    }
    return false;
}

export async function createArticles(articles: Array<InsertArticle>) {
    articles.forEach(async (article) => {
        if (!await articleExists(article.title)) {
            await createArticle(article);
        }
    }
    );
}


