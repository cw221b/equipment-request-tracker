import assert from "node:assert/strict";
import test from "node:test";

import {
  RequestValidationError,
  STORAGE_KEY,
  appendRequest,
  createRequest,
  effectivePriority,
  selectRequests,
  loadRequests,
  saveRequests,
} from "../src/request-store.js";

const validInput = {
  requester: "  Jordan Lee  ",
  department: "Operations",
  equipment: "  Laptop  ",
  neededBy: "2026-09-15",
  reason: "  Replace a failed field computer.  ",
};

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

test("createRequest trims input and adds system fields", () => {
  const request = createRequest(validInput, {
    id: "request-1",
    now: new Date("2026-08-17T12:00:00.000Z"),
  });

  assert.deepEqual(request, {
    id: "request-1",
    requester: "Jordan Lee",
    department: "Operations",
    equipment: "Laptop",
    priority: "Normal",
    neededBy: "2026-09-15",
    reason: "Replace a failed field computer.",
    createdAt: "2026-08-17T12:00:00.000Z",
  });
});

test("createRequest reports missing required fields", () => {
  assert.throws(
    () => createRequest({ ...validInput, requester: "", equipment: " " }),
    (error) => {
      assert.ok(error instanceof RequestValidationError);
      assert.deepEqual(Object.keys(error.errors), ["requester", "equipment"]);
      return true;
    },
  );
});

test("appendRequest returns a new list with the newest request first", () => {
  const original = [{ id: "old" }];
  const result = appendRequest(original, { id: "new" });

  assert.deepEqual(result.map((request) => request.id), ["new", "old"]);
  assert.deepEqual(original.map((request) => request.id), ["old"]);
});

test("saveRequests and loadRequests round-trip valid records", () => {
  const storage = new MemoryStorage();
  const request = createRequest(validInput, {
    id: "request-2",
    now: new Date("2026-08-17T12:00:00.000Z"),
  });

  saveRequests([request], storage);

  assert.deepEqual(loadRequests(storage), [request]);
});

test("loadRequests safely handles damaged stored data", () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, "not-json");

  assert.deepEqual(loadRequests(storage), []);
});

test("createRequest preserves each allowed priority", () => {
  for (const priority of ["Low", "Normal", "High"]) {
    const request = createRequest({ ...validInput, priority });
    assert.equal(request.priority, priority);
  }
});

test("createRequest rejects invalid priorities", () => {
  for (const priority of ["Urgent", "", "high", 1]) {
    assert.throws(
      () => createRequest({ ...validInput, priority }),
      (error) => error instanceof RequestValidationError &&
        error.errors.priority === "Select Low, Normal, or High priority.",
    );
  }
});

test("saveRequests and loadRequests preserve every priority", () => {
  const storage = new MemoryStorage();
  const requests = ["Low", "Normal", "High"].map((priority) =>
    createRequest({ ...validInput, priority }),
  );
  saveRequests(requests, storage);
  assert.deepEqual(loadRequests(storage), requests);
});

test("existing requests without priority remain readable after saving new requests", () => {
  const storage = new MemoryStorage();
  const legacy = createRequest(validInput, { id: "legacy" });
  delete legacy.priority;
  saveRequests([legacy], storage);
  assert.deepEqual(loadRequests(storage), [legacy]);

  const added = createRequest({ ...validInput, priority: "High" }, { id: "new" });
  saveRequests(appendRequest(loadRequests(storage), added), storage);
  assert.deepEqual(loadRequests(storage), [added, legacy]);
});

const viewRecords = [
  { id: "low", priority: "Low", createdAt: "2026-10-04T12:00:00Z" },
  { id: "high-old", priority: "High", createdAt: "2026-10-01T12:00:00Z" },
  { id: "normal", priority: "Normal", createdAt: "2026-10-03T12:00:00Z" },
  { id: "legacy", createdAt: "2026-10-02T12:00:00Z" },
  { id: "high-new", priority: "High", createdAt: "2026-10-05T12:00:00Z" },
  { id: "high-tie", priority: "High", createdAt: "2026-10-05T12:00:00Z" },
];
const ids = (records) => records.map((record) => record.id);

test("default view shows all records newest first with stable ties", () => {
  assert.deepEqual(ids(selectRequests(viewRecords)), [
    "high-new", "high-tie", "low", "normal", "legacy", "high-old",
  ]);
});

test("each filter works independently and treats missing priority as Low", () => {
  assert.equal(effectivePriority(viewRecords[3]), "Low");
  assert.deepEqual(ids(selectRequests(viewRecords, "Low")), ["low", "legacy"]);
  assert.deepEqual(ids(selectRequests(viewRecords, "Normal")), ["normal"]);
  assert.deepEqual(ids(selectRequests(viewRecords, "High")), ["high-new", "high-tie", "high-old"]);
});

test("priority sorting works alone, with stable ties and newest first within groups", () => {
  assert.deepEqual(ids(selectRequests(viewRecords, "All", "priority")), [
    "high-new", "high-tie", "high-old", "normal", "low", "legacy",
  ]);
});

test("filter and sort work together and return an empty list for no matches", () => {
  assert.deepEqual(ids(selectRequests(viewRecords, "High", "priority")), [
    "high-new", "high-tie", "high-old",
  ]);
  assert.deepEqual(selectRequests([viewRecords[0]], "High", "priority"), []);
  assert.deepEqual(selectRequests([], "All", "priority"), []);
});

test("view operations never mutate records, stored data, or stored order", () => {
  const storage = new MemoryStorage();
  const records = viewRecords.map((record) => ({
    ...createRequest(validInput, { id: record.id }), ...record,
  }));
  delete records[3].priority;
  saveRequests(records, storage);
  const before = storage.getItem(STORAGE_KEY);
  const loaded = loadRequests(storage);
  const snapshot = structuredClone(loaded);
  loaded.forEach(Object.freeze);
  Object.freeze(loaded);
  for (const priority of ["All", "Low", "Normal", "High"]) {
    for (const sort of ["newest", "priority"]) selectRequests(loaded, priority, sort);
  }
  assert.deepEqual(loaded, snapshot);
  assert.equal(storage.getItem(STORAGE_KEY), before);
  assert.deepEqual(loadRequests(storage), snapshot);
});
