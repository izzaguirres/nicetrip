import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseServer } from '@/app/supabase-server'

const BUCKET_NAME = 'admin-avatars'

async function ensureAdminUser() {
  const client = await supabaseServer()
  const {
    data: { session },
    error,
  } = await client.auth.getSession()
  if (error) throw error
  if (!session) throw new Error('Unauthorized')

  const { data: adminRecord, error: adminError } = await client
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle()
  if (adminError) throw adminError
  if (!adminRecord) throw new Error('Forbidden')
  return session.user.id
}

async function ensureBucket(client: ReturnType<typeof createClient>) {
  const { data: bucket } = await client.storage.getBucket(BUCKET_NAME)
  if (bucket) return
  const { error } = await client.storage.createBucket(BUCKET_NAME, { public: true })
  if (error && !error.message?.includes('already exists')) {
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const userId = await ensureAdminUser()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase não configurado para uploads')
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Arquivo inválido' }, { status: 400 })
    }

    const client = createClient(supabaseUrl, serviceRoleKey)
    await ensureBucket(client)

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9\.]/g, '_') || 'avatar.jpg'
    const path = `${userId}/${Date.now()}-${sanitizedName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await client.storage.from(BUCKET_NAME).upload(path, buffer, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })
    if (uploadError) throw uploadError

    const { data } = client.storage.from(BUCKET_NAME).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro no upload'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
