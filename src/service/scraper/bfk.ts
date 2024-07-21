import * as puppeteer from "puppeteer";
import { InsertArticle } from "../../db/schema";
import * as dbQueries from "../../db/queries";
import { db } from "../../db";

async function scrapeArticlesUrlsGmuend(browser: puppeteer.Browser): Promise<string[]> {
    const url: string = 'https://www.bfkdo-gmuend.at';
    console.log(`Scraping from ${url}`);
    const page = await browser.newPage();
    await page.goto(url);

    return await page.evaluate(() => {
        const articleElements = document.querySelectorAll('.post');
        return Array.from(articleElements).map(article => {
            return article.querySelector('a')?.getAttribute('href') || '';
        });
    });
}

export async function scrapeArticlesGmuend(browser: puppeteer.Browser, districtId: number): Promise<InsertArticle[]> {
    const urls: string[] = await scrapeArticlesUrlsGmuend(browser);
    const articles: InsertArticle[] = [];
    const concurrencyLimit = 5;
    let activeCount = 0;
    let index = 0;

    async function processNextUrl() {
        if (index >= urls.length) return;
        const url = urls[index++];
        activeCount++;

        try {
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); // 30s timeout
            const article = await page.evaluate((districtId, url) => {
                function extractTextUpToSecondParagraph(input: string): string {
                    const lines = input.split('\n');
                    if (lines.length > 2) {
                        return lines[0] + ' ' + lines[1];
                    }
                    return input.replace(/\n/g, ' ');
                }

                const titleElement = document.querySelector('.entry-content > p:nth-child(1)');
                const summaryElement = document.querySelector('.entry-content > p:nth-child(2)');
                const imageUrlElement = document.querySelector('.attachment-dynamico-ultra-wide');
                return {
                    districtId: districtId,
                    title: extractTextUpToSecondParagraph(titleElement?.textContent?.trim() || ''),
                    summary: summaryElement?.textContent?.trim() || '',
                    imageUrl: imageUrlElement?.getAttribute('src') || '',
                    url: url,
                } as InsertArticle;
            }, districtId, url);
            const articleExists = await dbQueries.articleExists(article.title, districtId);
            if (!articleExists) {
                articles.push(article);
            }
            await page.close();
        } catch (error) {
            console.error(`Failed to process ${url}:`, error);
        } finally {
            activeCount--;
            if (index < urls.length) {
                await processNextUrl();
            }
        }
    }

    const promises: Promise<void>[] = [];
    for (let i = 0; i < concurrencyLimit; i++) {
        promises.push(processNextUrl());
    }
    await Promise.all(promises);

    return articles;
}


export async function scrapeArticlesWeidhofen(browser: puppeteer.Browser, districtId: number): Promise<InsertArticle[]> {
    const url: string = 'https://www.bfk-waidhofen.at/category/berichte/2024/';
    console.log(`Scraping from ${url}`);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const articles = await page.evaluate((districtId, baseUrl) => {
        const articleElements = document.querySelectorAll('.post');
        return Array.from(articleElements).map(article => {
            const titleElement = article.querySelector('.entry-title a');
            const summaryElement = article.querySelector('.entry-summary p');
            const imageUrlElement = article.querySelector('.post-thumbnail a img');
            let url = titleElement?.getAttribute('href') || '';
            if (!url.startsWith('http')) {
                url = baseUrl + url;
            }

            return {
                districtId: districtId,
                title: titleElement?.textContent?.trim() || '',
                summary: summaryElement?.textContent?.trim() || '',
                imageUrl: imageUrlElement?.getAttribute('src') || '',
                url: url,
            } as InsertArticle;
        });
    }, districtId, url);

    await page.close();
    return await removePersistedArticles(articles, districtId);

}

export async function scrapeDeploymentReportsWeidhofen(browser: puppeteer.Browser, districtId: number): Promise<InsertArticle[]> {
    const url: string = 'https://www.bfk-waidhofen.at/category/einsaetze/2024-einsaetze/';
    console.log(`Scraping from ${url}`);
    const page = await browser.newPage();
    await page.goto(url);
    const articles = await page.evaluate((districtId, baseUrl) => {
        const articleElements = document.querySelectorAll('.post');
        return Array.from(articleElements).map(article => {
            const titleElement = article.querySelector('.entry-title a');
            const summaryElement = article.querySelector('.entry-summary p');
            const imageUrlElement = article.querySelector('.post-thumbnail a img');
            let url = titleElement?.getAttribute('href') || '';
            if (!url.startsWith('http')) {
                url = baseUrl + url;
            }

            return {
                districtId: districtId,
                title: titleElement?.textContent?.trim() || '',
                summary: summaryElement?.textContent?.trim() || '',
                imageUrl: imageUrlElement?.getAttribute('src') || '',
                url: url,
            } as InsertArticle;
        });
    }, districtId, url);

    await page.close();
    return await removePersistedArticles(articles, districtId);

}

async function removePersistedArticles(articles: InsertArticle[], id: number): Promise<InsertArticle[]> {
    const articleExistencePromises = articles.map(article =>
        dbQueries.articleExists(article.title, id).then(exists => ({ article, exists }))
    );

    const articlesAndExistence = await Promise.all(articleExistencePromises);
    const newArticles = articlesAndExistence
        .filter(({ exists }) => !exists)
        .map(({ article }) => article);

    return newArticles;
}