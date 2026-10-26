import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return createPrismaClient();
  }

  const existing = globalForPrisma.prisma;
  const isStale =
    !existing ||
    typeof (existing as unknown as Record<string, unknown>).supplierProfile === "undefined" ||
    typeof (existing as unknown as Record<string, unknown>).product === "undefined" ||
    typeof (existing as unknown as Record<string, unknown>).order === "undefined";

  if (isStale) {
    if (typeof require !== "undefined" && require.cache) {
      Object.keys(require.cache).forEach((key) => {
        if (key.includes(".prisma") || key.includes("@prisma")) {
          delete require.cache[key];
        }
      });
    }
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma!;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
  has(_target, prop) {
    const client = getPrismaClient();
    return prop in client;
  },
});

/**
 * Checks whether a valid PostgreSQL connection string is configured in the environment.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(
    url &&
      !url.includes("REPLACE_WITH_YOUR") &&
      (url.startsWith("postgresql://") || url.startsWith("postgres://"))
  );
}
