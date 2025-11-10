// app/service-history/utils/formatters.ts

export const formatCurrencyVND = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") return "--";
  const num = Number(value);
  if (Number.isNaN(num)) return "--";
  return new Intl.NumberFormat("vi-VN", { 
    style: "currency", 
    currency: "VND" 
  }).format(num);
};

export const formatDateOnly = (value?: string | null): string => {
  if (!value || typeof value !== "string") return "--";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return "--";
  const year = Number(y);
  const monthIndex = Number(m) - 1;
  const day = Number(d);
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) return "--";
  const date = new Date(year, monthIndex, day);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN", { 
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit" 
  });
};

export const formatDateTime = (value?: string | number | Date | null): string => {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};