"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Boxes,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  ShieldCheck,
  Package,
  Loader2,
  Check,
} from "lucide-react";
import { SupplierRegistrationInput } from "@/types/supplier";

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers",
  "Oyo",
  "Kano",
  "Ogun",
  "Enugu",
  "Delta",
  "Anambra",
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Nasarawa",
  "Niger",
  "Ondo",
  "Osun",
  "Plateau",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const CATEGORIES = [
  "Electronics",
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Home & Kitchen",
  "Health & Wellness",
  "Sports & Fitness",
  "Mobile Accessories",
  "Computers & Tech",
  "Other",
];

export default function SupplierRegistrationView() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState<SupplierRegistrationInput>({
    companyName: "",
    businessEmail: "",
    phone: "",
    country: "Nigeria",
    state: "Lagos",
    city: "",
    address: "",
    description: "",
    categoriesSupplied: ["Electronics"],
    website: "",
    logoUrl: "",
  });

  const toggleCategory = (cat: string) => {
    const current = formData.categoriesSupplied || [];
    if (current.includes(cat)) {
      setFormData({
        ...formData,
        categoriesSupplied: current.filter((c) => c !== cat),
      });
    } else {
      setFormData({
        ...formData,
        categoriesSupplied: [...current, cat],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.companyName.trim()) {
      setErrorMessage("Please enter your company or business name.");
      return;
    }
    if (!formData.businessEmail.trim()) {
      setErrorMessage("Please enter your business email.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Please enter your business phone number.");
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage("Please enter the city or market area of your warehouse.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/supplier/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit supplier application.");
      }

      setIsSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-[#0B3D2E] text-[#DCFCE7] flex items-center justify-center mx-auto mb-6 shadow-md">
          <Package className="w-10 h-10 stroke-[2.2] animate-bounce" />
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Application Submitted</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
          Welcome to Darté Supplier Hub
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[#4B5563] max-w-md mx-auto leading-relaxed">
          Your wholesale supplier profile for <strong className="text-[#111827]">{formData.companyName}</strong> has been created.
          Our team is reviewing your warehouse and verification details.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1">
          <div className="font-bold">Next Steps for Verification:</div>
          <div>• You can start configuring your supplier company profile and adding draft products now.</div>
          <div>• Once approved by Darté admins, your active products will be open for sellers to import.</div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/supplier/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B3D2E] hover:bg-[#0E4736] text-white text-sm font-semibold shadow-sm transition-all"
          >
            <span>Go to Supplier Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#374151] text-sm font-semibold transition-all shadow-xs"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Wholesale Supplier Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-[family-name:var(--font-heading)]">
          Supply Products to Nigerian Sellers
        </h1>
        <p className="mt-2 text-sm text-[#6B7280] max-w-lg mx-auto">
          Connect your warehouse inventory directly with hundreds of active online merchants across Darté.
        </p>
      </div>

      {/* Registration Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm">
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Details */}
          <div>
            <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#16A34A]" />
              <span>Company Information</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Company / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder="e.g. Apex Global Trading Ltd"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] text-sm focus:border-[#16A34A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Company Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your manufacturing, import focus, or distribution capabilities..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] text-sm focus:border-[#16A34A] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#16A34A]" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.businessEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, businessEmail: e.target.value })
                  }
                  placeholder="wholesale@yourcompany.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] text-sm focus:border-[#16A34A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Business Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+234 800 000 0000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] text-sm focus:border-[#16A34A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Website or Catalog Link (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={formData.website || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://yourcompany.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] text-sm focus:border-[#16A34A] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#16A34A]" />
              <span>Warehouse / Dispatch Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] text-sm focus:border-[#16A34A] focus:outline-none"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  City / Market Area *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g. Trade Fair, Alaba, Ikeja"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] text-sm focus:border-[#16A34A] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Warehouse or Office Street Address
                </label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="e.g. Block C, Suite 14, Trade Fair Complex"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] text-sm focus:border-[#16A34A] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-[#16A34A]" />
              <span>Product Categories Supplied</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = (formData.categoriesSupplied || []).includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#0B3D2E] text-white border-[#0B3D2E]"
                        : "bg-[#F8FAF9] text-[#4B5563] border-[#E5E7EB] hover:bg-white"
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#DCFCE7]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E7EB]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Supplier Application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
