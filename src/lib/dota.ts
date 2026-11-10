export interface DotaPatchSummary {
  patch_number: string;
  patch_name: string;
  patch_timestamp: number;
  patch_website?: string;
  patch_website_anchor?: string;
}

export interface DotaPatchDetail {
  patch_number: string;
  patch_name: string;
  patch_timestamp: number;
  heroes?: Array<{
    hero_id: number;
    hero_notes?: Array<{ note: string; icon?: string }>;
    abilities?: Array<{
      ability_id: number;
      ability_notes?: Array<{ note: string; aghanims?: string }>;
    }>;
  }>;
}

export interface DotaHeroStats {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  roles: string[];
  img: string;
  icon: string;
  pub_pick: number;
  pub_win: number;
  pro_pick?: number;
  pro_win?: number;
  winrate: number;
  dotabuff_url: string;
}

/**
 * Fetch list of all Dota 2 patches directly from Valve's official feed
 */
export async function getOfficialPatchList(): Promise<DotaPatchSummary[]> {
  try {
    const res = await fetch('https://www.dota2.com/datafeed/patchnoteslist');
    if (!res.ok) throw new Error(`Valve API returned status ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.patches)) {
      // Sort newest first
      return data.patches.reverse();
    }
    return [];
  } catch (error) {
    console.error('Error fetching patch list from Valve:', error);
    return [];
  }
}

/**
 * Fetch top picked heroes with stats and Dotabuff links from OpenDota API
 */
export async function getTopPickedHeroes(limit = 10): Promise<DotaHeroStats[]> {
  try {
    const res = await fetch('https://api.opendota.com/api/heroStats');
    if (!res.ok) throw new Error(`OpenDota API returned status ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    const heroes: DotaHeroStats[] = data
      .filter((h) => h.pub_pick > 0)
      .map((h) => {
        // e.g. "npc_dota_hero_anti_mage" -> "anti-mage"
        const slug = h.name
          .replace('npc_dota_hero_', '')
          .replace(/_/g, '-');

        const winrate = h.pub_pick > 0 ? Number(((h.pub_win / h.pub_pick) * 100).toFixed(1)) : 0;

        return {
          id: h.id,
          name: h.name,
          localized_name: h.localized_name,
          primary_attr: h.primary_attr,
          roles: h.roles || [],
          img: h.img ? `https://cdn.cloudflare.steamstatic.com${h.img}` : '',
          icon: h.icon ? `https://cdn.cloudflare.steamstatic.com${h.icon}` : '',
          pub_pick: h.pub_pick,
          pub_win: h.pub_win,
          pro_pick: h.pro_pick,
          pro_win: h.pro_win,
          winrate,
          dotabuff_url: `https://www.dotabuff.com/heroes/${slug}`,
        };
      })
      // Sort descending by total picks in current meta
      .sort((a, b) => b.pub_pick - a.pub_pick)
      .slice(0, limit);

    return heroes;
  } catch (error) {
    console.error('Error fetching hero stats:', error);
    return [];
  }
}
