import crypto from "crypto";

export const MAX_LOGO_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export interface ValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
  extension?: string;
}

/**
 * Validates the file buffer against known image magic byte signatures.
 * Rejects text files, HTML, SVG (XSS vector), and mismatched content.
 */
export function validateImageMagicBytes(buffer: Buffer): {
  valid: boolean;
  detectedMime?: string;
  extension?: string;
  error?: string;
} {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: "File buffer is too small or empty." };
  }

  // 1. Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: "image/png", extension: "png" };
  }

  // 2. Check JPEG signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: "image/jpeg", extension: "jpg" };
  }

  // 3. Check WebP signature: 'RIFF' .... 'WEBP'
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    return { valid: true, detectedMime: "image/webp", extension: "webp" };
  }

  // Check for SVG / HTML / scripts to give a descriptive error
  const sample = buffer.subarray(0, 100).toString("utf8").toLowerCase();
  if (sample.includes("<svg") || sample.includes("<?xml") || sample.includes("<html") || sample.includes("<script")) {
    return {
      valid: false,
      error: "SVG and vector formats are not supported for security reasons. Please upload PNG, JPEG, or WebP.",
    };
  }

  return {
    valid: false,
    error: "Invalid image content. The uploaded file does not match a supported PNG, JPEG, or WebP image signature.",
  };
}

/**
 * Comprehensive logo file validation:
 * Validates size, claimed MIME type, and binary signature.
 */
export function validateLogoFile(
  buffer: Buffer,
  claimedMime: string,
  claimedSize: number
): ValidationResult {
  // 1. File size check
  if (!claimedSize || claimedSize <= 0) {
    return { valid: false, error: "Uploaded file is empty." };
  }

  if (claimedSize > MAX_LOGO_FILE_SIZE) {
    const sizeMb = (claimedSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds the maximum allowed limit of 5 MB.`,
    };
  }

  // 2. Claimed MIME type check
  const normalizedMime = claimedMime?.toLowerCase().trim();
  if (!normalizedMime || !ALLOWED_MIME_TYPES.has(normalizedMime)) {
    if (normalizedMime === "image/svg+xml") {
      return {
        valid: false,
        error: "SVG files are not supported. Please upload a raster format (PNG, JPEG, or WebP).",
      };
    }
    return {
      valid: false,
      error: `Unsupported image format (${claimedMime || "unknown"}). Allowed formats: PNG, JPEG, and WebP.`,
    };
  }

  // 3. Binary signature / magic bytes check
  const magicCheck = validateImageMagicBytes(buffer);
  if (!magicCheck.valid) {
    return { valid: false, error: magicCheck.error };
  }

  // 4. Mismatch check between claimed MIME and detected signature
  if (magicCheck.detectedMime !== normalizedMime) {
    // Treat jpeg and jpg as matching
    const isJpegMatch =
      (normalizedMime === "image/jpeg" || normalizedMime === "image/jpg") &&
      magicCheck.detectedMime === "image/jpeg";

    if (!isJpegMatch) {
      return {
        valid: false,
        error: `File signature mismatch. Claimed '${claimedMime}' but file content signature is '${magicCheck.detectedMime}'.`,
      };
    }
  }

  return {
    valid: true,
    detectedMime: magicCheck.detectedMime,
    extension: magicCheck.extension,
  };
}

/**
 * Generates a safe, unguessable seller-scoped storage path.
 * Format: {sellerId}/logo-{timestamp}-{randomHex}.{ext}
 */
export function generateSafeStoragePath(sellerId: string, extension: string): string {
  // Sanitize sellerId to prevent directory traversal
  const cleanSellerId = sellerId.replace(/[^a-zA-Z0-9_-]/g, "");
  const cleanExt = extension.replace(/[^a-z0-9]/g, "").toLowerCase() || "png";
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString("hex");

  return `${cleanSellerId}/logo-${timestamp}-${randomSuffix}.${cleanExt}`;
}
