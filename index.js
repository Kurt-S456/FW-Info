const express = require('express');
const scraper = require('./scraper');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send("backend server is running");
});

app.get('/scrape', async (req, res) =>{
    await scraper.inintializeScraper(res);
});
