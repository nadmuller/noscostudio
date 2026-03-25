import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import type { Timeline } from "@/lib/types";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: timelines } = await supabase
    .from("timelines")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <>
      <Navbar
        timelines={(timelines as Timeline[]) || []}
        userEmail={user?.email || ""}
      />
      {children}
    </>
  );
}
