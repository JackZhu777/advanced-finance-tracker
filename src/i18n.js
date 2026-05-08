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
      "form.amountHint": "Positive for income, negative for expense.",
      "form.amountInvalidHint": "Enter a non-zero amount.",
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
      "toast.filtersReset": "Filters reset.",
      "toast.themeSaveFailed": "Theme changed, but the preference could not be saved.",
      "toast.transactionsSaveFailed": "Changes were made, but could not be saved locally.",
      "toast.cookieSaved": "Cookie preference saved.",
      "toast.cookieSaveFailed": "Cookie preference could not be saved locally.",
      "cookie.title": "Cookie & Privacy Notice",
      "cookie.text": "We use essential local storage to remember your transactions, theme, and cookie preference. We do not sell or share your data.",
      "cookie.privacyPolicy": "Read our Privacy Policy",
      "cookie.reject": "Reject",
      "cookie.accept": "Accept",
      "privacy.metaTitle": "Privacy Policy | Advanced Finance Tracker",
      "privacy.back": "<- Back to app",
      "privacy.title": "Privacy Policy",
      "privacy.lastUpdatedLabel": "Last updated:",
      "privacy.lastUpdatedDate": "April 2026",
      "privacy.dataTitle": "1. What data we store",
      "privacy.dataText": "Advanced Finance Tracker stores transaction entries, theme preference, and cookie preference locally in your browser using localStorage. Transaction entries may include title, amount, category, and date.",
      "privacy.whyTitle": "2. Why we store this data",
      "privacy.whyText": "The data is stored to provide the core functionality of the finance tracker, including keeping your transactions available after refreshing the page, remembering your selected theme, and remembering whether you accepted or rejected the cookie notice.",
      "privacy.whereTitle": "3. Where the data is stored",
      "privacy.whereText": "The data is stored on your own device in your browser. This project does not send your transaction data to an external server.",
      "privacy.sharingTitle": "4. Data sharing",
      "privacy.sharingText": "We do not sell, share, or transfer your locally stored transaction data to third parties.",
      "privacy.retentionTitle": "5. Data retention",
      "privacy.retentionText": "The data remains in your browser until you delete it, clear your browser storage, or reset the application data.",
      "privacy.choicesTitle": "6. Your choices",
      "privacy.choicesText": "You can remove stored data at any time by clearing your browser site data or localStorage for this website.",
      "privacy.contactTitle": "7. Contact",
      "privacy.contactText": "For questions about this student project, please contact the project team.",
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
      "form.amountHint": "正数是收入，负数是支出。",
      "form.amountInvalidHint": "请输入非零金额。",
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
      "toast.filtersReset": "筛选条件已重置。",
      "toast.themeSaveFailed": "主题已更改，但偏好设置无法保存。",
      "toast.transactionsSaveFailed": "更改已完成，但无法保存到本地。",
      "toast.cookieSaved": "Cookie 偏好已保存。",
      "toast.cookieSaveFailed": "Cookie 偏好无法保存到本地。",
      "cookie.title": "Cookie 与隐私提示",
      "cookie.text": "我们使用必要的本地存储来记住你的交易、主题和 Cookie 偏好。我们不会出售或分享你的数据。",
      "cookie.privacyPolicy": "阅读隐私政策",
      "cookie.reject": "拒绝",
      "cookie.accept": "接受",
      "privacy.metaTitle": "隐私政策 | 高级财务追踪器",
      "privacy.back": "<- 返回应用",
      "privacy.title": "隐私政策",
      "privacy.lastUpdatedLabel": "最后更新：",
      "privacy.lastUpdatedDate": "2026 年 4 月",
      "privacy.dataTitle": "1. 我们存储哪些数据",
      "privacy.dataText": "高级财务追踪器会使用 localStorage 将交易记录、主题偏好和 Cookie 偏好保存在你的浏览器本地。交易记录可能包含标题、金额、类别和日期。",
      "privacy.whyTitle": "2. 我们为什么存储这些数据",
      "privacy.whyText": "这些数据用于提供财务追踪器的核心功能，包括刷新页面后保留交易记录、记住你选择的主题，以及记住你接受或拒绝 Cookie 提示的选择。",
      "privacy.whereTitle": "3. 数据存储在哪里",
      "privacy.whereText": "数据存储在你自己的设备和浏览器中。本项目不会把你的交易数据发送到外部服务器。",
      "privacy.sharingTitle": "4. 数据共享",
      "privacy.sharingText": "我们不会出售、分享或转移你本地存储的交易数据给第三方。",
      "privacy.retentionTitle": "5. 数据保留",
      "privacy.retentionText": "这些数据会保留在你的浏览器中，直到你删除它、清除浏览器存储，或重置应用数据。",
      "privacy.choicesTitle": "6. 你的选择",
      "privacy.choicesText": "你可以随时通过清除此网站的浏览器站点数据或 localStorage 来移除已存储的数据。",
      "privacy.contactTitle": "7. 联系方式",
      "privacy.contactText": "如果你对这个学生项目有疑问，请联系项目团队。",
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
