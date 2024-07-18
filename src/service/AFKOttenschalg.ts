import * as puppeteer from 'puppeteer';
import { InsertArticle } from '../db/schema';
import { articleExists} from '../db/queries';


export async function scrapeArticles(browser: puppeteer.Browser, departmentId: number): Promise<InsertArticle[]> {
  const url: string = 'http://afk.ottenschlag.com/page.asp/-/48.htm';
  console.log(`Scraping from ${url}`);
  const page = await browser.newPage();
  await page.goto(url);
  const articles = await page.evaluate((departmentId, baseUrl) => {
    const articleElements = document.querySelectorAll('.newsbox');
    console.log(baseUrl);
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
      };
    });
  }, departmentId, url.substring(0, url.indexOf('-/48.htm')));
  const newArticles = [];
  for (const article of articles) {
    const exists = await articleExists(article.title);
    if (!exists) {
      newArticles.push(article);
    }
  }
  await page.close();
  return newArticles;
}

export async function scrapeFFOttenschalgParagraphs(browser: puppeteer.Browser, articles: InsertArticle[]) {

  const page = await browser.newPage();
  for (const article of articles) {
    if (!article.url) {
        continue;
    }
      await page.goto(article.url);
      const paragraphs = await page.evaluate(() => {
        const pElements = document.querySelectorAll('.bhv-text p');
        return Array.from(pElements).map(p => p.textContent?.trim() || '');
    });
    console.log(paragraphs);
  }
  await page.close();
}