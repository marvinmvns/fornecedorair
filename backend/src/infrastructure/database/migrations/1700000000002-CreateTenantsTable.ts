import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenantsTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenants table
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar UNIQUE NOT NULL,
        "slug" varchar UNIQUE NOT NULL,
        "primaryColor" varchar,
        "secondaryColor" varchar,
        "logoUrl" varchar,
        "whatsappEntryNumber" varchar,
        "defaultMarginPercent" decimal(5,2) NOT NULL DEFAULT 15,
        "slaTargetHours" integer NOT NULL DEFAULT 48,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tenants"`);
  }
}
