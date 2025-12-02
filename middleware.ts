import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

const adminPrefix = '/admin'
const adminApiPrefix = '/api/admin'
const publicAdminRoutes = ['/admin/login', '/admin/logo.png']

const rateLimitStore = new Map<string, { count: number; expires: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const ADMIN_API_LIMIT = 60
const CONVERSION_API_LIMIT = 30

const getClientIp = (req: NextRequest) => {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || null
  return (req as any).ip || null
}

const isRateLimited = (key: string, limit: number, windowMs: number) => {
  const now = Date.now()
  const bucket = rateLimitStore.get(key)
  if (!bucket || bucket.expires < now) {
    rateLimitStore.set(key, { count: 1, expires: now + windowMs })
    return false
  }
  bucket.count += 1
  rateLimitStore.set(key, bucket)
  return bucket.count > limit
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminPage = pathname.startsWith(adminPrefix)
  const isAdminApi = pathname.startsWith(adminApiPrefix)
  const isConversionApi = pathname.startsWith('/api/events/conversion')

  if (!isAdminPage && !isAdminApi && !isConversionApi) {
    return NextResponse.next()
  }

  const ip = getClientIp(req) || 'anon'
  if (isAdminApi) {
    const key = `${ip}:admin-api`
    if (isRateLimited(key, ADMIN_API_LIMIT, RATE_LIMIT_WINDOW_MS)) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  if (isConversionApi) {
    const key = `${ip}:conversion-api`
    if (isRateLimited(key, CONVERSION_API_LIMIT, RATE_LIMIT_WINDOW_MS)) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const supabase = createMiddlewareClient(
    { req, res: response },
    {
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isPublicRoute = isAdminPage && publicAdminRoutes.includes(pathname)

  if (!session && !isPublicRoute) {
    if (isAdminApi) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/admin/login'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  const isAdmin = session
    ? await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session?.user.id)
        .maybeSingle()
        .then((res) => !!res.data)
    : false

  if (session && !isAdmin && !isPublicRoute) {
    if (isAdminApi) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/admin/login'
    redirectUrl.search = '?message=Sem%20permissão%20para%20acessar%20o%20admin'
    return NextResponse.redirect(redirectUrl)
  }

  if (session && isAdmin && pathname === '/admin/login') {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/admin'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/events/conversion'],
}
