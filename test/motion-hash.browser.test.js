import { describe, expect, it } from "vitest";
import {
  generateMotionRandomNumber,
  generateMotionRandomNumberNormalized,
  processMotionEvent,
  processMotionEventWithRandom
} from "../src/index.js";

function createMockEvent(overrides = {}) {
  return {
    timeStamp: 123.456,
    interval: 16.667,
    acceleration: { x: 0.1, y: 0.2, z: 0.3 },
    accelerationIncludingGravity: { x: 9.8, y: 0.0, z: 0.1 },
    rotationRate: { alpha: 1.1, beta: 2.2, gamma: 3.3 },
    ...overrides
  };
}

describe("processMotionEvent", () => {
  it("returns hashed object with expected top-level keys", async () => {
    const result = await processMotionEvent(createMockEvent());

    expect(Object.keys(result)).toEqual([
      "timestamp",
      "interval",
      "acceleration",
      "accelerationIncludingGravity",
      "rotationRate"
    ]);
  });

  it("is deterministic for identical input", async () => {
    const event = createMockEvent();

    const first = await processMotionEvent(event);
    const second = await processMotionEvent(event);

    expect(first).toEqual(second);
  });

  it("hashes null values into stable string hashes", async () => {
    const result = await processMotionEvent(
      createMockEvent({
        acceleration: { x: null, y: null, z: null },
        accelerationIncludingGravity: null,
        rotationRate: null
      })
    );

    expect(typeof result.acceleration.x).toBe("string");
    expect(result.acceleration.x).toBe(result.accelerationIncludingGravity);
    expect(result.accelerationIncludingGravity).toBe(result.rotationRate);
  });

  it("changes hash when numeric input changes", async () => {
    const base = await processMotionEvent(createMockEvent({ acceleration: { x: 0.1, y: 0.2, z: 0.3 } }));
    const changed = await processMotionEvent(createMockEvent({ acceleration: { x: 0.1001, y: 0.2, z: 0.3 } }));

    expect(base.acceleration.x).not.toBe(changed.acceleration.x);
  });

  it("throws on invalid event input", async () => {
    await expect(processMotionEvent(undefined)).rejects.toThrow("Invalid motion event");
    await expect(processMotionEvent(null)).rejects.toThrow("Invalid motion event");
    await expect(processMotionEvent(42)).rejects.toThrow("Invalid motion event");
  });
});

describe("generateMotionRandomNumber", () => {
  it("returns a single bigint random number", async () => {
    const randomNumber = await generateMotionRandomNumber(createMockEvent());

    expect(typeof randomNumber).toBe("bigint");
    expect(randomNumber >= 0n).toBe(true);
  });

  it("is deterministic for identical input", async () => {
    const event = createMockEvent();

    const first = await generateMotionRandomNumber(event);
    const second = await generateMotionRandomNumber(event);

    expect(first).toBe(second);
  });

  it("changes when timestamp hash source changes", async () => {
    const base = await generateMotionRandomNumber(createMockEvent({ timeStamp: 100.0 }));
    const changed = await generateMotionRandomNumber(createMockEvent({ timeStamp: 100.0001 }));

    expect(base).not.toBe(changed);
  });
});

describe("generateMotionRandomNumberNormalized", () => {
  it("returns a normalized number in [0, 1)", async () => {
    const randomNumber = await generateMotionRandomNumberNormalized(createMockEvent());

    expect(typeof randomNumber).toBe("number");
    expect(Number.isFinite(randomNumber)).toBe(true);
    expect(randomNumber).toBeGreaterThanOrEqual(0);
    expect(randomNumber).toBeLessThan(1);
  });
});

describe("processMotionEventWithRandom", () => {
  it("returns hashedData, bigint randomNumber and normalized randomNumber in one response", async () => {
    const result = await processMotionEventWithRandom(createMockEvent());

    expect(typeof result.randomNumber).toBe("bigint");
    expect(typeof result.randomNumberNormalized).toBe("number");
    expect(result.hashedData).toHaveProperty("timestamp");
    expect(result.hashedData).toHaveProperty("rotationRate");
  });
});
