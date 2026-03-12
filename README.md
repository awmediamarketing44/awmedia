# AW Media — Website Audit Landing Page

A premium, static landing page for a website audit service targeting fitness coaches, personal trainers, gym owners and health/wellbeing businesses.

## File Structure

```
├── index.html        → Main landing page
├── styles.css        → All styling (CSS variables, responsive breakpoints)
├── script.js         → Mobile nav toggle + form validation
├── Dockerfile        → Production build using Caddy
├── Caddyfile         → Caddy config (port 8080, compression, security headers)
├── .dockerignore     → Files excluded from Docker build
├── railway.json      → Railway deployment config
└── README.md         → This file
```

## Run Locally

No build tools required. Just open `index.html` in a browser, or use any static file server:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve -l 8080
```

## Deploy on Railway

1. Push this repo to GitHub
2. Go to [Railway](https://railway.com) → New Project → Deploy from GitHub repo
3. Railway will detect the `Dockerfile` and build automatically
4. Caddy serves the static files on the `PORT` that Railway injects (defaults to 8080)
5. No environment variables needed — this is a static site

## Connect the Form

The form currently shows a success message on valid submission. To connect it to a real backend:

### Option A — Formspree (easiest)

1. Create a free account at [formspree.io](https://formspree.io)
2. Create a new form and copy the endpoint URL
3. In `script.js`, replace the `setTimeout` block in the submit handler with:

```javascript
fetch("https://formspree.io/f/YOUR_FORM_ID", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: fields.name.el.value,
    email: fields.email.el.value,
    business: fields.business.el.value,
    website: fields.website.el.value,
    message: document.getElementById("message").value
  })
}).then(function (res) {
  if (res.ok) {
    form.style.display = "none";
    formSuccess.classList.add("visible");
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = "Request My Free Audit";
    alert("Something went wrong. Please try again.");
  }
}).catch(function () {
  submitBtn.disabled = false;
  submitBtn.textContent = "Request My Free Audit";
  alert("Something went wrong. Please try again.");
});
```

### Option B — Custom backend

Send a `POST` request to your own API endpoint with the same JSON body above.

## Update Content

- **Copy/text**: Edit `index.html` directly — all copy is inline
- **Colours**: Change CSS variables at the top of `styles.css` (look for `:root`)
- **Font**: Swap the Google Fonts `<link>` in `index.html` and update `--font` in `styles.css`
- **Brand name**: Search and replace "AW Media" across `index.html`

## Tech Stack

- Plain HTML, CSS, vanilla JavaScript
- Google Fonts (Rethink Sans)
- Caddy web server (via Docker)
- No frameworks, no build tools, no dependencies
