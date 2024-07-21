import * as puppeteer from 'puppeteer';
import { InsertArticle } from '../../db/schema';
import { articleExists } from '../../db/queries';

export async function scrapeArticlesOttenschlag(browser: puppeteer.Browser, sectionId: number): Promise<InsertArticle[]> {
    const url: string = 'http://afk.ottenschlag.com/page.asp/-/48.htm';
    console.log(`Scraping from ${url}`);
    const page = await browser.newPage();
    await page.goto(url);
    const articles = await page.evaluate((sectionId, baseUrl) => {
        const articleElements = document.querySelectorAll('.newsbox');
        return Array.from(articleElements).map(article => {
            const titleElement = article.querySelector('.info h6');
            const summaryElement = article.querySelector('.info > p:nth-of-type(3)');
            const imageUrlElement = article.querySelector('.Bild img');
            const urlElement = article.querySelector('.link a');
            let url = urlElement?.getAttribute('href') || '';
            if (!url.startsWith('http') && !url.startsWith('www')) {
                url = baseUrl + '-/' + url;
            }

            return {
                sectionId: sectionId,
                title: titleElement?.textContent?.trim() || '',
                summary: summaryElement?.textContent?.trim() || '',
                imageUrl: baseUrl + imageUrlElement?.getAttribute('src')?.replace('../', '').replace(/ /g, '%20') || '',
                url: url,
            } as InsertArticle;
        });
    }, sectionId, url.substring(0, url.indexOf('-/48.htm')));
    await page.close();
    return await removePersistedArticles(articles, sectionId);
}

export async function scrapeArticlesGrossGerungs(browser: puppeteer.Browser, sectionId: number): Promise<InsertArticle[]> {
    const url: string = 'https://www.afkgg.at/index.php/aktuelle-news-feuerwehr.html';
    console.log(`Scraping from ${url}`);
    const page = await browser.newPage();
    await page.goto(url);
    const articles = await page.evaluate((sectionId, baseUrl) => {
        const articleElements = document.querySelectorAll('.layout_latest');
        return Array.from(articleElements).map(article => {
            const titleElement = article.querySelector('.titel h1');
            const summaryElement = article.querySelector('.teaserblock p');
            const imageUrlElement = article.querySelector('.image_container img');
            const urlElement = article.querySelector('.weiterlesen a');
            let url = urlElement?.getAttribute('href') || '';
            if (!url.startsWith('http')) {
                url = baseUrl + url;
            }

            return {
                sectionId: sectionId,
                title: titleElement?.textContent?.trim() || '',
                summary: summaryElement?.textContent?.trim() || '',
                imageUrl: baseUrl + imageUrlElement?.getAttribute('src') || '',
                url: url,
            } as InsertArticle;
        });

    }, sectionId, url.substring(0, url.indexOf('index.php')));
    await page.close();
    return await removePersistedArticles(articles, sectionId);
}


async function removePersistedArticles(articles: InsertArticle[], id: number): Promise<InsertArticle[]> {
    const articleExistencePromises = articles.map(article =>
        articleExists(article.title, id).then(exists => ({ article, exists }))
    );

    const articlesAndExistence = await Promise.all(articleExistencePromises);
    const newArticles = articlesAndExistence
        .filter(({ exists }) => !exists)
        .map(({ article }) => article);

    return newArticles;
}