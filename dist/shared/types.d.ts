export interface Contact {
    id: number;
    name: string;
    email?: string;
    phone_number?: string;
    thumbnail?: string;
    additional_attributes?: Record<string, unknown>;
    custom_attributes?: Record<string, unknown>;
    identifier?: string;
    created_at: string;
    updated_at: string;
}
export interface Conversation {
    id: number;
    account_id: number;
    inbox_id: number;
    status: 'open' | 'resolved' | 'pending' | 'snoozed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignee_id?: number;
    team_id?: number;
    contact: Contact;
    messages: Message[];
    labels: string[];
    custom_attributes?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}
export interface Message {
    id: number;
    content: string;
    content_type: 'text' | 'input_select' | 'cards' | 'form';
    content_attributes?: Record<string, unknown>;
    message_type: 'incoming' | 'outgoing' | 'activity' | 'template';
    private: boolean;
    sender?: {
        id: number;
        name: string;
        type: 'user' | 'contact';
    };
    attachments?: Attachment[];
    created_at: string;
}
export interface Attachment {
    id: number;
    file_type: string;
    data_url: string;
    thumb_url?: string;
    file_size?: number;
}
export interface Agent {
    id: number;
    name: string;
    email: string;
    role: 'administrator' | 'agent';
    availability_status: 'online' | 'offline' | 'busy';
    thumbnail?: string;
    custom_attributes?: Record<string, unknown>;
}
export interface Inbox {
    id: number;
    name: string;
    channel_type: string;
    avatar_url?: string;
    channel_id: number;
    greeting_enabled: boolean;
    greeting_message?: string;
    working_hours_enabled: boolean;
}
export interface Team {
    id: number;
    name: string;
    description?: string;
    allow_auto_assign: boolean;
    account_id: number;
}
export interface CannedResponse {
    id: number;
    short_code: string;
    content: string;
    account_id: number;
}
export interface CustomAttribute {
    id: number;
    attribute_display_name: string;
    attribute_display_type: string;
    attribute_description?: string;
    attribute_key: string;
    attribute_model: 'contact_attribute' | 'conversation_attribute';
    attribute_values?: string[];
}
export interface CustomFilter {
    id: number;
    name: string;
    filter_type: 'conversation' | 'contact' | 'report';
    query: Record<string, unknown>;
}
export interface Webhook {
    id: number;
    name?: string;
    url: string;
    subscriptions: string[];
    account_id: number;
    inbox_id?: number;
    custom_payload?: Record<string, unknown>;
    payload_template?: Record<string, unknown>;
    headers?: Record<string, string>;
    inbox?: {
        id: number;
        name: string;
    } | null;
}
export interface WebhookPayloadVariables {
    variables: Record<string, string[]>;
    events: string[];
}
export interface WebhookTriggerResult {
    success: boolean;
    message: string;
}
export interface AutomationRule {
    id: number;
    name: string;
    description?: string;
    event_name: string;
    conditions: Record<string, unknown>[];
    actions: Record<string, unknown>[];
    active: boolean;
    account_id: number;
}
export interface Specialist {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    active: boolean;
    max_concurrent_appointments: number;
    avatar_url?: string;
    availabilities?: SpecialistAvailability[];
}
export interface SpecialistAvailability {
    id: number;
    day_of_week: number;
    day_name: string;
    open_hour: number;
    open_minutes: number;
    close_hour: number;
    close_minutes: number;
    closed_all_day: boolean;
}
export interface Appointment {
    id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    specialist: {
        id: number;
        name: string;
        avatar_url?: string;
    };
    contact?: Contact;
    contacts?: Contact[];
}
export interface AvailableSlot {
    start_time: string;
    end_time: string;
    available: boolean;
    remaining_slots: number;
    max_concurrent: number;
}
export interface Portal {
    id: number;
    name: string;
    slug: string;
    custom_domain?: string;
    color?: string;
    homepage_link?: string;
    page_title?: string;
    header_text?: string;
    archived: boolean;
}
export interface Report {
    value: string;
    timestamp: number;
}
export interface AgentBot {
    id: number;
    name: string;
    description?: string;
    outgoing_url?: string;
    account_id?: number;
}
export interface AppointmentWaitlistEntry {
    id: number;
    specialist_id: number;
    contact_id: number;
    preferred_date?: string;
    preferred_time_start?: string;
    preferred_time_end?: string;
    notes?: string;
    status: 'pending' | 'notified' | 'accepted' | 'declined' | 'expired' | 'cancelled';
    priority: number;
    expires_at?: string;
    notified_at?: string;
    responded_at?: string;
    specialist?: {
        id: number;
        name: string;
    };
    contact?: Contact;
    created_at: string;
    updated_at: string;
}
export interface WaitlistNotificationSetting {
    id: number;
    specialist_id: number;
    enabled: boolean;
    notification_template?: string;
    response_timeout_hours: number;
    max_notifications_per_slot: number;
    auto_expire_hours: number;
    created_at: string;
    updated_at: string;
}
export interface PaginatedResponse<T> {
    payload: T[];
    meta: {
        count: number;
        current_page: number;
        total_pages?: number;
    };
}
//# sourceMappingURL=types.d.ts.map