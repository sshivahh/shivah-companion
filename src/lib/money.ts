export type MoneyType = "income" | "expense";
export type Category = { id: string; label: string; color: string };

/** First category in each list is the default when adding. */
export const CATEGORIES: Record<MoneyType, Category[]> = {
  income: [
    { id: "lessons", label: "Lessons", color: "#86e3a0" },
    { id: "salary", label: "Salary", color: "#8dcfff" },
    { id: "gift", label: "Gift", color: "#ff9cc8" },
    { id: "other-in", label: "Other", color: "#c9aeff" },
  ],
  expense: [
    { id: "food", label: "Food & drinks", color: "#ffb36b" },
    { id: "transport", label: "Transport", color: "#8dcfff" },
    { id: "shopping", label: "Shopping", color: "#ff9cc8" },
    { id: "bills", label: "Bills", color: "#ffe04d" },
    { id: "health", label: "Health", color: "#86e3a0" },
    { id: "fun", label: "Fun", color: "#c9aeff" },
    { id: "education", label: "Education", color: "#74e0d6" },
    { id: "family", label: "Family", color: "#ff9f8e" },
    { id: "other-out", label: "Other", color: "#aebbff" },
  ],
};

export function findCategory(type: MoneyType, id: string): Category {
  return CATEGORIES[type].find((c) => c.id === id) ?? { id, label: id, color: "#aebbff" };
}

export function isCategory(type: MoneyType, id: string) {
  return CATEGORIES[type].some((c) => c.id === id);
}

/** Largest single amount we accept (fits a Postgres integer). */
export const MAX_AMOUNT = 2_000_000_000;

const fmt = new Intl.NumberFormat("id-ID");

/** 150000 → "150.000" */
export const formatNumber = (n: number) => fmt.format(n);

/** 150000 → "Rp 150.000", -5000 → "−Rp 5.000" */
export function formatRupiah(n: number) {
  return `${n < 0 ? "−" : ""}Rp ${fmt.format(Math.abs(n))}`;
}

/** Reads what was typed ("150.000", "Rp150000") as a whole number of Rupiah. */
export function parseAmount(text: string) {
  const digits = text.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return digits ? Math.min(Number(digits), MAX_AMOUNT) : 0;
}
