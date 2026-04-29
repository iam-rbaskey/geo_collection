import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Ensure they exist in the profiles table for the Admin Panel
    await supabase.from('profiles').upsert({
      id: user.id,
      username: user.email?.split('@')[0] || 'Player',
      level: user.user_metadata?.level || 1,
      points: user.user_metadata?.score || 0,
      energy: user.user_metadata?.energy || 100,
      charsUnlocked: user.user_metadata?.inventory?.length || 0,
      lastActive: new Date().toISOString()
    }, { onConflict: 'id' }).select();

    return NextResponse.json({ 
      score: user.user_metadata?.score || 0,
      level: user.user_metadata?.level || 1,
      levelXP: user.user_metadata?.levelXP || 0,
      energy: user.user_metadata?.energy || 100,
      selectedAvatarId: user.user_metadata?.selectedAvatarId,
      inventory: user.user_metadata?.inventory || [],
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error loading syncing user' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const { data: updatedUser, error } = await supabase.auth.updateUser({
      data: {
        score: body.score,
        level: body.level,
        levelXP: body.levelXP,
        energy: body.energy,
        selectedAvatarId: body.selectedAvatarId,
        inventory: body.inventory,
      }
    });

    if (error) {
      throw error;
    }

    // Upsert to profiles table so Admin Panel always has live data
    await supabase.from('profiles').upsert({
      id: user.id,
      username: user.email?.split('@')[0] || 'Player',
      level: body.level,
      points: body.score,
      energy: body.energy,
      charsUnlocked: body.inventory?.length || 0,
      lastActive: new Date().toISOString()
    }, { onConflict: 'id' }).select();

    return NextResponse.json({ message: 'Progress saved successfully', user: updatedUser.user });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving progress' }, { status: 500 });
  }
}
