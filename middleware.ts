// middleware.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function middleware(req:any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session && req.nextUrl.pathname.startsWith('/photos')) {
    return NextResponse.redirect('/login');
  }
  return NextResponse.next();
}
