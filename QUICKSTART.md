# Quick Reference Guide

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your API keys

# 3. Check environment
node scripts/check-env.js

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:3000
```

## 📁 Project Structure

```
web-search-agent/
├── app/                    # Next.js App Router
│   ├── api/chat/          # Chat API endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ChatUI.tsx         # Main chat interface
├── lib/                   # Core logic
│   ├── agent.ts          # Agent orchestration
│   └── tools/            # Tool implementations
│       └── searchTool.ts # Web search
├── scripts/              # Utility scripts
└── styles/               # Global styles
```

## 🔑 Environment Variables

```bash
# Required
SERPAPI_KEY=your_key_here

# At least one required
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## 💻 NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Type check TypeScript
```

## 🔧 Common Tasks

### Add a New Tool

1. Create tool in `lib/tools/yourTool.ts`
2. Define tool schema
3. Implement tool function
4. Add to agent's tool list in `lib/agent.ts`

### Change System Prompt

Edit `SYSTEM_PROMPT` in `lib/agent.ts`

### Add New Provider

1. Install SDK: `npm install provider-sdk`
2. Add handler in `lib/agent.ts`
3. Update types and interfaces

### Customize UI

Edit `components/ChatUI.tsx` and `styles/globals.css`

## 🐛 Troubleshooting

### "API key not configured"
→ Check `.env.local` exists and has correct keys

### Module not found
→ Run `npm install`

### Build fails
→ Run `npm run type-check` to see errors

### Search not working
→ Verify SERPAPI_KEY is valid

### Rate limit errors
→ Check API usage quotas

## 📊 File Sizes (Approximate)

- `lib/agent.ts`: ~200 lines
- `lib/tools/searchTool.ts`: ~100 lines
- `components/ChatUI.tsx`: ~250 lines
- `app/api/chat/route.ts`: ~80 lines

## 🔗 Quick Links

- [Full README](README.md)
- [API Documentation](API.md)
- [Testing Guide](TESTING.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Enhancement Ideas](ENHANCEMENTS.md)

## 📝 Code Snippets

### Send Message (Frontend)
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, history }),
});
const data = await response.json();
```

### Execute Search (Backend)
```typescript
const results = await searchWeb(query, numResults);
const formatted = formatSearchResults(results);
```

### Switch Provider
```typescript
const config = { provider: 'claude', model: 'claude-sonnet-4-20250514' };
const response = await handleUserMessage(message, history, config);
```

## 🎯 Best Practices

1. Always validate user input
2. Handle errors gracefully
3. Show loading states
4. Cache when possible
5. Log for debugging
6. Test before deploying
7. Monitor API usage
8. Keep secrets secure

## 📞 Getting Help

1. Check documentation files
2. Review error messages carefully
3. Check API provider status pages
4. Search GitHub issues
5. Ask in community forums

---

**Remember**: Start simple, test thoroughly, deploy confidently! 🚀
