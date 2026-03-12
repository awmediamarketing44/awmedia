require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY || "";
const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

/* ── Simple in-memory rate limiter ── */
const rateMap = new Map();
const RATE_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT = 5; // max requests per window

function checkRate(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// Clean up old entries every 5 minutes
setInterval(function () {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now - entry.start > RATE_WINDOW * 2) rateMap.delete(ip);
  }
}, 5 * 60 * 1000);

/* ── URL validation ── */
function sanitizeUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname.includes(".")) return null;
    return parsed.href;
  } catch (e) {
    return null;
  }
}

/* ── Fetch PageSpeed data ── */
async function fetchPSI(url, strategy) {
  const params = new URLSearchParams({
    url: url,
    strategy: strategy,
    category: "PERFORMANCE",
    category: "ACCESSIBILITY",
    category: "BEST_PRACTICES",
    category: "SEO",
  });

  // URLSearchParams deduplicates keys, so build manually
  const queryStr = `url=${encodeURIComponent(url)}&strategy=${strategy}` +
    `&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO` +
    (PAGESPEED_API_KEY ? `&key=${PAGESPEED_API_KEY}` : "");

  const res = await fetch(`${PSI_BASE}?${queryStr}`);

  if (!res.ok) {
    const body = await res.text();
    console.error(`PSI ${strategy} error ${res.status}:`, body.substring(0, 500));
    throw new Error(`PageSpeed API returned ${res.status} for ${strategy} analysis`);
  }

  return res.json();
}

/* ── Parse PSI response ── */
function parseScores(data) {
  const cats = data.lighthouseResult?.categories || {};
  return {
    performance: Math.round((cats.performance?.score || 0) * 100),
    accessibility: Math.round((cats.accessibility?.score || 0) * 100),
    bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
    seo: Math.round((cats.seo?.score || 0) * 100),
  };
}

function parseIssues(data) {
  const audits = data.lighthouseResult?.audits || {};
  const issues = [];
  const wins = [];

  // Key audits to check
  const auditChecks = [
    { id: "first-contentful-paint", issue: "First paint is slow — visitors may leave before seeing content" },
    { id: "largest-contentful-paint", issue: "Main content takes too long to appear" },
    { id: "cumulative-layout-shift", issue: "Page elements shift while loading — feels unstable" },
    { id: "total-blocking-time", issue: "Page is unresponsive for too long during load" },
    { id: "speed-index", issue: "Visual loading is slower than expected" },
    { id: "render-blocking-resources", issue: "Render-blocking CSS or JS is slowing down the page", win: "Remove or defer render-blocking resources" },
    { id: "unused-css-rules", issue: "Unused CSS is adding weight to the page", win: "Remove unused CSS to speed up loading" },
    { id: "unused-javascript", issue: "Unused JavaScript is slowing things down", win: "Remove unused JavaScript files" },
    { id: "uses-optimized-images", win: "Compress images to reduce page weight" },
    { id: "uses-webp-images", win: "Convert images to WebP format for faster loading" },
    { id: "uses-text-compression", win: "Enable text compression (gzip/brotli) on the server" },
    { id: "uses-responsive-images", win: "Serve properly sized images for each device" },
    { id: "meta-description", issue: "Missing or weak meta description — affects search appearance" },
    { id: "document-title", issue: "Page title is missing or could be stronger" },
    { id: "image-alt", issue: "Images are missing alt text — hurts accessibility and SEO", win: "Add descriptive alt text to all images" },
    { id: "link-name", issue: "Some links don't have descriptive text" },
    { id: "heading-order", issue: "Heading levels are skipped — affects structure and SEO" },
    { id: "viewport", issue: "Viewport meta tag is missing or incorrect" },
    { id: "tap-targets", issue: "Tap targets (buttons/links) are too small on mobile" },
    { id: "font-display", win: "Use font-display: swap to prevent invisible text during load" },
  ];

  for (const check of auditChecks) {
    const audit = audits[check.id];
    if (!audit) continue;

    // Score of null means not applicable, 1 means passing
    if (audit.score !== null && audit.score < 0.9) {
      if (check.issue && issues.length < 8) issues.push(check.issue);
      if (check.win && wins.length < 6) wins.push(check.win);
    }
  }

  return { issues, wins };
}

/* ── Generate agency-style insights ── */
function generateInsights(mobile, desktop) {
  const insights = [];

  if (mobile.performance < 50) {
    insights.push("Your mobile performance score is low. Over 70% of fitness clients browse on their phone — a slow mobile site means lost enquiries and bookings.");
  } else if (mobile.performance < 75) {
    insights.push("Your mobile performance could be stronger. A faster mobile experience means more people stay long enough to enquire or book.");
  }

  if (desktop.performance > mobile.performance + 20) {
    insights.push("There's a big gap between your desktop and mobile scores. Most of your audience is on mobile, so that's where the biggest gains are.");
  }

  if (mobile.seo < 80 || desktop.seo < 80) {
    insights.push("Your SEO foundations need tightening. When someone searches for a personal trainer or gym in your area, you need to show up — and the basics aren't in place yet.");
  }

  if (mobile.accessibility < 80) {
    insights.push("Accessibility issues can hurt your reach and search rankings. Simple fixes like adding alt text and improving contrast make your site work for everyone.");
  }

  if (mobile.bestPractices < 80) {
    insights.push("Best practice issues suggest your site may not feel as trustworthy or polished as it should. Premium fitness services need premium presentation.");
  }

  var avgPerf = (mobile.performance + desktop.performance) / 2;
  if (avgPerf < 60) {
    insights.push("Your overall performance suggests visitors may be leaving before they even see your offer. Speed is one of the easiest things to fix — and one of the most impactful.");
  }

  if (mobile.performance >= 90 && desktop.performance >= 90) {
    insights.push("Your performance scores are strong — your site loads fast on both mobile and desktop. Focus your next improvements on copy, offer clarity and conversion flow.");
  }

  if (insights.length === 0) {
    insights.push("Your scores are solid across the board. To get more leads, focus on your offer positioning, calls to action and booking flow — the things a technical audit can't measure.");
  }

  return insights;
}

/* ── API Route ── */
app.post("/api/audit", async (req, res) => {
  // Rate limit
  const ip = req.headers["x-forwarded-for"] || req.ip || "unknown";
  if (!checkRate(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a minute and try again." });
  }

  const url = sanitizeUrl(req.body.url);
  if (!url) {
    return res.status(400).json({ error: "Please enter a valid website URL." });
  }

  try {
    // Run mobile and desktop in parallel
    const [mobileData, desktopData] = await Promise.all([
      fetchPSI(url, "MOBILE"),
      fetchPSI(url, "DESKTOP"),
    ]);

    const mobile = parseScores(mobileData);
    const desktop = parseScores(desktopData);

    // Merge issues from both
    const mobileIssues = parseIssues(mobileData);
    const desktopIssues = parseIssues(desktopData);

    // Deduplicate
    const allIssues = [...new Set([...mobileIssues.issues, ...desktopIssues.issues])].slice(0, 8);
    const allWins = [...new Set([...mobileIssues.wins, ...desktopIssues.wins])].slice(0, 6);

    const agencyInsights = generateInsights(mobile, desktop);

    res.json({
      url,
      mobile,
      desktop,
      issues: allIssues,
      quickWins: allWins,
      agencyInsights,
    });
  } catch (err) {
    console.error("Audit error:", err);
    res.status(500).json({
      error: err.message || "Failed to analyse this website. Please check the URL and try again."
    });
  }
});

/* ── Start ── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
