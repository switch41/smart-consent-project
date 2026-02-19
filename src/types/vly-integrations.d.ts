declare module '@vly-ai/integrations' {
  export interface AICompletionRequest {
    model?: string;
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }

  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    usage?: {
      credits: number;
      operation: string;
    };
  }

  export interface AICompletionResponse {
    id: string;
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
      finishReason: string;
    }>;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }

  export interface VlyIntegrations {
    ai: {
      completion(request: AICompletionRequest): Promise<ApiResponse<AICompletionResponse>>;
    };
  }

  export function createVlyIntegrations(config: {
    deploymentToken: string;
    debug?: boolean;
  }): VlyIntegrations;
}
