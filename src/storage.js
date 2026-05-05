import { parseStoredTransactions } from "./transactions.js";

export const loadTransactionsFromStorage = (storage, key) => {
  return parseStoredTransactions(storage.getItem(key));
};

export const saveTransactionsToStorage = (storage, key, transactions) => {
  storage.setItem(key, JSON.stringify(transactions));
};

export const loadThemeFromStorage = (storage, key, fallback = "dark") => {
  return storage.getItem(key) || fallback;
};

export const saveThemeToStorage = (storage, key, theme) => {
  storage.setItem(key, theme);
};
