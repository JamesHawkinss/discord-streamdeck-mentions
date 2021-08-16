const puppeteer = require('puppeteer');
const resize = require('resize-image-buffer');
const StreamDeck = require('streamdeck-util');
const fs = require('fs');

const sd = new StreamDeck();
const config = require('./config');

const { login, getMentions } = require('./functions');

(async () => {
    await new Promise((res) => {
        sd.listen({
            key: config.streamdeck.key,
            port: config.streamdeck.port,
            debug: config.streamdeck.debug
        });

        sd.on('open', res);
    })

    const browser = await puppeteer.launch({ headless: false });
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
        const m = await getMentions(page);

        sd.send({
            event: 'setTitle',
            context: config.streamdeck.context,
            payload: {
                title: `${m.mentions} mentions\n${m.hasUnreads}`
            }
        })
    }, 1000)
})();
