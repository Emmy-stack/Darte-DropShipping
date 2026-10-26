export enum Role {
  SELLER = "SELLER",
  SUPPLIER = "SUPPLIER",
  ADMIN = "ADMIN",
}

export interface UserProfile {
  id: string;
  clerkUserId: string;
  role: Role | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  userProfileId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfile {
  id: string;
  userProfileId: string;
  storeName: string;
  storeDescription: string;
  storeCategory: string;
  country: string;
  state: string;
  city: string;
  phone: string;
  goals: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProfile {
  id: string;
  userProfileId: string;
  businessName: string;
  businessDescription: string;
  businessCategory: string;
  country: string;
  state: string;
  city: string;
  businessAddress: string;
  phone: string;
  productsSupplied: string[];
  productCount: string;
  salesChannels: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOnboardingInput {
  storeName: string;
  storeDescription: string;
  storeCategory: string;
  country: string;
  state: string;
  city: string;
  phone: string;
  goals: string[];
}

export interface SupplierOnboardingInput {
  businessName: string;
  businessDescription: string;
  businessCategory: string;
  country: string;
  state: string;
  city: string;
  businessAddress: string;
  phone: string;
  productsSupplied: string[];
  productCount: string;
  salesChannels: string[];
}
