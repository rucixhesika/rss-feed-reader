# RSS Feed Reader
REST API Server using Express.js that:
- takes RSS URL as request parameter after episodes route 
    e.g:  http://localhost/episodes/<rss-url>
- parses content of RSS URL link using rss-parser module
- 2 options for calculating checksum of audio files:
    1. Downloads the audio file for each item asynchronously using Axios (path: /src/controllers/download), calculates and returns checksum (using crypto module)
    2. calculate checksum on the fly while streaming the file 
- Construct JSON list result
- Basic error handling in rssController using try/catch- enhance it to return different status code for different error causes, implement APIError class to detach it from controller that determines status code and return message 
- Two unit tests using jest framework- room for improvement to mock the rss server
- Improve logging

What is RSS? 
RSS is a web feed that allows users and applications to access updates to websites in a standardized, computer-readable format, commonly used subscibebale content websites.

## How to run

To start the server:
 In root directory of rss-feed-reader run: 
> npm run server

To test as client, in another terminal run eithe one of commands below:
> curl http://localhost:8008/episodes/https://feeds.acast.com/public/shows/4f74e9ff-24cd-41e5-8c9c-3d6d5b387dde
> curl http://localhost:8008/episodes/
> http://localhost:8008/episodes/kk

To run test, in root directory of rss-feed-reader:
> npm test

