import { SearchResult } from '@shared/schema';

// Mistral API base URL
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

/**
 * Sends a request to the Mistral API
 * @param messages The conversation history and current prompt
 * @returns The AI response
 */
async function sendMistralRequest(messages: any[]) {
  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest', // Using the latest Mistral large model
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    throw error;
  }
}

/**
 * Generates an AI response based on a user query
 * @param query The user's search query
 * @returns The AI-generated response
 */
export async function generateAIResponse(query: string): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: 'You are Operator, an advanced AI integrated into the Serqo search platform. Your responses should be concise, accurate, and helpful. When appropriate, cite reliable sources. Format your responses with Markdown for better readability.'
    },
    {
      role: 'user',
      content: `Please answer this question or search query: "${query}"`
    }
  ];

  try {
    // Only attempt to call the API if there's a valid API key
    if (MISTRAL_API_KEY) {
      const completion = await sendMistralRequest(messages);
      return completion.choices[0].message.content;
    } else {
      console.warn('No Mistral API key found, using fallback response');
      return `I am Operator, an AI assistant for Serqo. I can answer questions and provide information on a wide range of topics. However, I'm currently operating in limited mode because my connection to the AI service is unavailable. Please check back later for full functionality, or contact support for assistance.`;
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'I apologize, but I encountered an issue while processing your request. Please try again later.';
  }
}

/**
 * Generates a summary for search results
 * @param query The user's search query
 * @param results The search results to summarize
 * @returns A summary of the search results
 */
export async function generateSearchSummary(query: string, results: SearchResult[]): Promise<string> {
  // Extract relevant information from search results
  const resultsContext = results.slice(0, 5).map(result => {
    return `Title: ${result.title}\nDescription: ${result.description}\nURL: ${result.url}`;
  }).join('\n\n');

  const messages = [
    {
      role: 'system',
      content: 'You are Operator, an AI that summarizes search results. Create a concise, informative summary based on the provided search results. The summary should highlight key information, identify common themes, and provide useful insights. Use Markdown formatting for better readability.'
    },
    {
      role: 'user',
      content: `Please summarize these search results for the query "${query}":\n\n${resultsContext}`
    }
  ];

  try {
    // Only attempt to call the API if there's a valid API key
    if (MISTRAL_API_KEY) {
      const completion = await sendMistralRequest(messages);
      return completion.choices[0].message.content;
    } else {
      console.warn('No Mistral API key found, using fallback response for search summary');
      return `# Search Summary for "${query}"

Based on the search results, here are some key points:

${results.slice(0, 3).map(result => `- **${result.title}**: ${result.description.substring(0, 100)}...`).join('\n')}

*Note: I'm currently operating in limited mode. For more detailed summaries, please check back later when full AI functionality is available.*`;
    }
  } catch (error) {
    console.error('Error generating search summary:', error);
    return 'I apologize, but I encountered an issue while summarizing the search results. Please try again later.';
  }
}

/**
 * Generates a more detailed analysis for a specific topic
 * @param query The topic to analyze
 * @returns A detailed analysis of the topic
 */
export async function generateTopicAnalysis(query: string): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: 'You are Operator, an advanced analytical AI. Provide an in-depth, well-structured analysis of the given topic. Include relevant facts, multiple perspectives, and cite reliable sources where appropriate. Use Markdown formatting for better readability.'
    },
    {
      role: 'user',
      content: `Please provide a detailed analysis of this topic: "${query}"`
    }
  ];

  try {
    // Only attempt to call the API if there's a valid API key
    if (MISTRAL_API_KEY) {
      const completion = await sendMistralRequest(messages);
      return completion.choices[0].message.content;
    } else {
      console.warn('No Mistral API key found, using fallback response for topic analysis');
      return `# Analysis: ${query}

I'm currently operating in limited mode and cannot provide a full analysis on "${query}". 

When full AI functionality is restored, I'll be able to offer:
- In-depth exploration of this topic
- Multiple perspectives and considerations
- Relevant facts and background information
- Citations from reliable sources

Please check back later or contact support if you need immediate assistance with this topic.`;
    }
  } catch (error) {
    console.error('Error generating topic analysis:', error);
    return 'I apologize, but I encountered an issue while generating the analysis. Please try again later.';
  }
}