// // app/api/fx/wise/route.ts
// import { NextResponse } from "next/server";
// import axios from "axios";

// export async function GET() {
//   try {
//     const res = await axios.get(
//       "https://wise.com/rates/live?source=USD&target=NGN"
//     );
//     const data = res.data;

//     return NextResponse.json({
//       name: "Wise",
//       rate: data.value, // NGN per USD
//       source: "wise.com",
//     });
//   } catch (err) {
//     console.error("❌ Wise fetch failed:", err);
//     return NextResponse.json({ error: "Failed" }, { status: 500 });
//   }
// }



// app/api/fx/wise/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const res = await axios.get("https://wise.com/rates/live?source=USD&target=NGN");
    return NextResponse.json({
      name: "Wise",
      rate: res.data.value, // NGN per $1
      source: "https://wise.com/",
    });
  } catch (err) {
    console.error("❌ Wise API failed:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
