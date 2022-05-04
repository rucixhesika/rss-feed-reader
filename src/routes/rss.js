const express = require('express');
const router = express.Router();
const rssController = require('../controllers/rssController')

// rssController is the handler with the logic that processes the request with provided parameter after /episodes route
router.get('/*', rssController.parseFeed);


module.exports = router