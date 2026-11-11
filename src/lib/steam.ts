export interface SteamDeveloperProfile {
  name: string;
  avatarUrl: string | null;
  profileUrl: string;
  onlineState: string;
  steamId64?: string;
}

const STEAM_PROFILE_URL = 'https://steamcommunity.com/id/badayie97/';
const STEAM_XML_URL = 'https://steamcommunity.com/id/badayie97/?xml=1';

function extractXmlValue(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Dynamically fetch live Steam persona name, avatar, and online status.
 * Automatically updates whenever the user changes their Steam name or profile picture.
 */
export async function getDeveloperSteamProfile(): Promise<SteamDeveloperProfile> {
  const fallback: SteamDeveloperProfile = {
    name: 'badayie97',
    avatarUrl: null,
    profileUrl: STEAM_PROFILE_URL,
    onlineState: 'offline',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(STEAM_XML_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AegisDota2Tracker/1.0',
      },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return fallback;
    }

    const xml = await res.text();
    const steamName = extractXmlValue(xml, 'steamID');
    const avatarFull = extractXmlValue(xml, 'avatarFull') || extractXmlValue(xml, 'avatarMedium');
    const onlineState = extractXmlValue(xml, 'onlineState') || 'offline';
    const steamId64 = extractXmlValue(xml, 'steamID64');

    if (!steamName) {
      return fallback;
    }

    return {
      name: steamName,
      avatarUrl: avatarFull || null,
      profileUrl: STEAM_PROFILE_URL,
      onlineState,
      steamId64: steamId64 || undefined,
    };
  } catch {
    return fallback;
  }
}
