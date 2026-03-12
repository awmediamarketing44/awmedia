# AW Media — Website Audit Tool

An interactive website audit tool built for fitness coaches, personal trainers, gym owners and wellbeing brands. Users enter a website URL and get instant audit results powered by Google PageSpeed Insights.

## File Structure

```
├── public/
│   ├── index.html      → Landing page + audit UI
│   ├── styles.css      → Full styling
│   └── script.js       → Frontend logic (form, loading, results)
├── server.js           → Express API server
├── package.json        → Dependencies
├── .env.example        → Environment variable template
├── Dockerfile          → Production Docker build
├── .dockerignore       → Docker exclusions
└── README.md           → This file
```

## Local Setup

1. Clone the repo:
```bash
git clone https://github.com/awmediamarketing44/awmedia.git
cd awmedia
```

2. Install dependencies:
```bash
npm install
```

3. Create your `.env` file:
```bash
cp .env.example .env
```

4. Add your Google PageSpeed API key to `.env`:
```
PAGESPEED_API_KEY=your_key_here
```

5. Start the server:
```bash
npm start
```

6. Visit `http://localhost:3000`

## Get a PageSpeed API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select an existing one)
3. Enable the **PageSpeed Insights API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the key into your `.env` file

> The API works without a key but with strict rate limits. Add a key for reliable production use.

## Deploy on Railway

1. Push this repo to GitHub
2. Go to [railway.com](https://railway.com) → **New Project** → **Deploy from GitHub**
3. Select this repo and the `main` branch
4. Railway will detect the `Dockerfile` and build automatically
5. Add environment variables in Railway:
   - `PAGESPEED_API_KEY` — your Google PageSpeed API key
   - `PORT` is set automatically by Railway
6. Go to **Settings → Networking → Generate Domain** to get a public URL

## How It Works

1. User enters a website URL on the frontend
2. Express backend validates and sanitizes the URL
3. Backend calls Google PageSpeed Insights API twice (mobile + desktop)
4. Scores, issues and quick wins are extracted from the response
5. Custom agency-style recommendations are generated based on scores
6. Results are returned as JSON and rendered on the page

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PAGESPEED_API_KEY` | Recommended | Google PageSpeed Insights API key |
| `PORT` | No | Server port (defaults to 3000, Railway sets automatically) |

## Customisation

- **Colours**: Edit CSS variables in `public/styles.css` (`:root` block)
- **Font**: Swap the Google Fonts link in `public/index.html` and update `--font` in CSS
- **Brand name**: Search and replace "AW Media" in `public/index.html`
- **Email CTA**: Update the `mailto:` links in `public/index.html`
- **Agency insights**: Edit the `generateInsights()` function in `server.js`

## Tech Stack

- HTML, CSS, vanilla JavaScript (frontend)
- Node.js + Express (backend)
- Google PageSpeed Insights API
- Docker for deployment
