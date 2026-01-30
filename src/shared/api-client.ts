import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData from 'form-data';
import { getConfig, ChatwootConfig } from './config.js';

export class ChatwootClient {
  private client: AxiosInstance;
  private config: ChatwootConfig;
  private dynamicAccountId?: string;

  constructor() {
    this.config = getConfig();
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': this.config.apiKey,
      },
    });
  }

  // Set dynamic account ID for this request
  setAccountId(accountId: string | undefined): void {
    this.dynamicAccountId = accountId;
  }

  // Clear dynamic account ID
  clearAccountId(): void {
    this.dynamicAccountId = undefined;
  }

  get accountId(): string {
    return this.dynamicAccountId || this.config.accountId;
  }

  get defaultAccountId(): string {
    return this.config.accountId;
  }

  get inboxIdentifier(): string | undefined {
    return this.config.inboxIdentifier;
  }

  get contactIdentifier(): string | undefined {
    return this.config.contactIdentifier;
  }

  // Generic request methods
  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    try {
      console.log(`[DEBUG] GET ${this.config.apiUrl}${path}`, { params, accountId: this.accountId });
      const response = await this.client.get<T>(path, { params });
      return response.data;
    } catch (error) {
      console.error(`[DEBUG] GET Error:`, error);
      throw this.handleError(error);
    }
  }

  async post<T>(path: string, data?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.post<T>(path, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(path: string, data?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.put<T>(path, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(path: string, data?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.patch<T>(path, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(path: string): Promise<T> {
    try {
      const response = await this.client.delete<T>(path);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload file using multipart/form-data
  async postFormData<T>(path: string, formData: FormData): Promise<T> {
    try {
      const response = await this.client.post<T>(path, formData, {
        headers: {
          ...formData.getHeaders(),
          'api_access_token': this.config.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message;
      return new Error(`Chatwoot API Error: ${message}`);
    }
    return error instanceof Error ? error : new Error(String(error));
  }

  // Helper to build account-scoped paths
  accountPath(path: string): string {
    return `/api/v1/accounts/${this.accountId}${path}`;
  }

  // Helper to build platform paths
  platformPath(path: string): string {
    return `/platform/api/v1${path}`;
  }

  // Helper to build public API paths
  publicPath(path: string): string {
    return `/public/api/v1${path}`;
  }
}

// Export a factory function for creating clients
export function createClient(): ChatwootClient {
  return new ChatwootClient();
}
