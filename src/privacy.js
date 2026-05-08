const LANGUAGE_KEY = "financeTrackerLanguage";
const THEME_KEY = "financeTrackerTheme";

const translations = {
  en: {
    "privacy.metaTitle": "Privacy Policy | Advanced Finance Tracker",
    "privacy.back": "<- Back to app",
    "privacy.title": "Privacy Policy",
    "privacy.lastUpdatedLabel": "Last updated:",
    "privacy.lastUpdatedDate": "April 2026",
    "privacy.dataTitle": "1. What data we store",
    "privacy.dataText":
      "Advanced Finance Tracker stores transaction entries, theme preference, and cookie preference locally in your browser using localStorage. Transaction entries may include title, amount, category, and date.",
    "privacy.whyTitle": "2. Why we store this data",
    "privacy.whyText":
      "The data is stored to provide the core functionality of the finance tracker, including keeping your transactions available after refreshing the page, remembering your selected theme, and remembering whether you accepted or rejected the cookie notice.",
    "privacy.whereTitle": "3. Where the data is stored",
    "privacy.whereText":
      "The data is stored on your own device in your browser. This project does not send your transaction data to an external server.",
    "privacy.sharingTitle": "4. Data sharing",
    "privacy.sharingText":
      "We do not sell, share, or transfer your locally stored transaction data to third parties.",
    "privacy.retentionTitle": "5. Data retention",
    "privacy.retentionText":
      "The data remains in your browser until you delete it, clear your browser storage, or reset the application data.",
    "privacy.choicesTitle": "6. Your choices",
    "privacy.choicesText":
      "You can remove stored data at any time by clearing your browser site data or localStorage for this website.",
    "privacy.contactTitle": "7. Contact",
    "privacy.contactText":
      "For questions about this student project, please contact the project team.",
  },
  zh: {
    "privacy.metaTitle": "隐私政策 | 高级财务追踪器",
    "privacy.back": "<- 返回应用",
    "privacy.title": "隐私政策",
    "privacy.lastUpdatedLabel": "最后更新：",
    "privacy.lastUpdatedDate": "2026 年 4 月",
    "privacy.dataTitle": "1. 我们存储哪些数据",
    "privacy.dataText":
      "高级财务追踪器会使用 localStorage 将交易记录、主题偏好和 Cookie 偏好保存在你的浏览器本地。交易记录可能包含标题、金额、类别和日期。",
    "privacy.whyTitle": "2. 我们为什么存储这些数据",
    "privacy.whyText":
      "这些数据用于提供财务追踪器的核心功能，包括刷新页面后保留交易记录、记住你选择的主题，以及记住你接受或拒绝 Cookie 提示的选择。",
    "privacy.whereTitle": "3. 数据存储在哪里",
    "privacy.whereText":
      "数据存储在你自己的设备和浏览器中。本项目不会把你的交易数据发送到外部服务器。",
    "privacy.sharingTitle": "4. 数据共享",
    "privacy.sharingText":
      "我们不会出售、分享或转移你本地存储的交易数据给第三方。",
    "privacy.retentionTitle": "5. 数据保留",
    "privacy.retentionText":
      "这些数据会保留在你的浏览器中，直到你删除它、清除浏览器存储，或重置应用数据。",
    "privacy.choicesTitle": "6. 你的选择",
    "privacy.choicesText":
      "你可以随时通过清除此网站的浏览器站点数据或 localStorage 来移除已存储的数据。",
    "privacy.contactTitle": "7. 联系方式",
    "privacy.contactText": "如果你对这个学生项目有疑问，请联系项目团队。",
  },
};

const safeGetLanguage = () => {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
};

const safeGetTheme = () => {
  try {
    return window.localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
};

const applyTheme = () => {
  document.body.classList.toggle("theme-light", safeGetTheme() === "light");
};

const getLanguage = () => {
  const savedLanguage = safeGetLanguage();

  if (savedLanguage?.startsWith("zh")) {
    return "zh";
  }

  if (savedLanguage?.startsWith("en")) {
    return "en";
  }

  return navigator.language?.startsWith("zh") ? "zh" : "en";
};

applyTheme();

const language = getLanguage();
const dictionary = translations[language] || translations.en;

document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
document.title = dictionary["privacy.metaTitle"];

document.querySelectorAll("[data-i18n]").forEach((element) => {
  const value = dictionary[element.dataset.i18n];

  if (value) {
    element.textContent = value;
  }
});
