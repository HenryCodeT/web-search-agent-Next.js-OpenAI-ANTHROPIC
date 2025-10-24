/**
 * Web Search Tool
 * 
 * Performs real-time web searches using SerpApi (Google Search API wrapper)
 * Returns structured results with title, snippet, and URL
 */

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  timestamp: string;
}

/**
 * Search the web for information
 * 
 * @param query - The search query string
 * @param numResults - Maximum number of results to return (default: 5)
 * @returns Promise with search results
 */
export async function searchWeb(
  query: string,
  numResults: number = 5
): Promise<SearchResponse> {
  const apiKey = process.env.SERPAPI_KEY;
  
  if (!apiKey) {
    throw new Error('SERPAPI_KEY environment variable is not set');
  }

  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      query
    )}&num=${numResults}&api_key=${apiKey}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`SerpApi request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle case where no results are found
    if (!data.organic_results || data.organic_results.length === 0) {
      return {
        results: [],
        query,
        timestamp: new Date().toISOString(),
      };
    }

    // Extract and format results
    const results: SearchResult[] = data.organic_results
      .slice(0, numResults)
      .map((result: any) => ({
        title: result.title || 'Untitled',
        snippet: result.snippet || 'No description available',
        url: result.link || '',
      }))
      .filter((result: SearchResult) => result.url); // Filter out results without URLs

    return {
      results,
      query,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Failed to search web: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format search results for LLM consumption
 * 
 * @param searchResponse - The search response object
 * @returns Formatted string for LLM
 */
export function formatSearchResults(searchResponse: SearchResponse): string {
  if (searchResponse.results.length === 0) {
    return `No results found for query: "${searchResponse.query}"`;
  }

  const formattedResults = searchResponse.results
    .map((result, index) => {
      return `[${index + 1}] ${result.title}\n${result.snippet}\nURL: ${result.url}`;
    })
    .join('\n\n');

  return `Search results for "${searchResponse.query}":\n\n${formattedResults}`;
}
