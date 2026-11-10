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
    subsections?: Array<{
      title: string;
      style?: string;
      facet?: string;
      abilities?: Array<{
        ability_id: number;
        ability_notes?: Array<{ note: string }>;
      }>;
    }>;
  }>;
  items?: Array<{
    ability_id: number;
    ability_notes?: Array<{ note: string }>;
  }>;
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
 * Fetch detailed notes for a specific patch version (e.g. "7.37e")
 */
export async function getOfficialPatchDetails(version: string): Promise<DotaPatchDetail | null> {
  try {
    const res = await fetch(`https://www.dota2.com/datafeed/patchnotes?version=${encodeURIComponent(version)}`);
    if (!res.ok) throw new Error(`Valve API returned status ${res.status}`);
    const data = await res.json();
    if (data.success) {
      return data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching patch notes for ${version}:`, error);
    return null;
  }
}
