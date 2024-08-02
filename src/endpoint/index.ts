import express, { Express } from "express";
import * as scraper from '../service/scraper/index';
import * as bfkScraper from '../service/scraper/bfk';
import * as dbQueries from '../db/queries';
import * as cron from 'node-cron';
import { InsertArticle } from "../db/schema";

const app: Express = express();
const PORT: string | number = process.env.PORT ?? 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req: express.Request, res: express.Response) => {
    res.send("backend server is running");
});


app.get('/articles', async (req: express.Request, res: express.Response) => {
    console.log("GET /articles");
    res.send(await dbQueries.getArticles());
});

cron.schedule('* * * * *', async () => {
    console.log("Cron job started");
    const browser = await scraper.initBrowser();
    const articles: InsertArticle[] = [];
    Promise.allSettled([
        bfkScraper.scrapeArticlesGmuend(browser, 1).then((a) => {
            articles.push(...a);
        }).catch((err) => {
            console.error('Error scraping Gmuend:', err)
        }),
        bfkScraper.scrapeArticlesWeidhofen(browser, 2).then((a) => {
            articles.push(...a);
        }).catch((err) => {
            console.error('Error scraping Weidhofen:', err)
        }),
        bfkScraper.scrapeDeploymentReportsWeidhofen(browser, 2).then((a) => {
            articles.push(...a);
        }).catch((err) => {
            console.error('Error scraping deployment reports Weidhofen:', err)
        }),
        bfkScraper.scrapeArticlesZwettl(browser, 3).then((a) => {
            articles.push(...a);
        }).catch((err) => {
            console.error('Error scraping Zwettl:', err)
        }),
    ]).then(async () => {
        try {
            await dbQueries.createArticles(articles);
        }
        catch (error) {
            console.error('Error saving articles:', error);
        }
        await browser.close();
        console.log("Cron job finished");
    });
});