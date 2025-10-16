import { PrismaClient } from "../../prisma/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const dbClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  }).$extends(withAccelerate());
};

type DatabaseClient = ReturnType<typeof dbClientSingleton>;

declare global {
  var dbGlobal: DatabaseClient | undefined;
}

export const db = globalThis.dbGlobal ?? dbClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") {
  globalThis.dbGlobal = db;
}
