import puppeteer from 'puppeteer';
import 'dotenv/config';

export async function initBrowser() {
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
        console.error('Error initializing srcaper:', error);
    }
};