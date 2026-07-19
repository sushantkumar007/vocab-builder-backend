import bcrypt from "bcryptjs";
import { prisma } from "./index.js";
import { env } from "../config/env.js";

async function main() {
  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD;

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: "Administrator",
      username: "admin01",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  console.log("Admin user created");
}

main()
  .catch((error) => {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
