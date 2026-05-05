import { parseCalendarDate } from "./transactions.js";

export const formatCurrency = (
  amount,
  locale = "en-US",
  currency = "USD",
) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatDisplayDate = (dateString, locale = "en-US") => {
  return parseCalendarDate(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
