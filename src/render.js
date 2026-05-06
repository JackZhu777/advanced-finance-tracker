import { formatCurrency, formatDisplayDate } from "./formatters.js";
import { escapeHtml } from "./sanitize.js";
import {
  applyFilters,
  calculateTotals,
  groupTransactionsByMonth,
} from "./transactions.js";

export const renderDashboard = (dom, state) => {
  renderSummary(dom, state.transactions);
  renderTransactionList(dom, state);
  renderChart(dom.financeChart, state.transactions);
};

export const renderSummary = (dom, transactions) => {
  const totals = calculateTotals(transactions);
  dom.totalIncome.textContent = formatCurrency(totals.income);
  dom.totalExpenses.textContent = formatCurrency(totals.expenses);
  dom.totalBalance.textContent = formatCurrency(totals.balance);
};

export const renderTransactionList = (dom, state) => {
  const filteredTransactions = applyFilters(state.transactions, state.filters);
  dom.resultsCount.textContent = `${filteredTransactions.length} results`;

  if (filteredTransactions.length === 0) {
    dom.transactionsList.innerHTML = `
      <div class="transactions__empty">
        <div class="empty__icon">+</div>
        <p>No transactions yet. Add your first one to get started.</p>
        <button class="btn btn--accent empty-add-btn" type="button">Add First Transaction</button>
      </div>
    `;
    return;
  }

  const groupedTransactions = groupTransactionsByMonth(filteredTransactions);

  dom.transactionsList.innerHTML = groupedTransactions
  .map(
    (group) => `
      <div class="month-group">
        <p class="month-title">${escapeHtml(group.label)}</p>
        ${group.items.map(renderTransactionCard).join("")}
      </div>
    `,
  )
  .join("");
};

export const renderChart = (canvas, transactions) => {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
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

  context.strokeStyle = "rgba(255,255,255,0.08)";
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

  context.fillStyle = "#f8f4e9";
  context.font = "14px sans-serif";
  context.fillText("Income", 170, baseY + 20);
  context.fillText("Expense", 160 + barWidth + gap, baseY + 20);
  context.fillText(formatCurrency(totals.income), 150, baseY - incomeHeight - 10);
  context.fillText(
    formatCurrency(totals.expenses),
    150 + barWidth + gap,
    baseY - expenseHeight - 10,
  );
};

const renderTransactionCard = (transaction) => {
  const amountClass =
    transaction.amount >= 0 ? "amount--income" : "amount--expense";

  return `
    <div class="transaction">
      <div>
        <p class="transaction__title">${escapeHtml(transaction.title)}</p>
        <div class="transaction__meta">
          <span class="badge">${escapeHtml(transaction.category)}</span>
          <span>${escapeHtml(formatDisplayDate(transaction.date))}</span>
        </div>
      </div>
      <div>
        <p class="amount ${amountClass}">${escapeHtml(formatCurrency(transaction.amount))}</p>
        <button class="edit-btn" data-id="${escapeHtml(transaction.id)}">Edit</button>
        <button class="delete-btn" data-id="${escapeHtml(transaction.id)}">Delete</button>
      </div>
    </div>
  `;
};
