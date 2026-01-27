import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kfovgnhkbkjfbubvlzrj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmb3ZnbmhrYmtqZmJ1YnZsenJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Njg2NTEsImV4cCI6MjA4NDU0NDY1MX0.mrFpeBHDZ4Hw7tymXGMMTafJNlyB_yS-Zxbdf9SNvWk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);