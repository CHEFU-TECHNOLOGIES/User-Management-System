import assert from "node:assert/strict";
import { test } from "node:test";
import { ReadCache } from "../lib/read-cache.ts";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test("navigation reuses successful reads and concurrent consumers share one request", async () => {
  const cache = new ReadCache();
  const pending = deferred();
  let calls = 0;
  const load = () => {
    calls++;
    return pending.promise;
  };
  const first = cache.read("/users?page=1", load);
  const second = cache.read("/users?page=1", load);
  pending.resolve({ users: ["one"] });
  assert.deepEqual(await first, { users: ["one"] });
  assert.equal(await second, await first);
  assert.equal(await cache.read("/users?page=1", load), await first);
  assert.equal(calls, 1);
});

test("query parameters cache separate pages, searches, and date ranges", async () => {
  const cache = new ReadCache();
  let calls = 0;
  const paths = [
    "/users?page=1",
    "/users?page=2",
    "/users?search=alice",
    "/summary?days=7",
    "/summary?days=30",
  ];
  for (const path of [...paths, ...paths])
    await cache.read(path, async () => ++calls);
  assert.equal(calls, paths.length);
});

test("unmounting one consumer does not abort the request shared with another page", async () => {
  const cache = new ReadCache();
  const pending = deferred();
  const consumer = new AbortController();
  let requestSignal;
  let calls = 0;
  const load = (signal) => {
    calls++;
    requestSignal = signal;
    return pending.promise;
  };
  const first = cache.read("/session", load, consumer.signal);
  const second = cache.read("/session", load);
  const rejection = assert.rejects(first, { name: "AbortError" });
  consumer.abort();
  pending.resolve("account");
  await rejection;
  assert.equal(await second, "account");
  assert.equal(requestSignal.aborted, false);
  assert.equal(calls, 1);
});

test("failed reads do not automatically retry when a page remounts", async () => {
  const cache = new ReadCache();
  let calls = 0;
  const load = async () => {
    calls++;
    throw new Error("offline");
  };
  await assert.rejects(cache.read("/audit", load), /offline/);
  await assert.rejects(cache.read("/audit", load), /offline/);
  assert.equal(calls, 1);
  cache.invalidate((key) => key === "/audit");
  await assert.rejects(cache.read("/audit", load), /offline/);
  assert.equal(calls, 2, "an explicit retry performs another request");
});

test("data invalidation refreshes affected pages while preserving the session read", async () => {
  const cache = new ReadCache();
  const calls = new Map();
  const read = (key) =>
    cache.read(key, async () => {
      calls.set(key, (calls.get(key) || 0) + 1);
      return key;
    });
  for (const key of ["/session", "/users", "/audit", "/summary"])
    await read(key);
  cache.invalidate((key) => key !== "/session");
  for (const key of ["/session", "/users", "/audit", "/summary"])
    await read(key);
  assert.equal(calls.get("/session"), 1);
  assert.equal(calls.get("/users"), 2);
  assert.equal(calls.get("/audit"), 2);
  assert.equal(calls.get("/summary"), 2);
  cache.invalidate();
  await read("/session");
  assert.equal(calls.get("/session"), 2, "manual refresh rechecks the session");
});

test("an old in-flight response cannot replace data after refresh or an account change", async () => {
  const cache = new ReadCache();
  const pending = deferred();
  const old = cache.read("/users", () => pending.promise);
  await Promise.resolve();
  const rejection = assert.rejects(old, { name: "AbortError" });
  cache.invalidate();
  assert.equal(
    await cache.read("/users", async () => "new account"),
    "new account",
  );
  pending.resolve("old account");
  await rejection;
  assert.equal(
    await cache.read("/users", async () => "unexpected request"),
    "new account",
  );
});
