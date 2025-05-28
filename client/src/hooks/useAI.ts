import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { SearchResult } from '@shared/schema';

interface AIState {
  isLoading: boolean;
  error: string | null;
  response: string | null;
}

interface AIAnswer {
  query: string;
  response: string;
}

interface AISummary {
  query: string;
  summary: string;
}

interface AIAnalysis {
  query: string;
  analysis: string;
}

/**
 * Custom hook for interacting with the AI Assistant
 */
export function useAI() {
  const [state, setState] = useState<AIState>({
    isLoading: false,
    error: null,
    response: null
  });

  /**
   * Get an AI-generated answer for a query
   * @param query The user's query
   */
  const getAnswer = async (query: string) => {
    setState({
      isLoading: true,
      error: null,
      response: null
    });

    try {
      const data = await apiRequest<AIAnswer>(`/api/ai/answer?q=${encodeURIComponent(query)}`);
      setState({
        isLoading: false,
        error: null,
        response: data.response
      });
      return data.response;
    } catch (error: any) {
      setState({
        isLoading: false,
        error: 'Failed to get AI response: ' + (error.message || 'Unknown error'),
        response: null
      });
      throw error;
    }
  };

  /**
   * Get an AI-generated summary of search results
   * @param query The search query
   * @param results The search results to summarize
   */
  const getSummary = async (query: string, results: SearchResult[]) => {
    setState({
      isLoading: true,
      error: null,
      response: null
    });

    try {
      const data = await apiRequest<AISummary>({
        url: '/api/ai/summary',
        method: 'POST',
        body: JSON.stringify({ query, results }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setState({
        isLoading: false,
        error: null,
        response: data.summary
      });
      return data.summary;
    } catch (error: any) {
      setState({
        isLoading: false,
        error: 'Failed to get search summary: ' + (error.message || 'Unknown error'),
        response: null
      });
      throw error;
    }
  };

  /**
   * Get an AI-generated analysis of a topic
   * @param query The topic to analyze
   */
  const getAnalysis = async (query: string) => {
    setState({
      isLoading: true,
      error: null,
      response: null
    });

    try {
      const data = await apiRequest<AIAnalysis>(`/api/ai/analyze?q=${encodeURIComponent(query)}`);
      setState({
        isLoading: false,
        error: null,
        response: data.analysis
      });
      return data.analysis;
    } catch (error: any) {
      setState({
        isLoading: false,
        error: 'Failed to get topic analysis: ' + (error.message || 'Unknown error'),
        response: null
      });
      throw error;
    }
  };

  return {
    ...state,
    getAnswer,
    getSummary,
    getAnalysis
  };
}