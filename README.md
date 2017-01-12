# Hacking Facebook's Brick Pop Game

A bot for auto-solving Facebook Messenger's Brick Pop game.

As of right now the focus is on solving the board and not on getting the best score.
High score comes from its ability to brute force endlessly

*Tested in latest Chrome on OSX*

![brick-pop-bot.gif](https://raw.githubusercontent.com/smirea/brick-pop-bot/master/brick-pop-bot.gif)

## Setup:

Due to content-src policy on messenger.com, we need to do some DNS magic:

```bash
# Edit hosts file to redirect mylocal.facebook.com --> localhost
echo '127.0.0.1 mylocal.facebook.com' | sudo tee -a /etc/hosts
```

## Run Server

```bash
# Build latest
npm run build   # alternatively: npm run watch

# But in order for it to work with messenger, it needs port 80:
sudo PORT=80 npm run start
```

## Run Bot

After opening a Brick Pop game in a messenger window, open the console and paste to inject the bot:
Make sure to paste this in the `index.html` context (the iframe context)

```js
(() => {
    console.clear();
    Array.from(document.querySelectorAll('[data-bot-inject]')).forEach(elem => elem.remove());

    const script = document.createElement('script');
    script.src = 'https://mylocal.facebook.com/inject.bundle.js?rand=' + Math.random();
    script.dataset.botInject = true;
    document.body.appendChild(script);

    fetch('https://mylocal.facebook.com/styles.bundle.css?rand=' + Math.random())
    .then(res => res.text())
    .then(text => {
        const style = document.createElement('style');
        document.body.appendChild(style);
        style.dataset.botInject = true;
        style.innerHTML = text;
    })
    .catch(ex => console.warn('[BOT] Could not load styles', ex.stack || ex));
})();
```

## Development

```bash
npm run watch
```
