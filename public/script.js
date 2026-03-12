/* ══════════════════════════════════════
   AW Media — Website Audit Tool
   ══════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Mobile Navigation ── */
  var toggle = document.getElementById("mobileToggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    });

    var links = nav.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    }
  }

  /* ── Audit Form ── */
  var form = document.getElementById("auditForm");
  var urlInput = document.getElementById("urlInput");
  var auditBtn = document.getElementById("auditBtn");
  var errorEl = document.getElementById("auditError");
  var loadingEl = document.getElementById("loadingState");
  var resultsEl = document.getElementById("results");

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    runAudit();
  });

  function normalizeUrl(raw) {
    var url = raw.trim();
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    return url;
  }

  function isValidUrl(str) {
    try {
      var u = new URL(str);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  /* ── Score Color ── */
  function scoreClass(val) {
    if (val >= 90) return "score-good";
    if (val >= 50) return "score-ok";
    return "score-bad";
  }

  function scoreColor(val) {
    if (val >= 90) return "#28c840";
    if (val >= 50) return "#febc2e";
    return "#ff5c7a";
  }

  function scoreLabel(val) {
    if (val >= 90) return "Excellent";
    if (val >= 70) return "Good";
    if (val >= 50) return "Needs work";
    return "Poor";
  }

  /* ── Loading Steps ── */
  var stepEls = [
    document.getElementById("step1"),
    document.getElementById("step2"),
    document.getElementById("step3"),
    document.getElementById("step4")
  ];

  function setLoadingStep(index) {
    for (var i = 0; i < stepEls.length; i++) {
      stepEls[i].className = "loading-step";
      if (i < index) stepEls[i].className = "loading-step done";
      if (i === index) stepEls[i].className = "loading-step active";
    }
  }

  /* ── Escape HTML ── */
  function esc(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ── Ring SVG ── */
  function ringHTML(score) {
    var r = 58;
    var c = 2 * Math.PI * r;
    var offset = c - (score / 100) * c;
    var color = scoreColor(score);

    return '<svg viewBox="0 0 140 140">' +
      '<circle class="ring-bg" cx="70" cy="70" r="' + r + '"/>' +
      '<circle class="ring-fill" cx="70" cy="70" r="' + r + '" ' +
      'stroke="' + color + '" ' +
      'stroke-dasharray="' + c + '" ' +
      'stroke-dashoffset="' + offset + '"/>' +
      '</svg>' +
      '<div class="ring-text ' + scoreClass(score) + '">' + score + '</div>';
  }

  /* ── Device Rows ── */
  function deviceRows(data) {
    var rows = [
      { label: "Performance", key: "performance" },
      { label: "Accessibility", key: "accessibility" },
      { label: "Best Practices", key: "bestPractices" },
      { label: "SEO", key: "seo" }
    ];
    var html = "";
    for (var i = 0; i < rows.length; i++) {
      var val = data[rows[i].key];
      html += '<div class="device-score-row">' +
        '<span class="device-score-label">' + rows[i].label + '</span>' +
        '<span class="device-score-value ' + scoreClass(val) + '">' + val + '</span>' +
        '</div>';
    }
    return html;
  }

  /* ── List Items ── */
  function listItems(arr) {
    if (!arr || !arr.length) return '<li>None found — looking good.</li>';
    var html = "";
    for (var i = 0; i < arr.length; i++) {
      html += '<li>' + esc(arr[i]) + '</li>';
    }
    return html;
  }

  /* ── Agency Insights ── */
  function agencyItems(arr) {
    if (!arr || !arr.length) return "";
    var html = "";
    var icon = '<svg class="agency-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>';
    for (var i = 0; i < arr.length; i++) {
      html += '<li>' + icon + '<span>' + esc(arr[i]) + '</span></li>';
    }
    return html;
  }

  /* ── Render Results ── */
  function renderResults(data) {
    var overall = Math.round((data.mobile.performance + data.desktop.performance) / 2);
    var avgAccess = Math.round((data.mobile.accessibility + data.desktop.accessibility) / 2);
    var avgBP = Math.round((data.mobile.bestPractices + data.desktop.bestPractices) / 2);
    var avgSEO = Math.round((data.mobile.seo + data.desktop.seo) / 2);

    var html = '';

    // Header
    html += '<div class="results-header">' +
      '<h2>Your Audit Results</h2>' +
      '<p>Results for <span class="results-url">' + esc(data.url) + '</span></p>' +
      '</div>';

    // Overall Score Ring
    html += '<div class="overall-score-card">' +
      '<div class="overall-label">Overall Performance</div>' +
      '<div class="overall-ring">' + ringHTML(overall) + '</div>' +
      '<div class="overall-verdict ' + scoreClass(overall) + '">' + scoreLabel(overall) + '</div>' +
      '</div>';

    // 5 Score Cards
    html += '<div class="scores-grid">' +
      scoreCardHTML("Mobile Perf", data.mobile.performance) +
      scoreCardHTML("Desktop Perf", data.desktop.performance) +
      scoreCardHTML("Accessibility", avgAccess) +
      scoreCardHTML("Best Practices", avgBP) +
      scoreCardHTML("SEO", avgSEO) +
      '</div>';

    // Mobile vs Desktop
    html += '<div class="device-grid">' +
      '<div class="device-card">' +
      '<h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg> Mobile</h3>' +
      deviceRows(data.mobile) +
      '</div>' +
      '<div class="device-card">' +
      '<h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg> Desktop</h3>' +
      deviceRows(data.desktop) +
      '</div>' +
      '</div>';

    // Issues & Quick Wins
    html += '<div class="insights-grid">' +
      '<div class="insight-card issues">' +
      '<h3>Key Issues <span class="tag tag--red">Needs Attention</span></h3>' +
      '<ul class="insight-list">' + listItems(data.issues) + '</ul>' +
      '</div>' +
      '<div class="insight-card wins">' +
      '<h3>Quick Wins <span class="tag tag--green">Easy Fixes</span></h3>' +
      '<ul class="insight-list">' + listItems(data.quickWins) + '</ul>' +
      '</div>' +
      '</div>';

    // Agency Insights
    if (data.agencyInsights && data.agencyInsights.length) {
      html += '<div class="agency-insights">' +
        '<h3>What This Means for Your Fitness Business</h3>' +
        '<ul class="agency-list">' + agencyItems(data.agencyInsights) + '</ul>' +
        '</div>';
    }

    // CTA
    html += '<div class="results-cta">' +
      '<h3>Want us to fix this for you?</h3>' +
      '<p>This free audit covers the basics. A full expert review goes deeper into your copy, offer, booking flow, trust signals and conversion strategy — built specifically for fitness businesses.</p>' +
      '<a href="mailto:hello@awmedia.co.uk?subject=Full%20Audit%20Request%20-%20' + encodeURIComponent(data.url) + '" class="btn btn--lg">Book a Full Audit</a>' +
      '</div>';

    resultsEl.innerHTML = html;
  }

  function scoreCardHTML(label, val) {
    return '<div class="score-card">' +
      '<span class="score-card-label">' + esc(label) + '</span>' +
      '<div class="score-card-value ' + scoreClass(val) + '">' + val + '</div>' +
      '<span class="score-card-context">' + scoreLabel(val) + '</span>' +
      '</div>';
  }

  /* ── Run Audit ── */
  function runAudit() {
    var url = normalizeUrl(urlInput.value);
    errorEl.textContent = "";

    if (!url || !isValidUrl(url)) {
      errorEl.textContent = "Please enter a valid website URL (e.g. https://yoursite.com)";
      return;
    }

    // Reset UI
    auditBtn.disabled = true;
    auditBtn.textContent = "Running...";
    resultsEl.style.display = "none";
    resultsEl.innerHTML = "";
    loadingEl.style.display = "block";
    setLoadingStep(0);

    // Simulate loading steps for UX
    var stepTimers = [];
    stepTimers.push(setTimeout(function () { setLoadingStep(1); }, 2000));
    stepTimers.push(setTimeout(function () { setLoadingStep(2); }, 6000));
    stepTimers.push(setTimeout(function () { setLoadingStep(3); }, 12000));

    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url })
    })
    .then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || "Audit failed.");
        return data;
      });
    })
    .then(function (data) {
      // Clear step timers
      for (var i = 0; i < stepTimers.length; i++) clearTimeout(stepTimers[i]);

      // Show all steps complete
      for (var j = 0; j < stepEls.length; j++) stepEls[j].className = "loading-step done";

      setTimeout(function () {
        loadingEl.style.display = "none";
        resultsEl.style.display = "block";
        renderResults(data);
        resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    })
    .catch(function (err) {
      for (var i = 0; i < stepTimers.length; i++) clearTimeout(stepTimers[i]);
      loadingEl.style.display = "none";
      errorEl.textContent = err.message || "Something went wrong. Please try again.";
    })
    .finally(function () {
      auditBtn.disabled = false;
      auditBtn.textContent = "Run Free Audit";
    });
  }

})();
