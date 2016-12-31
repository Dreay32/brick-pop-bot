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
    const old = document.getElementById('hack-inject');
    if (old) old.remove();
    const script = document.createElement('script');
    script.src = 'https://mylocal.facebook.com/inject?rand=' + Math.random();
    script.setAttribute('id', 'hack-inject');
    script.dataset.hack = true;
    document.body.appendChild(script);
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
