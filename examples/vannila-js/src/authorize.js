document.addEventListener('DOMContentLoaded', async () => {
  const OLAFSDK = require('@olafsh/olaf-sdk-js');
  const sdk = new OLAFSDK();

  const isAuthenticated = await sdk
    .handleRedirectCallback()
    .catch(error => `Error occurred while handling callback: ${error}`);
  window.location.href = '/';
});
