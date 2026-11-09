import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Manual income/expense entries (not from a receipt).
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, amount, date, merchant, category_id, currency } = body;
  if (!["income", "expense"].includes(type) || typeof amount !== "number" || !date) {
    return NextResponse.json({ error: "type, amount and date are required" }, { status: 400 });
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type,
    amount,
    date,
    merchant,
    category_id: category_id || null,
    currency: currency ?? "USD",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
