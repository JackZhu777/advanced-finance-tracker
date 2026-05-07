import i18next from "i18next";

export const LANGUAGE_KEY = "financeTrackerLanguage";

export const LANGUAGE_OPTIONS = {
  en: {
    label: "EN",
    nextLabel: "中文",
    locale: "en-US",
    htmlLang: "en",
  },
  zh: {
    label: "中文",
    nextLabel: "EN",
    locale: "zh-CN",
    htmlLang: "zh-CN",
  },
};

const resources = {
  en: {
    translation: {
      "meta.title": "Advanced Personal Finance Tracker",
      "app.eyebrow": "Personal Finance",
      "app.title": "Advanced Finance Tracker",
      "app.subtitle": "Track income, expenses, and your balance with clarity.",
      "action.lightMode": "Light Mode",
      "action.darkMode": "Dark Mode",
      "action.exportCsv": "Export CSV",
      "action.resetFilters": "Reset Filters",
      "action.language": "中文",
      "summary.balance": "Total Balance",
      "summary.income": "Total Income",
      "summary.expenses": "Total Expenses",
      "chart.title": "Cash Flow Overview",
      "chart.meta": "Income vs Expense",
      "form.addTitle": "Add Transaction",
      "form.editTitle": "Edit Transaction",
      "form.title": "Title",
      "form.titlePlaceholder": "e.g., Freelance Payment",
      "form.amount": "Amount",
      "form.amountPlaceholder": "e.g., 1200 or -45",
      "form.category": "Category",
      "form.selectCategory": "Select category",
      "form.date": "Date",
      "form.addSubmit": "Add Transaction",
      "form.saveSubmit": "Save Changes",
      "form.cancelEdit": "Cancel Edit",
      "filters.title": "Filters & Search",
      "filters.allCategories": "All categories",
      "filters.type": "Type",
      "filters.allTypes": "All",
      "filters.income": "Income",
      "filters.expense": "Expense",
      "filters.search": "Search by title",
      "filters.searchPlaceholder": "Start typing...",
      "transactions.title": "Transactions",
      "transactions.results": "{{count}} results",
      "transactions.empty": "No transactions yet. Add your first one to get started.",
      "transactions.addFirst": "Add First Transaction",
      "transactions.edit": "Edit",
      "transactions.delete": "Delete",
      "modal.deleteTitle": "Delete transaction?",
      "modal.deleteText": "This action cannot be undone.",
      "modal.cancel": "Cancel",
      "modal.delete": "Delete",
      "toast.fixFields": "Please fix the highlighted fields.",
      "toast.added": "Transaction added.",
      "toast.updated": "Transaction updated.",
      "toast.editing": "Editing mode enabled.",
      "toast.deleted": "Transaction deleted.",
      "toast.noExportData": "No data to export.",
      "toast.exported": "CSV exported.",
      "validation.titleRequired": "Title is required.",
      "validation.amountInvalid": "Enter a valid amount.",
      "validation.categoryRequired": "Select a category.",
      "validation.dateRequired": "Pick a date.",
      "category.Salary": "Salary",
      "category.Business": "Business",
      "category.Investments": "Investments",
      "category.Housing": "Housing",
      "category.Food": "Food",
      "category.Transport": "Transport",
      "category.Health": "Health",
      "category.Entertainment": "Entertainment",
      "category.Education": "Education",
      "category.Other": "Other",
    },
  },
  zh: {
    translation: {
      "meta.title": "高级个人财务追踪器",
      "app.eyebrow": "个人财务",
      "app.title": "高级财务追踪器",
      "app.subtitle": "清晰追踪收入、支出和账户余额。",
      "action.lightMode": "浅色模式",
      "action.darkMode": "深色模式",
      "action.exportCsv": "导出 CSV",
      "action.resetFilters": "重置筛选",
      "action.language": "EN",
      "summary.balance": "总余额",
      "summary.income": "总收入",
      "summary.expenses": "总支出",
      "chart.title": "现金流概览",
      "chart.meta": "收入 vs 支出",
      "form.addTitle": "添加交易",
      "form.editTitle": "编辑交易",
      "form.title": "标题",
      "form.titlePlaceholder": "例如：自由职业收入",
      "form.amount": "金额",
      "form.amountPlaceholder": "例如：1200 或 -45",
      "form.category": "类别",
      "form.selectCategory": "选择类别",
      "form.date": "日期",
      "form.addSubmit": "添加交易",
      "form.saveSubmit": "保存修改",
      "form.cancelEdit": "取消编辑",
      "filters.title": "筛选与搜索",
      "filters.allCategories": "全部类别",
      "filters.type": "类型",
      "filters.allTypes": "全部",
      "filters.income": "收入",
      "filters.expense": "支出",
      "filters.search": "按标题搜索",
      "filters.searchPlaceholder": "开始输入...",
      "transactions.title": "交易记录",
      "transactions.results": "{{count}} 条结果",
      "transactions.empty": "还没有交易记录。添加第一笔交易开始使用。",
      "transactions.addFirst": "添加第一笔交易",
      "transactions.edit": "编辑",
      "transactions.delete": "删除",
      "modal.deleteTitle": "删除这笔交易？",
      "modal.deleteText": "此操作无法撤销。",
      "modal.cancel": "取消",
      "modal.delete": "删除",
      "toast.fixFields": "请修正高亮字段。",
      "toast.added": "交易已添加。",
      "toast.updated": "交易已更新。",
      "toast.editing": "已进入编辑模式。",
      "toast.deleted": "交易已删除。",
      "toast.noExportData": "没有可导出的数据。",
      "toast.exported": "CSV 已导出。",
      "validation.titleRequired": "请输入标题。",
      "validation.amountInvalid": "请输入有效金额。",
      "validation.categoryRequired": "请选择类别。",
      "validation.dateRequired": "请选择日期。",
      "category.Salary": "工资",
      "category.Business": "业务",
      "category.Investments": "投资",
      "category.Housing": "住房",
      "category.Food": "餐饮",
      "category.Transport": "交通",
      "category.Health": "健康",
      "category.Entertainment": "娱乐",
      "category.Education": "教育",
      "category.Other": "其他",
    },
  },
};

export const initializeI18n = async (storage = window.localStorage) => {
  const savedLanguage = storage.getItem(LANGUAGE_KEY);
  const browserLanguage = navigator.language?.startsWith("zh") ? "zh" : "en";
  const language = savedLanguage || browserLanguage;

  await i18next.init({
    lng: language,
    fallbackLng: "en",
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

  applyDocumentLanguage();
};

export const t = (key, options) => i18next.t(key, options);

export const changeLanguage = async (language, storage = window.localStorage) => {
  await i18next.changeLanguage(language);
  storage.setItem(LANGUAGE_KEY, language);
  applyDocumentLanguage();
};

export const getCurrentLanguage = () => i18next.language || "en";

export const getCurrentLocale = () => {
  const language = getCurrentLanguage();
  return LANGUAGE_OPTIONS[language]?.locale || LANGUAGE_OPTIONS.en.locale;
};

export const getNextLanguage = () => (getCurrentLanguage() === "zh" ? "en" : "zh");

export const translateCategory = (category) => {
  return t(`category.${category}`, { defaultValue: category });
};

export const translatePage = (root = document) => {
  document.title = t("meta.title");

  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });
};

const applyDocumentLanguage = () => {
  const language = getCurrentLanguage();
  document.documentElement.lang =
    LANGUAGE_OPTIONS[language]?.htmlLang || LANGUAGE_OPTIONS.en.htmlLang;
};
