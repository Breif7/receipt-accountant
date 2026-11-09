import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractReceipt } from "@/lib/claude";

// Accepts a multipart upload, stores the image in Supabase Storage, extracts it with Claude,
// and saves a pending receipt row the user confirms on the next screen.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const path = `${user.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(path, buffer, { contentType: file.type });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  let extraction;
  try {
    extraction = await extractReceipt(buffer.toString("base64"), file.type);
  } catch (e: any) {
    extraction = null;
  }

  const { data: receipt, error: insertError } = await supabase
    .from("receipts")
    .insert({
      user_id: user.id,
      image_path: path,
      raw_extraction: extraction,
      status: "pending",
    })
    .select()
    .single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ receipt });
}
