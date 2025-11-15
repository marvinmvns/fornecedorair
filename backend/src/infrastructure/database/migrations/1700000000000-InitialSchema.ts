import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "email" varchar UNIQUE NOT NULL,
        "passwordHash" varchar NOT NULL,
        "role" varchar NOT NULL DEFAULT 'ATTENDANT',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Installers table
    await queryRunner.query(`
      CREATE TABLE "installers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "whatsappNumber" varchar UNIQUE NOT NULL,
        "companyName" varchar,
        "city" varchar,
        "state" varchar,
        "zipCode" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Suppliers table
    await queryRunner.query(`
      CREATE TABLE "suppliers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "whatsappNumber" varchar,
        "apiUrl" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "averageLeadTimeDays" integer NOT NULL DEFAULT 7,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Air Conditioner Models table
    await queryRunner.query(`
      CREATE TABLE "air_conditioner_models" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sku" varchar UNIQUE NOT NULL,
        "brand" varchar NOT NULL,
        "modelName" varchar NOT NULL,
        "btuCapacity" integer NOT NULL,
        "type" varchar NOT NULL,
        "inverter" boolean NOT NULL DEFAULT false,
        "voltage" varchar NOT NULL,
        "energyEfficiencyClass" varchar NOT NULL DEFAULT 'C',
        "noiseLevelDb" integer,
        "wifiEnabled" boolean NOT NULL DEFAULT false,
        "recommendedAreaM2" integer,
        "baseCost" decimal(10,2) NOT NULL,
        "suggestedRetailPrice" decimal(10,2) NOT NULL,
        "features" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Quotation Requests table
    await queryRunner.query(`
      CREATE TABLE "quotation_requests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "originChannel" varchar NOT NULL,
        "installer_id" uuid NOT NULL,
        "description" text NOT NULL,
        "environmentType" varchar,
        "environmentAreaM2" decimal(10,2),
        "locationCity" varchar,
        "locationState" varchar,
        "voltagePreference" varchar,
        "productTypePreference" varchar,
        "brandPreference" varchar,
        "maxBudget" decimal(10,2),
        "deadlineDays" integer,
        "status" varchar NOT NULL DEFAULT 'OPEN',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_quotation_installer" FOREIGN KEY ("installer_id") REFERENCES "installers"("id") ON DELETE CASCADE
      )
    `);

    // Quotation Items table
    await queryRunner.query(`
      CREATE TABLE "quotation_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quotation_request_id" uuid NOT NULL,
        "air_conditioner_model_id" uuid NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "notes" text,
        CONSTRAINT "FK_quotation_item_request" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_requests"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_quotation_item_model" FOREIGN KEY ("air_conditioner_model_id") REFERENCES "air_conditioner_models"("id")
      )
    `);

    // Supplier Quotes table
    await queryRunner.query(`
      CREATE TABLE "supplier_quotes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quotation_request_id" uuid NOT NULL,
        "supplier_id" uuid NOT NULL,
        "totalPrice" decimal(10,2),
        "unitPrice" decimal(10,2),
        "leadTimeDays" integer,
        "stockAvailable" boolean NOT NULL DEFAULT false,
        "paymentConditions" text,
        "warrantyMonths" integer NOT NULL DEFAULT 12,
        "additionalNotes" text,
        "status" varchar NOT NULL DEFAULT 'PENDING',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_supplier_quote_request" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_requests"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_supplier_quote_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id")
      )
    `);

    // Orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quotation_request_id" uuid NOT NULL,
        "selected_supplier_id" uuid,
        "finalPriceToInstaller" decimal(10,2) NOT NULL,
        "grossCost" decimal(10,2) NOT NULL,
        "marginValue" decimal(10,2) NOT NULL,
        "marginPercent" decimal(5,2) NOT NULL,
        "proposalMessage" text,
        "status" varchar NOT NULL DEFAULT 'DRAFT',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_order_quotation" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_requests"("id"),
        CONSTRAINT "FK_order_supplier" FOREIGN KEY ("selected_supplier_id") REFERENCES "suppliers"("id")
      )
    `);

    // Chat Messages table
    await queryRunner.query(`
      CREATE TABLE "chat_messages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "direction" varchar NOT NULL,
        "channel" varchar NOT NULL,
        "fromRole" varchar NOT NULL,
        "phoneNumber" varchar,
        "related_quotation_request_id" uuid,
        "content" text NOT NULL,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_chat_message_quotation" FOREIGN KEY ("related_quotation_request_id") REFERENCES "quotation_requests"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_installers_whatsapp" ON "installers"("whatsappNumber")`);
    await queryRunner.query(`CREATE INDEX "IDX_quotations_status" ON "quotation_requests"("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_quotations_installer" ON "quotation_requests"("installer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_quotations_created" ON "quotation_requests"("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_chat_messages_phone" ON "chat_messages"("phoneNumber")`);
    await queryRunner.query(`CREATE INDEX "IDX_chat_messages_quotation" ON "chat_messages"("related_quotation_request_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_chat_messages_quotation"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_messages_phone"`);
    await queryRunner.query(`DROP INDEX "IDX_quotations_created"`);
    await queryRunner.query(`DROP INDEX "IDX_quotations_installer"`);
    await queryRunner.query(`DROP INDEX "IDX_quotations_status"`);
    await queryRunner.query(`DROP INDEX "IDX_installers_whatsapp"`);

    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "supplier_quotes"`);
    await queryRunner.query(`DROP TABLE "quotation_items"`);
    await queryRunner.query(`DROP TABLE "quotation_requests"`);
    await queryRunner.query(`DROP TABLE "air_conditioner_models"`);
    await queryRunner.query(`DROP TABLE "suppliers"`);
    await queryRunner.query(`DROP TABLE "installers"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
