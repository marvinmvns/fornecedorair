import { AppDataSource } from '../data-source';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { User, UserRole } from '../../../domain/entities/user.entity';
import { Installer } from '../../../domain/entities/installer.entity';
import { Supplier } from '../../../domain/entities/supplier.entity';
import { AirConditionerModel, ACType, Voltage, EnergyClass } from '../../../domain/entities/air-conditioner-model.entity';
import { QuotationRequest, OriginChannel, QuotationStatus, EnvironmentType } from '../../../domain/entities/quotation-request.entity';
import { QuotationItem } from '../../../domain/entities/quotation-item.entity';
import { SupplierQuote, SupplierQuoteStatus } from '../../../domain/entities/supplier-quote.entity';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';
import { ChatMessage, MessageDirection, MessageChannel, MessageRole } from '../../../domain/entities/chat-message.entity';
import * as bcrypt from 'bcrypt';

async function generateMockData() {
  console.log('🎭 Generating comprehensive mock data...');

  await AppDataSource.initialize();

  // 1. Create Tenants
  console.log('\n📦 Creating tenants...');
  const tenants = [];

  for (let i = 0; i < 3; i++) {
    const tenant = AppDataSource.getRepository(Tenant).create({
      name: `Distribuidor ${['Alpha', 'Beta', 'Gamma'][i]}`,
      slug: ['alpha', 'beta', 'gamma'][i],
      primaryColor: ['#4361ee', '#f72585', '#06d6a0'][i],
      secondaryColor: ['#3a0ca3', '#b5179e', '#073b4c'][i],
      logoUrl: null,
      whatsappEntryNumber: `5511999${990 + i}0000`,
      defaultMarginPercent: 15 + i * 5,
      slaTargetHours: 48 - i * 12,
      isActive: true,
    });

    const saved = await AppDataSource.getRepository(Tenant).save(tenant);
    tenants.push(saved);
    console.log(`   ✅ ${saved.name} (${saved.slug})`);
  }

  // 2. Create Users for each tenant
  console.log('\n👥 Creating users...');
  const users = [];

  for (const tenant of tenants) {
    const roles = [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.ATTENDANT, UserRole.VIEW_ONLY];

    for (const role of roles) {
      const user = AppDataSource.getRepository(User).create({
        tenantId: tenant.id,
        name: `${role.toLowerCase()}@${tenant.slug}`,
        email: `${role.toLowerCase()}@${tenant.slug}.com`,
        passwordHash: await bcrypt.hash('password123', 10),
        role,
        isActive: true,
      });

      const saved = await AppDataSource.getRepository(User).save(user);
      users.push(saved);
      console.log(`   ✅ ${saved.email} (${saved.role})`);
    }
  }

  // 3. Create Air Conditioner Models
  console.log('\n❄️  Creating air conditioner models...');
  const models = [];

  const mockModels = [
    { brand: 'Daikin', name: 'Advance Inverter', btu: 9000, type: ACType.SPLIT, class: EnergyClass.A, cost: 2200, price: 2800, area: 12 },
    { brand: 'LG', name: 'Dual Inverter', btu: 9000, type: ACType.SPLIT, class: EnergyClass.A, cost: 2100, price: 2700, area: 12 },
    { brand: 'Samsung', name: 'WindFree', btu: 12000, type: ACType.SPLIT, class: EnergyClass.A, cost: 2800, price: 3600, area: 18 },
    { brand: 'Midea', name: 'Eco Inverter', btu: 12000, type: ACType.SPLIT, class: EnergyClass.B, cost: 1800, price: 2400, area: 18 },
    { brand: 'Fujitsu', name: 'Premium Inverter', btu: 18000, type: ACType.SPLIT, class: EnergyClass.A, cost: 3800, price: 4900, area: 25 },
    { brand: 'Elgin', name: 'Eco Power', btu: 18000, type: ACType.SPLIT, class: EnergyClass.C, cost: 2400, price: 3200, area: 25 },
    { brand: 'Daikin', name: 'Advance Heavy', btu: 24000, type: ACType.SPLIT, class: EnergyClass.A, cost: 4500, price: 5800, area: 35 },
    { brand: 'Consul', name: 'Janela Compacto', btu: 7500, type: ACType.WINDOW, class: EnergyClass.C, cost: 900, price: 1300, area: 10 },
    { brand: 'Springer', name: 'Janela Mecânico', btu: 10000, type: ACType.WINDOW, class: EnergyClass.C, cost: 1100, price: 1600, area: 15 },
    { brand: 'LG', name: 'Cassete 4 Vias', btu: 24000, type: ACType.CASSETTE, class: EnergyClass.A, cost: 5800, price: 7500, area: 40 },
    { brand: 'Carrier', name: 'Piso Teto', btu: 36000, type: ACType.FLOOR_CEILING, class: EnergyClass.B, cost: 6500, price: 8500, area: 50 },
    { brand: 'Gree', name: 'Eco Garden', btu: 12000, type: ACType.SPLIT, class: EnergyClass.A, cost: 1950, price: 2600, area: 18 },
  ];

  for (const tenant of tenants) {
    for (const mockModel of mockModels) {
      const model = AppDataSource.getRepository(AirConditionerModel).create({
        tenantId: tenant.id,
        sku: `${tenant.slug.toUpperCase()}-${mockModel.brand}-${mockModel.btu}`,
        brand: mockModel.brand,
        modelName: `${mockModel.name} ${mockModel.btu} BTU`,
        btuCapacity: mockModel.btu,
        type: mockModel.type,
        inverter: mockModel.class === EnergyClass.A,
        voltage: mockModel.btu > 18000 ? Voltage.V220_THREE_PHASE : Voltage.V220_SINGLE,
        energyEfficiencyClass: mockModel.class,
        noiseLevelDb: 20 + Math.floor(Math.random() * 10),
        wifiEnabled: mockModel.class === EnergyClass.A,
        recommendedAreaM2: mockModel.area,
        baseCost: mockModel.cost,
        suggestedRetailPrice: mockModel.price,
        features: JSON.stringify(['Timer', 'Sleep Mode', mockModel.class === EnergyClass.A ? 'Wi-Fi' : 'Básico']),
        isActive: true,
      });

      const saved = await AppDataSource.getRepository(AirConditionerModel).save(model);
      models.push(saved);
    }
  }

  console.log(`   ✅ ${models.length} models created`);

  // 4. Create Suppliers
  console.log('\n🏢 Creating suppliers...');
  const suppliers = [];

  const mockSuppliers = [
    { name: 'Distribuidora Clima Frio Ltda', phone: '5511999990001', leadTime: 5 },
    { name: 'MegaAr Distribuidora', phone: '5511999990002', leadTime: 7 },
    { name: 'TechClima Supply', phone: null, leadTime: 10, api: 'http://api.techclima.com' },
    { name: 'Ar Express HVAC', phone: '5511999990004', leadTime: 3 },
    { name: 'ClimaTop Distribuidora', phone: '5511999990005', leadTime: 6 },
  ];

  for (const tenant of tenants) {
    for (const mockSupplier of mockSuppliers) {
      const supplier = AppDataSource.getRepository(Supplier).create({
        tenantId: tenant.id,
        name: mockSupplier.name,
        whatsappNumber: mockSupplier.phone,
        apiUrl: mockSupplier.api || null,
        averageLeadTimeDays: mockSupplier.leadTime,
        isActive: true,
      });

      const saved = await AppDataSource.getRepository(Supplier).save(supplier);
      suppliers.push(saved);
    }
  }

  console.log(`   ✅ ${suppliers.length} suppliers created`);

  // 5. Create Installers
  console.log('\n🔧 Creating installers...');
  const installers = [];

  const cities = [
    { city: 'São Paulo', state: 'SP' },
    { city: 'Rio de Janeiro', state: 'RJ' },
    { city: 'Belo Horizonte', state: 'MG' },
    { city: 'Campinas', state: 'SP' },
    { city: 'Curitiba', state: 'PR' },
    { city: 'Porto Alegre', state: 'RS' },
  ];

  for (const tenant of tenants) {
    for (let i = 0; i < 10; i++) {
      const location = cities[i % cities.length];
      const installer = AppDataSource.getRepository(Installer).create({
        tenantId: tenant.id,
        name: `Instalador ${tenant.slug.charAt(0).toUpperCase()}${i + 1}`,
        whatsappNumber: `55119999${String(i).padStart(5, '0')}`,
        companyName: i % 2 === 0 ? `Empresa ${i + 1}` : null,
        city: location.city,
        state: location.state,
        zipCode: `${String(i).padStart(5, '0')}-000`,
      });

      const saved = await AppDataSource.getRepository(Installer).save(installer);
      installers.push(saved);
    }
  }

  console.log(`   ✅ ${installers.length} installers created`);

  // 6. Create Quotations
  console.log('\n📋 Creating quotations...');
  let quotationCount = 0;

  for (const tenant of tenants) {
    const tenantInstallers = installers.filter(i => i.tenantId === tenant.id);
    const tenantModels = models.filter(m => m.tenantId === tenant.id);
    const tenantSuppliers = suppliers.filter(s => s.tenantId === tenant.id);

    for (let i = 0; i < 20; i++) {
      const installer = tenantInstallers[Math.floor(Math.random() * tenantInstallers.length)];
      const status = [QuotationStatus.OPEN, QuotationStatus.WAITING_SUPPLIERS, QuotationStatus.RECEIVED_SUPPLIERS, QuotationStatus.PROPOSAL_SENT][Math.floor(Math.random() * 4)];

      const quotation = AppDataSource.getRepository(QuotationRequest).create({
        tenantId: tenant.id,
        originChannel: Math.random() > 0.7 ? OriginChannel.API : OriginChannel.WHATSAPP,
        installerId: installer.id,
        description: `Preciso de ar-condicionado para ambiente de ${15 + Math.floor(Math.random() * 40)}m²`,
        environmentType: [EnvironmentType.RESIDENTIAL, EnvironmentType.COMMERCIAL][Math.floor(Math.random() * 2)],
        environmentAreaM2: 15 + Math.floor(Math.random() * 40),
        locationCity: installer.city,
        locationState: installer.state,
        voltagePreference: Math.random() > 0.5 ? '220V' : '110V',
        productTypePreference: 'split',
        brandPreference: Math.random() > 0.5 ? 'Daikin' : 'LG',
        maxBudget: 2000 + Math.floor(Math.random() * 5000),
        deadlineDays: 7 + Math.floor(Math.random() * 14),
        status,
      });

      const savedQuotation = await AppDataSource.getRepository(QuotationRequest).save(quotation);

      // Add items
      const itemCount = 1 + Math.floor(Math.random() * 2);
      for (let j = 0; j < itemCount; j++) {
        const model = tenantModels[Math.floor(Math.random() * tenantModels.length)];

        await AppDataSource.getRepository(QuotationItem).save({
          quotationRequestId: savedQuotation.id,
          airConditionerModelId: model.id,
          quantity: 1 + Math.floor(Math.random() * 3),
          notes: 'Sugerido automaticamente',
        });
      }

      // Add supplier quotes if status is advanced
      if (status !== QuotationStatus.OPEN) {
        for (const supplier of tenantSuppliers.slice(0, 3)) {
          await AppDataSource.getRepository(SupplierQuote).save({
            quotationRequestId: savedQuotation.id,
            supplierId: supplier.id,
            totalPrice: 2000 + Math.floor(Math.random() * 4000),
            unitPrice: 2000 + Math.floor(Math.random() * 4000),
            leadTimeDays: 3 + Math.floor(Math.random() * 10),
            stockAvailable: Math.random() > 0.3,
            paymentConditions: Math.random() > 0.5 ? 'À vista com 5% desconto' : '30/60 dias',
            warrantyMonths: 12,
            status: SupplierQuoteStatus.RECEIVED,
          });
        }
      }

      // Add chat messages for WhatsApp quotations
      if (savedQuotation.originChannel === OriginChannel.WHATSAPP) {
        await AppDataSource.getRepository(ChatMessage).save({
          direction: MessageDirection.INBOUND,
          channel: MessageChannel.WHATSAPP,
          fromRole: MessageRole.INSTALLER,
          phoneNumber: installer.whatsappNumber,
          relatedQuotationRequestId: savedQuotation.id,
          content: savedQuotation.description,
        });

        await AppDataSource.getRepository(ChatMessage).save({
          direction: MessageDirection.OUTBOUND,
          channel: MessageChannel.WHATSAPP,
          fromRole: MessageRole.LLM,
          phoneNumber: installer.whatsappNumber,
          relatedQuotationRequestId: savedQuotation.id,
          content: '✅ Perfeito! Recebi sua solicitação. Processando...',
        });
      }

      quotationCount++;
    }
  }

  console.log(`   ✅ ${quotationCount} quotations created with items, quotes, and messages`);

  console.log('\n✅ Mock data generation completed!');
  console.log('\n📊 Summary:');
  console.log(`   - Tenants: ${tenants.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Models: ${models.length}`);
  console.log(`   - Suppliers: ${suppliers.length}`);
  console.log(`   - Installers: ${installers.length}`);
  console.log(`   - Quotations: ${quotationCount}`);

  await AppDataSource.destroy();
}

generateMockData().catch(error => {
  console.error('❌ Error generating mock data:', error);
  process.exit(1);
});
