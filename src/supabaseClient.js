import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cvbizxzgywlgpekqtdcu.supabase.co'; 
const supabaseKey = 'sb_publishable_Fa06rVn1z6lGKHlzjjtIZQ_LWjAUp1d'; 

// 🌟 Khởi tạo Supabase client hỗ trợ linh hoạt bộ nhớ lưu trữ phiên (Storage)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});