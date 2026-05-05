import test from "node:test";
import assert from "node:assert/strict";

import { formatCurrency, formatDisplayDate } from "../src/formatters.js";

test("formatCurrency formats numbers as USD by default", () => {
  assert.equal(formatCurrency(1234.5), "$1,234.50");
});

test("formatCurrency supports custom locale and currency", () => {
  assert.equal(formatCurrency(1234.5, "en-GB", "GBP"), "£1,234.50");
});

test("formatDisplayDate formats a calendar date without timezone drift", () => {
  assert.equal(formatDisplayDate("2026-05-04"), "May 4, 2026");
});
