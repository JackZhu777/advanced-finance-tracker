import { parseStoredTransactions } from "./transactions.js";

const VALID_THEMES = new Set(["dark", "light"]);
const VALID_COOKIE_CONSENT = new Set(["accepted", "rejected"]);

// Wrap storage reads because localStorage can be unavailable or blocked in some browsers or private modes
export const safeGetItem = (storage, key) => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};
// Return a boolean so callers can show an error message when localStorage writes fail
export const safeSetItem = (storage, key, value) => {
  try {
    storage?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const loadTransactionsFromStorage = (storage, key) => {
  return parseStoredTransactions(safeGetItem(storage, key));
};

export const saveTransactionsToStorage = (storage, key, transactions) => {
  return safeSetItem(storage, key, JSON.stringify(transactions));
};

export const loadThemeFromStorage = (storage, key, fallback = "dark") => {
  const storedTheme = safeGetItem(storage, key);
  return VALID_THEMES.has(storedTheme) ? storedTheme : fallback;
};

export const saveThemeToStorage = (storage, key, theme) => {
  if (!VALID_THEMES.has(theme)) {
    return false;
  }

  return safeSetItem(storage, key, theme);
};

export const loadCookieConsentFromStorage = (storage, key) => {
  const storedConsent = safeGetItem(storage, key);
  return VALID_COOKIE_CONSENT.has(storedConsent) ? storedConsent : null;
};

export const saveCookieConsentToStorage = (storage, key, consent) => {
  if (!VALID_COOKIE_CONSENT.has(consent)) {
    return false;
  }

  return safeSetItem(storage, key, consent);
};