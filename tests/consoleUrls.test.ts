import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import {
  getOppositeConsoleLoginUrl,
  oppositeEnvironmentLabel,
} from "../src/lib/consoleUrls";

const originalLive = process.env.NEXT_PUBLIC_LIVE_CONSOLE_URL;
const originalSandbox = process.env.NEXT_PUBLIC_SANDBOX_CONSOLE_URL;

describe("consoleUrls", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_LIVE_CONSOLE_URL;
    delete process.env.NEXT_PUBLIC_SANDBOX_CONSOLE_URL;
  });

  afterEach(() => {
    if (originalLive === undefined) delete process.env.NEXT_PUBLIC_LIVE_CONSOLE_URL;
    else process.env.NEXT_PUBLIC_LIVE_CONSOLE_URL = originalLive;
    if (originalSandbox === undefined) delete process.env.NEXT_PUBLIC_SANDBOX_CONSOLE_URL;
    else process.env.NEXT_PUBLIC_SANDBOX_CONSOLE_URL = originalSandbox;
  });

  it("sandbox deploy builds live login URL from NEXT_PUBLIC_LIVE_CONSOLE_URL", () => {
    process.env.NEXT_PUBLIC_LIVE_CONSOLE_URL = "https://console.example.com/";
    assert.equal(
      getOppositeConsoleLoginUrl("sandbox"),
      "https://console.example.com/login",
    );
    assert.equal(oppositeEnvironmentLabel("sandbox"), "Live");
  });

  it("live deploy builds sandbox login URL from NEXT_PUBLIC_SANDBOX_CONSOLE_URL", () => {
    process.env.NEXT_PUBLIC_SANDBOX_CONSOLE_URL = "https://sandbox-console.example.com";
    assert.equal(
      getOppositeConsoleLoginUrl("live"),
      "https://sandbox-console.example.com/login",
    );
    assert.equal(oppositeEnvironmentLabel("live"), "Sandbox");
  });

  it("returns empty when opposite URL is unset", () => {
    assert.equal(getOppositeConsoleLoginUrl("sandbox"), "");
    assert.equal(getOppositeConsoleLoginUrl("live"), "");
  });
});
