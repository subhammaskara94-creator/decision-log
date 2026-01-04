import { supabase } from "./supabaseClient";

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
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
