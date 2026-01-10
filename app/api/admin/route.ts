import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Setup Admin Client (Guna Service Role Key - Kuasa Penuh)
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const body = await req.json();
    const { email, password, fullName, role, modules } = body;

    // 1. Create User dalam Supabase Auth
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto verify supaya tak payah klik email
      user_metadata: { full_name: fullName }
    });

    if (createError) throw createError;

    if (user.user) {
      // 2. Update Profile dengan Role & Permission
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.user.id,
          full_name: fullName,
          role: role,
          allowed_modules: modules, // Array string cth: ['posts', 'media']
          updated_at: new Date()
        });

      if (profileError) throw profileError;
    }

    return NextResponse.json({ message: 'User berjaya dicipta!' });

  } catch (error: any) {
    console.error('Error create user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}