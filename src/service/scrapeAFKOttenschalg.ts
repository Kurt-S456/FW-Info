import * as puppeteer from 'puppeteer';
import { InsertArticle } from '../db/schema';
import { createArticle } from '../db/queries';


export async function scrapeFFOttenschalg(browser: puppeteer.Browser, departmentId: number) {
    const baseUrl : string = 'https://feuerwehr.ottenschlag.com/';
    console.log(`Scraping ${departmentId} from ${baseUrl}`);
    const page = await browser.newPage();
    await page.goto(baseUrl);

    const articles: InsertArticle[] = await page.evaluate((departmentId) => {
        const items = document.querySelectorAll('.news');
        const results: InsertArticle[] = [];
        
        items.forEach(item => {
          const titleElement : HTMLElement | null = item.querySelector('.title');
          const summaryElement : HTMLElement | null = item.querySelector('.inner');
          const imageElement : HTMLElement | null = item.querySelector('.picture');

    
          const title = titleElement ? titleElement.textContent?.trim() : "";
          
          // Extracting the summary content by removing title and category labels
          let summary = "";
          if (summaryElement) {
            const categoryLabels = summaryElement.querySelector('.categories');
            if (categoryLabels) {
              categoryLabels.remove(); // Remove category labels from the summary element
            }
            const titleLabel = summaryElement.querySelector('.title');
            if (titleLabel) {
              titleLabel.remove(); // Remove the title label from the summary element
            }
            summary = summaryElement.innerText.replace(/\n+/g, ' ').trim(); // Get the clean summary
          }
    
          const onclickAttr = item.getAttribute('onclick');
          const urlMatch = onclickAttr ? RegExp(/window\.location\.href\s*=\s*'([^']+)'/).exec(onclickAttr) : null;
          let url = urlMatch ? urlMatch[1] : null;
            if (url && !url.startsWith('http')) {
                url = `https://feuerwehr.ottenschlag.com/-/${url}`;
            }
            let imageUrl = imageElement ? imageElement.style.backgroundImage.slice(5, -2) : null;
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `https://feuerwehr.ottenschlag.com/-/${imageUrl}`;
            }

          if (title && summary) {
            results.push({
              title,
              summary,
              url,
              imageUrl,
              departmentId,
            });
          }
        });
        return results;
      }, departmentId);
      console.log(articles);
      await createArticle(articles[0]);
    await page.close();
}
