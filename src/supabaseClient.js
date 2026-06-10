import { createClient } from '@supabase/supabase-js';

// Acessa as variáveis de ambiente corretas usando o Vite (import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis de ambiente foram carregadas corretamente
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam ser definidas no arquivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase Client Initialized");