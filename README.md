# Hacking Facebook's Brick Pop Game

## Setup:

Due to content-src policy on messenger.com, we need to do some DNS magic:

```bash
# Redirect local.messenger.com -> localhost
echo '127.0.0.1 local.messenger.com' | sudo tee -a /file.txt
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
