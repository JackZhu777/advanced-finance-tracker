import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_FILTERS } from "../src/transactions.js";
import {
  renderChart,
  renderDashboard,
  renderSummary,
  renderTransactionList,
} from "../src/render.js";

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
      locale: "en-GB",
      t(key, options = {}) {
        const values = {
          "transactions.results": `${options.count} rendered`,
          "transactions.edit": "Modify",
          "transactions.delete": "Remove",
        };

        return values[key] || key;
      },
      translateCategory(category) {
        return category === "Salary" ? "Wages" : category;
      },
    },
  );

  assert.equal(dom.resultsCount.textContent, "2 rendered");
  assert.match(dom.transactionsList.innerHTML, /15 Apr 2026/);
  assert.match(dom.transactionsList.innerHTML, /Wages/);
  assert.match(dom.transactionsList.innerHTML, /Modify/);
});

test("renderTransactionList escapes user-controlled transaction fields", () => {
  const dom = {
    resultsCount: { textContent: "" },
    transactionsList: { innerHTML: "" },
  };

  renderTransactionList(dom, {
    transactions: [
      {
        id: 'tx_"><script>alert(1)</script>',
        title: '<img src=x onerror="alert(1)">',
        amount: 100,
        category: "<script>alert(2)</script>",
        date: "2026-04-15",
      },
    ],
    filters: { ...DEFAULT_FILTERS },
  });

  assert.match(
    dom.transactionsList.innerHTML,
    /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/,
  );
  assert.match(
    dom.transactionsList.innerHTML,
    /&lt;script&gt;alert\(2\)&lt;\/script&gt;/,
  );
  assert.doesNotMatch(dom.transactionsList.innerHTML, /<img src=x/);
  assert.doesNotMatch(dom.transactionsList.innerHTML, /<script>alert/);
});

test("renderDashboard passes i18n through summary list and chart rendering", () => {
  const { canvas, context } = createCanvasMock();
  const restoreGlobals = mockChartGlobals({
    chartText: "#123456",
    chartGrid: "#abcdef",
  });
  const dom = {
    totalIncome: { textContent: "" },
    totalExpenses: { textContent: "" },
    totalBalance: { textContent: "" },
    resultsCount: { textContent: "" },
    transactionsList: { innerHTML: "" },
    financeChart: canvas,
  };
  const i18n = {
    locale: "en-GB",
    t(key, options = {}) {
      const values = {
        "transactions.results": `${options.count} translated results`,
        "transactions.edit": "Modify",
        "transactions.delete": "Remove",
        "filters.income": "Money In",
        "filters.expense": "Money Out",
      };

      return values[key] || key;
    },
    translateCategory(category) {
      return category === "Salary" ? "Wages" : category;
    },
  };

  try {
    renderDashboard(
      dom,
      {
        transactions,
        filters: { ...DEFAULT_FILTERS },
      },
      i18n,
    );
  } finally {
    restoreGlobals();
  }

  assert.equal(dom.totalIncome.textContent, "US$3,200.00");
  assert.equal(dom.resultsCount.textContent, "2 translated results");
  assert.match(dom.transactionsList.innerHTML, /Wages/);
  assert.match(dom.transactionsList.innerHTML, /Modify/);
  assert.ok(context.fillTextCalls.some(([text]) => text === "Money In"));
  assert.ok(context.fillTextCalls.some(([text]) => text === "Money Out"));
});

test("renderDashboard uses requestAnimationFrame when available", () => {
  const { canvas, context } = createCanvasMock();
  const restoreGlobals = mockChartGlobals({
    chartText: "#123456",
    chartGrid: "#abcdef",
    requestAnimationFrame(callback) {
      callback();
    },
  });
  const dom = {
    totalIncome: { textContent: "" },
    totalExpenses: { textContent: "" },
    totalBalance: { textContent: "" },
    resultsCount: { textContent: "" },
    transactionsList: { innerHTML: "" },
    financeChart: canvas,
  };

  try {
    renderDashboard(
      dom,
      {
        transactions,
        filters: { ...DEFAULT_FILTERS },
      },
    );
  } finally {
    restoreGlobals();
  }

  assert.ok(context.fillTextCalls.some(([text]) => text === "Income"));
  assert.ok(context.fillTextCalls.some(([text]) => text === "Expense"));
});

test("renderChart uses theme colors and localized chart labels", () => {
  const { canvas, context } = createCanvasMock();
  const restoreGlobals = mockChartGlobals({
    chartText: "#102030",
    chartGrid: "#405060",
  });

  try {
    renderChart(canvas, transactions, {
      locale: "en-GB",
      t(key) {
        const values = {
          "filters.income": "Money In",
          "filters.expense": "Money Out",
        };

        return values[key] || key;
      },
      translateCategory(category) {
        return category;
      },
    });
  } finally {
    restoreGlobals();
  }

  assert.equal(context.strokeStyleValues.at(-1), "#405060");
  assert.ok(context.fillStyleValues.includes("#102030"));
  assert.ok(context.fillTextCalls.some(([text]) => text === "Money In"));
  assert.ok(context.fillTextCalls.some(([text]) => text === "Money Out"));
  assert.ok(context.fillTextCalls.some(([text]) => text === "US$3,200.00"));
});

const createCanvasMock = () => {
  const context = {
    fillTextCalls: [],
    fillStyleValues: [],
    strokeStyleValues: [],
    beginPath() {},
    clearRect() {},
    fillRect() {},
    lineTo() {},
    moveTo() {},
    setTransform() {},
    stroke() {},
    fillText(...args) {
      this.fillTextCalls.push(args);
    },
    set fillStyle(value) {
      this.fillStyleValues.push(value);
    },
    get fillStyle() {
      return this.fillStyleValues.at(-1);
    },
    set strokeStyle(value) {
      this.strokeStyleValues.push(value);
    },
    get strokeStyle() {
      return this.strokeStyleValues.at(-1);
    },
    set font(value) {
      this.fontValue = value;
    },
    get font() {
      return this.fontValue;
    },
  };

  return {
    canvas: {
      clientWidth: 800,
      getContext(type) {
        assert.equal(type, "2d");
        return context;
      },
    },
    context,
  };
};

const mockChartGlobals = ({
  chartText,
  chartGrid,
  requestAnimationFrame,
}) => {
  const originalWindow = globalThis.window;
  const originalGetComputedStyle = globalThis.getComputedStyle;
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;

  globalThis.window = {
    ...originalWindow,
    devicePixelRatio: 2,
  };
  globalThis.getComputedStyle = () => ({
    getPropertyValue(property) {
      const values = {
        "--chart-text": chartText,
        "--chart-grid": chartGrid,
      };

      return values[property] || "";
    },
  });
  globalThis.requestAnimationFrame = requestAnimationFrame;

  return () => {
    globalThis.window = originalWindow;
    globalThis.getComputedStyle = originalGetComputedStyle;
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  };
};
