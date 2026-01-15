import 'dotenv/config';
export function getConfig() {
    const apiUrl = process.env.CHATWOOT_API_URL;
    const apiKey = process.env.CHATWOOT_API_KEY;
    const accountId = process.env.CHATWOOT_ACCOUNT_ID || '';
    if (!apiUrl) {
        throw new Error('CHATWOOT_API_URL environment variable is required');
    }
    if (!apiKey) {
        throw new Error('CHATWOOT_API_KEY environment variable is required');
    }
    // accountId is now optional - can be provided per request
    return {
        apiUrl: apiUrl.replace(/\/$/, ''), // Remove trailing slash
        apiKey,
        accountId,
        inboxIdentifier: process.env.CHATWOOT_INBOX_IDENTIFIER,
        contactIdentifier: process.env.CHATWOOT_CONTACT_IDENTIFIER,
    };
}
//# sourceMappingURL=config.js.map