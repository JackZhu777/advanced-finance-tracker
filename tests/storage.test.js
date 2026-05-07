import test from "node:test";
import assert from "node:assert/strict";

import {
  loadCookieConsentFromStorage,
  loadThemeFromStorage,
  loadTransactionsFromStorage,
  safeGetItem,
  safeSetItem,
  saveCookieConsentToStorage,
  saveThemeToStorage,
  saveTransactionsToStorage,
} from "../src/storage.js";

const createStorageMock = (initialValues = {}) => {
  const values = new Map(Object.entries(initialValues));
  const writes = [];

  return {
    writes,
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
      writes.push([key, value]);
    },
  };
};

test("loadTransactionsFromStorage returns parsed transaction data", () => {
  const storage = createStorageMock({
    financeTrackerData: JSON.stringify([
      {
        id: "tx_1",
        title: "Salary",
        amount: 2500,
        category: "Salary",
        date: "2026-04-30",
      },
    ]),
  });

  assert.deepEqual(loadTransactionsFromStorage(storage, "financeTrackerData"), [
    {
      id: "tx_1",
      title: "Salary",
      amount: 2500,
      category: "Salary",
      date: "2026-04-30",
    },
  ]);
});

test("loadTransactionsFromStorage falls back to an empty array for bad data", () => {
  const badJsonStorage = createStorageMock({
    financeTrackerData: "{broken-json",
  });
  const wrongShapeStorage = createStorageMock({
    financeTrackerData: JSON.stringify({ value: "not-an-array" }),
  });

  assert.deepEqual(loadTransactionsFromStorage(badJsonStorage, "financeTrackerData"), []);
  assert.deepEqual(loadTransactionsFromStorage(wrongShapeStorage, "financeTrackerData"), []);
});

test("saveTransactionsToStorage serializes transactions with the provided key", () => {
  const storage = createStorageMock();
  const transactions = [
    {
      id: "tx_2",
      title: "Groceries",
      amount: -80,
      category: "Food",
      date: "2026-04-29",
    },
  ];

  saveTransactionsToStorage(storage, "financeTrackerData", transactions);

  assert.deepEqual(storage.writes, [
    ["financeTrackerData", JSON.stringify(transactions)],
  ]);
});

test("loadThemeFromStorage returns stored theme or fallback", () => {
  const themedStorage = createStorageMock({
    financeTrackerTheme: "light",
  });
  const emptyStorage = createStorageMock();

  assert.equal(loadThemeFromStorage(themedStorage, "financeTrackerTheme", "dark"), "light");
  assert.equal(loadThemeFromStorage(emptyStorage, "financeTrackerTheme", "dark"), "dark");
});

test("saveThemeToStorage stores the selected theme value", () => {
  const storage = createStorageMock();

  saveThemeToStorage(storage, "financeTrackerTheme", "light");

  assert.deepEqual(storage.writes, [["financeTrackerTheme", "light"]]);
});

test("safeGetItem falls back to null when storage access fails", () => {
  const brokenStorage = {
    getItem() {
      throw new Error("Storage is unavailable");
    },
  };

  assert.equal(safeGetItem(brokenStorage, "financeTrackerData"), null);
});

test("safeSetItem returns false when storage writing fails", () => {
  const brokenStorage = {
    setItem() {
      throw new Error("Storage quota exceeded");
    },
  };

  assert.equal(safeSetItem(brokenStorage, "financeTrackerData", "[]"), false);
});

test("loadThemeFromStorage falls back for invalid stored theme values", () => {
  const storage = createStorageMock({
    financeTrackerTheme: "banana",
  });

  assert.equal(loadThemeFromStorage(storage, "financeTrackerTheme", "dark"), "dark");
});

test("cookie consent storage only accepts valid consent values", () => {
  const storage = createStorageMock({
    financeTrackerCookieConsent: "accepted",
  });

  assert.equal(
    loadCookieConsentFromStorage(storage, "financeTrackerCookieConsent"),
    "accepted",
  );
  assert.equal(saveCookieConsentToStorage(storage, "financeTrackerCookieConsent", "maybe"), false);
  assert.equal(saveCookieConsentToStorage(storage, "financeTrackerCookieConsent", "rejected"), true);
});