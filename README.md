# confined

my biolink, live at [confined.wtf](https://confined.wtf)

- now playing from last.fm / spotify, with the music video in the background
- synced lyrics (lrclib) and listen along
- live discord status for both my accounts (lanyard)
- my time vs yours, views, ping

react + vite + tailwind. some components are from [obsidianui](https://www.obsidianui.dev).

## running it

```sh
npm install
cp .env.example .env   # add your last.fm key
npm run dev
```

everything personal (accounts, text, skills, projects) is in `src/config.ts`.
