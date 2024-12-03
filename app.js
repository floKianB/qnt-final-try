const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const cors = require('cors');


const app = express();
const PORT = 5001;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());
app.use(cors());


// Endpoint for scraping
app.post('https://qnt-final-try-1.onrender.com/scrape', async (req, res) => {
    const { vin } = req.body;
    if (!vin) {
        return res.status(400).json({ error: 'VIN is required' });
    }
    try {
        const browser = await puppeteer.launch({
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    
        // Launch Puppeteer
        const page = await browser.newPage();

        // Navigate to the third-party website
        await page.goto('https://www.vinaudit.ca/market-value-tool', { waitUntil: 'domcontentloaded' });

        // Input the VIN and trigger the market value check
        await page.type('input[name="vin"]', vin);
        await page.click('.va_mv_btn');

        // Wait for the result (adjust the selector to match the result on the website)
        await page.waitForSelector('#va_mv_average_text'); // Replace `.result-selector` with the actual selector

        // Extract the market value
        const result1Selector = '#va_mv_average_text';
        const result2Selector = '#va_mv_leftlabel_text';
        const result3Selector = '#va_mv_rightlabel_text';

        // await page.waitForSelector(resultSelector, { timeout: 30000 }); // Wait for up to 30 seconds
        await page.waitForSelector(result1Selector, { visible: true });
        await page.waitForSelector(result2Selector, { visible: true });
        await page.waitForSelector(result3Selector, { visible: true });

        
        // Extract the market value
        const element1 = await page.$(result1Selector);  // Get the element handle
        const element2 = await page.$(result2Selector);  // Get the element handle
        const element3 = await page.$(result3Selector);  // Get the element handle
        const marketValue1 = await element1.evaluate(el => el.textContent.trim());
        const marketValue2 = await element2.evaluate(el => el.textContent.trim());
        const marketValue3 = await element3.evaluate(el => el.textContent.trim());
        const marketAvrage = marketValue1.replace(/[^0-9]/g,"");
        const BelowMarket = marketValue2.replace(/[^0-9]/g,"");
        const AboveMarket = marketValue3.replace(/[^0-9]/g,"");
            
        // Close the browser
        await browser.close();

        // Send the result back to the client
        res.json({ marketValue1: marketAvrage , marketValue2: BelowMarket, marketValue3: AboveMarket });
    } catch (error) {
        console.error('Error scraping market value:', error);
        res.status(500).json({ error: 'Failed to scrape market value' });
    } 
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
