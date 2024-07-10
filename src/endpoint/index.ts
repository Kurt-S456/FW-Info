import express, { Express } from "express";
import * as scraper from '../service/scraper';
import * as dbQueries from '../db/queries';
import * as cron from 'node-cron';

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
    
    console.log("Cron job finished");
});