import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user is in allowed_users
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const { data: allowedUser } = await supabase
          .from("allowed_users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (allowedUser) {
          return NextResponse.redirect(`${origin}/`);
        }
      }

      // Not authorized — sign out and redirect
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=unauthorized`);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
