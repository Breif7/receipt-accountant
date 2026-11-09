import Anthropic from "@anthropic-ai/sdk";
import { SupabaseClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Builds (or returns the existing) spending report for the given user and first-of-month date. */
export async function generateReport(supabase: SupabaseClient, userId: string, month: string) {
  const { data: existing } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();
  if (existing) return existing;

  const monthDate = new Date(month);
  const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1).toISOString().slice(0, 10);
  const prevMonthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
  const prevMonth = prevMonthDate.toISOString().slice(0, 10);

  const [{ data: tx }, { data: prevTx }] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount, type, date, merchant, categories(name)")
      .eq("user_id", userId)
      .gte("date", month)
      .lt("date", nextMonth),
    supabase
      .from("transactions")
      .select("amount, type, categories(name)")
      .eq("user_id", userId)
      .gte("date", prevMonth)
      .lt("date", month),
  ]);

  const summarize = (rows: any[] | null) => {
    const byCat: Record<string, number> = {};
    let income = 0;
    for (const t of rows ?? []) {
      if (t.type === "income") income += Number(t.amount);
      else byCat[t.categories?.name ?? "Uncategorized"] = (byCat[t.categories?.name ?? "Uncategorized"] ?? 0) + Number(t.amount);
    }
    return { income, byCat };
  };
  const current = summarize(tx);
  const previous = summarize(prevTx);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `You are a personal finance coach. Here is a user's spending for ${month.slice(0, 7)} by category: ${JSON.stringify(
          current.byCat
        )}, income ${current.income}. Last month's spending by category: ${JSON.stringify(
          previous.byCat
        )}, income ${previous.income}.
Write a short monthly report in Markdown with:
1. A one-paragraph summary of where the money went.
2. The categories that changed the most vs. last month, with amounts.
3. A "## Tips" section with exactly 3 concrete, specific savings tips based on this data.
Keep it under 250 words. Then on a new line write ONLY a JSON array of the 3 tips as plain strings, prefixed with "TIPS_JSON:".`,
      },
    ],
  });

  const text = message.content.find((b) => b.type === "text")?.text ?? "";
  const tipsMatch = text.match(/TIPS_JSON:\s*(\[[\s\S]*\])/);
  const tips = tipsMatch ? JSON.parse(tipsMatch[1]) : [];
  const content_md = text.replace(/TIPS_JSON:[\s\S]*/, "").trim();

  const { data: report, error } = await supabase
    .from("reports")
    .insert({ user_id: userId, month, content_md, tips })
    .select()
    .single();
  if (error) throw error;
  return report;
}
