import {createClient} from "@supabase/supabase-js";

const supabaseUrl = "https://vmbgiewsahcsovjgmwas.supabase.co";
const supabaseKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseKey);
