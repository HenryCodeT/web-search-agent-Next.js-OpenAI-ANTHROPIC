# Testing Checklist

Use this checklist to ensure all features are working correctly.

## ✅ Pre-Deployment Testing

### Environment Setup
- [ ] `.env.local` file created with all required keys
- [ ] At least one LLM provider key configured (OpenAI or Anthropic)
- [ ] SerpApi key configured
- [ ] All dependencies installed (`npm install`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)

### Basic Functionality
- [ ] Development server starts without errors (`npm run dev`)
- [ ] Homepage loads at http://localhost:3000
- [ ] Chat UI renders correctly
- [ ] Provider toggle buttons work (OpenAI/Claude)
- [ ] Input field accepts text
- [ ] Send button is clickable

### OpenAI Integration (if configured)
- [ ] Select OpenAI provider
- [ ] Send a simple message: "Hello, who are you?"
- [ ] Agent responds without searching
- [ ] Response is coherent and matches system prompt

### Claude Integration (if configured)
- [ ] Select Claude provider
- [ ] Send a simple message: "Hello, who are you?"
- [ ] Agent responds without searching
- [ ] Response is coherent and matches system prompt

### Web Search Functionality
- [ ] Send query requiring current info: "What's the latest news about AI?"
- [ ] Agent triggers search (shows "🔍 Searched: ..." indicator)
- [ ] Search results are retrieved successfully
- [ ] Response includes cited sources with URLs
- [ ] URLs are valid and clickable (format: Title - URL)

### Conversation History
- [ ] Send multiple messages in sequence
- [ ] Agent maintains context from previous messages
- [ ] Clear button removes all messages
- [ ] New conversation starts fresh after clearing

### Error Handling
- [ ] Remove API key temporarily and test error message
- [ ] Restore API key
- [ ] Send message with empty input (should be prevented)
- [ ] Send very long message (should handle gracefully)
- [ ] Test with network disconnected (should show error)

### UI/UX Testing
- [ ] Messages auto-scroll to bottom
- [ ] Loading indicator appears while waiting
- [ ] Mobile responsive (test at 375px width)
- [ ] Tablet responsive (test at 768px width)
- [ ] Desktop responsive (test at 1920px width)
- [ ] Suggestion buttons populate input correctly
- [ ] Enter key sends message
- [ ] Shift+Enter creates new line (if implemented)

### Search Quality
- [ ] Test factual query: "What is the capital of France?"
- [ ] Should answer directly without search
- [ ] Test current event: "Who won the latest Super Bowl?"
- [ ] Should search and provide current answer
- [ ] Test ambiguous query: "Tell me about Python"
- [ ] Should provide relevant answer or search
- [ ] Test specific recent event: "SpaceX launch yesterday"
- [ ] Should search for current info

### Source Citations
- [ ] All search-based answers include sources
- [ ] Source format is: (Title - URL)
- [ ] URLs are not fabricated
- [ ] Sources are relevant to the query
- [ ] Multiple sources cited when appropriate

## 🚀 Deployment Testing

### Vercel Deployment
- [ ] Project builds successfully on Vercel
- [ ] Environment variables configured in Vercel
- [ ] Production URL loads correctly
- [ ] All features work in production
- [ ] HTTPS is working
- [ ] No console errors in browser

### Performance
- [ ] Initial page load < 3 seconds
- [ ] Message response time < 10 seconds
- [ ] Search response time < 15 seconds
- [ ] No memory leaks during extended use
- [ ] API rate limits respected

### Security
- [ ] API keys not exposed in browser
- [ ] No API keys in GitHub repository
- [ ] .env.local in .gitignore
- [ ] CORS configured correctly
- [ ] No sensitive data in logs

## 📊 Test Cases

### Test Case 1: Direct Answer
**Query**: "What is 2+2?"
**Expected**: Direct answer without search

### Test Case 2: Current Events
**Query**: "What happened in the news today?"
**Expected**: Search performed, cited sources

### Test Case 3: Recent Technology
**Query**: "What's new in Next.js 15?"
**Expected**: Search performed, technical details, sources

### Test Case 4: Specific Facts
**Query**: "When was the iPhone 15 released?"
**Expected**: Search performed, specific date, source

### Test Case 5: Multiple Queries
**Query 1**: "Tell me about Tesla"
**Query 2**: "What are their latest vehicle models?"
**Expected**: Context maintained, relevant search

### Test Case 6: Ambiguous Query
**Query**: "Who won?"
**Expected**: Request for clarification or relevant search

## 🐛 Known Issues Checklist

Document any issues found:

- [ ] Issue: _______________
  - Severity: High/Medium/Low
  - Steps to reproduce: _______________
  - Expected behavior: _______________
  - Actual behavior: _______________

## 📝 Notes

Add any additional notes about testing:

---

**Testing Date**: _______________
**Tester**: _______________
**Version**: _______________
**Environment**: Development / Production
**Browser**: _______________
**Results**: Pass / Fail
