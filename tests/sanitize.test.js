import test from "node:test";
import assert from "node:assert/strict";

import { escapeHtml } from "../src/sanitize.js";

test("escapeHtml converts HTML-sensitive characters into entities", () => {
  assert.equal(
    escapeHtml('<img src=x onerror="alert(1)">'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
  );
});

test("escapeHtml handles nullish values safely", () => {
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(undefined), "");
});