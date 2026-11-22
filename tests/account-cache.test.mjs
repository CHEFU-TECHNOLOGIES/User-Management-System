import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypeScript } from "./load-typescript.mjs";

const { AccountCache } = loadTypeScript(
  new URL("../lib/account-cache.ts", import.meta.url),
);

test('unavailable IndexedDB falls back without blocking reads or invalidation', async () => {
  const { IndexedDbCache } = loadTypeScript(new URL('../lib/persistent-cache.ts', import.meta.url));
  const cache = new AccountCache(new IndexedDbCache());
  cache.activate('admin');
  let calls = 0;
  assert.equal(await cache.read('/users', async () => ++calls), 1);
  assert.equal(await cache.read('/users', async () => ++calls), 1);
  await cache.invalidate();
  assert.equal(await cache.read('/users', async () => ++calls), 2);
});
function storage() {
  const entries = new Map();
  const versions = new Map();
  const key = (account, path) => JSON.stringify([account, path]);
  return {
    entries,
    async read(account, path) {
      const id = key(account, path);
      return {
        found: entries.has(id),
        value: entries.get(id),
        version: String(versions.get(account) || 0),
      };
    },
    async write(account, path, value, version) {
      if (version === String(versions.get(account) || 0))
        entries.set(key(account, path), value);
    },
    async invalidate(account, path) {
      if (!account) {
        entries.clear();
        return;
      }
      versions.set(account, (versions.get(account) || 0) + 1);
      for (const id of entries.keys()) {
        const [owner, name] = JSON.parse(id);
        if (owner === account && (!path || name === path)) entries.delete(id);
      }
    },
  };
}

test("persistent data is available after reopening, only after identity validation", async () => {
  const disk = storage();
  const first = new AccountCache(disk);
  await assert.rejects(
    first.read("/users", async () => []),
    /Validate/,
  );
  first.activate("admin-a");
  let calls = 0;
  await first.read("/users", async () => {
    calls++;
    return "saved users";
  });
  const reopened = new AccountCache(disk);
  await assert.rejects(
    reopened.read("/users", async () => "unsafe"),
    /Validate/,
  );
  reopened.activate("admin-a");
  assert.equal(
    await reopened.read("/users", async () => {
      calls++;
      return "unexpected";
    }),
    "saved users",
  );
  assert.equal(calls, 1);
});

test("accounts cannot reuse each other’s cached data", async () => {
  const cache = new AccountCache(storage());
  cache.activate("admin-a");
  await cache.read("/users", async () => "a users");
  cache.activate("admin-b");
  assert.equal(await cache.read("/users", async () => "b users"), "b users");
  cache.activate("admin-a");
  assert.equal(await cache.read("/users", async () => "unexpected"), "a users");
});

test("logout removes persistent data for that account and prevents further reads", async () => {
  const disk = storage();
  const cache = new AccountCache(disk);
  cache.activate("admin");
  await cache.read("/audit", async () => "private audit");
  await cache.clear();
  assert.equal(disk.entries.size, 0);
  await assert.rejects(
    cache.read("/audit", async () => "unsafe"),
    /Validate/,
  );
  cache.activate("admin");
  assert.equal(
    await cache.read("/audit", async () => "fresh audit"),
    "fresh audit",
  );
});

test("refresh and mutations invalidate persistent results, not just memory", async () => {
  const disk = storage();
  const cache = new AccountCache(disk);
  cache.activate("admin");
  await cache.read("/users", async () => "old users");
  await cache.read("/audit", async () => "old audit");
  await cache.invalidate("/users");
  const reopened = new AccountCache(disk);
  reopened.activate("admin");
  assert.equal(
    await reopened.read("/users", async () => "new users"),
    "new users",
  );
  assert.equal(
    await reopened.read("/audit", async () => "unexpected"),
    "old audit",
  );
  await reopened.invalidate();
  assert.equal(disk.entries.size, 0);
});

test("data invalidated by another tab is reloaded after its memory is dropped", async () => {
  const disk = storage();
  const first = new AccountCache(disk);
  const second = new AccountCache(disk);
  first.activate("admin");
  second.activate("admin");
  await first.read("/users", async () => "old");
  assert.equal(await second.read("/users", async () => "unexpected"), "old");
  await first.invalidate();
  second.dropMemory();
  assert.equal(await second.read("/users", async () => "updated"), "updated");
});
