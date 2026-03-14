"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=Could+not+authenticate+user");
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  if (error) {
    redirect("/signup?error=Could+not+create+account");
  }

  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    redirect(
      "/signup?error=An+account+with+this+email+already+exists.+Please+sign+in+instead."
    );
  }

  redirect("/login?message=Check+your+email+to+confirm+your+account");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login");
}
