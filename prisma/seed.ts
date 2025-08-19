import { PrismaClient, VillaStatus } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const proj = await prisma.project.create({
    data: {
      name: 'Azure Bay Residences',
      description: 'Seaside villa community'
    }
  })

  await prisma.villa.createMany({
    data: [
      {
        projectId: proj.id,
        name: 'Villa A1',
        villaType: '2BR Townhouse',
        rooms: 2,
        landSqm: 180,
        villaSqm: 120,
        floor1Sqm: 60,
        floor2Sqm: 60,
        rooftopSqm: 20,
        gardenPoolSqm: 40,
        pricePerSqm: 2500,
        basePrice: 300000,
        vatRate: 0.11,
        priceWithVat: 300000 * 1.11,
        firstPayment: 60000,
        status: 'available',
        areaSqm: 120,
        monthlyPriceGrowthPct: 1.5,
        leaseholdEndDate: new Date('2054-12-01T00:00:00Z'),
        dailyRateUSD: 220,
        rentalGrowthPct: 5,
        occupancyPct: 60
      },
      {
        projectId: proj.id,
        name: 'Villa B3',
        villaType: '3BR Pool',
        rooms: 3,
        landSqm: 260,
        villaSqm: 180,
        floor1Sqm: 90,
        floor2Sqm: 90,
        rooftopSqm: 0,
        gardenPoolSqm: 80,
        pricePerSqm: 2700,
        basePrice: 486000,
        vatRate: 0.11,
        priceWithVat: 486000 * 1.11,
        firstPayment: 97200,
        status: 'available',
        areaSqm: 180,
        monthlyPriceGrowthPct: 1.2,
        leaseholdEndDate: new Date('2050-06-01T00:00:00Z'),
        dailyRateUSD: 280,
        rentalGrowthPct: 4,
        occupancyPct: 62
      }
    ]
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })