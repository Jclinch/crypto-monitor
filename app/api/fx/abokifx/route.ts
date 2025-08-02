// //app\api\fx\abokifx\route.ts
// // app/api/fx/abokifx/route.ts
// import { NextResponse } from "next/server";
// import * as cheerio from "cheerio";
// import axios from "axios";

// export async function GET() {
//   try {
//     const url = "https://abokifx.com/";
//     const res = await axios.get(url);
//     const $ = cheerio.load(res.data);

//     // Example selector: scrape USD parallel market rate
//     const usdRate = $("table tr:contains('USD')")
//       .find("td")
//       .eq(1)
//       .text()
//       .replace(/,/g, "")
//       .trim();

//     return NextResponse.json({
//       name: "AbokiFX",
//       rate: parseFloat(usdRate), // NGN per $1
//       source: url,
//     });
//   } catch (err) {
//     console.error("❌ AbokiFX scrape failed:", err);
//     return NextResponse.json({ error: "Failed" }, { status: 500 });
//   }
// }


// app/api/fx/abokifx/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";

export async function GET() {
  try {
    const url = "https://abokifx.com/";
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    // Example selector: scrape USD parallel market rate
    const usdRate = $("table tr:contains('USD')")
      .find("td")
      .eq(1)
      .text()
      .replace(/,/g, "")
      .trim();

    return NextResponse.json({
      name: "AbokiFX",
      rate: parseFloat(usdRate), // NGN per $1
      source: url,
    });
  } catch (err) {
    console.error("❌ AbokiFX scrape failed:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
