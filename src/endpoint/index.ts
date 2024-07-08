import express, { Express, Request, Response } from "express";
import { initializeScraper } from '../service/scraper';
import * as dbQueries from '../db/queries';
import * as cron from 'node-cron';

const app: Express = express();
const PORT: string | number = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req: express.Request, res: express.Response) => {
    res.send("backend server is running");
});

app.get('/scrape', async (req: express.Request, res: express.Response) => {
    await initializeScraper(res);
});

app.get('/articles', async (req: express.Request, res: express.Response) => {
    console.log("GET /articles");
    res.send(await dbQueries.getArticles());
});

cron.schedule('* * * * *', () => {
    console.log("Cron job started");
    console.log("Cron job finished");
});