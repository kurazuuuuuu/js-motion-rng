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
import { processMotionEventWithRandom } from "js-motion-rng";

window.addEventListener("devicemotion", async (event) => {
  const { randomNumber, randomNumberNormalized, hashedData } = await processMotionEventWithRandom(event);
  console.log(randomNumber.toString()); // BigInt
  console.log(randomNumberNormalized); // number in [0, 1)
  console.log(hashedData);
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

### `generateMotionRandomNumber(event)`

Uses all hashes generated from the motion payload (including timestamp-derived hash),
combines them, and returns one `BigInt` random number.

### `generateMotionRandomNumberNormalized(event)`

Returns a normalized `number` in `[0, 1)` derived from the `BigInt` random number.

### `processMotionEventWithRandom(event)`

Returns both values in one call:

- `hashedData`
- `randomNumber` (`BigInt`)
- `randomNumberNormalized` (`number`, `[0, 1)`)

## Test

```bash
npm test
```

## Browser Example

```bash
npm run example:serve
```

Then open the served page and grant motion permission on your device.
