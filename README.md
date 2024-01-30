# OLAF SDK for JS

## Overview

OLAF SDK for JS facilitates seamless integration of [OLAF.sh](https://olaf.sh/) into your apps,
offering features such as:

- 🗃️ secure credential storage,
- 🔐 effortless login and
  logout processes,
- 👤 and convenient access to user information, styles and permissions.

## Installation

```bash
// via npm
npm install @olafsh/olaf-sdk-js

// via yarn
yarn add @olafsh/olaf-sdk-js
```

## Initialize SDK

SDK can be imported either via CommonJS or ES Modules methods.

### CommonJS syntax

```js
const OLAFSDK = require('@olafsh/olaf-sdk-js');

const sdk = new OLAFSDK();
```

### ES Modules syntax

```js
import OLAFSDK from "@olafsh/olaf-sdk-js";

const sdk = new OLAFSDK();
```

> [!WARNING]  
> The SDK requires a browser to perform the authentication process,
> hence it **CAN NOT** be used in a NodeJS environment.

Check [examples/](https://github.com/olafsh/olaf-sdk-js/tree/main/examples) directory for more usages.

## Usage

```js
// Fetch configuration for your app from olaf.sh platform
await sdk.fetchConfig()

// Perform a login
await sdk.loginWithRedirect();

// Handle login callback from olaf.sh platform
// HINT: It's usually the best to done this on a different route
await sdk.handleRedirectCallback()

// Check current authentication status
console.log(await sdk.isAuthenticated);

// Perform a logout
await sdk.logout();
```

## Development

All source code is located in `/src`.
The source code is compiled via `npm run build` command to `/lib` directory.

```bash
# Clone project
git clone git@github.com:olafsh/olaf-sdk-js.git

# Compile changes
npm run build
    
# Run test
npm run test
```
