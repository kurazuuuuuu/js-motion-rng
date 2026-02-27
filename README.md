# js-motion-rng

DeviceMotionEvent data processor for browsers.

## Features

- Extracts motion payload from `DeviceMotionEvent`
- Applies logistic-map chaos transform to numeric fields
- Hashes all values with SHA-256
- Converts `null` to a stable hash token

## Install

```bash
npm install js-motion-rng
```

## Usage

```js
import { processMotionEvent } from "js-motion-rng";

window.addEventListener("devicemotion", async (event) => {
  const hashed = await processMotionEvent(event);
  console.log(hashed);
});
```

## API

### `processMotionEvent(event)`

Returns a Promise of:

- `timestamp`
- `interval`
- `acceleration`
- `accelerationIncludingGravity`
- `rotationRate`

All output values are SHA-256 hash strings.

## Test

```bash
npm test
```

## Browser Example

```bash
npm run example:serve
```

Then open the served page and grant motion permission on your device.
