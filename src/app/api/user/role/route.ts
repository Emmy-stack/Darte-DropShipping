import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { setUserRole } from "@/lib/db/profileStore";
import { Role } from "@/lib/types/profile";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || (role !== Role.SELLER && role !== Role.SUPPLIER)) {
      return NextResponse.json(
        { error: "Invalid role specified. Must be SELLER or SUPPLIER." },
        { status: 400 }
      );
    }

    const updatedProfile = await setUserRole(userId, role as Role);
    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: unknown) {
    console.error("API /api/user/role error:", err);
    return NextResponse.json(
      { error: "Failed to persist user role" },
      { status: 500 }
    );
  }
}
