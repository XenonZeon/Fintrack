import { TransactionsView } from "./TransactionsView";

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  const now = new Date();
  return <TransactionsView year={now.getFullYear()} month={now.getMonth() + 1} />;
}
