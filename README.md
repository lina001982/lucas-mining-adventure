# Lucas Mining Adventure

A cute pixel-style browser mining game for Lucas.

**Author:** Lucas Gao from Ottawa, Canada

## Files

This folder is a ready-to-upload static website:

- `index.html` - the GitHub Pages entry file
- `style.css` - visual style and layout
- `game.js` - game logic

There is currently no `assets` folder because the web version draws everything with HTML, CSS, and Canvas.

## How to Open Locally

Open `index.html` directly in a browser.

On Windows, you can double-click:

```text
web_miner/index.html
```

The game saves progress in the browser with `localStorage`, so each browser keeps its own save data.

## Best GitHub Pages Setup

Recommended simple setup:

1. Create a new GitHub repository.
2. Upload the files **inside** this `web_miner` folder to the repository root:
   - `index.html`
   - `style.css`
   - `game.js`
   - `README.md`
3. In GitHub, open the repository.
4. Go to **Settings**.
5. Go to **Pages**.
6. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
7. Choose branch **main** and folder **/(root)**.
8. Click **Save**.

After GitHub finishes deploying, the game URL will usually look like:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/
```

For example:

```text
https://lucasgao.github.io/lucas-mining-adventure/
```

## Alternative Setup

You can also keep the `web_miner` folder inside a larger repository, but GitHub Pages branch publishing only supports the repository root or a `/docs` folder.

If you want to keep a larger project structure, the easier options are:

- Rename `web_miner` to `docs`, then set GitHub Pages to branch `main` and folder `/docs`.
- Or copy the contents of `web_miner` into the repository root.

## How to Upload Files on GitHub

1. Open GitHub and sign in.
2. Click **New repository**.
3. Name it something like:

```text
lucas-mining-adventure
```

4. Keep it **Public** if you want friends to open it easily.
5. Click **Create repository**.
6. Click **uploading an existing file**.
7. Drag in the files from `web_miner`.
8. Click **Commit changes**.

## How to Find the Final Website URL

After enabling GitHub Pages:

1. Go to the repository **Settings**.
2. Open **Pages**.
3. Wait for GitHub to show a message saying the site is live.
4. Click **Visit site**.

If it does not appear immediately, wait a few minutes and refresh.

## How to Bind a Custom Domain Later

1. Buy or prepare a domain name.
2. In the repository, go to **Settings > Pages**.
3. Find **Custom domain**.
4. Enter your domain, for example:

```text
lucasmining.com
```

5. Save it.
6. In your domain provider's DNS settings, point the domain to GitHub Pages.
7. After DNS is ready, enable **Enforce HTTPS** in GitHub Pages.

GitHub may create a `CNAME` file in the Pages source folder when you set a custom domain.

## Notes

- This is a static website, so no server or database is required.
- The original Python pygame version is not changed by this web deployment setup.
- The browser version uses `localStorage`, so saves stay on the same device and browser.
