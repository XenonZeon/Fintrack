import { db } from "@/lib/db";
import { healthCheck } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  let dbStatus: "ok" | "error" = "ok";
  let errorMessage = "";

  try {
    await db.insert(healthCheck).values({});
    await db.select().from(healthCheck).limit(1);
  } catch (err) {
    dbStatus = "error";
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <p>App: ok</p>
      <p>DB: {dbStatus}</p>
      {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
    </div>
  );
}
