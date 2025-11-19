export class MetaWebhookPayloadDto {
    object: string;
    entry: MetaWebhookEntryDto[];
}

export class MetaWebhookEntryDto {
    id: string;
    changes: MetaWebhookChangeDto[];
}

export class MetaWebhookChangeDto {
    value: MetaWebhookValueDto;
    field: string;
}

export class MetaWebhookValueDto {
    messaging_product: string;
    metadata: {
        display_phone_number: string;
        phone_number_id: string;
    };
    contacts?: MetaWebhookContactDto[];
    messages?: MetaWebhookMessageDto[];
    statuses?: any[]; // Define Status DTO if needed
}

export class MetaWebhookContactDto {
    profile: {
        name: string;
    };
    wa_id: string;
}

export class MetaWebhookMessageDto {
    from: string;
    id: string;
    timestamp: string;
    type: string;
    text?: {
        body: string;
    };
    image?: {
        caption?: string;
        mime_type: string;
        sha: string;
        id: string;
    };
    // Add other types as needed
}
