import { NextResponse, type NextRequest } from "next/server";

import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";

async function signOut(request: NextRequest) {
  const supabase = await maybeCreateServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export async function GET(request: NextRequest) {
  return signOut(request);
}

export async function POST(request: NextRequest) {
  return signOut(request);
}
