// Permission categories
export const PERMISSION_CATEGORIES = [
    'contacts',
    'conversations',
    'messages',
    'agents',
    'teams',
    'inboxes',
    'specialists',
    'appointments',
    'webhooks',
    'automation',
    'reports',
    'labels',
    'canned_responses',
    'custom_attributes',
    'integrations',
    'csat',
];
// Full permissions preset
export const FULL_PERMISSIONS = PERMISSION_CATEGORIES.reduce((acc, category) => ({
    ...acc,
    [category]: { read: true, write: true, delete: true },
}), {});
// Read-only permissions preset
export const READ_ONLY_PERMISSIONS = PERMISSION_CATEGORIES.reduce((acc, category) => ({
    ...acc,
    [category]: { read: true, write: false, delete: false },
}), {});
// Empty permissions preset
export const NO_PERMISSIONS = PERMISSION_CATEGORIES.reduce((acc, category) => ({
    ...acc,
    [category]: { read: false, write: false, delete: false },
}), {});
//# sourceMappingURL=index.js.map