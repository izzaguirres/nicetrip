'use server'

import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/supabase-server'

export async function POST(request: Request) {
  const supabase = await supabaseServer()
  await supabase.auth.signOut()
  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return NextResponse.redirect(new URL('/admin/login', origin))
}
