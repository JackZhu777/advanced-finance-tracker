import { formatCurrency, formatDisplayDate } from "./formatters.js";
import { escapeHtml } from "./sanitize.js";
import {
  applyFilters,
  calculateTotals,
  groupTransactionsByMonth,
} from "./transactions.js";

const defaultI18n = {
  t(key, options = {}) {
    const values = {
      "transactions.results": `${options.count} results`,
      "transactions.empty": "No transactions yet. Add your first one to get started.",
      "transactions.addFirst": "Add First Transaction",
      "transactions.edit": "Edit",
      "transactions.delete": "Delete",
      "filters.income": "Income",
      "filters.expense": "Expense",
    };

    return values[key] || options.defaultValue || key;
  },
  locale: "en-US",
  translateCategory(category) {
    return category;
  },
};

export const renderDashboard = (dom, state, i18n = defaultI18n) => {
  renderSummary(dom, state.transactions, i18n);
  renderTransactionList(dom, state, i18n);

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => {
      renderChart(dom.financeChart, state.transactions, i18n);
    });
    return;
  }

  renderChart(dom.financeChart, state.transactions, i18n);
};

export const renderSummary = (dom, transactions, i18n = defaultI18n) => {
  const totals = calculateTotals(transactions);
  dom.totalIncome.textContent = formatCurrency(totals.income, i18n.locale);
  dom.totalExpenses.textContent = formatCurrency(totals.expenses, i18n.locale);
  dom.totalBalance.textContent = formatCurrency(totals.balance, i18n.locale);
};

export const renderTransactionList = (dom, state, i18n = defaultI18n) => {
  const filteredTransactions = applyFilters(state.transactions, state.filters);
  dom.resultsCount.textContent = i18n.t("transactions.results", {
    count: filteredTransactions.length,
  });

  if (filteredTransactions.length === 0) {
    dom.transactionsList.innerHTML = `
      <div class="transactions__empty">
        <div class="empty__icon">+</div>
        <p>${escapeHtml(i18n.t("transactions.empty"))}</p>
        <button class="btn btn--accent empty-add-btn" type="button">${escapeHtml(i18n.t("transactions.addFirst"))}</button>
      </div>
    `;
    return;
  }

  const groupedTransactions = groupTransactionsByMonth(
    filteredTransactions,
    i18n.locale,
  );

  dom.transactionsList.innerHTML = groupedTransactions
    .map(
      (group) => `
        <div class="month-group">
          <p class="month-title">${escapeHtml(group.label)}</p>
          ${group.items.map((item) => renderTransactionCard(item, i18n)).join("")}
        </div>
      `,
    )
    .join("");
};

export const renderChart = (canvas, transactions, i18n = defaultI18n) => {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  const styles = getComputedStyle(canvas);
  const chartTextColor =
    styles.getPropertyValue("--chart-text").trim() || "#f8f4e9";
  const chartGridColor =
    styles.getPropertyValue("--chart-grid").trim() || "rgba(255,255,255,0.08)";
  const devicePixelRatio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = 260;
  const totals = calculateTotals(transactions);
  const maxValue = Math.max(totals.income, totals.expenses, 1);
  const barWidth = 120;
  const gap = 80;
  const baseY = height - 40;
  const incomeHeight = (totals.income / maxValue) * (height - 80);
  const expenseHeight = (totals.expenses / maxValue) * (height - 80);

  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);

  context.strokeStyle = chartGridColor;
  context.beginPath();
  context.moveTo(40, baseY);
  context.lineTo(width - 40, baseY);
  context.stroke();

  context.fillStyle = "#22c55e";
  context.fillRect(160, baseY - incomeHeight, barWidth, incomeHeight);

  context.fillStyle = "#f97316";
  context.fillRect(
    160 + barWidth + gap,
    baseY - expenseHeight,
    barWidth,
    expenseHeight,
  );

  context.fillStyle = chartTextColor;
  context.font = "14px sans-serif";
  context.fillText(i18n.t("filters.income"), 170, baseY + 20);
  context.fillText(i18n.t("filters.expense"), 160 + barWidth + gap, baseY + 20);
  context.fillText(
    formatCurrency(totals.income, i18n.locale),
    150,
    baseY - incomeHeight - 10,
  );
  context.fillText(
    formatCurrency(totals.expenses, i18n.locale),
    150 + barWidth + gap,
    baseY - expenseHeight - 10,
  );
};

const renderTransactionCard = (transaction, i18n) => {
  const amountClass =
    transaction.amount >= 0 ? "amount--income" : "amount--expense";

  return `
    <div class="transaction">
      <div>
        <p class="transaction__title">${escapeHtml(transaction.title)}</p>
        <div class="transaction__meta">
          <span class="badge">${escapeHtml(i18n.translateCategory(transaction.category))}</span>
          <span>${escapeHtml(formatDisplayDate(transaction.date, i18n.locale))}</span>
        </div>
      </div>
      <div>
        <p class="amount ${amountClass}">${escapeHtml(formatCurrency(transaction.amount, i18n.locale))}</p>
        <button
          class="edit-btn"
          type="button"
          data-id="${escapeHtml(transaction.id)}"
          aria-label="${escapeHtml(`${i18n.t("transactions.edit")} transaction: ${transaction.title}`)}"
        >
          ${escapeHtml(i18n.t("transactions.edit"))}
        </button>
        <button
          class="delete-btn"
          type="button"
          data-id="${escapeHtml(transaction.id)}"
          aria-label="${escapeHtml(`${i18n.t("transactions.delete")} transaction: ${transaction.title}`)}"
        >
          ${escapeHtml(i18n.t("transactions.delete"))}
        </button>
      </div>
    </div>
  `;
};
