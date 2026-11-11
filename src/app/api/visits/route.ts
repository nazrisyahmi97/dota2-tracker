import { NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getTodayMalaysiaDate(): string {
  // Format YYYY-MM-DD in Asia/Kuala_Lumpur timezone
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ count: null });
  }

  try {
    const supabase = getServiceSupabase();
    const today = getTodayMalaysiaDate();

    const { data, error } = await supabase
      .from('daily_visits')
      .select('visit_count')
      .eq('visit_date', today)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ count: null, error: error.message });
    }

    return NextResponse.json({ count: data?.visit_count ?? 0, date: today });
  } catch {
    return NextResponse.json({ count: null });
  }
}

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ count: null });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('increment_daily_visit');

    if (error) {
      return NextResponse.json({ count: null, error: error.message });
    }

    return NextResponse.json({ count: data ?? 1 });
  } catch {
    return NextResponse.json({ count: null });
  }
}
