// app/api/fx/aggregator/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const endpoints = [
    "/api/fx/abokifx",
    "/api/fx/wise",
    "/api/fx/worldremit",
    "/api/fx/payoneer",
    "/api/fx/skrill",
    "/api/fx/westernunion",
    "/api/fx/transfergo",
    "/api/fx/afriex",
    "/api/fx/pay4me",
  ];

  const results: any[] = [];

  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        results.push(await res.json());
      }
    } catch (err) {
      console.error(`❌ ${url} failed`, err);
    }
  }

  return NextResponse.json(results);
}
