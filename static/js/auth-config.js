/* Public configuration for sign-in providers.
   Client IDs are public identifiers, not secrets. Replace the placeholders
   with the values from your Google Cloud and Microsoft Entra app registrations. */
window.HNG_AUTH_CONFIG = {
  googleClientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  microsoftClientId: "YOUR_MICROSOFT_APPLICATION_CLIENT_ID",
  microsoftAuthority: "https://login.microsoftonline.com/common",
  // Pin the MSAL version you have tested. Check available versions at alcdn.msauth.net.
  msalScriptUrl: "https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js"
};
