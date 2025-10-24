# Future Enhancements Guide

This document provides ideas and implementation guidance for extending the Web Search Agent.

## 🔄 Retry Logic

### Problem
API calls can fail due to network issues or rate limits.

### Solution
Implement exponential backoff retry logic.

```typescript
// lib/utils/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Usage in searchTool.ts
const response = await retryWithBackoff(
  () => fetch(url),
  3,
  1000
);
```

---

## 🧠 Query Rewriting

### Problem
User queries may not be optimal for search engines.

### Solution
Add a query rewriting step before searching.

```typescript
// lib/tools/queryRewriter.ts
export async function rewriteQuery(
  originalQuery: string,
  provider: 'openai' | 'claude'
): Promise<string> {
  const prompt = `Rewrite this query to be more effective for web search. 
Keep it concise and specific. Only return the rewritten query, nothing else.

Original query: ${originalQuery}

Rewritten query:`;

  // Call LLM to rewrite
  const rewritten = await callLLM(prompt, provider);
  return rewritten.trim();
}

// Add to agent.ts before searching
const rewrittenQuery = await rewriteQuery(args.query, config.provider);
const searchResults = await searchWeb(rewrittenQuery, args.num_results || 5);
```

---

## 🪶 Streaming Responses

### Problem
Users wait for the entire response before seeing anything.

### Solution
Implement streaming responses using Server-Sent Events (SSE).

```typescript
// app/api/chat/stream/route.ts
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start async processing
  (async () => {
    try {
      // Stream chunks as they arrive
      for await (const chunk of getStreamingResponse(message)) {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
        );
      }
      await writer.close();
    } catch (error) {
      await writer.abort(error);
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Update ChatUI.tsx to handle streaming
const eventSource = new EventSource('/api/chat/stream');
eventSource.onmessage = (event) => {
  const { chunk } = JSON.parse(event.data);
  // Append chunk to current message
};
```

---

## 🌎 Multi-Engine Search

### Problem
Single search engine may miss relevant results.

### Solution
Search multiple engines and aggregate results.

```typescript
// lib/tools/multiSearch.ts
export async function multiSearch(
  query: string,
  numResults: number = 5
): Promise<SearchResponse> {
  const [serpResults, bingResults] = await Promise.allSettled([
    searchSerpApi(query, numResults),
    searchBing(query, numResults),
  ]);

  // Merge and deduplicate results
  const allResults = [
    ...(serpResults.status === 'fulfilled' ? serpResults.value.results : []),
    ...(bingResults.status === 'fulfilled' ? bingResults.value.results : []),
  ];

  // Remove duplicates by URL
  const uniqueResults = Array.from(
    new Map(allResults.map(r => [r.url, r])).values()
  ).slice(0, numResults);

  return {
    results: uniqueResults,
    query,
    timestamp: new Date().toISOString(),
  };
}

async function searchBing(query: string, num: number) {
  const apiKey = process.env.BING_API_KEY;
  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${num}`;
  
  const response = await fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey! },
  });
  
  const data = await response.json();
  // Transform to standard format
}
```

---

## 📊 Analytics

### Problem
No visibility into usage patterns and performance.

### Solution
Add lightweight analytics tracking.

```typescript
// lib/analytics/tracker.ts
export class AnalyticsTracker {
  async trackQuery(data: {
    query: string;
    provider: string;
    searchPerformed: boolean;
    responseTime: number;
    success: boolean;
  }) {
    // Log to file or database
    console.log('[ANALYTICS]', {
      timestamp: new Date().toISOString(),
      ...data,
    });
    
    // Optional: Send to analytics service
    if (process.env.ANALYTICS_ENDPOINT) {
      await fetch(process.env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  }
}

// Use in agent.ts
const startTime = Date.now();
const response = await handleUserMessage(message, history, config);
const responseTime = Date.now() - startTime;

await analytics.trackQuery({
  query: message,
  provider: config.provider,
  searchPerformed: response.searchPerformed,
  responseTime,
  success: true,
});
```

---

## 💾 Response Caching

### Problem
Repeated queries waste API calls and time.

### Solution
Cache responses for common queries.

```typescript
// lib/cache/simple-cache.ts
interface CacheEntry {
  response: string;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry>();
  
  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.response;
  }
  
  set(key: string, response: string, ttl: number = 3600000) {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl,
    });
  }
}

export const cache = new SimpleCache();

// Use in agent.ts
const cacheKey = `${provider}:${message}`;
const cached = cache.get(cacheKey);
if (cached) return { content: cached, searchPerformed: false };

// ... perform search and generate response ...

cache.set(cacheKey, response.content);
```

---

## 🔐 User Authentication

### Problem
No user accounts or personalization.

### Solution
Add authentication using NextAuth.js.

```bash
npm install next-auth
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.userId = token.sub;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Update ChatUI to require auth
import { useSession } from 'next-auth/react';

export default function ChatUI() {
  const { data: session, status } = useSession({ required: true });
  
  if (status === 'loading') return <div>Loading...</div>;
  
  // Render chat UI
}
```

---

## 💬 Conversation Persistence

### Problem
Conversations are lost on page refresh.

### Solution
Store conversations in database or localStorage.

```typescript
// lib/storage/conversations.ts
export class ConversationStorage {
  saveConversation(userId: string, messages: Message[]) {
    localStorage.setItem(
      `conversation:${userId}`,
      JSON.stringify({
        messages,
        timestamp: Date.now(),
      })
    );
  }
  
  loadConversation(userId: string): Message[] {
    const stored = localStorage.getItem(`conversation:${userId}`);
    if (!stored) return [];
    
    const { messages, timestamp } = JSON.parse(stored);
    
    // Expire after 24 hours
    if (Date.now() - timestamp > 86400000) {
      return [];
    }
    
    return messages;
  }
}

// Use in ChatUI.tsx
useEffect(() => {
  const storage = new ConversationStorage();
  const loaded = storage.loadConversation(userId);
  setMessages(loaded);
}, [userId]);

useEffect(() => {
  const storage = new ConversationStorage();
  storage.saveConversation(userId, messages);
}, [messages, userId]);
```

---

## 🎨 Custom Themes

### Problem
Users want personalization options.

### Solution
Add theme switching capability.

```typescript
// components/ThemeProvider.tsx
'use client';
import { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: 'light', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Update tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ... rest of config
};
```

---

## 📱 Mobile App

### Problem
Users want native mobile experience.

### Solution
Convert to React Native using Expo.

```bash
npx create-expo-app mobile-search-agent
cd mobile-search-agent
npm install axios @react-native-async-storage/async-storage
```

```typescript
// App.tsx
import { View, TextInput, Button, FlatList } from 'react-native';
import axios from 'axios';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  async function sendMessage() {
    const response = await axios.post(
      'https://your-api.vercel.app/api/chat',
      { message: input, history: messages }
    );
    
    setMessages([...messages, 
      { role: 'user', content: input },
      { role: 'assistant', content: response.data.content }
    ]);
  }
  
  // Render UI
}
```

---

## 🎯 Specialized Agents

### Problem
One agent tries to do everything.

### Solution
Create specialized agents for different domains.

```typescript
// lib/agents/specialized.ts
export const AGENT_CONFIGS = {
  research: {
    systemPrompt: 'You are a research assistant specializing in academic sources...',
    searchBias: 'scholarly articles',
  },
  news: {
    systemPrompt: 'You are a news analyst focusing on recent events...',
    searchBias: 'news articles',
  },
  tech: {
    systemPrompt: 'You are a technical assistant specializing in programming...',
    searchBias: 'technical documentation',
  },
};

export function getSpecializedAgent(type: keyof typeof AGENT_CONFIGS) {
  const config = AGENT_CONFIGS[type];
  return createAgent(config);
}
```

---

## 📈 Usage Dashboard

### Problem
No visibility into app usage and costs.

### Solution
Create an admin dashboard.

```typescript
// app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Usage Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Queries" value={stats?.totalQueries} />
        <StatCard title="Searches Performed" value={stats?.searches} />
        <StatCard title="Avg Response Time" value={`${stats?.avgTime}ms`} />
      </div>
      
      {/* Charts and graphs */}
    </div>
  );
}
```

---

## 🔍 Advanced Search Features

### Ideas for Enhancement

1. **Image Search**: Add ability to search for and display images
2. **Video Search**: Search and embed YouTube videos
3. **News Search**: Dedicated news search with filters
4. **Shopping Search**: Product search with prices
5. **Local Search**: Location-based search results
6. **Academic Search**: Google Scholar integration
7. **Code Search**: GitHub/StackOverflow integration

---

## 🚀 Performance Optimizations

### Ideas

1. **Edge Functions**: Deploy API routes as edge functions
2. **CDN Caching**: Cache static assets on CDN
3. **Database**: Use Redis for caching, Postgres for persistence
4. **Connection Pooling**: Reuse HTTP connections
5. **Lazy Loading**: Load components on demand
6. **Code Splitting**: Split bundles by route
7. **Image Optimization**: Use Next.js Image component

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI Cookbook](https://cookbook.openai.com/)
- [Anthropic Documentation](https://docs.anthropic.com/)
- [Vercel Guides](https://vercel.com/guides)
- [React Patterns](https://reactpatterns.com/)

---

Choose enhancements based on your specific needs and user feedback. Start small and iterate!
