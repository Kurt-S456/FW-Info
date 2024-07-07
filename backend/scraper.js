const e = require('express');
const puppeteer = require('puppeteer');

const inintializeScraper = async (res) => {
    let browser; 
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url = 'https://feuerwehr.ottenschlag.com/';
        await page.goto(url);
        const news = await page.evaluate(() => {
            const newsElements = Array.from(document.querySelectorAll('div.news'));
            const newsData = newsElements.map(newsElement => {
            const title = newsElement.querySelector('.title')?.textContent.trim();
            const categories = Array.from(newsElement.querySelectorAll('.categories span'))
                                    .map(span => span.textContent.trim());
            let description = newsElement.textContent.trim(); // Get the whole text content
            description = description.replace(/[\n\r]+/g, ''); // Remove line breaks
            description = description.replace(/mehr lesen/g, ''); // Remove "mehr lesen"

            const imageUrl = newsElement.querySelector('.picture')?.style.backgroundImage
                                    .replace('url("', '')
                                    .replace('")', ''); // Extracting background image URL
            const onclick = newsElement.getAttribute('onclick');
            const match = onclick ? onclick.match(/'([^']+)'/) : null;
            const relativeUrl = match ? match[1] : ''; // Extract relative URL from onclick attribute if match is not null
                    
            const fullUrl = 'https://feuerwehr.ottenschlag.com/-/' + relativeUrl; // Construct full URL

                return {
                    title,
                    categories,
                    description,
                    imageUrl,
                    fullUrl
                };
            });
            return newsData;
        });

        res.send(news);
    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred while scraping the website.' + error);
    } finally {
        await browser?.close(); 
    }
};

module.exports = { inintializeScraper };