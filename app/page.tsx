// "use client";

// import { useState } from "react";
// import useSWR from "swr";
// import { fetchCoinGeckoPrices, CoinGeckoMarketCoin } from "@/lib/api";
// import Image from "next/image";
// import Link from "next/link";

// const fetcher = (currency: "usd" | "ngn") => fetchCoinGeckoPrices(currency);

// export default function HomePage() {
//   const [currency, setCurrency] = useState<"usd" | "ngn">("usd");

//   const {
//     data: coins,
//     isLoading,
//     error,
//   } = useSWR(["homepage_coins", currency], () => fetcher(currency), {
//     refreshInterval: 30000,
//   });

//   if (isLoading) return <p>Loading top cryptocurrencies...</p>;
//   if (error || !coins) return <p className="text-red-600">Failed to load data.</p>;

//   const top10 = coins.slice(0, 10);

//   return (
//     <main className="p-6 text-gray-950 bg-[#e5e5e6]">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-3xl font-bold text-gray-900">Crypto Monitor</h1>
//         <div className="space-x-2">
//           <button
//             onClick={() => setCurrency("usd")}
//             className={`px-4 py-1 rounded-md text-sm border ${currency === "usd" ? "bg-blue-500 text-white" : "bg-white"}`}
//           >
//             USD
//           </button>
//           <button
//             onClick={() => setCurrency("ngn")}
//             className={`px-4 py-1 rounded-md text-sm border ${currency === "ngn" ? "bg-blue-500 text-white" : "bg-white"}`}
//           >
//             NGN
//           </button>
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white shadow-md rounded-lg">
//           <thead className="bg-gray-100 text-sm">
//             <tr>
//               <th className="p-2 text-left">#</th>
//               <th className="p-2 text-left">Coin</th>
//               <th className="p-2 text-left">Price</th>
//               <th className="p-2 text-left">% 24h</th>
//             </tr>
//           </thead>
//           <tbody>
//             {top10.map((coin: CoinGeckoMarketCoin) => (
//               <tr key={coin.id} className="border-t text-sm hover:bg-gray-50">
//                 <td className="p-2">{coin.market_cap_rank}</td>
//                 <td className="p-2 flex items-center gap-2">
//                   <Image
//                     src={coin.image}
//                     alt={coin.name}
//                     width={20}
//                     height={20}
//                     className="rounded-full"
//                   />
//                   {coin.name} ({coin.symbol.toUpperCase()})
//                 </td>
//                 <td className="p-2">
//                   {currency === "usd"
//                     ? `$${coin.current_price.toLocaleString()}`
//                     : `₦${Math.round(coin.current_price).toLocaleString()}`}
//                 </td>
//                 <td
//                   className={`p-2 ${
//                     coin.price_change_percentage_24h >= 0
//                       ? "text-green-600"
//                       : "text-red-600"
//                   }`}
//                 >
//                   {coin.price_change_percentage_24h?.toFixed(2)}%
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-4 text-right">
//         <Link
//           href="/platforms/coingecko"
//           className="text-blue-600 hover:underline text-sm"
//         >
//           View full market →
//         </Link>
//       </div>
//     </main>
//   );
// }


"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  fetchCoinGeckoPrices,
  fetchCryptoComparePrices,
  fetchBinancePrices,
  fetchUsdToNgnRate,
  CoinGeckoMarketCoin,
} from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

type PlatformPriceMap = {
  [symbol: string]: {
    coingecko?: number;
    coinmarketcap?: number;
    cryptocompare?: number;
    binance?: number;
  };
};

const currencySymbol = {
  usd: "$",
  ngn: "₦",
};

export default function HomePage() {
  const [currency, setCurrency] = useState<"usd" | "ngn">("usd");

  const { data: geckoCoins, isLoading: gLoading } = useSWR(
    ["homepage_coins", currency],
    () => fetchCoinGeckoPrices(currency),
    { refreshInterval: 30000 }
  );

  type CoinMarketCapCoin = {
    symbol: string;
    quote: {
      USD: { price: number };
      NGN?: { price: number };
    };
  };

  const { data: cmcCoins } = useSWR(
    "cmc_home",
    async () => {
      const res = await fetch("/api/coinmarketcap");
      if (!res.ok) throw new Error("Failed to fetch CoinMarketCap data");
      return res.json() as Promise<Array<CoinMarketCapCoin>>;
    },
    {
      refreshInterval: 30000,
    }
  );

  const { data: binanceData } = useSWR("binance_home", fetchBinancePrices, {
    refreshInterval: 30000,
  });

  const { data: fxRate } = useSWR("usd_ngn", fetchUsdToNgnRate, {
    refreshInterval: 60000,
  });

  const { data: ccPrices } = useSWR("cc_home", fetchCryptoComparePrices, {
    refreshInterval: 30000,
  });

  const isLoading = gLoading || !geckoCoins;

  if (isLoading) return <p>Loading top cryptocurrencies...</p>;
  if (!geckoCoins) return <p className="text-red-600">Failed to load data.</p>;

  const top10 = geckoCoins.slice(0, 10);

  const merged: PlatformPriceMap = {};

  for (const coin of top10) {
    const symbol = coin.symbol.toUpperCase();
    merged[symbol] = {
      coingecko: coin.current_price,
    };
  }

  if (cmcCoins) {
    for (const coin of cmcCoins) {
      const symbol = coin.symbol.toUpperCase();
      if (merged[symbol]) {
        merged[symbol].coinmarketcap =
          currency === "usd" ? coin.quote.USD?.price : coin.quote.NGN?.price;
      }
    }
  }

  if (ccPrices) {
    for (const symbol in ccPrices) {
      const entry = ccPrices[symbol];
      if (merged[symbol]) {
        merged[symbol].cryptocompare =
          currency === "usd" ? entry.USD : entry.NGN;
      }
    }
  }

  // ✅ FIX: Add Binance price per coin using fxRate conversion
  if (binanceData) {
  for (const symbol of Object.keys(merged)) {
    if (currency === "usd") {
      merged[symbol].binance = binanceData[symbol];
    } else {
      merged[symbol].binance = binanceData[`${symbol}_NGN`];
    }
  }
}
console.log("🔥 Binance Data:", binanceData);

  return (
    <main className="p-6 text-gray-950 bg-[#e5e5e6]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Crypto Monitor</h1>
        <div className="space-x-2">
          <button
            onClick={() => setCurrency("usd")}
            className={`px-4 py-1 rounded-md text-sm border ${
              currency === "usd" ? "bg-blue-500 text-white" : "bg-white"
            }`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency("ngn")}
            className={`px-4 py-1 rounded-md text-sm border ${
              currency === "ngn" ? "bg-blue-500 text-white" : "bg-white"
            }`}
          >
            NGN
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Coin</th>
              <th className="p-2 text-left">CoinGecko</th>
              <th className="p-2 text-left">CoinMarketCap</th>
              <th className="p-2 text-left">CryptoCompare</th>
              <th className="p-2 text-left">Binance</th>
              <th className="p-2 text-left">% 24h</th>
            </tr>
          </thead>
          <tbody>
            {top10.map((coin: CoinGeckoMarketCoin) => {
              const symbol = coin.symbol.toUpperCase();
              const priceSources = merged[symbol];

              return (
                <tr key={coin.id} className="border-t text-sm hover:bg-gray-50">
                  <td className="p-2">{coin.market_cap_rank}</td>
                  <td className="p-2 flex items-center gap-2">
                    <Image
                      src={coin.image}
                      alt={coin.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    {coin.name} ({symbol})
                  </td>
                  <td className="p-2">
                    {priceSources?.coingecko
                      ? `${currencySymbol[currency]}${priceSources.coingecko.toLocaleString()}`
                      : "N/A"}
                  </td>
                  <td className="p-2">
                    {priceSources?.coinmarketcap
                      ? `${currencySymbol[currency]}${priceSources.coinmarketcap.toLocaleString()}`
                      : "N/A"}
                  </td>
                  <td className="p-2">
                    {priceSources?.cryptocompare
                      ? `${currencySymbol[currency]}${priceSources.cryptocompare.toLocaleString()}`
                      : "N/A"}
                  </td>
                  <td className="p-2">
                    {priceSources?.binance
                      ? `${currencySymbol[currency]}${priceSources.binance.toLocaleString()}`
                      : "N/A"}
                  </td>
                  <td
                    className={`p-2 ${
                      coin.price_change_percentage_24h >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right">
        <Link
          href="/platforms/coingecko"
          className="text-blue-600 hover:underline text-sm"
        >
          View full market →
        </Link>
      </div>
    </main>
  );
}
