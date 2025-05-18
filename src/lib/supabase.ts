import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

// Create a single supabase client for the entire app
export const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const BUCKET_NAME = "auction-items";
