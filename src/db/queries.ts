
import { db } from './index';
import { articleTable, departmentTable, InsertArticle, SelectArticle} from './schema';

export async function getArticles(page = 1, size = 10) : Promise<Array<SelectArticle>> {
 return db.select().from(articleTable).limit(size).offset((page - 1) * size);   
}

export async function createArticle(data: InsertArticle) {
    return db.insert(articleTable).values(data);
}

export async function getDepartments() {
    return db.select().from(departmentTable);
}

