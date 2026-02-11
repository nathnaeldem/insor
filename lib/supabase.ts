import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Proposal {
    id: string;
    location_lat: number;
    location_lng: number;
    location_name: string;
    hint: string;
    question: string;
    yes_message: string;
    no_message: string;
    created_at: string;
    response?: 'yes' | 'no' | null;
    responded_at?: string;
    is_paid?: boolean;
    video_url?: string | null;
}
