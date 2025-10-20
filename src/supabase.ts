import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hfsfjspmjqyfgiqlrftr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc2Zqc3BtanF5ZmdpcWxyZnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MTk5MTMsImV4cCI6MjA3NjQ5NTkxM30.vbmae8uTlrxuawayYjOJfgHMFUi6S08YuMnJy2rp5QM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
