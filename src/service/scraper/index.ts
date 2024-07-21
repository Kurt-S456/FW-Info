import * as puppeteer from 'puppeteer';
import 'dotenv/config';

export async function initBrowser() : Promise<puppeteer.Browser> {
    try {
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
    } catch (error) {
        console.error('Could not create browser instance: '+error);
        return {} as puppeteer.Browser;
    };
};