import { supabase } from "./supabaseClient";

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "http://localhost:3000",
    },
  });

  if (error) {
    console.error(error);
    throw error;
  }
}


export async function signOut() {
  await supabase.auth.signOut();
}
