import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ReceiptReview from "@/components/ReceiptReview";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: receipt }, { data: categories }] = await Promise.all([
    supabase.from("receipts").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name, icon").order("name"),
  ]);

  if (!receipt) notFound();

  const {
    data: { publicUrl },
  } = supabase.storage.from("receipts").getPublicUrl(receipt.image_path);
  const { data: signed } = await supabase.storage
    .from("receipts")
    .createSignedUrl(receipt.image_path, 3600);

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signed?.signedUrl ?? publicUrl}
          alt="Receipt"
          className="w-full rounded-lg object-contain max-h-[70vh]"
        />
      </div>
      <ReceiptReview receipt={receipt} categories={categories ?? []} />
    </div>
  );
}
