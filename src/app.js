import {
  applyFieldErrors,
  clearFieldErrors,
  createToast,
} from "./feedback.js";
import { renderDashboard } from "./render.js";
import {
  loadCookieConsentFromStorage,
  loadThemeFromStorage,
  loadTransactionsFromStorage,
  saveCookieConsentToStorage,
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
const COOKIE_CONSENT_KEY = "financeTrackerCookieConsent";

const state = createInitialState();

export const initializeApp = () => {
  const dom = getDomReferences();
  hydrateState(dom);
  renderDashboard(dom, state);
  renderCookieBanner(dom);
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
    cookieBanner: document.getElementById("cookieBanner"),
    acceptCookiesBtn: document.getElementById("acceptCookiesBtn"),
    rejectCookiesBtn: document.getElementById("rejectCookiesBtn"),
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
    renderDashboard(dom, state);
  });

  dom.filterType.addEventListener("change", (event) => {
    state.filters.type = event.target.value;
    renderDashboard(dom, state);
  });

  dom.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderDashboard(dom, state);
  });

  dom.resetFiltersBtn.addEventListener("click", () => {
    state.filters = { ...DEFAULT_FILTERS };
    dom.filterCategory.value = DEFAULT_FILTERS.category;
    dom.filterType.value = DEFAULT_FILTERS.type;
    dom.searchInput.value = DEFAULT_FILTERS.search;
    renderDashboard(dom, state);
  });

  dom.exportCsvBtn.addEventListener("click", () => {
    exportTransactions(dom);
  });

  dom.themeToggleBtn.addEventListener("click", () => {
    applyTheme(dom, state.theme === "dark" ? "light" : "dark");
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

  dom.acceptCookiesBtn?.addEventListener("click", () => {
    handleCookieConsent(dom, "accepted");
  });

  dom.rejectCookiesBtn?.addEventListener("click", () => {
    handleCookieConsent(dom, "rejected");
  });
};

const submitTransactionForm = (dom) => {
  const rawInput = readForm(dom);
  const validation = validateTransactionInput(rawInput);
  const fieldMap = getFieldMap(dom);

  clearFieldErrors(Object.values(fieldMap));

  if (!validation.isValid) {
    applyFieldErrors(fieldMap, validation.errors);
    createToast(dom.toastContainer, "Please fix the highlighted fields.", "error");
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
  persistTransactions(dom);
  renderDashboard(dom, state);
  createToast(
    dom.toastContainer,
    isEditing ? "Transaction updated." : "Transaction added.",
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
  dom.submitBtn.textContent = "Add Transaction";
  dom.cancelEditBtn.hidden = true;
  clearFieldErrors(Object.values(getFieldMap(dom)));
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
  dom.submitBtn.textContent = "Save Changes";
  dom.cancelEditBtn.hidden = false;
  dom.titleInput.focus();
  createToast(dom.toastContainer, "Editing mode enabled.");
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

  persistTransactions(dom);
  renderDashboard(dom, state);
  closeDeleteModal(dom);
  createToast(dom.toastContainer, "Transaction deleted.");
};

const exportTransactions = (dom) => {
  if (state.transactions.length === 0) {
    createToast(dom.toastContainer, "No data to export.", "error");
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

  createToast(dom.toastContainer, "CSV exported.");
};

const applyTheme = (dom, theme) => {
  state.theme = theme;
  document.body.classList.toggle("theme-light", theme === "light");
  dom.themeToggleBtn.textContent =
    theme === "light" ? "Dark Mode" : "Light Mode";
  const saved = saveThemeToStorage(window.localStorage, THEME_KEY, theme);

  if (!saved) {
    createToast(
      dom.toastContainer,
      "Theme changed, but the preference could not be saved.",
      "error",
    );
  }

};

const persistTransactions = (dom) => {
  const saved = saveTransactionsToStorage(
    window.localStorage,
    STORAGE_KEY,
    state.transactions,
  );

  if (!saved) {
    createToast(
      dom.toastContainer,
      "Changes were made, but could not be saved locally.",
      "error",
    );
  }

  return saved;
};

const renderCookieBanner = (dom) => {
  const consent = loadCookieConsentFromStorage(
    window.localStorage,
    COOKIE_CONSENT_KEY,
  );

  if (!dom.cookieBanner) {
    return;
  }

  dom.cookieBanner.hidden = Boolean(consent);
};

const handleCookieConsent = (dom, consent) => {
  const saved = saveCookieConsentToStorage(
    window.localStorage,
    COOKIE_CONSENT_KEY,
    consent,
  );

  if (dom.cookieBanner) {
    dom.cookieBanner.hidden = true;
  }

  createToast(
    dom.toastContainer,
    saved
      ? "Cookie preference saved."
      : "Cookie preference could not be saved locally.",
    saved ? "success" : "error",
  );
};