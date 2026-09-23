const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Wiping all fake / demo data for production...");

  await prisma.report.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.joinRequest.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.orphanListing.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✨ Database successfully cleaned! Pristine state ready for real users.");
}

main()
  .catch((e) => {
    console.error("Error wiping database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
