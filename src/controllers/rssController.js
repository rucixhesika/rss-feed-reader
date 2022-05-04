let Parser = require('rss-parser');
const path = require('path');
const axios = require('axios').default;
const fs = require('fs');
const crypto = require('crypto')
const stream = require('stream');
let promisify = require('util').promisify;
const finished = promisify(stream.finished);

let parser = new
    Parser({
        // extract special fields from rss items(mp3 url is attribute of enclosure)
        // guid is extracted for uniquely naming downloaded files and perhaps used in future by the aggregator to check if its new content 
        customFields: {
            item: ['enclosure', 'guid']
        }
    });

function generateChecksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

/*calculate and return checksum of audio file after downloaded*/
async function downloadFile(guid, mp3Url) {
    const fileName = `media_${guid}.mp3`
    const downloadFolder = `${__dirname}/download/`;
    const localFilePath = path.resolve(__dirname, downloadFolder, fileName);
    const writer = fs.createWriteStream(localFilePath);
    return axios({
        method: 'get',
        url: mp3Url,
        responseType: 'stream',
    }).then(async response => {
        response.data.pipe(writer);
        await finished(writer); //this is a Promise that waits until all data is piped in disk file
        console.log('Successfully downloaded file!');
        // read audio file 
        const data = fs.readFileSync(localFilePath);
        // calculate checksum
        const checksum = generateChecksum(data, "MD5", "hex")
        return checksum
    });
};

/*calculate and return checksum of audio file stream without downloading it*/
async function calcStreamChecksum(mp3Url) {
    var hash = crypto.createHash('md5')
    var checksum;

    return axios({
        method: 'get',
        url: mp3Url,
        responseType: 'stream',
    }).then(async response => {
        var data = response.data;
        data.on('error', err => {
            console.error('Encountered Stream error:', err)
        })
        data.on('data', function (chunk) {
            // Default chunk size(Highwatermark) is 16 kb
            // hash.update() method updates the hash with new chunk's data until the stream is fully read
            hash.update(chunk);
        });
        data.on('end', function () {
            // Use digest to get the hash value when reached end of stream
            checksum = hash.digest('hex');
        })
        await finished(data); //this is a Promise
        //console.log("Returned file checksum: ", checksum)
        return checksum

    })
};


class RSSController {
    async parseFeed(req, res, next) {
        // Parse feed content from RSS url
        // extract rssURL from the api call request's parameter
        const rssURL = req.query.url;
        if (!rssURL) {
            res.status(400).json("RSS URL parameter is required");
            return;
        }
        try {
            // fetch rss' xml object with all items on it
            const feed = await parser.parseURL(rssURL)
            // iterate over each item of rss feed object to extract mp3 file url, guid to use it as download file name
            const promises = feed.items.map(async item => {
                const mp3Url = item.enclosure.url
                //const guid = item.guid
                // get audio file checksum on the fly from streaming
                const checksum = await calcStreamChecksum(mp3Url)
                //const checksum = await downloadFile(guid, mp3Url)
                // Add episode info: title, mp3url, checksum of mp3 file to RSS JSON object 
                return { "title": item.title, "checksum": checksum, "url": mp3Url }
            })
            // Using promise.all() for creating result to make sure that we wait for item iteration's download(checksum calculation in the end) before returning the json object
            const result = await Promise.all(promises);
            res.status(200).json(result)
        }
        catch (e) {
            res.status(400).json("Error parsing rssURL")
            return e;
        }
    }
}

module.exports = new RSSController();
module.exports.generateChecksum = generateChecksum;
module.exports.downloadFile = downloadFile;