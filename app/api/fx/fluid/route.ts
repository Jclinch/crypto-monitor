//app\api\fx\fluid\route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";

// GET /api/fx/fluid
export async function GET() {
  try {
    const url = "https://www.fluidcoins.com/rates"; // Hypothetical rates page
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    // Scrape USD→NGN rate (adjust selector as per site HTML)
    const usdRate = $("div.rate:contains('USD/NGN')")
      .find("span.value")
      .text()
      .trim();

    return NextResponse.json({
      name: "Fluid",
      rate: parseFloat(usdRate.replace(/,/g, "")),
      source: url,
    });
  } catch (err) {
    console.error("❌ Fluid scrape failed:", err);
    return NextResponse.json(
      { error: "Failed to scrape Fluid" },
      { status: 500 }
    );
  }
}
