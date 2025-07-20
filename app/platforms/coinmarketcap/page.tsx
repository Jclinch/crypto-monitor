// //app\platforms\coinmarketcap\page.tsx

// import { fetchCoinMarketCapPrices } from "@/lib/api";

// type Coin = {
//   id: string;
//   name: string;
//   symbol: string;
//   quote: {
//     USD: {
//       price: number;
//     };
//   };
// };

// export default async function CoinMarketCapPage() {
//   type CoinMarketCapListing = {
//     id: number;
//     name: string;
//     symbol: string;
//     quote: {
//       USD: {
//         price: number;
//       };
//     };
//   };

//   const rawData: CoinMarketCapListing[] = await fetchCoinMarketCapPrices();
//   const data: Coin[] = rawData.map((coin: CoinMarketCapListing) => ({
//     ...coin,
//     id: String(coin.id),
//   }));

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">CoinMarketCap Prices</h2>
//       <table className="w-full bg-white shadow-md rounded-lg">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-2 text-left">Name</th>
//             <th className="p-2 text-left">Symbol</th>
//             <th className="p-2 text-left">Price (USD)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((coin: Coin) => (
//             <tr key={coin.id} className="border-t">
//               <td className="p-2">{coin.name}</td>
//               <td className="p-2 uppercase">{coin.symbol}</td>
//               <td className="p-2">${coin.quote.USD.price.toFixed(2)}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }




//app\platforms\coinmarketcap\page.tsx
"use client";

import useSWR from "swr";

type Coin = {
  id: string;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
    };
  };
};

export default function CoinMarketCapPage() {
  const { data: coins, isLoading, error } = useSWR<Coin[]>(
    "cmc",
    async () => {
      const res = await fetch("/api/coinmarketcap");
      if (!res.ok) throw new Error("Failed to fetch");
      const raw = await res.json();
      return raw.map((coin: Coin) => ({
        ...coin,
        id: String(coin.id),
      }));
    },
    { refreshInterval: 30000 }
  );

  if (isLoading) return <p>Loading...</p>;
  if (error || !coins) return <p className="text-red-600">Failed to load CoinMarketCap data.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">CoinMarketCap Prices</h2>
      <table className="w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Symbol</th>
            <th className="p-2 text-left">Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr key={coin.id} className="border-t">
              <td className="p-2">{coin.name}</td>
              <td className="p-2 uppercase">{coin.symbol}</td>
              <td className="p-2">${coin.quote.USD.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
