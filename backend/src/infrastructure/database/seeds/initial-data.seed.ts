import { AppDataSource } from '../data-source';
import { AirConditionerModel, ACType, Voltage, EnergyClass } from '../../../domain/entities/air-conditioner-model.entity';
import { Supplier } from '../../../domain/entities/supplier.entity';

async function seed() {
  await AppDataSource.initialize();

  console.log('🌱 Seeding database...');

  const acRepo = AppDataSource.getRepository(AirConditionerModel);
  const supplierRepo = AppDataSource.getRepository(Supplier);

  // Seed Air Conditioner Models
  const models = [
    // Split 9000 BTU
    {
      sku: 'DAIKIN-SPLIT-9K-INV',
      brand: 'Daikin',
      modelName: 'Advance Inverter 9.000 BTU',
      btuCapacity: 9000,
      type: ACType.SPLIT,
      inverter: true,
      voltage: Voltage.V220_SINGLE,
      energyEfficiencyClass: EnergyClass.A,
      noiseLevelDb: 21,
      wifiEnabled: true,
      recommendedAreaM2: 12,
      baseCost: 2200,
      suggestedRetailPrice: 2800,
      features: JSON.stringify(['Wi-Fi', 'Inverter', 'Silencioso', 'Econômico']),
    },
    {
      sku: 'LG-SPLIT-9K-DUAL',
      brand: 'LG',
      modelName: 'Dual Inverter 9.000 BTU',
      btuCapacity: 9000,
      type: ACType.SPLIT,
      inverter: true,
      voltage: Voltage.V220_SINGLE,
      energyEfficiencyClass: EnergyClass.A,
      noiseLevelDb: 19,
      wifiEnabled: true,
      recommendedAreaM2: 12,
      baseCost: 2100,
      suggestedRetailPrice: 2700,
      features: JSON.stringify(['Wi-Fi', 'Dual Inverter', 'Ultra silencioso']),
    },
    // Split 12000 BTU
    {
      sku: 'SAMSUNG-SPLIT-12K-INV',
      brand: 'Samsung',
      modelName: 'WindFree Inverter 12.000 BTU',
      btuCapacity: 12000,
      type: ACType.SPLIT,
      inverter: true,
      voltage: Voltage.V220_SINGLE,
      energyEfficiencyClass: EnergyClass.A,
      noiseLevelDb: 22,
      wifiEnabled: true,
      recommendedAreaM2: 18,
      baseCost: 2800,
      suggestedRetailPrice: 3600,
      features: JSON.stringify(['Wi-Fi', 'WindFree', 'Inverter', 'Smart']),
    },
    {
      sku: 'MIDEA-SPLIT-12K',
      brand: 'Midea',
      modelName: 'Eco Inverter 12.000 BTU',
      btuCapacity: 12000,
      type: ACType.SPLIT,
      inverter: true,
      voltage: Voltage.V220_SINGLE,
      energyEfficiencyClass: EnergyClass.B,
      noiseLevelDb: 25,
      wifiEnabled: false,
      recommendedAreaM2: 18,
      baseCost: 1800,
      suggestedRetailPrice: 2400,
      features: JSON.stringify(['Inverter', 'Econômico', 'Timer']),
    },
    // Split 18000 BTU
    {
      sku: 'FUJITSU-SPLIT-18K-INV',
      brand: 'Fujitsu',
      modelName: 'Inverter Premium 18.000 BTU',
      btuCapacity: 18000,
      type: ACType.SPLIT,
      inverter: true,
      voltage: Voltage.V220_SINGLE,
      energyEfficiencyClass: EnergyClass.A,
      noiseLevelDb: 23,
      wifiEnabled: true,
      recommendedAreaM2: 25,
      baseCost: 3800,
      suggestedRetailPrice: 4900,
      features: JSON.stringify(['Wi-Fi', 'Inverter', 'Premium', 'Filtro avançado']),
    },
    {
      sku: 'ELGIN-SPLIT-18K',
      brand: 'Elgin',
      modelName: 'Eco Power 18.000 BTU',
      btuCapacity: 18000,
      type: ACType.SPLIT,
      inverter: false,
      voltage: Voltage.V220_SINGLE,
      energyEfficiencyClass: EnergyClass.C,
      noiseLevelDb: 28,
      wifiEnabled: false,
      recommendedAreaM2: 25,
      baseCost: 2400,
      suggestedRetailPrice: 3200,
      features: JSON.stringify(['Timer', 'Sleep mode', 'Básico']),
    },
    // Split 24000 BTU
    {
      sku: 'DAIKIN-SPLIT-24K-INV',
      brand: 'Daikin',
      modelName: 'Advance Inverter 24.000 BTU',
      btuCapacity: 24000,
      type: ACType.SPLIT,
      inverter: true,
      voltage: Voltage.V220_SINGLE,
      energyEfficiencyClass: EnergyClass.A,
      noiseLevelDb: 26,
      wifiEnabled: true,
      recommendedAreaM2: 35,
      baseCost: 4500,
      suggestedRetailPrice: 5800,
      features: JSON.stringify(['Wi-Fi', 'Inverter', 'Alta capacidade']),
    },
    // Window units
    {
      sku: 'CONSUL-WINDOW-7.5K',
      brand: 'Consul',
      modelName: 'Janela 7.500 BTU',
      btuCapacity: 7500,
      type: ACType.WINDOW,
      inverter: false,
      voltage: Voltage.V110,
      energyEfficiencyClass: EnergyClass.C,
      noiseLevelDb: 35,
      wifiEnabled: false,
      recommendedAreaM2: 10,
      baseCost: 900,
      suggestedRetailPrice: 1300,
      features: JSON.stringify(['Compacto', 'Econômico', 'Timer']),
    },
    {
      sku: 'SPRINGER-WINDOW-10K',
      brand: 'Springer',
      modelName: 'Janela Mecânico 10.000 BTU',
      btuCapacity: 10000,
      type: ACType.WINDOW,
      inverter: false,
      voltage: Voltage.V220_SINGLE,
      energyEfficiencyClass: EnergyClass.C,
      noiseLevelDb: 38,
      wifiEnabled: false,
      recommendedAreaM2: 15,
      baseCost: 1100,
      suggestedRetailPrice: 1600,
      features: JSON.stringify(['Compacto', 'Resistente']),
    },
    // Cassette
    {
      sku: 'LG-CASSETTE-24K',
      brand: 'LG',
      modelName: 'Cassete Inverter 24.000 BTU',
      btuCapacity: 24000,
      type: ACType.CASSETTE,
      inverter: true,
      voltage: Voltage.V220_THREE_PHASE,
      energyEfficiencyClass: EnergyClass.A,
      noiseLevelDb: 30,
      wifiEnabled: true,
      recommendedAreaM2: 40,
      baseCost: 5800,
      suggestedRetailPrice: 7500,
      features: JSON.stringify(['4 vias', 'Inverter', 'Comercial']),
    },
  ];

  for (const modelData of models) {
    const exists = await acRepo.findOne({ where: { sku: modelData.sku } });
    if (!exists) {
      await acRepo.save(acRepo.create(modelData));
      console.log(`✅ Created AC model: ${modelData.brand} ${modelData.modelName}`);
    }
  }

  // Seed Suppliers
  const suppliers = [
    {
      name: 'Distribuidora Clima Frio Ltda',
      whatsappNumber: '5511999990001',
      apiUrl: null,
      averageLeadTimeDays: 5,
    },
    {
      name: 'MegaAr Distribuidora',
      whatsappNumber: '5511999990002',
      apiUrl: null,
      averageLeadTimeDays: 7,
    },
    {
      name: 'TechClima Supply',
      whatsappNumber: null,
      apiUrl: 'http://api.techclima.com',
      averageLeadTimeDays: 10,
    },
    {
      name: 'Ar Express HVAC',
      whatsappNumber: '5511999990004',
      apiUrl: null,
      averageLeadTimeDays: 3,
    },
  ];

  for (const supplierData of suppliers) {
    const exists = await supplierRepo.findOne({ where: { name: supplierData.name } });
    if (!exists) {
      await supplierRepo.save(supplierRepo.create(supplierData));
      console.log(`✅ Created supplier: ${supplierData.name}`);
    }
  }

  console.log('✅ Seeding completed!');

  await AppDataSource.destroy();
}

seed().catch(error => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
