import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google AI client
const API_KEY = process.env.GOOGLE_AI_KEY;

// Make sure API_KEY exists
if (!API_KEY) {
  console.error('Google AI API key is missing');
}

// Initialize the Google AI client with proper API key
const genAI = new GoogleGenerativeAI(API_KEY || '');

// Model to use - gemini-pro which is commonly available
const MODEL_NAME = 'gemini-pro';

/**
 * Generates an AI response based on user query
 * @param query The user's query
 * @returns AI-generated response
 */
export async function generateAIResponse(query: string): Promise<string> {
  try {
    console.log(`Generating AI response for query: "${query}"`);
    
    // For content with text only
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    console.log(`Using model: ${MODEL_NAME}`);

    const prompt = `You are Operator, an advanced AI assistant for the Serqo search engine. 
Your responses should be helpful, accurate, concise, and friendly.
If you're unsure about something, be transparent about your limitations.
You're specialized in providing information and helping users with their search queries.

User query: ${query}

Please provide a helpful response to this query.`;

    console.log('Sending request to Google AI API...');
    const result = await model.generateContent([{ text: prompt }]);
    console.log('Received response from Google AI API');
    
    const response = result.response;
    const text = response.text();
    
    console.log(`Generated response: "${text.substring(0, 50)}..."`);
    return text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    // Provide more detailed error information
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

/**
 * Generates a summary of search results
 * @param query The search query
 * @param results The search results to summarize
 * @returns A summary of the search results
 */
export async function generateSearchSummary(query: string, results: any[]): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `Summarize the following search results for the query "${query}":
    
${JSON.stringify(results, null, 2)}

Provide a concise summary of the key points and information from these search results. Focus on the most relevant aspects based on the search query. Keep your response under 250 words.`;

    const result = await model.generateContent([{ text: prompt }]);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating search summary:', error);
    throw new Error('Failed to generate search summary');
  }
}

/**
 * Generates a more detailed analysis of a specific topic
 * @param query The topic to analyze
 * @returns A detailed analysis of the topic
 */
export async function generateTopicAnalysis(query: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `Provide a detailed analysis of the topic "${query}".
    
Include key concepts, important aspects, different perspectives, and recent developments if applicable.
Structure your response with clear sections and be informative yet concise.
Limit your analysis to 5-6 paragraphs maximum.`;

    const result = await model.generateContent([{ text: prompt }]);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating topic analysis:', error);
    throw new Error('Failed to generate topic analysis');
  }
}