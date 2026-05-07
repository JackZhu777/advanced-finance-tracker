import {
  applyFieldErrors,
  clearFieldErrors,
  createToast,
} from "./feedback.js";
import {
  changeLanguage,
  getCurrentLocale,
  getNextLanguage,
  initializeI18n,
  t,
  translateCategory,
  translatePage,
} from "./i18n.js";
import { renderDashboard } from "./render.js";
import {
  loadThemeFromStorage,
  loadTransactionsFromStorage,
  saveThemeToStorage,
  saveTransactionsToStorage,
} from "./storage.js";
import {
  DEFAULT_FILTERS,
  buildCsvContent,
  createInitialState,
  deleteTransactionById,
  normalizeTransactionInput,
  upsertTransaction,
  validateTransactionInput,
} from "./transactions.js";

const STORAGE_KEY = "financeTrackerData";
const THEME_KEY = "financeTrackerTheme";

const state = createInitialState();

export const initializeApp = async () => {
  await initializeI18n(window.localStorage);

  const dom = getDomReferences();
  hydrateState(dom);
  refreshUi(dom);
  attachEventHandlers(dom);

  setTimeout(() => {
    dom.skeleton.classList.add("is-hidden");
  }, 300);
};

const getDomReferences = () => {
  return {
    form: document.getElementById("transactionForm"),
    titleInput: document.getElementById("titleInput"),
    amountInput: document.getElementById("amountInput"),
    categoryInput: document.getElementById("categoryInput"),
    dateInput: document.getElementById("dateInput"),
    titleError: document.getElementById("titleError"),
    amountError: document.getElementById("amountError"),
    categoryError: document.getElementById("categoryError"),
    dateError: document.getElementById("dateError"),
    submitBtn: document.getElementById("submitBtn"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    filterCategory: document.getElementById("filterCategory"),
    filterType: document.getElementById("filterType"),
    searchInput: document.getElementById("searchInput"),
    resetFiltersBtn: document.getElementById("resetFiltersBtn"),
    exportCsvBtn: document.getElementById("exportCsvBtn"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    languageToggleBtn: document.getElementById("languageToggleBtn"),
    formTitle: document.getElementById("formTitle"),
    transactionsList: document.getElementById("transactionsList"),
    resultsCount: document.getElementById("resultsCount"),
    totalBalance: document.getElementById("totalBalance"),
    totalIncome: document.getElementById("totalIncome"),
    totalExpenses: document.getElementById("totalExpenses"),
    financeChart: document.getElementById("financeChart"),
    confirmModal: document.getElementById("confirmModal"),
    confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
    cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
    toastContainer: document.getElementById("toastContainer"),
    skeleton: document.getElementById("skeleton"),
  };
};

const hydrateState = (dom) => {
  state.transactions = loadTransactionsFromStorage(window.localStorage, STORAGE_KEY);
  applyTheme(dom, loadThemeFromStorage(window.localStorage, THEME_KEY));
};

const attachEventHandlers = (dom) => {
  dom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitTransactionForm(dom);
  });

  dom.cancelEditBtn.addEventListener("click", () => {
    resetForm(dom);
  });

  dom.transactionsList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-btn");
    const editButton = event.target.closest(".edit-btn");
    const emptyAddButton = event.target.closest(".empty-add-btn");

    if (deleteButton?.dataset?.id) {
      openDeleteModal(dom, deleteButton.dataset.id);
    }

    if (editButton?.dataset?.id) {
      beginEditing(dom, editButton.dataset.id);
    }

    if (emptyAddButton) {
      dom.titleInput.focus();
    }
  });

  dom.filterCategory.addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    renderDashboard(dom, state, getI18nAdapter());
  });

  dom.filterType.addEventListener("change", (event) => {
    state.filters.type = event.target.value;
    renderDashboard(dom, state, getI18nAdapter());
  });

  dom.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderDashboard(dom, state, getI18nAdapter());
  });

  dom.resetFiltersBtn.addEventListener("click", () => {
    state.filters = { ...DEFAULT_FILTERS };
    dom.filterCategory.value = DEFAULT_FILTERS.category;
    dom.filterType.value = DEFAULT_FILTERS.type;
    dom.searchInput.value = DEFAULT_FILTERS.search;
    renderDashboard(dom, state, getI18nAdapter());
  });

  dom.exportCsvBtn.addEventListener("click", () => {
    exportTransactions(dom);
  });

  dom.themeToggleBtn.addEventListener("click", () => {
    applyTheme(dom, state.theme === "dark" ? "light" : "dark");
  });

  dom.languageToggleBtn.addEventListener("click", async () => {
    await changeLanguage(getNextLanguage(), window.localStorage);
    clearFieldErrors(Object.values(getFieldMap(dom)));
    refreshUi(dom);
  });

  dom.confirmDeleteBtn.addEventListener("click", () => {
    confirmDeletion(dom);
  });

  dom.cancelDeleteBtn.addEventListener("click", () => {
    closeDeleteModal(dom);
  });

  dom.confirmModal.addEventListener("click", (event) => {
    if (event.target.dataset.close) {
      closeDeleteModal(dom);
    }
  });
};

const submitTransactionForm = (dom) => {
  const rawInput = readForm(dom);
  const validation = validateTransactionInput(rawInput, getValidationMessages());
  const fieldMap = getFieldMap(dom);

  clearFieldErrors(Object.values(fieldMap));

  if (!validation.isValid) {
    applyFieldErrors(fieldMap, validation.errors);
    createToast(dom.toastContainer, t("toast.fixFields"), "error");
    return;
  }

  const normalizedTransaction = normalizeTransactionInput(rawInput);
  const isEditing = Boolean(state.editingId);

  state.transactions = upsertTransaction(
    state.transactions,
    normalizedTransaction,
    state.editingId,
  );

  resetForm(dom);
  persistTransactions();
  refreshUi(dom);
  createToast(
    dom.toastContainer,
    isEditing ? t("toast.updated") : t("toast.added"),
  );
};

const readForm = (dom) => {
  return {
    title: dom.titleInput.value,
    amountValue: dom.amountInput.value,
    category: dom.categoryInput.value,
    date: dom.dateInput.value,
  };
};

const getFieldMap = (dom) => {
  return {
    title: [dom.titleInput, dom.titleError],
    amount: [dom.amountInput, dom.amountError],
    category: [dom.categoryInput, dom.categoryError],
    date: [dom.dateInput, dom.dateError],
  };
};

const resetForm = (dom) => {
  dom.form.reset();
  state.editingId = null;
  dom.cancelEditBtn.hidden = true;
  clearFieldErrors(Object.values(getFieldMap(dom)));
  refreshUi(dom);
};

const beginEditing = (dom, id) => {
  const transaction = state.transactions.find((item) => item.id === id);

  if (!transaction) {
    return;
  }

  dom.titleInput.value = transaction.title;
  dom.amountInput.value = transaction.amount;
  dom.categoryInput.value = transaction.category;
  dom.dateInput.value = transaction.date;

  state.editingId = id;
  dom.cancelEditBtn.hidden = false;
  dom.titleInput.focus();
  refreshUi(dom);
  createToast(dom.toastContainer, t("toast.editing"));
};

const openDeleteModal = (dom, id) => {
  state.pendingDeleteId = id;
  dom.confirmModal.classList.add("is-open");
  dom.confirmModal.setAttribute("aria-hidden", "false");
};

const closeDeleteModal = (dom) => {
  state.pendingDeleteId = null;
  dom.confirmModal.classList.remove("is-open");
  dom.confirmModal.setAttribute("aria-hidden", "true");
};

const confirmDeletion = (dom) => {
  if (!state.pendingDeleteId) {
    closeDeleteModal(dom);
    return;
  }

  state.transactions = deleteTransactionById(
    state.transactions,
    state.pendingDeleteId,
  );

  persistTransactions();
  refreshUi(dom);
  closeDeleteModal(dom);
  createToast(dom.toastContainer, t("toast.deleted"));
};

const exportTransactions = (dom) => {
  if (state.transactions.length === 0) {
    createToast(dom.toastContainer, t("toast.noExportData"), "error");
    return;
  }

  const csvContent = buildCsvContent(state.transactions);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = "transactions.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);

  createToast(dom.toastContainer, t("toast.exported"));
};

const applyTheme = (dom, theme) => {
  state.theme = theme;
  document.body.classList.toggle("theme-light", theme === "light");
  updateDynamicLabels(dom);
  saveThemeToStorage(window.localStorage, THEME_KEY, theme);
};

const persistTransactions = () => {
  saveTransactionsToStorage(window.localStorage, STORAGE_KEY, state.transactions);
};

const refreshUi = (dom) => {
  translatePage();
  updateDynamicLabels(dom);
  renderDashboard(dom, state, getI18nAdapter());
};

const updateDynamicLabels = (dom) => {
  dom.themeToggleBtn.textContent =
    state.theme === "light" ? t("action.darkMode") : t("action.lightMode");
  dom.languageToggleBtn.textContent = t("action.language");
  dom.formTitle.textContent = state.editingId ? t("form.editTitle") : t("form.addTitle");
  dom.submitBtn.textContent = state.editingId
    ? t("form.saveSubmit")
    : t("form.addSubmit");
};

const getI18nAdapter = () => {
  return {
    t,
    locale: getCurrentLocale(),
    translateCategory,
  };
};

const getValidationMessages = () => {
  return {
    titleRequired: t("validation.titleRequired"),
    amountInvalid: t("validation.amountInvalid"),
    categoryRequired: t("validation.categoryRequired"),
    dateRequired: t("validation.dateRequired"),
  };
};
