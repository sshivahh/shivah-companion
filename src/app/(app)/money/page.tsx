import { MoneyView } from "@/components/money-view";
import { getToday, getTransactionsBetween } from "@/lib/data";
import { isMonthKey, monthKey, monthRange } from "@/lib/dates";

export default async function MoneyPage({ searchParams }: PageProps<"/money">) {
  const { m } = await searchParams;
  const today = await getToday();
  const month = isMonthKey(m) ? m : monthKey(today);
  const { start, end } = monthRange(month);
  const transactions = await getTransactionsBetween(start, end);
  return <MoneyView key={month} month={month} today={today} transactions={transactions} />;
}
