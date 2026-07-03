import { redirect } from "next/navigation";
import { Inter } from "next/font/google";
import { auth } from "@/lib/auth/server";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-app" });

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  return (
    <div
      className={`${inter.variable} flex h-screen w-full overflow-hidden`}
      style={{
        background: "var(--app-bg)",
        color: "var(--app-text)",
        fontFamily: "var(--font-app), sans-serif",
      }}
    >
      <Sidebar userName={session.user.name || session.user.email} />
      <div className="flex-1 overflow-y-auto px-16 pt-12 pb-20">{children}</div>
    </div>
  );
}
