import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { seedDefaultCategoriesIfMissing } from "@/lib/db/queries/categories";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  await seedDefaultCategoriesIfMissing(session.user.id);

  return <>{children}</>;
}
