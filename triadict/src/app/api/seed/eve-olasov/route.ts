import { NextResponse } from "next/server"
import { seedEveOlasov } from "@/../../scripts/seed-eve-olasov"

export async function POST() {
  try {
    const result = await seedEveOlasov()
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ success: true, ...result })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    )
  }
}
