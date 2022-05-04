const rssController = require('./rssController')

test('Testing generateChecksum', () => {
    expect(rssController.generateChecksum('rssController.js')).toBe('90a0b4b11ca4bab06ee22b07b7433128')
});

test('Testing downloadFile', () => {
    rssController.downloadFile('db3db70d-38b2-48dd-9f60-b6c41802de8e', 'https://sphinx.acast.com/lyckojagarna/3.sex-pizzabikini-stjartvarm-alarm-tordhardochhentaimedkallenorwald/media.mp3').then(data => {
        expect(data).toBe('013dabbd6d9207180d4462b7df4bdd76');
    });

});