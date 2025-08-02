//app\api\fx\vendors\route.ts
import { NextResponse } from "next/server";
import axios from "axios";
// If supabase is a default export:
import { supabase } from "@/lib/supabase";

// If supabase is exported with a different name, use:
// import { correctExportName } from "@/lib/supabase";

export async function GET() {
  const results: any[] = [];

  // ✅ Wise
  try {
    const wise = await axios.get(
      "https://wise.com/rates/live?source=USD&target=NGN"
    );
    results.push({
      name: "Wise",
      rate: wise.data.value,
      source: "wise.com",
    });
  } catch (e) {}

  // ✅ OFX
  try {
    const ofx = await axios.get(
      "https://api.ofx.com/PublicSite.ApiService/SpotRateHistory?baseCurrency=USD&termCurrency=NGN&period=day"
    );
    const last = ofx.data.HistoricalPoints.at(-1);
    results.push({
      name: "OFX",
      rate: last.InterbankRate,
      source: "ofx.com",
    });
  } catch (e) {}

  // ✅ Scraped vendors (read from Supabase)
  try {
    const { data, error } = await supabase
      .from("fx_vendors")
      .select("name, rate, source, updated_at")
      .order("updated_at", { ascending: false });
    if (data) results.push(...data);
  } catch (e) {}

  return NextResponse.json(results);
}
