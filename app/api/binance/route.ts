//app\api\binance\route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { fetchUsdToNgnRate } from "@/lib/api";

export async function GET() {
  try {
    const fxRate = await fetchUsdToNgnRate();
const url = "https://data-api.binance.vision/api/v3/ticker/price";

    const res = await axios.get(url);
    const allPrices = res.data as Array<{ symbol: string; price: string }>;

    const symbols = [
      "BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT","XRPUSDT",
      "ADAUSDT","DOGEUSDT","MATICUSDT","TRXUSDT","DOTUSDT",
      "LINKUSDT","LTCUSDT","AVAXUSDT","UNIUSDT","SHIBUSDT"
    ];

    const prices: Record<string, { USD: number; NGN: number }> = {};

    for (const pair of symbols) {
      const match = allPrices.find((p) => p.symbol === pair);
      if (match) {
        const coin = pair.replace("USDT", "");
        const usd = parseFloat(match.price);
        prices[coin] = { USD: usd, NGN: usd * fxRate };
      }
    }

    return NextResponse.json(prices);
  } catch (err) {
    console.error("❌ Binance API fetch failed:", err);
    return new NextResponse("Failed to fetch Binance prices", { status: 500 });
  }
}
