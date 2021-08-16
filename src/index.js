const puppeteer = require('puppeteer');
const resize = require('resize-image-buffer');
const StreamDeck = require('streamdeck-util');
const fs = require('fs');
const { login, getMentions, setTitle } = require('./functions');
const config = require('./config');

const sd = new StreamDeck();
var context = null;

(async () => {
    await new Promise((res) => {
        sd.listen({
            key: config.streamdeck.key,
            port: config.streamdeck.port,
            debug: config.streamdeck.debug
        });

        sd.on('open', res);
        sd.on('error', (err) => console.error(err));
        sd.on('message', (msg) => {
            context = msg.context;
        });
    })

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setViewport({ width: 1920, height: 1080 })

    await page.goto('https://discord.com/channels/@me');

    await login(page, async (b64) => {
        b64 = b64.split(';base64,').pop();
        b64 = await resize(Buffer.from(b64, 'base64'), { width: 500, height: 500 });

        if (fs.existsSync('./image.png')) fs.rmSync('./image.png');
        fs.writeFileSync('./image.png', b64, { encoding: 'base64' });

        require('child_process').exec('image.png')
    });

    setInterval(async () => {
        const { mentions, hasUnreads } = await getMentions(page);
        setTitle(`${mentions}\n${hasUnreads}`, context, sd);
    }, 1000)
})();
