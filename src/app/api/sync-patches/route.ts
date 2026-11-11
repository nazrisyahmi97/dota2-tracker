import { NextRequest, NextResponse } from 'next/server';
import { getOfficialPatchList } from '@/lib/dota';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// 30-minute minimum cooldown between database syncs
const COOLDOWN_MINUTES = 30;

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Supabase credentials are not configured in .env.local yet.' },
        { status: 400 }
      );
    }

    // 1. Security Check: Admin Secret or Vercel Cron Header
    const adminSecret = process.env.ADMIN_SYNC_SECRET || 'dota2-admin-secret';
    const authHeader = req.headers.get('authorization');
    const secretQuery = req.nextUrl.searchParams.get('secret');
    const customHeader = req.headers.get('x-admin-secret');

    const isCron =
      (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
      req.headers.get('user-agent')?.includes('vercel-cron');
    const isAdmin = customHeader === adminSecret || secretQuery === adminSecret;

    if (!isAdmin && !isCron) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin secret required to trigger sync.' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // 2. Cooldown Check: Prevent spamming even if secret is known
    const { data: latestRecords } = await supabase
      .from('patches')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (latestRecords && latestRecords.length > 0) {
      const lastSyncTime = new Date(latestRecords[0].updated_at).getTime();
      const elapsedMinutes = (Date.now() - lastSyncTime) / (1000 * 60);

      if (elapsedMinutes < COOLDOWN_MINUTES) {
        const remainingMinutes = Math.ceil(COOLDOWN_MINUTES - elapsedMinutes);
        return NextResponse.json({
          success: true,
          skipped: true,
          message: `Database is already up to date. Next sync available in ${remainingMinutes} min.`,
        });
      }
    }

    // 3. Fetch official patches from Valve
    const valvePatches = await getOfficialPatchList();
    if (!valvePatches || valvePatches.length === 0) {
      return NextResponse.json({ success: false, message: 'No patches retrieved from Valve API' }, { status: 502 });
    }

    // 4. Prepare records for Supabase upsert (take latest 50 patches)
    const records = valvePatches.slice(0, 50).map((patch) => ({
      id: patch.patch_number,
      patch_number: patch.patch_number,
      patch_name: patch.patch_name,
      patch_timestamp: patch.patch_timestamp,
      release_date: new Date(patch.patch_timestamp * 1000).toISOString(),
      raw_data: patch,
      updated_at: new Date().toISOString(),
    }));

    // 5. Upsert into Supabase patches table
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

// GET endpoint: runs sync when triggered by Vercel Cron, otherwise returns DB status
export async function GET(req: NextRequest) {
  const isCronTrigger =
    req.headers.get('user-agent')?.includes('vercel-cron') ||
    (process.env.CRON_SECRET && req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`);

  if (isCronTrigger) {
    return POST(req);
  }

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
