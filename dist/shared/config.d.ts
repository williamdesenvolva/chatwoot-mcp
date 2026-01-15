import 'dotenv/config';
export interface ChatwootConfig {
    apiUrl: string;
    apiKey: string;
    accountId: string;
    inboxIdentifier?: string;
    contactIdentifier?: string;
}
export declare function getConfig(): ChatwootConfig;
//# sourceMappingURL=config.d.ts.map