import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOptimizedIndexes1700000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===== QUOTATION_REQUESTS =====
    // Composite index for tenant + status (dashboard stats, filtering)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_quotation_requests_tenant_status"
      ON "quotation_requests" ("tenantId", "status")
    `);

    // Composite index for tenant + created_at (timeline queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_quotation_requests_tenant_created"
      ON "quotation_requests" ("tenantId", "createdAt")
    `);

    // Index on installer_id for frequent JOINs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_quotation_requests_installer"
      ON "quotation_requests" ("installer_id")
    `);

    // Index on status for filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_quotation_requests_status"
      ON "quotation_requests" ("status")
    `);

    // ===== USERS =====
    // Composite index for tenant + active users
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_tenant_active"
      ON "users" ("tenant_id", "isActive")
    `);

    // Index on tenant_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_tenant"
      ON "users" ("tenant_id")
    `);

    // ===== INSTALLERS =====
    // Composite index for tenant + whatsapp lookup
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_installers_tenant_whatsapp"
      ON "installers" ("tenant_id", "whatsappNumber")
    `);

    // Index on whatsappNumber for fast lookup
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_installers_whatsapp"
      ON "installers" ("whatsappNumber")
    `);

    // Index on tenant_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_installers_tenant"
      ON "installers" ("tenant_id")
    `);

    // ===== SUPPLIERS =====
    // Composite index for active suppliers per tenant
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_suppliers_tenant_active"
      ON "suppliers" ("tenantId", "isActive")
    `);

    // Index on tenantId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_suppliers_tenant"
      ON "suppliers" ("tenantId")
    `);

    // ===== SUPPLIER_QUOTES =====
    // Index on quotation_request_id for frequent JOINs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_supplier_quotes_quotation"
      ON "supplier_quotes" ("quotation_request_id")
    `);

    // Index on supplier_id for JOINs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_supplier_quotes_supplier"
      ON "supplier_quotes" ("supplier_id")
    `);

    // Composite index for quotation + status filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_supplier_quotes_quotation_status"
      ON "supplier_quotes" ("quotation_request_id", "status")
    `);

    // ===== QUOTATION_ITEMS =====
    // Index on quotation_request_id for very frequent JOINs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_quotation_items_quotation"
      ON "quotation_items" ("quotation_request_id")
    `);

    // Index on air_conditioner_model_id for JOINs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_quotation_items_model"
      ON "quotation_items" ("air_conditioner_model_id")
    `);

    // ===== CHAT_MESSAGES =====
    // Composite index for phone + created_at (conversation history)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chat_messages_phone_created"
      ON "chat_messages" ("phoneNumber", "createdAt")
    `);

    // Index on phoneNumber for lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chat_messages_phone"
      ON "chat_messages" ("phoneNumber")
    `);

    // Index on related_quotation_request_id for JOINs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chat_messages_quotation"
      ON "chat_messages" ("related_quotation_request_id")
    `);

    // ===== AIR_CONDITIONER_MODELS =====
    // Composite index for active models per tenant
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_air_conditioner_models_tenant_active"
      ON "air_conditioner_models" ("tenantId", "isActive")
    `);

    // Index on BTU capacity for filtering by area recommendations
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_air_conditioner_models_btu"
      ON "air_conditioner_models" ("btuCapacity")
    `);

    // Index on tenantId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_air_conditioner_models_tenant"
      ON "air_conditioner_models" ("tenantId")
    `);

    // Composite index for filtering by type and tenant
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_air_conditioner_models_tenant_type"
      ON "air_conditioner_models" ("tenantId", "type")
    `);

    // ===== ORDERS =====
    // Index on quotation_request_id for JOINs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_quotation"
      ON "orders" ("quotation_request_id")
    `);

    // Index on selected_supplier_id for JOINs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_supplier"
      ON "orders" ("selected_supplier_id")
    `);

    // Index on status for filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_status"
      ON "orders" ("status")
    `);

    // Composite index for created_at ordering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_created"
      ON "orders" ("createdAt")
    `);

    console.log('✅ Optimized indexes created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes in reverse order
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_supplier"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_quotation"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_air_conditioner_models_tenant_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_air_conditioner_models_tenant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_air_conditioner_models_btu"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_air_conditioner_models_tenant_active"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_chat_messages_quotation"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_chat_messages_phone"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_chat_messages_phone_created"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_quotation_items_model"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_quotation_items_quotation"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_supplier_quotes_quotation_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_supplier_quotes_supplier"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_supplier_quotes_quotation"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_suppliers_tenant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_suppliers_tenant_active"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_installers_tenant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_installers_whatsapp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_installers_tenant_whatsapp"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_tenant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_tenant_active"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_quotation_requests_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_quotation_requests_installer"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_quotation_requests_tenant_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_quotation_requests_tenant_status"`);

    console.log('✅ Optimized indexes dropped successfully');
  }
}
