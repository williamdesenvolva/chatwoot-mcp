export declare class ChatwootClient {
    private client;
    private config;
    private dynamicAccountId?;
    constructor();
    setAccountId(accountId: string | undefined): void;
    clearAccountId(): void;
    get accountId(): string;
    get defaultAccountId(): string;
    get inboxIdentifier(): string | undefined;
    get contactIdentifier(): string | undefined;
    get<T>(path: string, params?: Record<string, unknown>): Promise<T>;
    post<T>(path: string, data?: Record<string, unknown>): Promise<T>;
    put<T>(path: string, data?: Record<string, unknown>): Promise<T>;
    patch<T>(path: string, data?: Record<string, unknown>): Promise<T>;
    delete<T>(path: string): Promise<T>;
    private handleError;
    accountPath(path: string): string;
    platformPath(path: string): string;
    publicPath(path: string): string;
}
export declare function createClient(): ChatwootClient;
//# sourceMappingURL=api-client.d.ts.map