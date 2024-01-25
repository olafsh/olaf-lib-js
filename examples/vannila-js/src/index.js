document.addEventListener('DOMContentLoaded', async () => {
  const OLAFSDK = require('@olafsh/olaf-sdk-js');
  const sdk = new OLAFSDK();

  const loginForm = document.getElementById('loginForm');
  const contentDiv = document.getElementById('content');
  const greetingHeader = document.getElementById('greeting');

  const loginButton = document.getElementById('login');
  const logoutButton = document.getElementById('logout');

  await sdk.fetchConfig().catch((error) => console.log("Failed to fetch the config: ", error));
  const isAuthenticated = await sdk.isAuthenticated;

  if (!isAuthenticated) {
    greetingHeader.innerHTML = `Welcome!`;

    loginButton.addEventListener("click", async () => {
      await sdk.loginWithRedirect();
    });
  } else {
    loginForm.style.display = 'none';
    contentDiv.style.display = 'block';

    greetingHeader.innerHTML = `Welcome, ${sdk.config["account_name"]}!`;

    logoutButton.addEventListener("click", async () => {
      await sdk.logout();

      greetingHeader.innerHTML = `Welcome!`;
      loginForm.style.display = 'block';
      contentDiv.style.display = 'none';
    });
  }
});