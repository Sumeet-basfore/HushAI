import { NextRequest, NextResponse } from 'next/server';

const SEARCH1API_KEY = process.env.SEARCH1API_KEY;
const SEARCH1API_URL = 'https://api.search1api.com/search';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

interface SourceType {
  id: string;
  name: string;
  queryModifier?: string;
}

const SOURCE_TYPES: SourceType[] = [
  { id: 'reddit', name: 'Reddit', queryModifier: 'site:reddit.com' },
  { id: 'twitter', name: 'Twitter/X', queryModifier: 'site:twitter.com OR site:x.com' },
  { id: 'news', name: 'News Sites' },
  { id: 'blogs', name: 'Blogs', queryModifier: 'site:medium.com OR site:substack.com OR site:wordpress.com' },
  { id: 'youtube', name: 'YouTube', queryModifier: 'site:youtube.com' },
  { id: 'academic', name: 'Academic', queryModifier: 'site:scholar.google.com OR site:arxiv.org' },
  { id: 'tiktok', name: 'TikTok', queryModifier: 'site:tiktok.com' },
  { id: 'forums', name: 'Forums', queryModifier: 'site:quora.com OR site:stackexchange.com' },
  { id: 'ecommerce', name: 'E-commerce', queryModifier: '(site:amazon.com OR site:ebay.com) review' },
];

async function searchWithSearch1API(query: string, sourceTypes: string[]): Promise<SearchResult[]> {
  if (!SEARCH1API_KEY) {
    throw new Error('SEARCH1API_KEY not configured');
  }

  const results: SearchResult[] = [];
  const resultsPerSource = Math.ceil(10 / sourceTypes.length);

  for (const sourceId of sourceTypes) {
    const source = SOURCE_TYPES.find(s => s.id === sourceId);
    if (!source) continue;

    const modifiedQuery = source.queryModifier 
      ? `${query} ${source.queryModifier}`
      : query;

    try {
      const response = await fetch(SEARCH1API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEARCH1API_KEY}`,
        },
        body: JSON.stringify({
          query: modifiedQuery,
          max_results: resultsPerSource,
        }),
      });

      if (!response.ok) {
        console.warn(`Search1API error for ${source.name}:`, response.status);
        continue;
      }

      const data = await response.json();
      
      interface Search1ApiResult {
        title?: string;
        link?: string;
        url?: string;
        snippet?: string;
        description?: string;
      }
      
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((result: Search1ApiResult) => {
          results.push({
            title: result.title || 'Untitled',
            link: result.link || result.url || '#',
            snippet: result.snippet || result.description || '',
            source: source.name,
          });
        });
      }
    } catch (error) {
      console.error(`Error searching ${source.name}:`, error);
    }
  }

  return results.slice(0, 10);
}

async function searchWithDuckDuckGo(query: string, sourceTypes: string[]): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    // Use DuckDuckGo Lite (HTML only, no JS, simpler structure)
    // It's more stable for scraping than the main HTML site
    const response = await fetch(`https://lite.duckduckgo.com/lite/`, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `q=${encodeURIComponent(query)}&kl=us-en`,
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo search failed: ${response.status}`);
    }

    const html = await response.text();
    console.log(`DuckDuckGo Lite returned ${html.length} bytes of HTML`);
    
    // Parse Lite HTML
    // Structure: <a class="result-link" href="...">Title</a> ... <td class="result-snippet">Snippet</td>
    
    const linkRegex = /<a[^>]*class="result-link"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
    const snippetRegex = /<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/g;
    
    const links: {url: string, title: string}[] = [];
    const snippets: string[] = [];
    
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push({
        url: match[1],
        title: match[2].replace(/<[^>]*>/g, '').trim()
      });
    }
    
    while ((match = snippetRegex.exec(html)) !== null) {
      snippets.push(match[1].replace(/<[^>]*>/g, '').trim());
    }
    
    // Combine
    for (let i = 0; i < Math.min(links.length, 15); i++) {
      const { url, title } = links[i];
      const snippet = snippets[i] || '';
      
      // Determine source type from URL
      let source = 'Web';
      if (url.includes('reddit.com')) source = 'Reddit';
      else if (url.includes('twitter.com') || url.includes('x.com')) source = 'Twitter/X';
      else if (url.includes('youtube.com')) source = 'YouTube';
      else if (url.includes('medium.com') || url.includes('substack.com')) source = 'Blogs';
      else if (url.includes('quora.com')) source = 'Forums';
      else if (url.includes('news') || url.includes('bbc.com') || url.includes('cnn.com')) source = 'News Sites';

      // Filter logic
       const sourceMatch = sourceTypes.some(typeId => {
        const type = SOURCE_TYPES.find(s => s.id === typeId);
        if (!type) return false;
        // Match by source name or URL patterns
        if (source === type.name) return true;
        if (type.id === 'reddit' && url.includes('reddit.com')) return true;
        if (type.id === 'twitter' && (url.includes('twitter.com') || url.includes('x.com'))) return true;
        if (type.id === 'youtube' && url.includes('youtube.com')) return true;
        if (type.id === 'blogs' && (url.includes('medium.com') || url.includes('substack.com') || url.includes('wordpress.com'))) return true;
        if (type.id === 'forums' && (url.includes('quora.com') || url.includes('stackexchange.com'))) return true;
        if (type.id === 'news' && (url.includes('news') || url.includes('bbc.com') || url.includes('cnn.com'))) return true;
        return false;
      });

      if (sourceMatch || sourceTypes.length === 0 || sourceTypes.includes('web') || results.length < 3) {
        results.push({ title, link: url, snippet, source });
      }
    }
    
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const { query, sourceTypes } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!sourceTypes || !Array.isArray(sourceTypes) || sourceTypes.length === 0) {
      return NextResponse.json(
        { error: 'At least one source type must be selected' },
        { status: 400 }
      );
    }

    let results: SearchResult[] = [];

    // Try Search1API first if key is available
    if (SEARCH1API_KEY) {
      try {
        results = await searchWithSearch1API(query, sourceTypes);
        console.log(`Search1API returned ${results.length} results`);
      } catch (error) {
        console.warn('Search1API failed, falling back to DuckDuckGo:', error);
      }
    } else {
      console.log('No SEARCH1API_KEY configured, using DuckDuckGo fallback');
    }

    // Fallback to DuckDuckGo if Search1API fails or returns no results
    if (results.length === 0) {
      console.log('Falling back to DuckDuckGo search...');
      results = await searchWithDuckDuckGo(query, sourceTypes);
      console.log(`DuckDuckGo returned ${results.length} results`);
    }

    if (results.length === 0) {
      // Provide more context about why search failed
      let errorMessage = 'No results found. Try different keywords or source types.';
      if (!SEARCH1API_KEY) {
        errorMessage += ' (Search1API key not configured)';
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        query,
        sources: sourceTypes,
        results,
        total: results.length,
      },
    });

  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Research failed' },
      { status: 500 }
    );
  }
}