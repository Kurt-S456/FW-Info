import * as puppeteer from 'puppeteer';
import * as dbQuerries from '../db/queries';
import { InsertArticle } from '../db/schema';

export async function scrapeFFOttenschalg(browser: puppeteer.Browser, url: string, departmentId: number) {
    console.log(`Scraping ${departmentId} from ${url}`);
    const page = await browser.newPage();
    await page.goto(url);
    const extractedArticles = await page.evaluate(() : InsertArticle[]  => {
        const newsElements = Array.from(document.querySelectorAll('div.news'));
        console.log(newsElements);
        return newsElements.map((element) => {
            return {
                title:  "",
                summary: "",
                url: "",
                imageUrl: "",
                departmentId: departmentId,
            };
        });
    });
    console.log(extractedArticles);
    await page.close();
}
