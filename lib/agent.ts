/**
 * Agent Logic
 * 
 * Core orchestration layer for handling user messages,
 * coordinating with LLMs (OpenAI or Claude), and executing tools
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { searchWeb, formatSearchResults, SearchResponse } from './tools/searchTool';

// Message types
export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

export interface AgentConfig {
  provider: 'openai' | 'claude';
  model?: string;
  maxIterations?: number;
}

// Tool definition for LLMs
const SEARCH_TOOL = {
  name: 'search_web',
  description: 'Searches the web for up-to-date information and returns concise snippets with titles and URLs. Use this when the user asks about current events, recent information, or facts that may have changed.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The text query to search for on the web. Be specific and concise.',
      },
      num_results: {
        type: 'integer',
        description: 'Maximum number of results to retrieve (default: 5)',
        default: 5,
      },
    },
    required: ['query'],
  },
};

// System prompt for the agent
const SYSTEM_PROMPT = `You are "Web Search Agent", an AI assistant capable of reasoning and using tools to help users find accurate, up-to-date information.

When the user asks about real-world events, current topics, recent news, or facts that may have changed, call the \`search_web\` tool with an appropriate query.

Instructions:
- Briefly explain why you're searching before calling the tool
- After receiving tool results, synthesize a clear, factual summary
- Always cite your sources using this format: (Source Title - URL)
- Never fabricate or assume URLs - only use URLs from search results
- Keep your tone concise, helpful, and professional
- If search results are insufficient, acknowledge limitations and suggest refining the query
- For questions you can answer from general knowledge without needing current data, answer directly without searching

Remember: Your strength is combining reasoning with real-time information retrieval.`;

/**
 * Handle user message with OpenAI GPT-4
 */
async function handleWithOpenAI(
  message: string,
  history: Message[],
  model: string = 'gpt-4o'
): Promise<{ content: string; searchPerformed: boolean; searchQuery?: string }> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let searchPerformed = false;
  let searchQuery: string | undefined;

  // Initial completion with tool availability
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ],
    tools: [
      {
        type: 'function' as const,
        function: {
          name: SEARCH_TOOL.name,
          description: SEARCH_TOOL.description,
          parameters: SEARCH_TOOL.parameters,
        },
      },
    ],
    tool_choice: 'auto',
  });

  const responseMessage = completion.choices[0].message;

  // Check if tool was called
  if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
    const toolCall = responseMessage.tool_calls[0];
    
    if (toolCall.function.name === 'search_web') {
      searchPerformed = true;
      const args = JSON.parse(toolCall.function.arguments);
      searchQuery = args.query;
      
      // Execute search
      const searchResults = await searchWeb(args.query, args.num_results || 5);
      const formattedResults = formatSearchResults(searchResults);

      // Follow-up completion with search results
      const followUpCompletion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          })),
          { role: 'user', content: message },
          responseMessage,
          {
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: formattedResults,
          },
        ],
      });

      return {
        content: followUpCompletion.choices[0].message.content || 'No response generated',
        searchPerformed,
        searchQuery,
      };
    }
  }

  // No tool call - return direct response
  return {
    content: responseMessage.content || 'No response generated',
    searchPerformed,
    searchQuery,
  };
}

/**
 * Handle user message with Claude
 */
async function handleWithClaude(
  message: string,
  history: Message[],
  model: string = 'claude-sonnet-4-20250514'
): Promise<{ content: string; searchPerformed: boolean; searchQuery?: string }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let searchPerformed = false;
  let searchQuery: string | undefined;

  // Format messages for Claude
  const claudeMessages = [
    ...history
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: msg.content,
      })),
    { role: 'user' as const, content: message },
  ];

  // Initial completion with tool availability
  const completion = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: claudeMessages,
    tools: [
      {
        name: SEARCH_TOOL.name,
        description: SEARCH_TOOL.description,
        input_schema: SEARCH_TOOL.parameters as any,
      },
    ],
  });

  // Check if tool was used
  const toolUseBlock = completion.content.find(
    (block: any) => block.type === 'tool_use'
  );

  if (toolUseBlock) {
    searchPerformed = true;
    const toolInput = toolUseBlock.input as { query: string; num_results?: number };
    searchQuery = toolInput.query;

    // Execute search
    const searchResults = await searchWeb(toolInput.query, toolInput.num_results || 5);
    const formattedResults = formatSearchResults(searchResults);

    // Follow-up completion with search results
    const followUpCompletion = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        ...claudeMessages,
        {
          role: 'assistant' as const,
          content: completion.content,
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'tool_result' as const,
              tool_use_id: toolUseBlock.id,
              content: formattedResults,
            },
          ],
        },
      ],
    });

    const textBlock = followUpCompletion.content.find(
      (block: any) => block.type === 'text'
    );

    return {
      content: textBlock?.text || 'No response generated',
      searchPerformed,
      searchQuery,
    };
  }

  // No tool use - return direct response
  const textBlock = completion.content.find((block: any) => block.type === 'text');

  return {
    content: textBlock?.text || 'No response generated',
    searchPerformed,
    searchQuery,
  };
}

/**
 * Main entry point for handling user messages
 * 
 * @param message - User's message
 * @param history - Conversation history
 * @param config - Agent configuration
 * @returns Response with content and metadata
 */
export async function handleUserMessage(
  message: string,
  history: Message[] = [],
  config: AgentConfig = { provider: 'openai' }
): Promise<{ content: string; searchPerformed: boolean; searchQuery?: string }> {
  try {
    if (config.provider === 'claude') {
      return await handleWithClaude(message, history, config.model);
    } else {
      return await handleWithOpenAI(message, history, config.model);
    }
  } catch (error) {
    console.error('Agent error:', error);
    throw new Error(
      `Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
