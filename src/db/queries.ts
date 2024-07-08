import { db } from './index';
import { article } from './schema';

export const getArticles = async () => {
    return db.select().from(article);
};
