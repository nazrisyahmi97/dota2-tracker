import { NextResponse } from 'next/server';
import { getOfficialPatchList } from '@/lib/dota';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Supabase credentials are not configured in .env.local yet.',
      }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // 1. Fetch official patches from Valve
    const valvePatches = await getOfficialPatchList();
    if (!valvePatches || valvePatches.length === 0) {
      return NextResponse.json({ success: false, message: 'No patches retrieved from Valve API' }, { status: 502 });
    }

    // 2. Prepare records for Supabase upsert (take latest 50 patches)
    const records = valvePatches.slice(0, 50).map((patch) => ({
      id: patch.patch_number,
      patch_number: patch.patch_number,
      patch_name: patch.patch_name,
      patch_timestamp: patch.patch_timestamp,
      release_date: new Date(patch.patch_timestamp * 1000).toISOString(),
      raw_data: patch,
      updated_at: new Date().toISOString(),
    }));

    // 3. Upsert into Supabase patches table
    const { data, error } = await supabase
      .from('patches')
      .upsert(records, { onConflict: 'patch_number' })
      .select('patch_number');

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${data?.length || 0} patches to Supabase!`,
      syncedCount: data?.length || 0,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ connected: false, message: 'Supabase credentials not configured' });
    }
    const supabase = getServiceSupabase();
    const { count, error } = await supabase.from('patches').select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ connected: false, error: error.message });
    }

    return NextResponse.json({ connected: true, totalPatchesInDb: count ?? 0 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ connected: false, error: errorMessage });
  }
}
