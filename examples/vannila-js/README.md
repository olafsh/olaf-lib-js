# OLAF.SH Vanilla JS Example

## Run locally

```bash
# Set your Olaf domain
$ export OLAF_DOMAIN=<your-domain>

# Generate a self-signed certificate
$ ./generate_cert.sh

# Add /etc/hosts alias for 127.0.0.1
$ ./update_hosts.sh

# Install dependencies
$ npm i

# Compile code
$ npm run compile

# In a new session, start the server
$ npm run serve

# Open a Chrome browser (on macos)
$ ./open_chrome.sh
```