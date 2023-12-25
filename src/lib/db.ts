import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prisma = new PrismaClient({
  log: ["error", "warn", "info"],
}).$extends(withAccelerate());