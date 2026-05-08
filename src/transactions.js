export const DEFAULT_FILTERS = {
  category: "all",
  type: "all",
  search: "",
};

export const createInitialState = () => {
  return {
    transactions: [],
    filters: { ...DEFAULT_FILTERS },
    editingId: null,
    pendingDeleteId: null,
    theme: "dark",
  };
};

const DEFAULT_VALIDATION_MESSAGES = {
  titleRequired: "Title is required.",
  amountInvalid: "Enter a valid amount.",
  categoryRequired: "Select a category.",
  dateRequired: "Pick a date.",
};

export const generateTransactionId = () => {
  return `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const validateTransactionInput = (
  { title, amountValue, category, date },
  messages = DEFAULT_VALIDATION_MESSAGES,
) => {
  const errors = {};
  const trimmedTitle = title.trim();
  const trimmedAmountValue = amountValue.trim();
  const amount = Number(trimmedAmountValue);

  if (!trimmedTitle) {
    errors.title = messages.titleRequired;
  }

  if (!trimmedAmountValue || Number.isNaN(amount) || amount === 0) {
    errors.amount = messages.amountInvalid;
  }

  if (!category) {
    errors.category = messages.categoryRequired;
  }

  if (!date) {
    errors.date = messages.dateRequired;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const normalizeTransactionInput = ({
  title,
  amountValue,
  category,
  date,
}) => {
  return {
    title: title.trim(),
    amount: Number(amountValue),
    category,
    date,
  };
};

export const upsertTransaction = (
  transactions,
  transactionInput,
  editingId,
  createId = generateTransactionId,
) => {
  if (editingId) {
    return transactions.map((transaction) =>
      transaction.id === editingId
        ? { ...transaction, ...transactionInput }
        : transaction,
    );
  }

  return [
    {
      id: createId(),
      ...transactionInput,
    },
    ...transactions,
  ];
};

export const deleteTransactionById = (transactions, id) => {
  return transactions.filter((transaction) => transaction.id !== id);
};

export const parseStoredTransactions = (storedValue) => {
  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidTransaction);
  } catch {
    return [];
  }
};

export const applyFilters = (transactions, filters = DEFAULT_FILTERS) => {
  const searchQuery = filters.search.toLowerCase();

  return transactions.filter((transaction) => {
    const matchesCategory =
      filters.category === "all" || transaction.category === filters.category;
    const matchesType =
      filters.type === "all" ||
      (filters.type === "income" && transaction.amount > 0) ||
      (filters.type === "expense" && transaction.amount < 0);
    const matchesSearch = transaction.title
      .toLowerCase()
      .includes(searchQuery);

    return matchesCategory && matchesType && matchesSearch;
  });
};

export const calculateTotals = (transactions) => {
  const amounts = transactions.map((transaction) => transaction.amount);
  const income = amounts
    .filter((amount) => amount > 0)
    .reduce((sum, amount) => sum + amount, 0);
  const expenseTotal = amounts
    .filter((amount) => amount < 0)
    .reduce((sum, amount) => sum + amount, 0);

  return {
    income,
    expenses: Math.abs(expenseTotal),
    balance: income + expenseTotal,
  };
};

export const parseCalendarDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const groupTransactionsByMonth = (
  transactions,
  locale = "en-US",
) => {
  const sorted = [...transactions].sort(
    (left, right) => parseCalendarDate(right.date) - parseCalendarDate(left.date),
  );
  const groups = [];
  const lookup = new Map();

  sorted.forEach((transaction) => {
    const label = parseCalendarDate(transaction.date).toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });

    if (!lookup.has(label)) {
      const group = { label, items: [] };
      lookup.set(label, group);
      groups.push(group);
    }

    lookup.get(label).items.push(transaction);
  });

  return groups;
};

export const buildCsvContent = (transactions) => {
  const rows = [["Title", "Amount", "Category", "Date"], ...transactions.map((transaction) => [
    transaction.title,
    transaction.amount,
    transaction.category,
    transaction.date,
  ])];

  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
};

const isValidTransaction = (value) => {
  return Boolean(
    value &&
      typeof value.id === "string" &&
      typeof value.title === "string" &&
      typeof value.amount === "number" &&
      typeof value.category === "string" &&
      typeof value.date === "string",
  );
};
