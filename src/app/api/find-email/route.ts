import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!serviceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not set — /api/find-email will not work without it.');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username } = body;
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Assumes a `profiles` table exists with columns: id (auth uid), username, email
    const { data, error } = await admin
      .from('profiles')
      .select('email')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('[find-email] Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!data || !data.email) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    return NextResponse.json({ found: true, email: data.email });
  } catch (err) {
    console.error('[find-email] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
