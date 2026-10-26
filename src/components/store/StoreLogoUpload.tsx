"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Cloud,
  Link as LinkIcon,
} from "lucide-react";
import { isManagedLogoUrl } from "@/lib/supabase/server";

interface StoreLogoUploadProps {
  storeName: string;
  logoUrl?: string | null;
  onChange: (url: string | null) => void;
  onLogoPersisted?: (url: string | null) => void;
  disabled?: boolean;
}

const PRESET_AVATAR_COLORS = [
  { bg: "bg-[#0B3D2E]", text: "text-[#DCFCE7]", label: "Darté Green" },
  { bg: "bg-emerald-600", text: "text-white", label: "Emerald" },
  { bg: "bg-blue-600", text: "text-white", label: "Cobalt" },
  { bg: "bg-purple-600", text: "text-white", label: "Royal Purple" },
  { bg: "bg-amber-600", text: "text-white", label: "Warm Ochre" },
  { bg: "bg-rose-600", text: "text-white", label: "Crimson" },
];

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function StoreLogoUpload({
  storeName,
  logoUrl,
  onChange,
  onLogoPersisted,
  disabled = false,
}: StoreLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeBlobUrlRef = useRef<string | null>(null);

  // Revoke temporary object URLs on unmount to prevent browser memory leaks
  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "D";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleApplyUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setErrorMessage("Please enter a valid URL starting with http:// or https://");
      return;
    }

    onChange(trimmed);
    if (onLogoPersisted) {
      onLogoPersisted(trimmed);
    }
    setIsUrlModalOpen(false);
    setCustomUrlInput("");
    setSuccessMessage("External logo image URL applied.");
    setErrorMessage(null);
  };

  const processAndUploadFile = async (file: File) => {
    // 1. Client-side pre-validation
    if (file.size > MAX_BYTES) {
      setErrorMessage(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of 5 MB.`
      );
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage(
        "Invalid format. Only PNG, JPEG, and WebP images are allowed. SVG is disabled for security."
      );
      return;
    }

    // 2. Set up instantaneous local preview
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
    }
    const blobUrl = URL.createObjectURL(file);
    activeBlobUrlRef.current = blobUrl;
    setPreviewBlobUrl(blobUrl);

    // 3. Initiate multipart upload to /api/seller/store/logo
    setIsUploading(true);
    setUploadProgress("Uploading to Supabase Storage...");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/seller/store/logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload logo.");
      }

      // 4. On success: update parent states with persistent public URL
      onChange(data.logoUrl);
      if (onLogoPersisted) {
        onLogoPersisted(data.logoUrl);
      }

      setSuccessMessage("Store logo uploaded and saved to Supabase Storage!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      // Clean up local blob preview now that upload is complete or failed
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
      setPreviewBlobUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading && !isDeleting) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading || isDeleting) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/seller/store/logo", {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove logo.");
      }

      onChange(null);
      if (onLogoPersisted) {
        onLogoPersisted(null);
      }
      setSuccessMessage("Logo removed successfully. Reverted to brand avatar.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove logo.";
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  const activeColor = PRESET_AVATAR_COLORS[selectedColorIdx];
  const displayImage = previewBlobUrl || logoUrl;
  const isCloudManaged = isManagedLogoUrl(logoUrl);

  return (
    <div className="space-y-4">
      {/* Messages */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-800 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Drag-and-Drop and Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl border-2 transition-all ${
          isDragOver
            ? "border-[#16A34A] bg-[#DCFCE7]/20 border-dashed"
            : "border-[#E5E7EB] bg-white border-solid"
        }`}
      >
        {/* Logo Avatar Display */}
        <div className="relative group shrink-0">
          {displayImage ? (
            <div className="w-24 h-24 rounded-2xl border-2 border-[#E5E7EB] overflow-hidden bg-white shadow-xs flex items-center justify-center relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImage}
                alt={`${storeName} logo`}
                className="w-full h-full object-cover"
                onError={() => {
                  if (!previewBlobUrl) {
                    onChange(null);
                  }
                }}
              />

              {/* Uploading Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-[#22C55E]" />
                  <span className="text-[10px] mt-1 font-medium">Uploading</span>
                </div>
              )}

              {/* Deleting Overlay */}
              {isDeleting && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                  <span className="text-[10px] mt-1 font-medium">Removing</span>
                </div>
              )}

              {/* Storage Badge */}
              {!isUploading && !isDeleting && (
                <div className="absolute bottom-1 right-1">
                  {isCloudManaged ? (
                    <span
                      title="Stored in Supabase Storage"
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#0B3D2E]/90 text-[10px] font-medium text-[#DCFCE7] shadow-xs"
                    >
                      <Cloud className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span
                      title="External Image URL"
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gray-800/80 text-[10px] font-medium text-white shadow-xs"
                    >
                      <LinkIcon className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div
              className={`w-24 h-24 rounded-2xl ${activeColor.bg} ${activeColor.text} font-bold text-3xl flex items-center justify-center shadow-xs border border-black/10 transition-colors duration-200`}
            >
              {getInitials(storeName)}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 flex-1 w-full">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#111827]">Store Brand Logo</span>
              {logoUrl && (
                <span
                  className={`text-[10px] px-2 py-0.5 font-medium rounded-full ${
                    isCloudManaged
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {isCloudManaged ? "Supabase Storage" : "External URL"}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              JPG, PNG, or WebP up to 5 MB. Stored persistently in Supabase Cloud Storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              disabled={disabled || isUploading || isDeleting}
            />

            {/* Upload / Replace Button */}
            <button
              type="button"
              disabled={disabled || isUploading || isDeleting}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white transition-colors shadow-2xs disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{uploadProgress || "Uploading..."}</span>
                </>
              ) : logoUrl ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace Logo</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                </>
              )}
            </button>

            {/* External URL Button */}
            <button
              type="button"
              disabled={disabled || isUploading || isDeleting}
              onClick={() => setIsUrlModalOpen(!isUrlModalOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAF9] hover:border-[#D1D5DB] transition-colors shadow-2xs disabled:opacity-50"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Image URL</span>
            </button>

            {/* Remove / Reset Button */}
            {logoUrl && (
              <button
                type="button"
                disabled={disabled || isUploading || isDeleting}
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {/* Color Palettes for Initials Avatar (when no image logo is uploaded) */}
          {!logoUrl && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-[#6B7280] mr-1">Brand Avatar Color:</span>
              {PRESET_AVATAR_COLORS.map((color, idx) => (
                <button
                  key={color.label}
                  type="button"
                  onClick={() => setSelectedColorIdx(idx)}
                  className={`w-5 h-5 rounded-full ${color.bg} flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ${
                    selectedColorIdx === idx ? "ring-2 ring-offset-1 ring-[#16A34A]" : ""
                  }`}
                  title={color.label}
                  aria-label={color.label}
                >
                  {selectedColorIdx === idx && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Removing Logo */}
      {isConfirmingDelete && (
        <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 text-xs text-rose-900 space-y-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-rose-950">Remove Store Logo?</p>
              <p className="text-rose-800 text-[11px] mt-0.5">
                This will delete your uploaded logo file from Supabase Storage and reset your store to the initials avatar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsConfirmingDelete(false)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirmed}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <span>Confirm Removal</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* URL Input Modal/Dropdown */}
      {isUrlModalOpen && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-[#374151]">
            <span>External Image URL</span>
            <button
              type="button"
              onClick={() => setIsUrlModalOpen(false)}
              className="text-[#9CA3AF] hover:text-[#4B5563]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#D1D5DB] bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#16A34A] text-white hover:bg-[#15803D] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
