import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://spbykncvncytupngfuxp.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
