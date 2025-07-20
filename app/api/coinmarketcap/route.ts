// // app/api/coinmarketcap/route.ts
// import { NextResponse } from "next/server";
// import axios from "axios";

// export const dynamic = "force-dynamic"; // Disable caching (optional)

// export async function GET() {
//   const apiKey = process.env.CMC_API_KEY;
//   const url =
//     "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&convert=USD,NGN";

//   try {
//     const response = await axios.get(url, {
//       headers: {
//         "X-CMC_PRO_API_KEY": apiKey,
//       },
//     });

//     return NextResponse.json(response.data.data);
//   } catch (error) {
//     console.error("CMC Error:", error);
//     return new NextResponse("Failed to fetch CoinMarketCap data", {
//       status: 500,
//     });
//   }
// }


//app\api\coinmarketcap\route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic"; // Optional: disable caching

export async function GET() {
  const apiKey = process.env.CMC_API_KEY;
  if (!apiKey) return new NextResponse("Missing API key", { status: 500 });

  try {
    const res = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&convert=USD",
      { headers: { "X-CMC_PRO_API_KEY": apiKey } }
    );
    return NextResponse.json(res.data.data);
  } catch (err) {
    console.error("CMC fetch error:", err);
    return new NextResponse("Failed", { status: 500 });
  }
}

