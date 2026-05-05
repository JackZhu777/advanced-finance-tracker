import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_FILTERS } from "../src/transactions.js";
import { renderSummary, renderTransactionList } from "../src/render.js";

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
];

test("renderSummary writes formatted totals into the summary DOM nodes", () => {
  const dom = {
    totalIncome: { textContent: "" },
    totalExpenses: { textContent: "" },
    totalBalance: { textContent: "" },
  };

  renderSummary(dom, transactions);

  assert.equal(dom.totalIncome.textContent, "$3,200.00");
  assert.equal(dom.totalExpenses.textContent, "$1,200.00");
  assert.equal(dom.totalBalance.textContent, "$2,000.00");
});

test("renderTransactionList shows empty state when there are no matching transactions", () => {
  const dom = {
    resultsCount: { textContent: "" },
    transactionsList: { innerHTML: "" },
  };

  renderTransactionList(dom, {
    transactions,
    filters: {
      ...DEFAULT_FILTERS,
      search: "non-existent",
    },
  });

  assert.equal(dom.resultsCount.textContent, "0 results");
  assert.match(dom.transactionsList.innerHTML, /No transactions yet/);
});

test("renderTransactionList renders grouped transaction markup for matches", () => {
  const dom = {
    resultsCount: { textContent: "" },
    transactionsList: { innerHTML: "" },
  };

  renderTransactionList(dom, {
    transactions,
    filters: { ...DEFAULT_FILTERS },
  });

  assert.equal(dom.resultsCount.textContent, "2 results");
  assert.match(dom.transactionsList.innerHTML, /April 2026/);
  assert.match(dom.transactionsList.innerHTML, /Salary/);
  assert.match(dom.transactionsList.innerHTML, /Rent/);
});
