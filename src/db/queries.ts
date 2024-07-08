import { db } from './index';
import { article } from './schema';

export const createArticle = async (name: string, summary: string) => {
  return db.insert(article).values({ name, summary }).execute();
};

export const getArticles = async () => {
    return db.select().from(article);
};
