import { revalidatePath } from "next/cache";
import { revalidateBudgetPaths } from "@/lib/revalidate-budget";

export function revalidateTransactionPaths() {
  revalidatePath("/transactions");
  revalidatePath("/transactions/[month]", "page");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/[month]", "page");
  revalidateBudgetPaths();
}
