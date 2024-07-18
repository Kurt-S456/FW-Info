import * as puppeteer from 'puppeteer';
import 'dotenv/config';
import { InsertArticle } from '../db/schema';
import { articleExists } from '../db/queries';

export async function initBrowser() : Promise<puppeteer.Browser> {
        return await puppeteer.launch({
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--single-process', 
                '--no-zygote'
            ],
            executablePath: 
            process.env.NODE_ENV === "production" 
            ? process.env.PUPPETEER_EXECUTABLE_PATH ?? puppeteer.executablePath()
            : puppeteer.executablePath(),
        });
};

export async function scrapeArticlesOttenschlag(browser: puppeteer.Browser, departmentId: number): Promise<InsertArticle[]> {
    const url: string = 'http://afk.ottenschlag.com/page.asp/-/48.htm';
    console.log(`Scraping from ${url}`);
    const page = await browser.newPage();
    await page.goto(url);
    const articles = await page.evaluate((departmentId, baseUrl) => {
      const articleElements = document.querySelectorAll('.newsbox');
      return Array.from(articleElements).map(article => {
        const titleElement = article.querySelector('.info h6');
        const summaryElement = article.querySelector('.info > p:nth-of-type(3)');
        const imageUrlElement = article.querySelector('.Bild img');
        const urlElement = article.querySelector('.link a');
        return {
          departmentId: departmentId,
          title: titleElement?.textContent?.trim() || '',
          summary: summaryElement?.textContent?.trim() || '',
          imageUrl: baseUrl + imageUrlElement?.getAttribute('src')?.replace('../', '').replace(/ /g, '%20') || '',
          url: baseUrl+ '-/'+ urlElement?.getAttribute('href') || '',
        } as InsertArticle;
      });
    }, departmentId, url.substring(0, url.indexOf('-/48.htm')));
    await page.close();
    return await removePersistedArticles(articles);
  }

  export async function scrapeArticlesGrossGerungs(browser: puppeteer.Browser, departmentId: number): Promise<InsertArticle[]> {
    const url: string = 'https://www.afkgg.at/index.php/aktuelle-news-feuerwehr.html';
    console.log(`Scraping from ${url}`);
    const page = await browser.newPage();
    await page.goto(url);
    const articles = await page.evaluate((departmentId, baseUrl) => {
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
                departmentId: departmentId,
                title: titleElement?.textContent?.trim() || '',
                summary: summaryElement?.textContent?.trim() || '',
                imageUrl: baseUrl + imageUrlElement?.getAttribute('src') || '',
                url: url,
            } as InsertArticle;
        });

    }, departmentId, url.substring(0, url.indexOf('index.php')));
    await page.close();
    return await removePersistedArticles(articles);
  }


  async function removePersistedArticles(articles: InsertArticle[]) : Promise<InsertArticle[]> {
    const newArticles = [];
    for (const article of articles) {
      const exists = await articleExists(article.title);
      if (!exists) {
        newArticles.push(article);
      }
    }
    return newArticles;
  }