import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateChatTables1700000001001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create conversations table
    await queryRunner.createTable(
      new Table({
        name: 'conversations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'contact_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'contact_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'whatsapp_chat_id',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'last_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'last_message_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'unread_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'closed', 'archived'],
            default: "'active'",
          },
          {
            name: 'tenant_id',
            type: 'uuid',
          },
          {
            name: 'installer_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'quotation_request_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create messages table
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'conversation_id',
            type: 'uuid',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'sender',
            type: 'enum',
            enum: ['contact', 'agent', 'system'],
            default: "'contact'",
          },
          {
            name: 'sender_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['sent', 'delivered', 'read', 'failed'],
            default: "'sent'",
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['text', 'image', 'document', 'audio', 'video', 'location'],
            default: "'text'",
          },
          {
            name: 'whatsapp_message_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'media_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign keys for conversations
    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        columnNames: ['installer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'installers',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        columnNames: ['quotation_request_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'quotation_requests',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign keys for messages
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['conversation_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conversations',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Create indexes
    await queryRunner.query(
      'CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_conversations_status ON conversations(status)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_conversations_last_message_time ON conversations(last_message_time DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_messages_conversation_id ON messages(conversation_id)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_messages_whatsapp_id ON messages(whatsapp_message_id)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query('DROP INDEX IF EXISTS idx_messages_whatsapp_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_messages_timestamp');
    await queryRunner.query('DROP INDEX IF EXISTS idx_messages_conversation_id');
    await queryRunner.query(
      'DROP INDEX IF EXISTS idx_conversations_last_message_time',
    );
    await queryRunner.query('DROP INDEX IF EXISTS idx_conversations_status');
    await queryRunner.query('DROP INDEX IF EXISTS idx_conversations_tenant_id');

    // Drop tables (foreign keys are dropped automatically)
    await queryRunner.dropTable('messages');
    await queryRunner.dropTable('conversations');
  }
}
