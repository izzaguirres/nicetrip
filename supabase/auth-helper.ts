import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // throw new Error('Supabase credentials are missing')
    // Retorna cliente com placeholder para não quebrar build estático
    return createServerComponentClient({ cookies: () => cookieStore }, {
        supabaseUrl: 'https://placeholder.supabase.co',
        supabaseKey: 'placeholder',
    })
  }

  return createServerComponentClient({ cookies: () => cookieStore }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
}
