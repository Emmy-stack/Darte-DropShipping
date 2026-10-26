"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  ShieldCheck,
  Clock,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  SupplierProfileData,
  SupplierProfileUpdateInput,
} from "@/types/supplier";

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

interface SupplierProfileViewProps {
  initialSupplier: SupplierProfileData;
}

export default function SupplierProfileView({
  initialSupplier,
}: SupplierProfileViewProps) {
  const router = useRouter();
  const [supplier, setSupplier] = useState<SupplierProfileData>(initialSupplier);

  const [formData, setFormData] = useState<SupplierProfileUpdateInput>({
    companyName: initialSupplier.companyName,
    businessEmail: initialSupplier.businessEmail,
    phone: initialSupplier.phone,
    state: initialSupplier.state,
    city: initialSupplier.city,
    address: initialSupplier.address || "",
    description: initialSupplier.description || "",
    website: initialSupplier.website || "",
    logoUrl: initialSupplier.logoUrl || "",
    categoriesSupplied: initialSupplier.categoriesSupplied || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.companyName?.trim()) {
      setErrorMessage("Company name cannot be empty.");
      return;
    }
    if (!formData.businessEmail?.trim()) {
      setErrorMessage("Business email cannot be empty.");
      return;
    }
    if (!formData.phone?.trim()) {
      setErrorMessage("Phone number cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/supplier/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setSupplier(data.supplier);
      setSuccessMessage("Company profile updated successfully!");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "An error occurred while saving."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isApproved = supplier.verificationStatus === "APPROVED";
  const isPending = supplier.verificationStatus === "PENDING";
  const formattedDate = new Date(supplier.createdAt).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] font-[family-name:var(--font-heading)]">
          Company Profile &amp; Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
          Manage your business credentials, warehouse location, and view your verification status.
        </p>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Verification Status Card */}
      <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B3D2E] text-white flex items-center justify-center font-bold text-lg">
            {supplier.companyName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111827]">
                {supplier.companyName}
              </h2>
              {isApproved && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approved</span>
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pending Approval</span>
                </span>
              )}
            </div>
            <div className="text-xs text-[#6B7280] mt-0.5">
              Wholesale Partner since {formattedDate} • {supplier.productCount ?? 0} Listed Products
            </div>
          </div>
        </div>

        <div className="text-xs text-[#6B7280] sm:text-right">
          <span className="block font-medium text-[#111827]">Darté Verified Partner Portal</span>
          <span>Status is administered by Darté</span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Basic Business Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#16A34A]" />
            <span>Company Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Website or Catalogue Link
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
                />
              </div>
            </div>
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
              placeholder="Tell sellers about your wholesale focus, manufacturing capabilities, or warranty terms..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
          <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider flex items-center gap-1.5">
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
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Phone Number *
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Location */}
        <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
          <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#16A34A]" />
            <span>Warehouse / Dispatch Facility</span>
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
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
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
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Warehouse / Street Address
              </label>
              <input
                type="text"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Suite, Plaza, or Street address for courier pick-up"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.99] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
