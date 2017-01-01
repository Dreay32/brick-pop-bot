# Hacking Facebook's Brick Pop Game

## Setup:

Due to content-src policy on messenger.com, we need to do some DNS magic:

```bash
# Redirect local.messenger.com -> localhost
echo '127.0.0.1 mylocal.facebook.com' | sudo tee -a /file.txt
```

After opening a Brick Pop game in a messenger window, open the console and paste:

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

## Run

```bash
# You can run this locally on any port to play with the as-is version
npm run start

# But in order for it to work with messenger, it needs port 80:
sudo PORT=80 npm run start

# Alternative, development version:
npm run start-dev
```
