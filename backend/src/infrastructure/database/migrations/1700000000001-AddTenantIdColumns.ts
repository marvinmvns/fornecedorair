import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantIdColumns1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add tenantId to users table (nullable for now to not break existing data)
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tenant_id" uuid
    `);

    // Add tenantId to installers table
    await queryRunner.query(`
      ALTER TABLE "installers" ADD COLUMN IF NOT EXISTS "tenant_id" uuid
    `);

    // Add tenantId to suppliers table
    await queryRunner.query(`
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "tenantId" uuid
    `);

    // Add tenantId to air_conditioner_models table
    await queryRunner.query(`
      ALTER TABLE "air_conditioner_models" ADD COLUMN IF NOT EXISTS "tenantId" uuid
    `);

    // Add tenantId to quotation_requests table
    await queryRunner.query(`
      ALTER TABLE "quotation_requests" ADD COLUMN IF NOT EXISTS "tenantId" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "tenant_id"`);
    await queryRunner.query(`ALTER TABLE "installers" DROP COLUMN IF EXISTS "tenant_id"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "tenantId"`);
    await queryRunner.query(`ALTER TABLE "air_conditioner_models" DROP COLUMN IF EXISTS "tenantId"`);
    await queryRunner.query(`ALTER TABLE "quotation_requests" DROP COLUMN IF EXISTS "tenantId"`);
  }
}
