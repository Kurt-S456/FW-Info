import puppeteer from 'puppeteer';
import express from 'express';
import 'dotenv/config';

interface NewsData {
    title: string | null;
    categories: string[];
    description: string;
    imageUrl: string | null;
    onclick: string | null;
}

export async function initializeScraper(res: express.Response) {
    let browser: any = null; 
    try {
        browser = await puppeteer.launch({
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
        const page = await browser.newPage();
        const url = 'https://feuerwehr.ottenschlag.com/';
        await page.goto(url);
        const news = await page.evaluate((): NewsData[] => {
            const newsElements = Array.from(document.querySelectorAll('div.news'));
            return newsElements.map(newsElement => {
                const title = newsElement.querySelector('.title')?.textContent?.trim() ?? null;
                const categories = Array.from(newsElement.querySelectorAll('.categories span'))
                                        .map(span => span.textContent?.trim())
                                        .filter((category): category is string => category !== undefined); // Updated line
                let description = newsElement.querySelector('.inner')?.textContent?.trim() ?? ''; // Get the whole text content
                description = description.replace(/[\n\r]+/g, ''); // Remove line breaks
                description = description.replace(/mehr lesen/g, ''); // Remove "mehr lesen"
        
                const imageUrl = newsElement.querySelector('img')?.getAttribute('src') ?? null;
                const onclick = newsElement.getAttribute('onclick');
                const match = onclick ? onclick.match(/'([^']+)'/) : null;
        
                return { title, categories, description, imageUrl, onclick: match ? match[1] : null };
            });
        });
        res.json(news);
    } catch (error) {
        console.error('Error initializing scraper:', error);
    } finally {
        await browser?.close();
    }
};