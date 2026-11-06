/* Shared logic for pages/login.html and pages/signup.html.
   The page sets <body data-mode="login"> or <body data-mode="signup">. */
(function () {
  "use strict";

  var cfg = window.HNG_AUTH_CONFIG || {};
  var mode = document.body.getAttribute("data-mode") === "signup" ? "signup" : "login";
  var form = document.getElementById("auth-form");
  var statusEl = document.getElementById("auth-status");
  var submitBtn = document.getElementById("auth-submit");
  var msalApp = null;
  var AFTER_LOGIN = "home.html";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isConfigured(value) {
    return !!value && value.indexOf("YOUR_") !== 0;
  }

  function showStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.className = "auth-status " + (kind || "error");
    statusEl.hidden = false;
  }

  function clearStatus() {
    statusEl.hidden = true;
    statusEl.textContent = "";
  }

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? "Please wait…" : (mode === "signup" ? "Create account" : "Login");
  }

  function errorFrom(data, status) {
    if (data && typeof data.detail === "string") return data.detail;
    if (data && Array.isArray(data.detail) && data.detail.length) {
      return data.detail.map(function (item) { return item.msg; }).join(" ");
    }
    return "Something went wrong (" + status + "). Please try again.";
  }

  function post(path, body) {
    return fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (!res.ok) throw new Error(errorFrom(data, res.status));
        return data;
      });
    });
  }

  function goHome() {
    window.location.href = AFTER_LOGIN;
  }

  function socialSignIn(path, body) {
    showStatus("Signing you in…", "info");
    return post(path, body).then(goHome).catch(function (err) {
      showStatus(err.message);
    });
  }

  /* Email and password form */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearStatus();

    var data = new FormData(form);
    var email = String(data.get("email") || "").trim();
    var password = String(data.get("password") || "");
    var name = String(data.get("name") || "").trim();

    if (!EMAIL_RE.test(email)) {
      showStatus("Please enter a valid email address.");
      return;
    }
    if (mode === "signup") {
      if (name.length < 2) return showStatus("Please enter your name.");
      if (password.length < 8) return showStatus("Password must be at least 8 characters.");
      if (password !== String(data.get("confirm") || "")) return showStatus("Passwords do not match.");
    } else if (!password) {
      showStatus("Please enter your password.");
      return;
    }

    setBusy(true);
    var request = mode === "signup"
      ? post("/api/auth/signup", { name: name, email: email, password: password })
      : post("/api/auth/login", {
          email: email,
          password: password,
          remember: data.get("remember") === "on"
        });

    request.then(goHome).catch(function (err) {
      showStatus(err.message);
      setBusy(false);
    });
  });

  /* Google (also covers Gmail accounts) */
  function initGoogle(attempt) {
    var slot = document.getElementById("google-btn");
    if (!isConfigured(cfg.googleClientId)) {
      slot.innerHTML = '<button type="button" class="auth-btn social" disabled>Google sign-in not configured</button>';
      return;
    }
    if (!(window.google && google.accounts && google.accounts.id)) {
      if (attempt < 40) {
        setTimeout(function () { initGoogle(attempt + 1); }, 250);
      } else {
        slot.innerHTML = '<p class="auth-note">Google sign-in could not be loaded.</p>';
      }
      return;
    }
    google.accounts.id.initialize({
      client_id: cfg.googleClientId,
      callback: function (response) {
        socialSignIn("/api/auth/google", { id_token: response.credential });
      }
    });
    google.accounts.id.renderButton(slot, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: mode === "signup" ? "signup_with" : "continue_with",
      width: Math.max(200, Math.min(slot.clientWidth || 320, 400))
    });
  }

  /* Microsoft (MSAL popup flow) */
  function loadMsal() {
    if (window.msal) return Promise.resolve(window.msal);
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = cfg.msalScriptUrl;
      script.onload = function () { resolve(window.msal); };
      script.onerror = function () { reject(new Error("Could not load Microsoft sign-in.")); };
      document.head.appendChild(script);
    });
  }

  function microsoftSignIn() {
    clearStatus();
    if (!isConfigured(cfg.microsoftClientId)) {
      showStatus("Microsoft sign-in is not configured yet.");
      return;
    }
    loadMsal().then(function (msal) {
      if (!msalApp) {
        msalApp = new msal.PublicClientApplication({
          auth: {
            clientId: cfg.microsoftClientId,
            authority: cfg.microsoftAuthority,
            redirectUri: window.location.origin + "/pages/login.html"
          },
          cache: { cacheLocation: "sessionStorage" }
        });
      }
      return msalApp.loginPopup({ scopes: ["openid", "profile", "email"] });
    }).then(function (result) {
      return socialSignIn("/api/auth/microsoft", { id_token: result.idToken });
    }).catch(function (err) {
      showStatus(err.message || "Microsoft sign-in failed.");
    });
  }

  document.getElementById("ms-btn").addEventListener("click", microsoftSignIn);
  initGoogle(0);
})();
