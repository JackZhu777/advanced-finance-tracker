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

test("renderTransactionList supports translated labels and locale dates", () => {
  const dom = {
    resultsCount: { textContent: "" },
    transactionsList: { innerHTML: "" },
  };

  renderTransactionList(
    dom,
    {
      transactions,
      filters: { ...DEFAULT_FILTERS },
    },
    {
      locale: "zh-CN",
      t(key, options = {}) {
        const values = {
          "transactions.results": `${options.count} 条结果`,
          "transactions.edit": "编辑",
          "transactions.delete": "删除",
        };

        return values[key] || key;
      },
      translateCategory(category) {
        return category === "Salary" ? "工资" : category;
      },
    },
  );

  assert.equal(dom.resultsCount.textContent, "2 条结果");
  assert.match(dom.transactionsList.innerHTML, /2026年4月/);
  assert.match(dom.transactionsList.innerHTML, /工资/);
  assert.match(dom.transactionsList.innerHTML, /编辑/);
});
