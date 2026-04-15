import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente do arquivo .env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Lança um erro se as variáveis não estiverem definidas, para evitar problemas silenciosos.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As variáveis de ambiente REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY precisam ser definidas no arquivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase Client Initialized");