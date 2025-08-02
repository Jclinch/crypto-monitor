//lib\api.ts
import axios, { AxiosError } from "axios";

// 🔹 CoinGecko Market Coin Type
export interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
}

// 🔹 CoinGecko Chart Data
export interface CoinGeckoChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

// 🔹 CoinMarketCap Listing Type
export interface CoinMarketCapListing {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
    };
    NGN: {
      price: number;
      percent_change_24h: number;
    };
  };
}

// 🔁 CoinGecko: Top 100 Prices
export const fetchCoinGeckoPrices = async (
  vs_currency: "usd" | "ngn"
): Promise<CoinGeckoMarketCoin[]> => {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;

  const res = await axios.get(url);
  return res.data as CoinGeckoMarketCoin[];
};

// 🌍 USD to NGN FX Rate from CoinGecko
export const fetchUsdToNgnRate = async (): Promise<number> => {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=ngn";
  const res = await axios.get(url);
  return res.data.usd.ngn;
};

// 📈 7-Day Chart for CoinGecko Coin
export const fetchCoinGeckoChart = async (
  coinId: string,
  vs_currency: "usd" | "ngn"
): Promise<CoinGeckoChartData> => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vs_currency}&days=7`;
  const res = await axios.get(url);
  return res.data as CoinGeckoChartData;
};

// 💰 CoinMarketCap Prices (USD + NGN)
export const fetchCoinMarketCapPrices = async (): Promise<CoinMarketCapListing[]> => {
  const apiKey = process.env.CMC_API_KEY || "";

  if (!apiKey) {
    console.warn("⚠️ CMC_API_KEY not found in environment variables");
    return [];
  }

  const url =
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&convert=USD,NGN";

  try {
    const res = await axios.get(url, {
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
      },
    });

    if (!res.data?.data) {
      console.error("❌ No data returned from CoinMarketCap");
      return [];
    }

    return res.data.data as CoinMarketCapListing[];
  } catch (error: unknown) {
    const err = error as AxiosError;
    console.error("❌ Error fetching from CoinMarketCap:", err.response?.data || err.message);
    return [];
  }
};

// 🔁 CryptoCompare: Limited Coins (USD + NGN)
export const fetchCryptoComparePrices = async (): Promise<
  Record<string, { USD: number; NGN: number }>
> => {
  const symbols = "BTC,ETH,SOL,BNB,XRP,ADA,DOGE,MATIC,TRX,DOT,USDT,USDC,BUSD,LINK,LTC,XRP,USDT,STETH,AVAX,UNI,SHIB,WBTC,DAI";
  const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD,NGN`;

  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error: unknown) {
    const err = error as AxiosError;
    console.error("❌ Error fetching from CryptoCompare:", err.response?.data || err.message);
    throw new Error("Failed to fetch prices from CryptoCompare");
  }
};

// ➕ Binance: fetch from our API route
// lib/api.ts

// Binance prices come from our own API route (no CORS issues)
export const fetchBinancePrices = async (): Promise<Record<string, { USD: number; NGN: number }>> => {
  const res = await fetch("/api/binance"); // ✅ call your API route
  if (!res.ok) throw new Error("Failed to fetch Binance prices");
  return res.json();
};

