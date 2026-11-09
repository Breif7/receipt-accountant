import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ReceiptUploader from "@/components/ReceiptUploader";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const { data: receipts } = await supabase
    .from("receipts")
    .select("id, image_path, status, raw_extraction, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Receipts</h1>
      <ReceiptUploader />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(receipts ?? []).map((r) => {
          const extraction = r.raw_extraction as any;
          return (
            <Link
              key={r.id}
              href={`/receipts/${r.id}`}
              className="card hover:border-accent transition block"
            >
              <div className="text-sm font-medium truncate">{extraction?.merchant ?? "Unreadable"}</div>
              <div className="text-xs text-gray-400">{extraction?.date ?? "—"}</div>
              <div className="text-sm mt-2">
                {extraction ? `${extraction.currency} ${extraction.total}` : "—"}
              </div>
              <div
                className={`text-xs mt-1 ${
                  r.status === "confirmed" ? "text-income" : "text-yellow-400"
                }`}
              >
                {r.status}
              </div>
            </Link>
          );
        })}
        {!receipts?.length && (
          <p className="text-sm text-gray-400 col-span-full">No receipts yet. Upload your first one above.</p>
        )}
      </div>
    </div>
  );
}
