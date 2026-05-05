import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_FILTERS,
  applyFilters,
  buildCsvContent,
  calculateTotals,
  deleteTransactionById,
  groupTransactionsByMonth,
  normalizeTransactionInput,
  parseStoredTransactions,
  upsertTransaction,
  validateTransactionInput,
} from "../src/transactions.js";

const transactions = [
  {
    id: "tx_1",
    title: "Salary",
    amount: 3200,
    category: "Salary",
    date: "2026-04-15",
  },
  {
    id: "tx_2",
    title: "Rent",
    amount: -1200,
    category: "Housing",
    date: "2026-04-01",
  },
  {
    id: "tx_3",
    title: "Dinner",
    amount: -40,
    category: "Food",
    date: "2026-03-28",
  },
];

test("validateTransactionInput returns errors for invalid form data", () => {
  const result = validateTransactionInput({
    title: " ",
    amountValue: "0",
    category: "",
    date: "",
  });

  assert.equal(result.isValid, false);
  assert.deepEqual(result.errors, {
    title: "Title is required.",
    amount: "Enter a valid amount.",
    category: "Select a category.",
    date: "Pick a date.",
  });
});

test("normalizeTransactionInput trims text and converts amount", () => {
  assert.deepEqual(
    normalizeTransactionInput({
      title: " Freelance ",
      amountValue: "250",
      category: "Business",
      date: "2026-04-30",
    }),
    {
      title: "Freelance",
      amount: 250,
      category: "Business",
      date: "2026-04-30",
    },
  );
});

test("upsertTransaction prepends a new transaction when not editing", () => {
  const result = upsertTransaction(
    transactions,
    {
      title: "Bonus",
      amount: 500,
      category: "Salary",
      date: "2026-04-20",
    },
    null,
    () => "tx_new",
  );

  assert.equal(result[0].id, "tx_new");
  assert.equal(result.length, 4);
});

test("upsertTransaction updates an existing transaction when editing", () => {
  const result = upsertTransaction(
    transactions,
    {
      title: "Updated Rent",
      amount: -1300,
      category: "Housing",
      date: "2026-04-01",
    },
    "tx_2",
  );

  assert.equal(result[1].title, "Updated Rent");
  assert.equal(result[1].amount, -1300);
});

test("deleteTransactionById removes the matching transaction", () => {
  const result = deleteTransactionById(transactions, "tx_2");
  assert.equal(result.length, 2);
  assert.equal(result.find((item) => item.id === "tx_2"), undefined);
});

test("applyFilters combines category type and search filters", () => {
  const result = applyFilters(transactions, {
    ...DEFAULT_FILTERS,
    category: "Food",
    type: "expense",
    search: "din",
  });

  assert.deepEqual(result, [transactions[2]]);
});

test("calculateTotals returns balance income and expenses", () => {
  assert.deepEqual(calculateTotals(transactions), {
    income: 3200,
    expenses: 1240,
    balance: 1960,
  });
});

test("groupTransactionsByMonth sorts by local calendar month", () => {
  const groups = groupTransactionsByMonth(transactions);

  assert.equal(groups[0].label, "April 2026");
  assert.deepEqual(
    groups[0].items.map((item) => item.id),
    ["tx_1", "tx_2"],
  );
});

test("parseStoredTransactions ignores corrupted and invalid storage payloads", () => {
  assert.deepEqual(parseStoredTransactions("not-json"), []);
  assert.deepEqual(parseStoredTransactions('{"bad":true}'), []);
  assert.deepEqual(
    parseStoredTransactions(JSON.stringify([transactions[0], { foo: "bar" }])),
    [transactions[0]],
  );
});

test("buildCsvContent escapes quotes in exported fields", () => {
  const csv = buildCsvContent([
    {
      id: "tx_4",
      title: 'Client "A"',
      amount: 100,
      category: "Business",
      date: "2026-04-30",
    },
  ]);

  assert.match(csv, /"Client ""A"""/);
});
