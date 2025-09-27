import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create tags
  await prisma.tag.upsert({
    where: { id: 'bds-tag' },
    update: {},
    create: {
      id: 'bds-tag',
      name: 'BDS',
      description: 'Boycott, Divestment, and Sanctions violations',
    },
  });

  await prisma.tag.upsert({
    where: { id: 'defense-tag' },
    update: {},
    create: {
      id: 'defense-tag',
      name: 'DEFENSE',
      description: 'Defense contractor activities',
    },
  });

  await prisma.tag.upsert({
    where: { id: 'surveillance-tag' },
    update: {},
    create: {
      id: 'surveillance-tag',
      name: 'SURVEILLANCE',
      description: 'Surveillance technology',
    },
  });

  await prisma.tag.upsert({
    where: { id: 'shariah-tag' },
    update: {},
    create: {
      id: 'shariah-tag',
      name: 'SHARIAH',
      description: 'Shariah compliance',
    },
  });

  // Create sources
  const afscSource = await prisma.source.upsert({
    where: { id: 'afsc-source' },
    update: {},
    create: {
      id: 'afsc-source',
      domain: 'afsc.org',
      title: 'American Friends Service Committee',
      url: 'https://afsc.org/investigate',
      publisher: 'AFSC',
    },
  });

  const sipriSource = await prisma.source.upsert({
    where: { id: 'sipri-source' },
    update: {},
    create: {
      id: 'sipri-source',
      domain: 'sipri.org',
      title: 'SIPRI Arms Industry Database',
      url: 'https://www.sipri.org/databases/armsindustry',
      publisher: 'SIPRI',
    },
  });

  const effSource = await prisma.source.upsert({
    where: { id: 'eff-source' },
    update: {},
    create: {
      id: 'eff-source',
      domain: 'atlasofsurveillance.org',
      title: 'EFF Atlas of Surveillance',
      url: 'https://atlasofsurveillance.org',
      publisher: 'Electronic Frontier Foundation',
    },
  });

  // Create companies
  const apple = await prisma.company.upsert({
    where: { ticker: 'AAPL' },
    update: {},
    create: {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      country: 'US',
      cik: '0000320193',
    },
  });

  const lockheed = await prisma.company.upsert({
    where: { ticker: 'LMT' },
    update: {},
    create: {
      ticker: 'LMT',
      name: 'Lockheed Martin Corporation',
      country: 'US',
      cik: '0000936468',
    },
  });

  const cocaCola = await prisma.company.upsert({
    where: { ticker: 'KO' },
    update: {},
    create: {
      ticker: 'KO',
      name: 'The Coca-Cola Company',
      country: 'US',
      cik: '0000021344',
    },
  });

  // Create evidence
  await prisma.evidence.upsert({
    where: { id: 'apple-surveillance' },
    update: {},
    create: {
      id: 'apple-surveillance',
      companyId: apple.id,
      tagId: 'surveillance-tag',
      sourceId: effSource.id,
      strength: 'HIGH',
      notes: 'Facial recognition technology in iOS devices',
    },
  });

  await prisma.evidence.upsert({
    where: { id: 'lockheed-defense' },
    update: {},
    create: {
      id: 'lockheed-defense',
      companyId: lockheed.id,
      tagId: 'defense-tag',
      sourceId: sipriSource.id,
      strength: 'HIGH',
      notes: 'Top 10 arms producer globally',
    },
  });

  await prisma.evidence.upsert({
    where: { id: 'coca-bds' },
    update: {},
    create: {
      id: 'coca-bds',
      companyId: cocaCola.id,
      tagId: 'bds-tag',
      sourceId: afscSource.id,
      strength: 'MEDIUM',
      notes: 'Operations in occupied territories',
    },
  });

  // Create arms ranking
  await prisma.armsRank.upsert({
    where: { id: 'lockheed-rank-2024' },
    update: {},
    create: {
      id: 'lockheed-rank-2024',
      companyId: lockheed.id,
      sipriRank: 1,
      armsRevenueUsd: 65000000000, // $65B
      year: 2024,
      sourceId: sipriSource.id,
    },
  });

  // Create contracts
  await prisma.contract.upsert({
    where: { id: 'lockheed-dod-2024' },
    update: {},
    create: {
      id: 'lockheed-dod-2024',
      companyId: lockheed.id,
      agency: 'Department of Defense',
      psc: '10',
      amountUsd: 50000000000, // $50B
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-12-31'),
      sourceId: sipriSource.id,
    },
  });

  // Create financials
  await prisma.financial.upsert({
    where: { id: 'apple-financials-2024' },
    update: {},
    create: {
      id: 'apple-financials-2024',
      companyId: apple.id,
      period: '2024-Q4',
      debt: 100000000000, // $100B
      cashSecurities: 50000000000, // $50B
      receivables: 20000000000, // $20B
      marketCap: 3000000000000, // $3T
      sourceId: afscSource.id,
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
