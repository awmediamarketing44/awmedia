/* ══════════════════════════════════════
   AW Media — Website Audit Landing Page
   ══════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Mobile Navigation ── */
  var toggle = document.getElementById("mobileToggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      var isOpen = nav.classList.contains("open");
      toggle.setAttribute("aria-expanded", isOpen);
    });

    // Close mobile nav when a link is clicked
    var navLinks = nav.querySelectorAll("a");
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    }
  }

  /* ── Form Validation ── */
  var form = document.getElementById("auditForm");
  var formSuccess = document.getElementById("formSuccess");
  var submitBtn = document.getElementById("submitBtn");

  if (!form) return;

  var fields = {
    name: {
      el: document.getElementById("name"),
      error: document.getElementById("nameError"),
      validate: function (val) {
        if (!val.trim()) return "Please enter your name.";
        if (val.trim().length < 2) return "Name must be at least 2 characters.";
        return "";
      }
    },
    email: {
      el: document.getElementById("email"),
      error: document.getElementById("emailError"),
      validate: function (val) {
        if (!val.trim()) return "Please enter your email address.";
        // Simple email pattern
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return "Please enter a valid email address.";
        return "";
      }
    },
    business: {
      el: document.getElementById("business"),
      error: document.getElementById("businessError"),
      validate: function (val) {
        if (!val.trim()) return "Please enter your business name.";
        return "";
      }
    },
    website: {
      el: document.getElementById("website"),
      error: document.getElementById("websiteError"),
      validate: function (val) {
        if (!val.trim()) return "Please enter your website URL.";
        // Must look like a URL
        if (!/^https?:\/\/.+\..+/.test(val.trim())) return "Please enter a valid URL starting with http:// or https://";
        return "";
      }
    }
  };

  // Validate a single field and show/clear error
  function validateField(key) {
    var field = fields[key];
    var msg = field.validate(field.el.value);
    field.error.textContent = msg;
    if (msg) {
      field.el.classList.add("error");
    } else {
      field.el.classList.remove("error");
    }
    return !msg;
  }

  // Add blur validation to each field
  var fieldKeys = Object.keys(fields);
  for (var i = 0; i < fieldKeys.length; i++) {
    (function (key) {
      fields[key].el.addEventListener("blur", function () {
        validateField(key);
      });
      // Clear error on input
      fields[key].el.addEventListener("input", function () {
        if (fields[key].el.classList.contains("error")) {
          validateField(key);
        }
      });
    })(fieldKeys[i]);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var allValid = true;
    for (var i = 0; i < fieldKeys.length; i++) {
      var valid = validateField(fieldKeys[i]);
      if (!valid) allValid = false;
    }

    if (!allValid) {
      // Focus the first invalid field
      for (var j = 0; j < fieldKeys.length; j++) {
        if (fields[fieldKeys[j]].el.classList.contains("error")) {
          fields[fieldKeys[j]].el.focus();
          break;
        }
      }
      return;
    }

    // Form is valid — show success
    // In production, replace this block with a fetch() call to Formspree or your backend
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    // Simulate a short delay then show success
    setTimeout(function () {
      form.style.display = "none";
      formSuccess.classList.add("visible");
    }, 600);
  });
})();
