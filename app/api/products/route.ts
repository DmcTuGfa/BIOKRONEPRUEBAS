import { NextResponse } from "next/server"
import { getProductsSafe } from "@/lib/db-safe"

export async function GET() {
  const products = await getProductsSafe()
  return NextResponse.json(products)
}
