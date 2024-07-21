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

export async function scrapeArticlesGmuend(browser: puppeteer.Browser, sectionId: number): Promise<InsertArticle[]> {
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
            const article = await page.evaluate((sectionId, url) => {
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
                    sectionId: sectionId,
                    title: extractTextUpToSecondParagraph(titleElement?.textContent?.trim() || ''),
                    summary: summaryElement?.textContent?.trim() || '',
                    imageUrl: imageUrlElement?.getAttribute('src') || '',
                    url: url,
                } as InsertArticle;
            }, sectionId, url);
            const articleExists = await dbQueries.articleExists(article.title);
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