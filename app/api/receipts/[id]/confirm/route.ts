import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Saves the (possibly edited) extraction as a real transaction and marks the receipt confirmed.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { merchant, date, total, currency, category_id } = body;
  if (!date || typeof total !== "number") {
    return NextResponse.json({ error: "date and total are required" }, { status: 400 });
  }

  const { error: txError } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: "expense",
    amount: total,
    currency: currency ?? "USD",
    date,
    merchant,
    category_id: category_id ?? null,
    receipt_id: id,
  });
  if (txError) return NextResponse.json({ error: txError.message }, { status: 500 });

  const { error: updateError } = await supabase
    .from("receipts")
    .update({ status: "confirmed" })
    .eq("id", id)
    .eq("user_id", user.id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
