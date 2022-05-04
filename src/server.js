/** src/server.js */
const express = require('express');
const api = express();
const PORT = process.env.PORT ?? 8008;
const router = require('./routes/rss')

// mount the router as middleware at path /episodes
api.use('/episodes', router)

api.listen(PORT, () => console.log(`FeedReader server is running on port ${PORT}`));

// Demo a request to api server
//const axios = require('axios');
//const resp = (async () => {
//    await axios.get('http://localhost:8008/episodes/?url=https://api.sr.se/api/rss/pod/itunes/37282')
//})()

