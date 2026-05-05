import test from "node:test";
import assert from "node:assert/strict";

import {
  applyFieldErrors,
  clearFieldErrors,
  createToast,
} from "../src/feedback.js";

const createElementMock = () => {
  const classes = new Set();

  return {
    textContent: "",
    classList: {
      add(value) {
        classes.add(value);
      },
      remove(value) {
        classes.delete(value);
      },
      contains(value) {
        return classes.has(value);
      },
    },
    removeCalled: false,
    remove() {
      this.removeCalled = true;
    },
  };
};

test("clearFieldErrors removes invalid styling and clears messages", () => {
  const input = createElementMock();
  const error = createElementMock();

  input.classList.add("is-invalid");
  error.textContent = "Bad value";

  clearFieldErrors([[input, error]]);

  assert.equal(input.classList.contains("is-invalid"), false);
  assert.equal(error.textContent, "");
});

test("applyFieldErrors only applies messages for failing fields", () => {
  const titleInput = createElementMock();
  const titleError = createElementMock();
  const amountInput = createElementMock();
  const amountError = createElementMock();

  applyFieldErrors(
    {
      title: [titleInput, titleError],
      amount: [amountInput, amountError],
    },
    {
      title: "Title is required.",
    },
  );

  assert.equal(titleInput.classList.contains("is-invalid"), true);
  assert.equal(titleError.textContent, "Title is required.");
  assert.equal(amountInput.classList.contains("is-invalid"), false);
  assert.equal(amountError.textContent, "");
});

test("createToast appends a toast and schedules removal", async (t) => {
  const appended = [];
  const createdToast = createElementMock();

  const originalDocument = global.document;
  const originalSetTimeout = global.setTimeout;

  global.document = {
    createElement() {
      return createdToast;
    },
  };

  global.setTimeout = (callback) => {
    callback();
    return 1;
  };

  t.after(() => {
    global.document = originalDocument;
    global.setTimeout = originalSetTimeout;
  });

  const container = {
    appendChild(node) {
      appended.push(node);
    },
  };

  createToast(container, "Saved successfully", "error");

  assert.equal(appended.length, 1);
  assert.equal(appended[0], createdToast);
  assert.equal(createdToast.textContent, "Saved successfully");
  assert.equal(createdToast.className, "toast toast--error");
  assert.equal(createdToast.removeCalled, true);
});
