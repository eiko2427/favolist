const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => { // '/link-preview' -> '/'
    const url = req.query.url;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const title = $('meta[property="og:title"]').attr('content');
        const description = $('meta[property="og:description"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');
        res.json({ title, description, image });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate link preview' });
    }
});

module.exports = router;
