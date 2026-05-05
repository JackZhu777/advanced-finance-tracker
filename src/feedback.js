export const createToast = (container, message, variant = "success") => {
  const toast = document.createElement("div");
  toast.className = `toast${variant === "error" ? " toast--error" : ""}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2400);
};

export const clearFieldErrors = (fieldMap) => {
  fieldMap.forEach(([input, errorElement]) => {
    input.classList.remove("is-invalid");
    errorElement.textContent = "";
  });
};

export const applyFieldErrors = (fieldMap, errors) => {
  Object.entries(fieldMap).forEach(([key, [input, errorElement]]) => {
    if (!errors[key]) {
      return;
    }

    input.classList.add("is-invalid");
    errorElement.textContent = errors[key];
  });
};
