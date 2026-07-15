import { revalidatePath } from "next/cache";

export function revalidateTransactionPaths() {
  revalidatePath("/transactions");
  revalidatePath("/transactions/[month]", "page");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/[month]", "page");
  revalidatePath("/budget");
  revalidatePath("/budget/[month]", "page");
}
