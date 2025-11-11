import { getSupabaseServerClient } from '@/supabase/auth-helper'

export const supabaseServer = () => getSupabaseServerClient()
