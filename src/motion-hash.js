const NULL_TOKEN = "__NULL__";
const CHAOS_R = 3.99;
const CHAOS_ITERATIONS = 32;

let nullHashPromise = null;

function safeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function pickXYZ(source) {
  if (!source) {
    return null;
  }

  return {
    x: safeNumber(source.x),
    y: safeNumber(source.y),
    z: safeNumber(source.z)
  };
}

function pickRotation(source) {
  if (!source) {
    return null;
  }

  return {
    alpha: safeNumber(source.alpha),
    beta: safeNumber(source.beta),
    gamma: safeNumber(source.gamma)
  };
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashText(text) {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(digest);
}

async function hashText512(text) {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-512", encoded);
  return toHex(digest);
}

function getNullHash() {
  if (!nullHashPromise) {
    nullHashPromise = hashText(NULL_TOKEN);
  }
  return nullHashPromise;
}

function chaoticTransform(value) {
  let x = Math.abs(Math.sin(value * 12.9898 + 78.233)) % 1;
  if (x <= 0 || x >= 1) {
    x = 0.5;
  }

  for (let i = 0; i < CHAOS_ITERATIONS; i += 1) {
    x = CHAOS_R * x * (1 - x);
  }

  return x;
}

async function hashValue(value) {
  if (value === null) {
    return getNullHash();
  }

  if (typeof value === "object") {
    const hashedObject = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      hashedObject[key] = await hashValue(nestedValue);
    }
    return hashedObject;
  }

  if (typeof value === "number") {
    const chaoticValue = chaoticTransform(value);
    return hashText(chaoticValue.toFixed(16));
  }

  return hashText(String(value));
}

function extractRawMotionData(event) {
  return {
    timestamp: safeNumber(event.timeStamp),
    interval: safeNumber(event.interval),
    acceleration: pickXYZ(event.acceleration),
    accelerationIncludingGravity: pickXYZ(event.accelerationIncludingGravity),
    rotationRate: pickRotation(event.rotationRate)
  };
}

function collectHashLeaves(value, path = "", output = []) {
  if (typeof value === "string") {
    output.push([path, value]);
    return output;
  }

  if (!value || typeof value !== "object") {
    return output;
  }

  const keys = Object.keys(value).sort();
  for (const key of keys) {
    const nextPath = path ? `${path}.${key}` : key;
    collectHashLeaves(value[key], nextPath, output);
  }

  return output;
}

async function combineHashesToRandomBigInt(hashedData) {
  const leaves = collectHashLeaves(hashedData);

  if (leaves.length === 0) {
    throw new TypeError("Invalid hashed motion data");
  }

  const material = leaves.map(([path, hash]) => `${path}:${hash}`).join("|");
  const combinedHash = await hashText512(material);
  return BigInt(`0x${combinedHash}`);
}

function toNormalizedRandomNumber(randomBigInt) {
  const maxInt = 1n << 53n;
  const randomInt = randomBigInt % maxInt;
  return Number(randomInt) / Number(maxInt);
}

export async function processMotionEvent(event) {
  if (!event || typeof event !== "object") {
    throw new TypeError("Invalid motion event");
  }

  const rawData = extractRawMotionData(event);
  return hashValue(rawData);
}

export async function generateMotionRandomNumber(event) {
  const hashedData = await processMotionEvent(event);
  return combineHashesToRandomBigInt(hashedData);
}

export async function generateMotionRandomNumberNormalized(event) {
  const randomBigInt = await generateMotionRandomNumber(event);
  return toNormalizedRandomNumber(randomBigInt);
}

export async function processMotionEventWithRandom(event) {
  const hashedData = await processMotionEvent(event);
  const randomNumber = await combineHashesToRandomBigInt(hashedData);
  const randomNumberNormalized = toNormalizedRandomNumber(randomNumber);

  return {
    hashedData,
    randomNumber,
    randomNumberNormalized
  };
}
