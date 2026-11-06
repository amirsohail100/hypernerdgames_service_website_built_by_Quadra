// Login and signup logic for pages/login.html and pages/signup.html.
// Uses the Firebase Auth web SDK (modular, loaded from gstatic).
// The page sets <body data-mode="login"> or <body data-mode="signup">.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const AFTER_LOGIN = "home.html";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mode = document.body.dataset.mode === "signup" ? "signup" : "login";

const form = document.getElementById("auth-form");
const statusEl = document.getElementById("auth-status");
const submitBtn = document.getElementById("auth-submit");
const googleBtn = document.getElementById("google-btn");
const microsoftBtn = document.getElementById("ms-btn");
const controls = [submitBtn, googleBtn, microsoftBtn];

const isConfigured = !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_");

const FIREBASE_MESSAGES = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password is too weak. Use at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/popup-blocked": "The sign-in popup was blocked. Allow popups for this site and try again.",
  "auth/account-exists-with-different-credential": "This email is already registered with another sign-in method. Use that method instead.",
  "auth/operation-not-allowed": "This sign-in method is not enabled in the Firebase console.",
  "auth/unauthorized-domain": "This domain is not authorized. Add it under Firebase Authentication > Settings > Authorized domains."
};

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
  controls.forEach((el) => { el.disabled = busy; });
  submitBtn.textContent = busy
    ? "Please wait…"
    : (mode === "signup" ? "Create account" : "Login");
}

function friendlyError(err) {
  const code = err && err.code ? err.code : "";
  return FIREBASE_MESSAGES[code] || (err && err.message) || "Something went wrong. Please try again.";
}

function goHome() {
  window.location.href = AFTER_LOGIN;
}

if (!isConfigured) {
  showStatus("Firebase is not configured yet. Add your values to static/js/firebase-config.js.");
  controls.forEach((el) => { el.disabled = true; });
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // A user who is already signed in does not need this page.
  onAuthStateChanged(auth, (user) => {
    if (user && !form.dataset.submitting) goHome();
  });

  // Email and password
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();

    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const name = String(data.get("name") || "").trim();
    const remember = data.get("remember") === "on";

    if (!EMAIL_RE.test(email)) return showStatus("Please enter a valid email address.");

    if (mode === "signup") {
      if (name.length < 2) return showStatus("Please enter your name.");
      if (password.length < 8) return showStatus("Password must be at least 8 characters.");
      if (password !== String(data.get("confirm") || "")) return showStatus("Passwords do not match.");
    } else if (!password) {
      return showStatus("Please enter your password.");
    }

    form.dataset.submitting = "1";
    setBusy(true);
    try {
      // Signup always keeps the user signed in; login follows the "Remember me" checkbox.
      await setPersistence(auth, remember || mode === "signup" ? browserLocalPersistence : browserSessionPersistence);

      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      goHome();
    } catch (err) {
      delete form.dataset.submitting;
      showStatus(friendlyError(err));
      setBusy(false);
    }
  });

  // Social sign-in with popup
  async function socialSignIn(provider) {
    clearStatus();
    form.dataset.submitting = "1";
    setBusy(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
      goHome();
    } catch (err) {
      delete form.dataset.submitting;
      showStatus(friendlyError(err));
      setBusy(false);
    }
  }

  googleBtn.addEventListener("click", () => {
    // Gmail accounts sign in through this same Google provider.
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    socialSignIn(provider);
  });

  microsoftBtn.addEventListener("click", () => {
    const provider = new OAuthProvider("microsoft.com");
    provider.setCustomParameters({ prompt: "select_account" });
    socialSignIn(provider);
  });
}
