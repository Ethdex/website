[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

### Local Dev Setup

Requires Node version 6.9.5 or higher.

Add the following to your `/etc/hosts` file:

```
127.0.0.1 ethdex.dev
```

Clone the [contracts repo](https://github.com/ethdex/contracts) into the same parent directory as this project.

Install [yarn](https://yarnpkg.com/lang/en/docs/install/) in order to install the project dependencies more deterministically.

Install dependencies:

```
yarn
```

Import smart contract artifacts from `contracts` repo:

```
yarn run update_contracts
```

Start dev server:

```
yarn run dev
```

Visit [ethdex.dev:3572](http://ethdex.dev:3572) in your browser.
