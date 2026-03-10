export const formatDate = (
  dateInput: string | Date | null | undefined,
): string => {
  if (!dateInput) return "-";

  const dateString =
    typeof dateInput === "string" ? dateInput : dateInput.toISOString();

  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return "Data inválida";
  }
};

export const formatDateOnly = (
  dateInput: string | Date | null | undefined,
): string => {
  if (!dateInput) return "-";

  const dateString =
    typeof dateInput === "string" ? dateInput : dateInput.toISOString();

  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return "Data inválida";
  }
};
