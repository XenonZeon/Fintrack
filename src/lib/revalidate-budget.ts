import { revalidatePath } from "next/cache";

export function revalidateBudgetPaths() {
  revalidatePath("/budget");
  revalidatePath("/budget/[month]", "page");
}
