import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdvancedFeatures1700000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // SLA Configs
    await queryRunner.query(`
      CREATE TABLE "sla_configs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "stage" varchar UNIQUE NOT NULL,
        "targetMinutes" integer NOT NULL,
        "warningMinutes" integer NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Workflow Events
    await queryRunner.query(`
      CREATE TABLE "workflow_events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quotationRequestId" uuid NOT NULL,
        "eventType" varchar NOT NULL,
        "fromStatus" varchar,
        "toStatus" varchar,
        "userId" uuid,
        "description" text,
        "metadata" jsonb,
        "durationMinutes" integer,
        "slaViolated" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_workflow_event_quotation" FOREIGN KEY ("quotationRequestId") REFERENCES "quotation_requests"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_workflow_event_user" FOREIGN KEY ("userId") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_workflow_events_quotation" ON "workflow_events"("quotationRequestId")`);
    await queryRunner.query(`CREATE INDEX "IDX_workflow_events_type" ON "workflow_events"("eventType")`);
    await queryRunner.query(`CREATE INDEX "IDX_workflow_events_created" ON "workflow_events"("createdAt")`);

    // Attachments
    await queryRunner.query(`
      CREATE TABLE "attachments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quotationRequestId" uuid NOT NULL,
        "fileName" varchar NOT NULL,
        "originalName" varchar NOT NULL,
        "mimeType" varchar NOT NULL,
        "fileSizeBytes" integer NOT NULL,
        "storagePath" varchar NOT NULL,
        "thumbnailPath" varchar,
        "uploadedVia" varchar NOT NULL,
        "uploadedByPhone" varchar,
        "description" text,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_attachment_quotation" FOREIGN KEY ("quotationRequestId") REFERENCES "quotation_requests"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_attachments_quotation" ON "attachments"("quotationRequestId")`);

    // Pricing Scenarios
    await queryRunner.query(`
      CREATE TABLE "pricing_scenarios" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quotationRequestId" uuid NOT NULL,
        "selectedSupplierQuoteId" uuid,
        "scenarioType" varchar NOT NULL,
        "scenarioName" varchar NOT NULL,
        "baseCost" decimal(10,2) NOT NULL,
        "marginPercent" decimal(5,2) NOT NULL,
        "marginValue" decimal(10,2) NOT NULL,
        "installationCost" decimal(10,2),
        "shippingCost" decimal(10,2),
        "additionalServices" decimal(10,2),
        "finalPrice" decimal(10,2) NOT NULL,
        "description" text,
        "features" jsonb,
        "estimatedDeliveryDays" integer,
        "isRecommended" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_pricing_scenario_quotation" FOREIGN KEY ("quotationRequestId") REFERENCES "quotation_requests"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pricing_scenario_quote" FOREIGN KEY ("selectedSupplierQuoteId") REFERENCES "supplier_quotes"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_pricing_scenarios_quotation" ON "pricing_scenarios"("quotationRequestId")`);

    // Installation Schedules
    await queryRunner.query(`
      CREATE TABLE "installation_schedules" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "scheduledDate" timestamp NOT NULL,
        "timeSlot" varchar NOT NULL,
        "technicianName" varchar NOT NULL,
        "technicianPhone" varchar,
        "address" text NOT NULL,
        "city" varchar,
        "state" varchar,
        "zipCode" varchar,
        "accessInstructions" text,
        "status" varchar NOT NULL DEFAULT 'SCHEDULED',
        "actualStartTime" timestamp,
        "actualEndTime" timestamp,
        "durationMinutes" integer,
        "completionNotes" text,
        "customerConfirmed" boolean NOT NULL DEFAULT false,
        "confirmationSentAt" timestamp,
        "confirmationReceivedAt" timestamp,
        "assignedById" uuid,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_installation_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_installation_user" FOREIGN KEY ("assignedById") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_installations_order" ON "installation_schedules"("orderId")`);
    await queryRunner.query(`CREATE INDEX "IDX_installations_date" ON "installation_schedules"("scheduledDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_installations_status" ON "installation_schedules"("status")`);

    // Notifications
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" varchar NOT NULL,
        "priority" varchar NOT NULL,
        "title" varchar NOT NULL,
        "message" text NOT NULL,
        "relatedEntityType" varchar,
        "relatedEntityId" uuid,
        "actionUrl" varchar,
        "isRead" boolean NOT NULL DEFAULT false,
        "readAt" timestamp,
        "isArchived" boolean NOT NULL DEFAULT false,
        "expiresAt" timestamp,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_notification_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_notifications_user" ON "notifications"("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_read" ON "notifications"("isRead")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_created" ON "notifications"("createdAt")`);

    // WhatsApp Queue
    await queryRunner.query(`
      CREATE TABLE "whatsapp_queue" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "phoneNumber" varchar NOT NULL,
        "message" text NOT NULL,
        "mediaUrl" varchar,
        "mediaType" varchar,
        "status" varchar NOT NULL DEFAULT 'PENDING',
        "retryCount" integer NOT NULL DEFAULT 0,
        "maxRetries" integer NOT NULL DEFAULT 3,
        "scheduledFor" timestamp,
        "sentAt" timestamp,
        "errorMessage" text,
        "relatedEntityType" varchar,
        "relatedEntityId" uuid,
        "sessionId" varchar NOT NULL DEFAULT 'default',
        "priority" integer NOT NULL DEFAULT 0,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_whatsapp_queue_status" ON "whatsapp_queue"("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_whatsapp_queue_session" ON "whatsapp_queue"("sessionId")`);
    await queryRunner.query(`CREATE INDEX "IDX_whatsapp_queue_scheduled" ON "whatsapp_queue"("scheduledFor")`);
    await queryRunner.query(`CREATE INDEX "IDX_whatsapp_queue_priority" ON "whatsapp_queue"("priority" DESC)`);

    // WhatsApp Sessions
    await queryRunner.query(`
      CREATE TABLE "whatsapp_sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sessionId" varchar UNIQUE NOT NULL,
        "phoneNumber" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'DISCONNECTED',
        "qrCode" text,
        "lastConnectedAt" timestamp,
        "lastDisconnectedAt" timestamp,
        "isActive" boolean NOT NULL DEFAULT true,
        "isPrimary" boolean NOT NULL DEFAULT false,
        "errorMessage" text,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_whatsapp_sessions_status" ON "whatsapp_sessions"("status")`);

    // Insert default SLA configs
    await queryRunner.query(`
      INSERT INTO "sla_configs" ("stage", "targetMinutes", "warningMinutes") VALUES
      ('QUOTATION_CREATED', 15, 10),
      ('SUPPLIER_DISPATCH', 30, 20),
      ('SUPPLIER_RESPONSE', 120, 90),
      ('PROPOSAL_SENT', 60, 45)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "whatsapp_sessions"`);
    await queryRunner.query(`DROP TABLE "whatsapp_queue"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "installation_schedules"`);
    await queryRunner.query(`DROP TABLE "pricing_scenarios"`);
    await queryRunner.query(`DROP TABLE "attachments"`);
    await queryRunner.query(`DROP TABLE "workflow_events"`);
    await queryRunner.query(`DROP TABLE "sla_configs"`);
  }
}
