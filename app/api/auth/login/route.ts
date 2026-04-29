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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    const user = data.user;

    return NextResponse.json({ 
      message: 'Logged in successfully',
      userData: {
        score: user.user_metadata?.score || 0,
        level: user.user_metadata?.level || 1,
        levelXP: user.user_metadata?.levelXP || 0,
        energy: user.user_metadata?.energy || 100,
        selectedAvatarId: user.user_metadata?.selectedAvatarId,
        inventory: user.user_metadata?.inventory || [],
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
