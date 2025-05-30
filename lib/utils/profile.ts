import { createClient } from "@/lib/supabase/client"

export async function ensureProfileExists() {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "No authenticated user" }
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating profile:", insertError)
        return { error: "Failed to create profile" }
      }

      return { success: true, created: true }
    } else if (profileError) {
      console.error("Error checking profile:", profileError)
      return { error: "Failed to check profile" }
    }

    return { success: true, created: false }
  } catch (error) {
    console.error("Unexpected error in ensureProfileExists:", error)
    return { error: "Unexpected error" }
  }
}
