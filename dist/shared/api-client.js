import axios, { AxiosError } from 'axios';
import { getConfig } from './config.js';
export class ChatwootClient {
    client;
    config;
    dynamicAccountId;
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
    setAccountId(accountId) {
        this.dynamicAccountId = accountId;
    }
    // Clear dynamic account ID
    clearAccountId() {
        this.dynamicAccountId = undefined;
    }
    get accountId() {
        return this.dynamicAccountId || this.config.accountId;
    }
    get defaultAccountId() {
        return this.config.accountId;
    }
    get inboxIdentifier() {
        return this.config.inboxIdentifier;
    }
    get contactIdentifier() {
        return this.config.contactIdentifier;
    }
    // Generic request methods
    async get(path, params) {
        try {
            console.log(`[DEBUG] GET ${this.config.apiUrl}${path}`, { params, accountId: this.accountId });
            const response = await this.client.get(path, { params });
            return response.data;
        }
        catch (error) {
            console.error(`[DEBUG] GET Error:`, error);
            throw this.handleError(error);
        }
    }
    async post(path, data) {
        try {
            const response = await this.client.post(path, data);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async put(path, data) {
        try {
            const response = await this.client.put(path, data);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async patch(path, data) {
        try {
            const response = await this.client.patch(path, data);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async delete(path) {
        try {
            const response = await this.client.delete(path);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    // Upload file using multipart/form-data
    async postFormData(path, formData) {
        try {
            const response = await this.client.post(path, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'api_access_token': this.config.apiKey,
                },
            });
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    handleError(error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message;
            return new Error(`Chatwoot API Error: ${message}`);
        }
        return error instanceof Error ? error : new Error(String(error));
    }
    // Helper to build account-scoped paths
    accountPath(path) {
        return `/api/v1/accounts/${this.accountId}${path}`;
    }
    // Helper to build platform paths
    platformPath(path) {
        return `/platform/api/v1${path}`;
    }
    // Helper to build public API paths
    publicPath(path) {
        return `/public/api/v1${path}`;
    }
}
// Export a factory function for creating clients
export function createClient() {
    return new ChatwootClient();
}
//# sourceMappingURL=api-client.js.map