export interface RedditPost {
  id: string;
  title: string;
  author: string;
  link: string;
  published: string;
  excerpt?: string;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#32;/g, ' ');
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*\\/?>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Fetch the top popular posts from r/DotA2 over the past 7 days using Reddit's free RSS/Atom feed
 */
export async function getTopWeeklyRedditPosts(limit = 3): Promise<RedditPost[]> {
  try {
    const res = await fetch(`https://www.reddit.com/r/DotA2/top.rss?t=week&limit=${limit}`, {
      headers: {
        'User-Agent': 'web:aegis-dota2-tracker:v1.0.0 (by /u/aegis_tracker)',
        Accept: 'application/atom+xml, application/xml, text/xml',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`Reddit RSS returned status ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) || [];

    return entries.slice(0, limit).map((entry) => {
      const id = extractTag(entry, 'id');
      const rawTitle = extractTag(entry, 'title');
      const title = decodeHtmlEntities(rawTitle);

      const authorBlock = extractTag(entry, 'author');
      const author = decodeHtmlEntities(extractTag(authorBlock, 'name')) || 'Redditor';

      const link = extractAttr(entry, 'link', 'href') || 'https://www.reddit.com/r/DotA2/top/?t=week';
      const published = extractTag(entry, 'published') || extractTag(entry, 'updated');

      // Extract a clean short excerpt from HTML content if text exists
      const rawContent = decodeHtmlEntities(extractTag(entry, 'content'));
      const mdMatch = rawContent.match(/<div class="md">([\s\S]*?)<\/div>/i);
      let excerpt = '';
      if (mdMatch) {
        excerpt = mdMatch[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (excerpt.length > 140) {
          excerpt = excerpt.slice(0, 137) + '...';
        }
      }

      return {
        id,
        title,
        author,
        link,
        published,
        excerpt: excerpt || undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching Reddit r/DotA2 RSS:', error);
    return [];
  }
}
