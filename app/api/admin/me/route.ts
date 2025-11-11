import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/supabase-server'

export async function GET() {
  const supabase = await supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ user: null, isAdmin: false }, { status: 200 })
  }

  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
    },
    isAdmin: !!adminRecord,
  })
}
