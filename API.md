# API Documentation

## Overview

The Web Search Agent provides a RESTful API for chat interactions with AI-powered web search capabilities.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-app.vercel.app/api`

## Authentication

Currently, no authentication is required. For production deployments, consider implementing:
- API key authentication
- Rate limiting
- User authentication (OAuth, JWT)

---

## Endpoints

### POST `/api/chat`

Send a message to the AI agent and receive a response.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "message": "string (required)",
  "history": "array of Message objects (optional)",
  "provider": "string: 'openai' | 'claude' (optional, default: 'openai')",
  "model": "string (optional)"
}
```

**Message Object:**
```typescript
{
  role: 'user' | 'assistant';
  content: string;
}
```

**Example Request:**
```json
{
  "message": "What's the latest news about AI?",
  "history": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you today?"
    }
  ],
  "provider": "openai"
}
```

#### Response

**Success Response (200 OK):**
```json
{
  "content": "string - The AI's response",
  "searchPerformed": "boolean - Whether web search was used",
  "searchQuery": "string (optional) - The search query if search was performed"
}
```

**Example Success Response:**
```json
{
  "content": "Based on recent developments, AI continues to advance rapidly. According to TechCrunch (https://techcrunch.com/ai-news), major breakthroughs include...",
  "searchPerformed": true,
  "searchQuery": "latest AI news 2025"
}
```

**Error Response (400 Bad Request):**
```json
{
  "content": "",
  "searchPerformed": false,
  "error": "Message is required and must be a non-empty string"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "content": "",
  "searchPerformed": false,
  "error": "OPENAI_API_KEY is not configured. Please add it to your environment variables."
}
```

#### Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error (API key issues, LLM errors, search errors)

#### Rate Limits

- Consider implementing rate limiting in production
- Recommended: 10 requests per minute per IP
- Consider user-based rate limiting for authenticated users

---

## Usage Examples

### JavaScript/TypeScript (Fetch)

```typescript
async function sendMessage(message: string, history: any[] = []) {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history,
      provider: 'openai'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return await response.json();
}

// Usage
try {
  const result = await sendMessage('What is the weather today?');
  console.log(result.content);
  if (result.searchPerformed) {
    console.log(`Search query: ${result.searchQuery}`);
  }
} catch (error) {
  console.error('Error:', error);
}
```

### Python (requests)

```python
import requests

def send_message(message, history=None, provider='openai'):
    url = 'http://localhost:3000/api/chat'
    payload = {
        'message': message,
        'history': history or [],
        'provider': provider
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()

# Usage
try:
    result = send_message('What is the latest news about AI?')
    print(result['content'])
    if result['searchPerformed']:
        print(f"Search query: {result['searchQuery']}")
except requests.exceptions.RequestException as e:
    print(f'Error: {e}')
```

### cURL

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the latest news about AI?",
    "provider": "openai"
  }'
```

---

## Error Handling

### Common Errors

#### Missing API Keys
```json
{
  "error": "OPENAI_API_KEY is not configured. Please add it to your environment variables."
}
```

**Solution**: Add the required API key to your `.env.local` file.

#### Invalid Message
```json
{
  "error": "Message is required and must be a non-empty string"
}
```

**Solution**: Ensure the `message` field is a non-empty string.

#### Search API Error
```json
{
  "error": "Failed to search web: SerpApi request failed: 401 Unauthorized"
}
```

**Solution**: Check your SerpApi key validity and quota.

#### LLM API Error
```json
{
  "error": "Failed to process message: OpenAI API error"
}
```

**Solution**: Check your OpenAI/Anthropic API key and quota.

---

## Best Practices

### 1. Conversation History

Maintain conversation history to provide context:

```typescript
const [history, setHistory] = useState([]);

async function sendMessage(message: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
  
  const result = await response.json();
  
  // Update history
  setHistory([
    ...history,
    { role: 'user', content: message },
    { role: 'assistant', content: result.content }
  ]);
}
```

### 2. Error Handling

Always handle errors gracefully:

```typescript
try {
  const result = await sendMessage(message);
  // Handle success
} catch (error) {
  // Show user-friendly error message
  console.error('Failed to send message:', error);
}
```

### 3. Loading States

Show loading indicators while waiting for responses:

```typescript
const [isLoading, setIsLoading] = useState(false);

async function sendMessage(message: string) {
  setIsLoading(true);
  try {
    const result = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    // Handle response
  } finally {
    setIsLoading(false);
  }
}
```

### 4. Timeout Handling

Implement request timeouts:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

try {
  const response = await fetch('/api/chat', {
    method: 'POST',
    signal: controller.signal,
    body: JSON.stringify({ message }),
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timeout');
  }
} finally {
  clearTimeout(timeoutId);
}
```

---

## Security Considerations

1. **API Keys**: Never expose API keys in client-side code
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Validation**: Validate all user inputs on the server
4. **CORS**: Configure CORS appropriately for your deployment
5. **Authentication**: Add authentication for production deployments
6. **Logging**: Log requests for monitoring and debugging (but not sensitive data)

---

## Monitoring

Track these metrics in production:

- **Request rate**: Requests per minute/hour
- **Error rate**: Failed requests percentage
- **Response time**: Average time to respond
- **Search usage**: Percentage of requests triggering search
- **Token usage**: LLM token consumption
- **API costs**: OpenAI/Anthropic/SerpApi costs

---

## Support

For issues or questions:
- Check the [README.md](README.md) for general documentation
- Review the [TESTING.md](TESTING.md) for troubleshooting
- Check API provider documentation for API-specific issues
