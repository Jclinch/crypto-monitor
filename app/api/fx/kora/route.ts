//app\api\fx\kora\route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";

// GET /api/fx/kora
export async function GET() {
  try {
    const url = "https://www.korahq.com/rates"; // Kora rates page
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    // Scrape USD→NGN rate (adjust selector as needed)
    const usdRate = $("div:contains('USD/NGN')")
      .next()
      .text()
      .trim();

    return NextResponse.json({
      name: "Kora",
      rate: parseFloat(usdRate.replace(/,/g, "")),
      source: url,
    });
  } catch (err) {
    console.error("❌ Kora scrape failed:", err);
    return NextResponse.json(
      { error: "Failed to scrape Kora" },
      { status: 500 }
    );
  }
}
