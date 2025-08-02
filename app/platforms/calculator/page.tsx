"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetchCoinGeckoPrices, CoinGeckoMarketCoin } from "@/lib/api";
import { FxVendor } from "@/lib/types";

type Result = {
  vendor: string;
  display: string;
  updated_at?: string;
};

export default function CalculatorPage() {
  const [amount, setAmount] = useState(100);
  const [currency, setCurrency] = useState<"usd" | "ngn">("usd");
  const [selectedCoin, setSelectedCoin] = useState("BTC");

  const { data: geckoCoins } = useSWR("gecko", () =>
    fetchCoinGeckoPrices("usd")
  );
  const { data: vendors } = useSWR<FxVendor[]>("fx", () =>
    fetch("/api/fx/vendors").then((r) => r.json())
  );

  if (!geckoCoins || !vendors) return <p className="p-6">Loading rates…</p>;

  const coin = geckoCoins.find(
    (c: CoinGeckoMarketCoin) => c.symbol.toUpperCase() === selectedCoin
  );
  const coinPriceUsd = coin?.current_price ?? 0;

  const results: Result[] = vendors.map((v) => {
    if (!v.rate)
      return { vendor: v.name, display: "N/A", updated_at: v.updated_at };

    if (currency === "usd") {
      const cryptoAmt = amount / coinPriceUsd;
      const nairaEq = amount * v.rate; // convert USD → NGN
      return {
        vendor: v.name,
        display: `${amount} USD (~₦${nairaEq.toLocaleString()}) = ${cryptoAmt.toFixed(
          6
        )} ${selectedCoin} @ ${v.name} (₦${v.rate.toLocaleString()}/$1)`,
        updated_at: v.updated_at,
      };
    } else {
      const usdAmt = amount / v.rate; // NGN → USD
      const cryptoAmt = usdAmt / coinPriceUsd;
      return {
        vendor: v.name,
        display: `${amount.toLocaleString()} NGN (~$${usdAmt.toFixed(
          2
        )}) = ${cryptoAmt.toFixed(6)} ${selectedCoin} @ ${v.name} (₦${v.rate.toLocaleString()}/$1)`,
        updated_at: v.updated_at,
      };
    }
  });

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Multi‑Vendor Crypto Calculator</h1>
      <div className="flex gap-4 mb-6">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border p-2 rounded w-32"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as "usd" | "ngn")}
          className="border p-2 rounded"
        >
          <option value="usd">USD</option>
          <option value="ngn">NGN</option>
        </select>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="border p-2 rounded"
        >
          {geckoCoins.slice(0, 20).map((c) => (
            <option key={c.id} value={c.symbol.toUpperCase()}>
              {c.name} ({c.symbol.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.vendor} className="p-3 bg-white rounded shadow">
            <div>{r.display}</div>
            {r.updated_at && (
              <div className="text-xs text-gray-500">
                Updated: {new Date(r.updated_at).toLocaleString()}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
