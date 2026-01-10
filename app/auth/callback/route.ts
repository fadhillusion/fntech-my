import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Kalau ada parameter 'next', kita hantar ke situ. Kalau takde, terus ke admin
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // TUKAR KOD JADI SESSION (PENTING!)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Berjaya! Redirect masuk ke Admin
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Kalau gagal, balik ke login
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}