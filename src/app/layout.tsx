import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Darté — Turn Products Into Business | African Dropshipping & Commerce",
  description:
    "Discover products, launch your store, and start selling without holding inventory. Darté gives African entrepreneurs and social sellers the tools to build and grow their online business.",
  keywords: [
    "dropshipping Africa",
    "online business Nigeria",
    "Darté",
    "social commerce",
    "supplier marketplace",
    "ecommerce storefront",
    "make money online Africa",
  ],
  authors: [{ name: "Darté Technologies" }],
  openGraph: {
    title: "Darté — Turn Products Into Business",
    description:
      "Find products, create your storefront, and let suppliers fulfill. The dropshipping and commerce platform built for African entrepreneurs.",
    type: "website",
    siteName: "Darté",
    locale: "en_US",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B3D2E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyConfigured =
    publishableKey &&
    !publishableKey.includes("REPLACE_WITH_YOUR") &&
    publishableKey.startsWith("pk_");

  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} scroll-smooth antialiased`}
    >
      <body className="font-sans min-h-screen bg-[#F8FAF9] text-[#111827] flex flex-col selection:bg-[#DCFCE7] selection:text-[#0B3D2E]">
        <ClerkProvider
          publishableKey={publishableKey}
          appearance={{
            variables: {
              colorPrimary: "#16A34A",
              colorPrimaryForeground: "#FFFFFF",
              colorForeground: "#111827",
              colorMutedForeground: "#6B7280",
              colorBackground: "#FFFFFF",
              colorInput: "#F8FAF9",
              borderRadius: "0.75rem",
              fontFamily: "var(--font-sans)",
            },
            elements: {
              card: "shadow-[0_12px_40px_-8px_rgba(11,61,46,0.09)] border border-[#E5E7EB] rounded-2xl bg-white",
              formButtonPrimary:
                "bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm shadow-[#16A34A]/25 rounded-xl text-sm font-semibold transition-all py-3",
              footerActionLink: "text-[#16A34A] hover:text-[#0B3D2E] font-semibold",
              headerTitle: "text-xl font-bold text-[#111827] font-[family-name:var(--font-heading)]",
              headerSubtitle: "text-sm text-[#6B7280]",
              formFieldInput:
                "rounded-xl border-[#E5E7EB] bg-[#F8FAF9] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]",
              dividerLine: "bg-[#E5E7EB]",
              dividerText: "text-xs uppercase tracking-wider text-[#9CA3AF]",
              socialButtonsBlockButton:
                "rounded-xl border-[#E5E7EB] hover:bg-[#F8FAF9] text-sm font-medium text-[#374151]",
            },
          }}
        >
          {!isKeyConfigured && (
            <div className="bg-[#0B3D2E] text-white text-xs py-2 px-4 text-center border-b border-[#165641] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>
                <strong>Clerk Setup:</strong> Paste your real Clerk Publishable &amp; Secret keys from{" "}
                <a
                  href="https://dashboard.clerk.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-[#DCFCE7] font-semibold"
                >
                  dashboard.clerk.com
                </a>{" "}
                into <code className="bg-black/30 px-1 py-0.5 rounded">.env.local</code> to activate live login.
              </span>
            </div>
          )}
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
