import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin1234!", 12);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", name: "Admin User", password, role: "ADMIN" },
  });
  console.log("✅ Seed complete — admin@example.com / Admin1234!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
