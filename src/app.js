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

export const initializeApp = async () => {
  await initializeI18n(window.localStorage);

  const dom = getDomReferences();
  hydrateState(dom);
  refreshUi(dom);
  renderCookieBanner(dom);
  attachEventHandlers(dom);

  dom.skeleton.classList.add("is-hidden");
};

const getDomReferences = () => {
  return {
    form: document.getElementById("transactionForm"),
    titleInput: document.getElementById("titleInput"),
    amountInput: document.getElementById("amountInput"),
    amountTypeHint: document.getElementById("amountTypeHint"),
    categoryInput: document.getElementById("categoryInput"),
    dateInput: document.getElementById("dateInput"),
    titleError: document.getElementById("titleError"),
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
  let resetHighlightTimer = null;
  let lastDeleteTrigger = null;

  dom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitTransactionForm(dom);
  });

  dom.cancelEditBtn.addEventListener("click", () => {
    resetForm(dom);
  });

  dom.amountInput.addEventListener("input", () => {
    updateAmountTypeHint(dom);
  });

  dom.transactionsList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-btn");
    const editButton = event.target.closest(".edit-btn");
    const emptyAddButton = event.target.closest(".empty-add-btn");

    if (deleteButton?.dataset?.id) {
      lastDeleteTrigger = deleteButton;
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
    resetHighlightTimer = showResetFiltersHighlight(dom, resetHighlightTimer);
    createToast(dom.toastContainer, t("toast.filtersReset"));
  });

  dom.exportCsvBtn.addEventListener("click", () => {
    exportTransactions(dom);
  });

  dom.themeToggleBtn.addEventListener("click", () => {
    applyTheme(dom, state.theme === "dark" ? "light" : "dark");
    refreshUi(dom);
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
    closeDeleteModal(dom, lastDeleteTrigger);
  });

  dom.confirmModal.addEventListener("click", (event) => {
    if (event.target.dataset.close) {
      closeDeleteModal(dom, lastDeleteTrigger);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      dom.confirmModal.classList.contains("is-open")
    ) {
      closeDeleteModal(dom, lastDeleteTrigger);
    }
  });

  dom.acceptCookiesBtn?.addEventListener("click", () => {
    handleCookieConsent(dom, "accepted");
  });

  dom.rejectCookiesBtn?.addEventListener("click", () => {
    handleCookieConsent(dom, "rejected");
  });
};

const showResetFiltersHighlight = (dom, activeTimer) => {
  const filterControls = [
    dom.filterCategory,
    dom.filterType,
    dom.searchInput,
  ];

  if (activeTimer) {
    window.clearTimeout(activeTimer);
  }

  filterControls.forEach((control) => {
    control.classList.remove("is-reset-highlight");
    void control.offsetWidth;
    control.classList.add("is-reset-highlight");
  });

  return window.setTimeout(() => {
    filterControls.forEach((control) => {
      control.classList.remove("is-reset-highlight");
    });
  }, 700);
};


const submitTransactionForm = (dom) => {
  const rawInput = readForm(dom);
  const validation = validateTransactionInput(rawInput, getValidationMessages());
  const fieldMap = getFieldMap(dom);

  clearFieldErrors(Object.values(fieldMap));
  updateAmountTypeHint(dom);

  if (!validation.isValid) {
    applyFieldErrors(fieldMap, validation.errors);
    applyAmountFieldError(dom, validation.errors.amount);
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
  persistTransactions(dom);
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
    category: [dom.categoryInput, dom.categoryError],
    date: [dom.dateInput, dom.dateError],
  };
};

const applyAmountFieldError = (dom, message) => {
  if (!message) {
    return;
  }

  dom.amountInput.classList.add("is-invalid");
  dom.amountTypeHint.textContent = message;
  setAmountHintVariant(dom, "error");
};

const resetForm = (dom) => {
  dom.form.reset();
  state.editingId = null;
  dom.cancelEditBtn.hidden = true;
  clearFieldErrors(Object.values(getFieldMap(dom)));
  updateAmountTypeHint(dom);
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
  updateAmountTypeHint(dom);
  refreshUi(dom);
  createToast(dom.toastContainer, t("toast.editing"));
};

const openDeleteModal = (dom, id) => {
  state.pendingDeleteId = id;
  dom.confirmModal.classList.add("is-open");
  dom.confirmModal.setAttribute("aria-hidden", "false");
  
  requestAnimationFrame(() => {
    dom.cancelDeleteBtn.focus();
  });
};

const closeDeleteModal = (dom, returnFocusTo = null) => {
  state.pendingDeleteId = null;
  dom.confirmModal.classList.remove("is-open");
  dom.confirmModal.setAttribute("aria-hidden", "true");
  if (returnFocusTo && document.contains(returnFocusTo)) {
    returnFocusTo.focus();
  }
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
  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });
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
  const saved = saveThemeToStorage(window.localStorage, THEME_KEY, theme);

  if (!saved) {
    createToast(
      dom.toastContainer,
      t("toast.themeSaveFailed"),
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
      t("toast.transactionsSaveFailed"),
      "error",
    );
  }

  return saved;
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
  updateAmountTypeHint(dom);
};

const updateAmountTypeHint = (dom) => {
  const rawValue = dom.amountInput.value.trim();
  const amount = Number(rawValue);

  dom.amountInput.classList.remove("is-invalid");

  if (!rawValue) {
    dom.amountTypeHint.textContent = t("form.amountHint");
    setAmountHintVariant(dom, "neutral");
    return;
  }

  if (!Number.isFinite(amount) || amount === 0) {
    dom.amountTypeHint.textContent = t("form.amountInvalidHint");
    setAmountHintVariant(dom, "error");
    return;
  }

  if (amount > 0) {
    dom.amountTypeHint.textContent = t("filters.income");
    setAmountHintVariant(dom, "income");
    return;
  }

  dom.amountTypeHint.textContent = t("filters.expense");
  setAmountHintVariant(dom, "expense");
};

const setAmountHintVariant = (dom, variant) => {
  dom.amountTypeHint.classList.remove(
    "amount-hint--income",
    "amount-hint--expense",
    "amount-hint--error",
    "amount-hint--neutral",
  );
  dom.amountTypeHint.classList.add(`amount-hint--${variant}`);
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
    saved ? t("toast.cookieSaved") : t("toast.cookieSaveFailed"),
    saved ? "success" : "error",
  );
};
