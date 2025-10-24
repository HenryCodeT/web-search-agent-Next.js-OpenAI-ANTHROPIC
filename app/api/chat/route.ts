/**
 * Chat API Route
 * 
 * Handles POST requests for chat messages
 * Orchestrates between frontend and agent logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleUserMessage, Message, AgentConfig } from '@/lib/agent';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout

interface ChatRequest {
  message: string;
  history?: Message[];
  provider?: 'openai' | 'claude';
  model?: string;
}

interface ChatResponse {
  content: string;
  searchPerformed: boolean;
  searchQuery?: string;
  error?: string;
}

/**
 * POST /api/chat
 * 
 * Process a chat message and return agent response
 */
export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body: ChatRequest = await req.json();
    
    const { message, history = [], provider = 'openai', model } = body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { 
          content: '',
          searchPerformed: false,
          error: 'Message is required and must be a non-empty string' 
        },
        { status: 400 }
      );
    }

    // Check for required API keys
    const requiredKey = provider === 'claude' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
    if (!process.env[requiredKey]) {
      return NextResponse.json(
        { 
          content: '',
          searchPerformed: false,
          error: `${requiredKey} is not configured. Please add it to your environment variables.` 
        },
        { status: 500 }
      );
    }

    if (!process.env.SERPAPI_KEY) {
      return NextResponse.json(
        { 
          content: '',
          searchPerformed: false,
          error: 'SERPAPI_KEY is not configured. Please add it to your environment variables.' 
        },
        { status: 500 }
      );
    }

    // Configure agent
    const config: AgentConfig = {
      provider,
      model,
      maxIterations: 3,
    };

    // Process message
    const response = await handleUserMessage(message, history, config);

    return NextResponse.json({
      content: response.content,
      searchPerformed: response.searchPerformed,
      searchQuery: response.searchQuery,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { 
        content: '',
        searchPerformed: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/chat
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
