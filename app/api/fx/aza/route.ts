//app\api\fx\aza\route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";

// GET /api/fx/aza
export async function GET() {
  try {
    const url = "https://azafinance.com/rates"; // AZA public rates page
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    // Scrape USD→NGN rate (adjust based on HTML)
    const usdRate = $("div:contains('USD/NGN')")
      .next()
      .text()
      .trim();

    return NextResponse.json({
      name: "AZA Finance",
      rate: parseFloat(usdRate.replace(/,/g, "")),
      source: url,
    });
  } catch (err) {
    console.error("❌ AZA scrape failed:", err);
    return NextResponse.json(
      { error: "Failed to scrape AZA Finance" },
      { status: 500 }
    );
  }
}
