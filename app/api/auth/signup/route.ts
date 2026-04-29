import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          score: 0,
          level: 1,
          levelXP: 0,
          energy: 100,
        }
      }
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const newUser = data.user;
    if (!newUser) {
      return NextResponse.json({ message: 'User creation failed' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'User created successfully',
      user: { 
        email: newUser.email, 
        score: newUser.user_metadata?.score || 0, 
        level: newUser.user_metadata?.level || 1,
        levelXP: newUser.user_metadata?.levelXP || 0,
        energy: newUser.user_metadata?.energy || 100,
      }
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
