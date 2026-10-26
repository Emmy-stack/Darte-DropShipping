import fs from "fs/promises";
import path from "path";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  Role,
  UserProfile,
  Store,
  SellerProfile,
  SupplierProfile,
  SellerOnboardingInput,
  SupplierOnboardingInput,
} from "../types/profile";

interface DatabaseSchema {
  users: Record<string, UserProfile>; // keyed by clerkUserId
  sellerProfiles: Record<string, SellerProfile>; // keyed by userProfileId
  supplierProfiles: Record<string, SupplierProfile>; // keyed by userProfileId
  stores: Record<string, Store>; // keyed by userProfileId
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "darte_db.json");

// In-memory cache synchronized with disk via mtime check
let inMemoryDB: DatabaseSchema | null = null;
let lastMtimeMs = 0;

export async function ensureDB(): Promise<DatabaseSchema> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    const stat = await fs.stat(DB_FILE).catch(() => null);

    // If cache is fresh compared to disk file, reuse it
    if (inMemoryDB && stat && stat.mtimeMs <= lastMtimeMs) {
      return inMemoryDB;
    }

    if (stat) {
      const content = await fs.readFile(DB_FILE, "utf-8");
      inMemoryDB = JSON.parse(content) as DatabaseSchema;
      lastMtimeMs = stat.mtimeMs;
    } else {
      if (!inMemoryDB) {
        inMemoryDB = {
          users: {},
          sellerProfiles: {},
          supplierProfiles: {},
          stores: {},
        };
      }
      await persistDB();
    }
  } catch {
    if (!inMemoryDB) {
      inMemoryDB = {
        users: {},
        sellerProfiles: {},
        supplierProfiles: {},
        stores: {},
      };
    }
  }

  return inMemoryDB;
}

export async function persistDB(): Promise<void> {
  if (!inMemoryDB) return;
  try {
    await fs.mkdir(DB_DIR, { recursive: true });

    // Read latest from disk and merge before saving to avoid clobbering concurrent worker updates
    try {
      const diskContent = await fs.readFile(DB_FILE, "utf-8");
      const diskDB = JSON.parse(diskContent) as DatabaseSchema;
      inMemoryDB = {
        users: { ...diskDB.users, ...inMemoryDB.users },
        sellerProfiles: { ...diskDB.sellerProfiles, ...inMemoryDB.sellerProfiles },
        supplierProfiles: { ...diskDB.supplierProfiles, ...inMemoryDB.supplierProfiles },
        stores: { ...diskDB.stores, ...inMemoryDB.stores },
      };
    } catch {
      // File may not exist yet, proceed with inMemoryDB
    }

    const tempFile = `${DB_FILE}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 7)}`;
    await fs.writeFile(tempFile, JSON.stringify(inMemoryDB, null, 2), "utf-8");
    await fs.rename(tempFile, DB_FILE);

    const stat = await fs.stat(DB_FILE).catch(() => null);
    if (stat) {
      lastMtimeMs = stat.mtimeMs;
    }
  } catch (error) {
    console.error("Error persisting Darté database:", error);
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Reconciles seller onboarding state if database records (e.g. store products) prove
 * that the user has already configured and used their seller store.
 */
async function reconcileSellerFromDatabase(clerkUserId: string): Promise<UserProfile | null> {
  if (!clerkUserId) return null;

  let hasDatabaseStoreProducts = false;
  if (isDatabaseConfigured()) {
    try {
      const sp = await prisma.storeProduct.findFirst({
        where: { sellerId: clerkUserId },
      });
      hasDatabaseStoreProducts = Boolean(sp);
    } catch (err) {
      console.warn("Database check note in reconcileSellerFromDatabase:", err);
    }
  }

  const db = await ensureDB();
  const existing = db.users[clerkUserId];
  const hasProfileStore = existing && db.stores[existing.id];

  if (!hasDatabaseStoreProducts && !hasProfileStore) {
    return existing || null;
  }

  const now = new Date().toISOString();
  let profile = existing;

  if (!profile) {
    profile = {
      id: generateId("usr"),
      clerkUserId,
      role: Role.SELLER,
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    };
    db.users[clerkUserId] = profile;
  } else {
    profile.role = Role.SELLER;
    profile.onboardingCompleted = true;
    profile.updatedAt = now;
  }

  if (!db.stores[profile.id]) {
    db.stores[profile.id] = {
      id: generateId("str"),
      userProfileId: profile.id,
      name: "My Store",
      slug: "my-store",
      description: "Online storefront on Darté",
      category: "General",
      currency: "NGN",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  if (!db.sellerProfiles[profile.id]) {
    db.sellerProfiles[profile.id] = {
      id: generateId("sel"),
      userProfileId: profile.id,
      storeName: "My Store",
      storeDescription: "Online storefront on Darté",
      storeCategory: "General",
      country: "Nigeria 🇳🇬",
      state: "Lagos",
      city: "Lagos",
      phone: "",
      goals: ["Find products to sell"],
      createdAt: now,
      updatedAt: now,
    };
  }

  await persistDB();
  return profile;
}

/**
 * Checks whether a user has completed onboarding, inspecting profile store,
 * store definitions, and PostgreSQL store products.
 */
export async function isUserOnboarded(clerkUserId: string): Promise<boolean> {
  if (!clerkUserId) return false;
  const profile = await getUserProfile(clerkUserId);
  return Boolean(profile?.onboardingCompleted);
}

/**
 * Get or create UserProfile by Clerk User ID with database self-healing
 */
export async function getUserProfile(
  clerkUserId: string
): Promise<UserProfile | null> {
  const db = await ensureDB();
  let user = db.users[clerkUserId] || null;

  if (!user || !user.onboardingCompleted) {
    const reconciled = await reconcileSellerFromDatabase(clerkUserId);
    if (reconciled) {
      user = reconciled;
    }
  }

  return user;
}

/**
 * Set or change the user's role (SELLER or SUPPLIER).
 * Never overwrites an already completed onboarding status.
 */
export async function setUserRole(
  clerkUserId: string,
  role: Role
): Promise<UserProfile> {
  const db = await ensureDB();
  const existing = db.users[clerkUserId];
  const now = new Date().toISOString();

  if (existing) {
    existing.role = role;
    existing.updatedAt = now;
    await persistDB();
    return existing;
  }

  // Check if user has store products in PostgreSQL before assuming un-onboarded
  let alreadyOnboarded = false;
  if (isDatabaseConfigured()) {
    try {
      const sp = await prisma.storeProduct.findFirst({
        where: { sellerId: clerkUserId },
      });
      if (sp) alreadyOnboarded = true;
    } catch {
      // ignore
    }
  }

  const newProfile: UserProfile = {
    id: generateId("usr"),
    clerkUserId,
    role,
    onboardingCompleted: alreadyOnboarded,
    createdAt: now,
    updatedAt: now,
  };

  db.users[clerkUserId] = newProfile;
  await persistDB();
  return newProfile;
}

/**
 * Complete Seller Onboarding:
 * Updates UserProfile to onboardingCompleted = true,
 * creates SellerProfile, and creates Store.
 */
export async function completeSellerOnboarding(
  clerkUserId: string,
  input: SellerOnboardingInput
): Promise<{
  profile: UserProfile;
  sellerProfile: SellerProfile;
  store: Store;
}> {
  const db = await ensureDB();
  const now = new Date().toISOString();

  let profile = db.users[clerkUserId];
  if (!profile) {
    profile = {
      id: generateId("usr"),
      clerkUserId,
      role: Role.SELLER,
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    };
    db.users[clerkUserId] = profile;
  } else {
    profile.role = Role.SELLER;
    profile.onboardingCompleted = true;
    profile.updatedAt = now;
  }

  const sellerProfile: SellerProfile = {
    id: generateId("sel"),
    userProfileId: profile.id,
    storeName: input.storeName,
    storeDescription: input.storeDescription,
    storeCategory: input.storeCategory,
    country: input.country,
    state: input.state,
    city: input.city,
    phone: input.phone,
    goals: input.goals,
    createdAt: now,
    updatedAt: now,
  };
  db.sellerProfiles[profile.id] = sellerProfile;

  const store: Store = {
    id: generateId("str"),
    userProfileId: profile.id,
    name: input.storeName,
    slug: slugify(input.storeName) || "my-store",
    description: input.storeDescription,
    category: input.storeCategory,
    currency: "NGN",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  db.stores[profile.id] = store;

  await persistDB();
  return { profile, sellerProfile, store };
}

/**
 * Complete Supplier Onboarding:
 * Updates UserProfile to onboardingCompleted = true,
 * creates SupplierProfile.
 */
export async function completeSupplierOnboarding(
  clerkUserId: string,
  input: SupplierOnboardingInput
): Promise<{
  profile: UserProfile;
  supplierProfile: SupplierProfile;
}> {
  const db = await ensureDB();
  const now = new Date().toISOString();

  let profile = db.users[clerkUserId];
  if (!profile) {
    profile = {
      id: generateId("usr"),
      clerkUserId,
      role: Role.SUPPLIER,
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    };
    db.users[clerkUserId] = profile;
  } else {
    profile.role = Role.SUPPLIER;
    profile.onboardingCompleted = true;
    profile.updatedAt = now;
  }

  const supplierProfile: SupplierProfile = {
    id: generateId("sup"),
    userProfileId: profile.id,
    businessName: input.businessName,
    businessDescription: input.businessDescription,
    businessCategory: input.businessCategory,
    country: input.country,
    state: input.state,
    city: input.city,
    businessAddress: input.businessAddress,
    phone: input.phone,
    productsSupplied: input.productsSupplied,
    productCount: input.productCount,
    salesChannels: input.salesChannels,
    verified: false, // Under review initially
    createdAt: now,
    updatedAt: now,
  };
  db.supplierProfiles[profile.id] = supplierProfile;

  await persistDB();
  return { profile, supplierProfile };
}

/**
 * Fetch full user business context
 */
export async function getFullUserContext(clerkUserId: string): Promise<{
  profile: UserProfile | null;
  sellerProfile: SellerProfile | null;
  store: Store | null;
  supplierProfile: SupplierProfile | null;
}> {
  const profile = await getUserProfile(clerkUserId);
  const db = await ensureDB();

  if (!profile) {
    return {
      profile: null,
      sellerProfile: null,
      store: null,
      supplierProfile: null,
    };
  }

  return {
    profile,
    sellerProfile: db.sellerProfiles[profile.id] || null,
    store: db.stores[profile.id] || null,
    supplierProfile: db.supplierProfiles[profile.id] || null,
  };
}
