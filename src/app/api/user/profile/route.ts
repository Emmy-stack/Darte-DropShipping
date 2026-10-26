import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getFullUserContext } from "@/lib/db/profileStore";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await getFullUserContext(userId);
    return NextResponse.json(context);
  } catch (err: unknown) {
    console.error("API /api/user/profile error:", err);
    return NextResponse.json(
      { error: "Authentication error or credentials pending" },
      { status: 401 }
    );
  }
}
