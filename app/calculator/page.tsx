// app/calculator/page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  fetchCoinGeckoPrices,
  fetchCryptoComparePrices,
  fetchBinancePrices,
  fetchCoinMarketCapPrices,
  fetchUsdToNgnRate,
  CoinGeckoMarketCoin,
} from "@/lib/api";

const currencySymbol = { usd: "$", ngn: "₦" };

export default function CalculatorPage() {
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<"usd" | "ngn">("ngn");
  const [selectedCoin, setSelectedCoin] = useState<string>("BTC");

  const { data: geckoCoins } = useSWR(["calc_gecko", currency], () => fetchCoinGeckoPrices(currency));
  const { data: cmcCoins } = useSWR("calc_cmc", fetchCoinMarketCapPrices);
  const { data: ccPrices } = useSWR("calc_cc", fetchCryptoComparePrices);
  const { data: binancePrices } = useSWR("calc_binance", fetchBinancePrices);
  const { data: fxRate } = useSWR("calc_fx", fetchUsdToNgnRate);

  if (!geckoCoins || !cmcCoins || !ccPrices || !binancePrices) {
    return <p>Loading prices...</p>;
  }

  // Get coin price from each platform
  const coinGecko = geckoCoins.find((c: CoinGeckoMarketCoin) => c.symbol.toUpperCase() === selectedCoin)?.current_price;

  const cmcCoin = cmcCoins.find((c) => c.symbol.toUpperCase() === selectedCoin);
  const cmcPrice = cmcCoin
    ? currency === "usd" ? cmcCoin.quote.USD.price : cmcCoin.quote.NGN?.price
    : null;

  const ccPrice = ccPrices[selectedCoin]
    ? currency === "usd" ? ccPrices[selectedCoin].USD : ccPrices[selectedCoin].NGN
    : null;

  const binancePrice = binancePrices[selectedCoin + (currency === "ngn" ? "_NGN" : "")];

  // Calculation
  const results = [
    { platform: "CoinGecko", price: coinGecko },
    { platform: "CoinMarketCap", price: cmcPrice },
    { platform: "CryptoCompare", price: ccPrice },
    { platform: "Binance", price: binancePrice },
  ];

  return (
    <main className="p-6 bg-gray-50 text-gray-950">
      <h1 className="text-2xl font-bold mb-4">Crypto Calculator</h1>

      {/* Input form */}
      <div className="flex gap-4 mb-6">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border p-2 rounded-md"
        />

        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as "usd" | "ngn")}
          className="border p-2 rounded-md"
        >
          <option value="usd">USD</option>
          <option value="ngn">NGN</option>
        </select>

        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="border p-2 rounded-md"
        >
          {geckoCoins.slice(0, 20).map((coin) => (
            <option key={coin.id} value={coin.symbol.toUpperCase()}>
              {coin.name} ({coin.symbol.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Results table */}
      <table className="w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Platform</th>
            <th className="p-2 text-left">Price ({currencySymbol[currency]})</th>
            <th className="p-2 text-left">You Get ({selectedCoin})</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.platform} className="border-t">
              <td className="p-2">{r.platform}</td>
              <td className="p-2">
                {r.price ? `${currencySymbol[currency]}${r.price.toLocaleString()}` : "N/A"}
              </td>
              <td className="p-2">
                {r.price ? (amount / r.price).toFixed(6) : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
