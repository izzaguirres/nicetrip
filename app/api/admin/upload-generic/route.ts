import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseServer } from '@/app/supabase-server'

const DEFAULT_BUCKET = 'hotel-images'

async function ensureAdmin() {
  const authClient = await supabaseServer()
  const {
    data: { session },
    error,
  } = await authClient.auth.getSession()
  if (error) throw error
  if (!session) {
    throw new Error('Unauthorized')
  }
  // Verificação simplificada de admin (já feita pelo middleware na rota /admin)
  // Mas como é upload, dupla checagem é boa.
  return session.user.id
}

async function ensureBucket(client: ReturnType<typeof createClient>, bucketName: string) {
  const { data: bucket } = await client.storage.getBucket(bucketName)
  if (bucket) return
  const { error } = await client.storage.createBucket(bucketName, { public: true })
  if (error && !error.message?.includes('already exists')) {
    console.error('Error creating bucket:', error)
    // Não falhar se erro for permissão, tentar upload mesmo assim
  }
}

export async function POST(request: Request) {
  try {
    await ensureAdmin()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Tentar Service Role (Admin total) -> Fallback para Anon Key (RLS)
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração de servidor incompleta: Faltam chaves do Supabase')
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const bucketName = (formData.get('bucket') as string) || DEFAULT_BUCKET
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Arquivo inválido' }, { status: 400 })
    }

    const client = createClient(supabaseUrl, supabaseKey)
    await ensureBucket(client, bucketName)

    // Sanitizar nome e criar path único
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9\.-]/g, '_')
    const path = `${folder}/${Date.now()}-${sanitizedName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await client.storage.from(bucketName).upload(path, buffer, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })

    if (uploadError) throw uploadError

    const { data } = client.storage.from(bucketName).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Erro no upload'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
