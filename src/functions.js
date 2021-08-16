async function login(page, callback) {
    let res;
    const p = new Promise((r) => res = r);

    await page.waitForSelector('div[class*="qrCode-"] > img');

    page.browser().on('targetchanged', (e) => {
        let t = e.url();
        if (t === 'https://discord.com/channels/@me') res();
    });

    const b64 = await page.evaluate(() => {
        return document.querySelector('div[class*="qrCode-"] > img').src;
    });

    callback(b64);

    await p;
    await page.waitForSelector('div[class*="unreadMentionsIndicatorTop"]');
}

async function getMentions(page) {
    return page.evaluate(() => {
        let mentions = 0;
        let hasUnreads = false;

        document.querySelectorAll('div[class*="lowerBadge-"] > div[class*="numberBadge-"]').forEach((i) => {
            mentions += parseInt(i.innerText);
        });

        Array.from(document.querySelectorAll('div[class*="pill"] > span'))
            .forEach((e) => { if (e.style.height == '8px') hasUnreads = true })

        return {
            mentions,
            hasUnreads
        };
    });
}

function setTitle(title, context, sd) {
    sd.send({
        event: 'setTitle',
        context: context,
        payload: {
            title: title
        }
    })
}

module.exports = { login, getMentions, setTitle }