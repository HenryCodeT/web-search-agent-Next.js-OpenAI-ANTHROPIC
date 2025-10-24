# Deployment Guide - Vercel

This guide will help you deploy the Web Search Agent to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (sign up at https://vercel.com)
- Your API keys ready:
  - OpenAI API key (if using GPT-4o)
  - Anthropic API key (if using Claude)
  - SerpApi key (required)

## Step-by-Step Deployment

### 1. Push to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/web-search-agent.git

# Push to GitHub
git push -u origin main
```

### 2. Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Import"

### 3. Configure Environment Variables

In the Vercel dashboard, go to your project settings and add these environment variables:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SERPAPI_KEY=...
```

**Important Notes:**
- You need at least ONE LLM provider (OpenAI or Anthropic)
- SerpApi key is REQUIRED for web search functionality
- Never commit these keys to your repository

### 4. Deploy

Click "Deploy" and wait for the build to complete.

Your app will be live at: `https://your-project-name.vercel.app`

## Post-Deployment

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### Monitoring

- View deployment logs in Vercel dashboard
- Check function logs for debugging
- Monitor API usage in OpenAI/Anthropic/SerpApi dashboards

### Updates

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically deploy the changes.

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript compilation with `npm run type-check`

### Runtime Errors

- Check function logs in Vercel dashboard
- Verify environment variables are set correctly
- Check API key validity and quotas

### Rate Limiting

Consider implementing:
- Request throttling
- Caching for common queries
- User authentication

## Environment Variable Security

- Vercel keeps environment variables secure
- They are only accessible server-side
- Never exposed to the client browser
- Rotate keys regularly for security

## Scaling

For production use:
- Upgrade to Vercel Pro for better performance
- Consider SerpApi paid plan for more searches
- Monitor OpenAI/Anthropic API usage
- Implement caching strategy

## Support

If you encounter issues:
- Check Vercel documentation: https://vercel.com/docs
- Review Next.js documentation: https://nextjs.org/docs
- Check the project README.md

Happy deploying! 🚀
