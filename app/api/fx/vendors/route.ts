// import { NextResponse } from "next/server";
// import axios from "axios";
// import { supabase } from "@/lib/supabase";
// import { FxVendor } from "@/lib/types";

// export async function GET() {
//   const results: FxVendor[] = [];

//   // ✅ Wise
//   try {
//     const wise = await axios.get<{ value: number }>(
//       "https://wise.com/rates/live?source=USD&target=NGN"
//     );
//     results.push({
//       name: "Wise",
//       rate: wise.data.value,
//       source: "wise.com",
//       updated_at: new Date().toISOString(),
//     });
//   } catch (e) {
//     console.error("Wise API error:", e);
//   }

//   // ✅ OFX
//   try {
//     const ofx = await axios.get<{
//       HistoricalPoints: { InterbankRate: number }[];
//     }>(
//       "https://api.ofx.com/PublicSite.ApiService/SpotRateHistory?baseCurrency=USD&termCurrency=NGN&period=day"
//     );
//     const last = ofx.data.HistoricalPoints.at(-1);
//     if (last) {
//       results.push({
//         name: "OFX",
//         rate: last.InterbankRate,
//         source: "ofx.com",
//         updated_at: new Date().toISOString(),
//       });
//     }
//   } catch (e) {
//     console.error("OFX API error:", e);
//   }

//   // ✅ Supabase scraped vendors
//   try {
//     const { data, error } = await supabase
//       .from("fx_vendors")
//       .select("name, rate, source, updated_at")
//       .order("updated_at", { ascending: false });

//     if (error) throw error;
//     if (data) results.push(...(data as FxVendor[]));
//   } catch (e) {
//     console.error("Supabase fetch error:", e);
//   }

//   // ✅ Deduplicate by vendor name, keep freshest
//   const unique: FxVendor[] = Object.values(
//     results.reduce<Record<string, FxVendor>>((acc, v) => {
//       if (
//         !acc[v.name] ||
//         (v.updated_at &&
//           new Date(v.updated_at) > new Date(acc[v.name].updated_at ?? 0))
//       ) {
//         acc[v.name] = v;
//       }
//       return acc;
//     }, {})
//   );

//   return NextResponse.json(unique);
// }



import { NextResponse } from "next/server";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import { FxVendor } from "@/lib/types";

export async function GET() {
  const results: FxVendor[] = [];

  // ✅ Wise (direct API)
  try {
    const wise = await axios.get<{ value: number }>(
      "https://wise.com/rates/live?source=USD&target=NGN"
    );
    results.push({
      name: "Wise",
      rate: wise.data.value,
      source: "wise.com",
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("❌ Wise API failed", e);
  }

  // ✅ OFX (direct API)
  try {
    const ofx = await axios.get<{
      HistoricalPoints: { InterbankRate: number }[];
    }>(
      "https://api.ofx.com/PublicSite.ApiService/SpotRateHistory?baseCurrency=USD&termCurrency=NGN&period=day"
    );
    const last = ofx.data.HistoricalPoints.at(-1);
    if (last) {
      results.push({
        name: "OFX",
        rate: last.InterbankRate,
        source: "ofx.com",
        updated_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.error("❌ OFX API failed", e);
  }

  // ✅ Scraped vendors from Supabase (AbokiFX, Skrill, Western Union, etc.)
  try {
    const { data, error } = await supabase
      .from("fx_vendors")
      .select("name, rate, source, updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    if (data) results.push(...(data as FxVendor[]));
  } catch (e) {
    console.error("❌ Supabase fetch failed", e);
  }

  // ✅ Deduplicate by vendor name (keep latest updated_at)
  const unique: FxVendor[] = Object.values(
    results.reduce<Record<string, FxVendor>>((acc, v) => {
      if (
        !acc[v.name] ||
        (v.updated_at &&
          new Date(v.updated_at) > new Date(acc[v.name].updated_at ?? 0))
      ) {
        acc[v.name] = v;
      }
      return acc;
    }, {})
  );

  return NextResponse.json(unique);
}
