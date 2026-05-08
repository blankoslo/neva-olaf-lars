import { PrismaClient } from './generated/client';
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create 5 users with hashed passwords
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        name: 'Diana',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'edward@example.com',
        name: 'Edward',
        password: await bcrypt.hash('password123', 10),
      },
    }),
  ]);

  // Create a sample trip
  const trip = await prisma.trip.create({
    data: {
      title: 'Wilhelms runde',
      description: 'En klassisk tur i Finnskogen over tre dager.',
      area: 'Finnskogen · Solør',
      startDate: new Date('2026-09-12'),
      endDate: new Date('2026-09-14'),
      status: 'PLANNING',
      stages: {
        create: [
          {
            dayNumber: 1,
            date: new Date('2026-09-12'),
            fromLocation: 'Røvollen',
            toLocation: 'Linneset',
            distanceKm: 11,
            durationMinutes: 270,
            elevationGainM: 280,
            elevationLossM: 210,
            hutName: 'Linneset hytte',
          },
          {
            dayNumber: 2,
            date: new Date('2026-09-13'),
            fromLocation: 'Linneset',
            toLocation: 'Roenshaugen',
            distanceKm: 14,
            durationMinutes: 315,
            elevationGainM: 410,
            elevationLossM: 320,
            hutName: 'Roenshaugen hytte',
          },
          {
            dayNumber: 3,
            date: new Date('2026-09-14'),
            fromLocation: 'Roenshaugen',
            toLocation: 'Røvollen',
            distanceKm: 13,
            durationMinutes: 290,
            elevationGainM: 220,
            elevationLossM: 380,
          },
        ],
      },
    },
  });

  // Connect all users to the trip
  await Promise.all(
    users.map((user, i) =>
      prisma.userTrip.create({
        data: {
          userId: user.id,
          tripId: trip.id,
          status: i === 0 ? 'ACCEPTED' : 'PENDING',
        },
      })
    )
  );

  console.log('Seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
