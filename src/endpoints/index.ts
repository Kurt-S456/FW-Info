import express, { Express, Request, Response } from "express";
import { initializeScraper } from '../service/scraper';

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