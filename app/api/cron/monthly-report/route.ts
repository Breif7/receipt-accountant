import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { generateReport } from "@/lib/reports";

// Vercel Cron hits this on the 1st of each month (see vercel.json) to build last month's
// report for every user. Protected by CRON_SECRET so it can't be triggered publicly.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);

  const { data: users } = await supabase.from("transactions").select("user_id").gte("date", lastMonth);
  const userIds = [...new Set((users ?? []).map((u) => u.user_id))];

  const results = await Promise.allSettled(userIds.map((id) => generateReport(supabase, id, lastMonth)));
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ generated: userIds.length - failed, failed });
}
