import crypto from "crypto";

export interface PaystackInitParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitResponse {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
  error?: string;
}

export interface PaystackVerifyResponse {
  success: boolean;
  status?: "success" | "failed" | "abandoned" | "reversed" | string;
  amountKobo?: number;
  currency?: string;
  reference?: string;
  paidAt?: string | null;
  channel?: string;
  gatewayResponse?: string;
  error?: string;
}

/**
 * Returns the Paystack secret key from environment variables.
 * Never log or expose this key to client-side code.
 */
export function getPaystackSecretKey(): string {
  return process.env.PAYSTACK_SECRET_KEY || "";
}

/**
 * Checks whether Paystack secret key is configured in the environment.
 */
export function isPaystackConfigured(): boolean {
  const key = getPaystackSecretKey();
  return Boolean(key && key.trim().length > 0 && !key.includes("placeholder"));
}

/**
 * Initializes a hosted Paystack checkout session.
 * Documentation: https://paystack.com/docs/api/transaction/#initialize
 */
export async function initializePaystackTransaction(
  params: PaystackInitParams
): Promise<PaystackInitResponse> {
  const secretKey = getPaystackSecretKey();

  if (!isPaystackConfigured()) {
    return {
      success: false,
      error:
        "Paystack secret key is not configured. Please set PAYSTACK_SECRET_KEY in server environment variables.",
    };
  }

  if (!params.email || !params.amountKobo || params.amountKobo <= 0 || !params.reference) {
    return {
      success: false,
      error: "Invalid transaction parameters: email, amountKobo, and reference are required.",
    };
  }

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: Math.round(params.amountKobo),
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata || {},
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      return {
        success: false,
        error: data.message || `Paystack initialization failed with HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error contacting Paystack API";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Verifies a transaction status directly with Paystack servers.
 * Documentation: https://paystack.com/docs/api/transaction/#verify
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const secretKey = getPaystackSecretKey();

  if (!isPaystackConfigured()) {
    return {
      success: false,
      error:
        "Paystack secret key is not configured. Please set PAYSTACK_SECRET_KEY in server environment variables.",
    };
  }

  if (!reference || !reference.trim()) {
    return {
      success: false,
      error: "Transaction reference is required for verification.",
    };
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference.trim())}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data.status) {
      return {
        success: false,
        error: data.message || `Paystack verification failed with HTTP ${res.status}`,
      };
    }

    const tx = data.data;

    return {
      success: true,
      status: tx.status, // "success", "failed", "abandoned", etc.
      amountKobo: tx.amount,
      currency: tx.currency,
      reference: tx.reference,
      paidAt: tx.paid_at || null,
      channel: tx.channel || null,
      gatewayResponse: tx.gateway_response || null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error verifying Paystack transaction";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Validates the x-paystack-signature header on incoming Paystack webhook requests.
 * Uses timing-safe HMAC SHA512 comparison.
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null | undefined
): boolean {
  const secret = getPaystackSecretKey();
  if (!secret || !signature) return false;

  try {
    const computedHash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (computedHash.length !== signature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch {
    return false;
  }
}
