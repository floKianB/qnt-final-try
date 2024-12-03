const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json()); // Parse JSON body
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.get('/scrape', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Scraping Endpoint
app.post('/scrape', async (req, res) => {
    const { vin } = req.body;

    // Validate input
    if (!vin) {
        return res.status(400).json({ error: 'VIN is required' });
    }

    try {
        const osPlatform = os.platform(); // possible values are: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
        console.log('Scraper running on platform: ', osPlatform);
        let executablePaths;
        if (/^win/i.test(osPlatform)) {
            executablePaths = '';
        } else if (/^linux/i.test(osPlatform)) {
            executablePaths = '/usr/bin/google-chrome';
        }
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            executablePath: executablePaths, // Use Puppeteer's bundled Chromium
            headless: false, // Run in headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessary for containerized environments
        });
        console.log('Using browser executable path:', puppeteer.executablePath());
        const page = await browser.newPage();

        // Navigate to the target website
        await page.goto('https://www.vinaudit.ca/market-value-tool', { waitUntil: 'domcontentloaded' });

        // Input VIN and trigger search
        await page.type('input[name="vin"]', vin);
        await page.click('.va_mv_btn');

        // Wait for results
        const result1Selector = '#va_mv_average_text';
        const result2Selector = '#va_mv_leftlabel_text';
        const result3Selector = '#va_mv_rightlabel_text';

        await page.waitForSelector(result1Selector, { visible: true });
        await page.waitForSelector(result2Selector, { visible: true });
        await page.waitForSelector(result3Selector, { visible: true });

        // Extract data
        const marketValue1 = await page.$eval(result1Selector, el => el.textContent.trim());
        const marketValue2 = await page.$eval(result2Selector, el => el.textContent.trim());
        const marketValue3 = await page.$eval(result3Selector, el => el.textContent.trim());
        // Clean extracted values
        const marketAverage = marketValue1.replace(/[^0-9]/g, "");
        const belowMarket = marketValue2.replace(/[^0-9]/g, "");
        const aboveMarket = marketValue3.replace(/[^0-9]/g, "");

        // Close browser
        await browser.close();
        console.log(marketAverage)
        console.log(belowMarket)
        console.log(aboveMarket)
        // Send JSON response
        res.json({
            marketValue1: marketAverage,
            marketValue2: belowMarket,
            marketValue3: aboveMarket
        });

    } catch (error) {
        console.error('Error scraping market value:', error);
        res.status(500).json({ error: 'Failed to scrape market value' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
