import { NextResponse } from "next/server";
import axios from "axios";
import { supabase } from "@/lib/supabase";

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
      updated_at: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("Wise API error:", e.message);
  }

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
      updated_at: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("OFX API error:", e.message);
  }

  // ✅ Scraped vendors
  try {
    const { data, error } = await supabase
      .from("fx_vendors")
      .select("name, rate, source, updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    if (data) results.push(...data);
  } catch (e: any) {
    console.error("Supabase fetch error:", e.message);
  }

  // ✅ Remove duplicates (prefer freshest by updated_at)
  const unique = Object.values(
    results.reduce((acc: any, v: any) => {
      if (!acc[v.name] || new Date(v.updated_at) > new Date(acc[v.name].updated_at)) {
        acc[v.name] = v;
      }
      return acc;
    }, {})
  );

  return NextResponse.json(unique);
}
