import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureDefaultCategories } from "@/lib/categories";

// Supabase redirects the magic-link click here with a PKCE `code`; exchange it for a
// session, seed default categories for brand-new users, then send them to the dashboard.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user) await ensureDefaultCategories(supabase, data.user.id);
  }
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
