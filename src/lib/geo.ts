import { useEffect, useState } from "react";

// Paystack-supported local currencies. Everything else falls back to USD.
const COUNTRY_CURRENCY: Record<string, string> = {
  NG: "NGN", GH: "GHS", ZA: "ZAR", KE: "KES", EG: "EGP",
  CI: "XOF", SN: "XOF", BJ: "XOF", TG: "XOF", BF: "XOF", ML: "XOF",
};

const SYMBOLS: Record<string, string> = {
  USD: "$", NGN: "₦", GHS: "GH₵", ZAR: "R", KES: "KSh", EGP: "E£", XOF: "CFA ",
};

// Sensible market floors so we never undercharge if every rate source fails.
// Updated late-2025 mid-market reference values. These are ONLY used as a
// last-resort fallback if all live APIs fail.
const FALLBACK_RATES: Record<string, number> = {
  NGN: 1650, GHS: 15.2, ZAR: 18.3, KES: 129, EGP: 48, XOF: 605,
};

export type GeoState = {
  country: string;
  currency: string;
  symbol: string;
  rate: number;       // 1 USD = rate * local
  rateSource: "live" | "fallback" | "usd";
  fetchedAt: number;
};

const CACHE_KEY = "psc_geo_v2";
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6h

function readCache(): GeoState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeoState;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL) return parsed; // stale but usable
    return parsed;
  } catch { return null; }
}
function writeCache(g: GeoState) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(g)); } catch {/* ignore */}
}

async function detectCountry(): Promise<string> {
  // Two providers, race-and-fallback
  const urls = ["https://ipapi.co/json/", "https://ipwho.is/"];
  for (const url of urls) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) continue;
      const j = await r.json();
      const code = (j.country_code || j.country) as string | undefined;
      if (code && /^[A-Z]{2}$/.test(code)) return code;
    } catch { /* try next */ }
  }
  return "US";
}

async function fetchRate(currency: string): Promise<number | null> {
  if (currency === "USD") return 1;

  // 1) open.er-api.com — free, no key, real market rates, CORS-enabled.
  try {
    const r = await fetch(`https://open.er-api.com/v6/latest/USD`, { cache: "no-store" });
    if (r.ok) {
      const j = await r.json();
      const v = Number(j?.rates?.[currency]);
      if (v && isFinite(v) && v > 0) return v;
    }
  } catch { /* fall through */ }

  // 2) fawazahmed0 currency-api on jsDelivr — community-maintained, very reliable.
  try {
    const r = await fetch(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`,
      { cache: "no-store" },
    );
    if (r.ok) {
      const j = await r.json();
      const v = Number(j?.usd?.[currency.toLowerCase()]);
      if (v && isFinite(v) && v > 0) return v;
    }
  } catch { /* fall through */ }

  // 3) Cloudflare mirror of the same dataset.
  try {
    const r = await fetch(
      `https://latest.currency-api.pages.dev/v1/currencies/usd.json`,
      { cache: "no-store" },
    );
    if (r.ok) {
      const j = await r.json();
      const v = Number(j?.usd?.[currency.toLowerCase()]);
      if (v && isFinite(v) && v > 0) return v;
    }
  } catch { /* fall through */ }

  return null;
}

let inflight: Promise<GeoState> | null = null;

export async function detectGeo(force = false): Promise<GeoState> {
  if (!force) {
    const cached = readCache();
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    const country = await detectCountry();
    const currency = COUNTRY_CURRENCY[country] ?? "USD";
    let rate = 1;
    let rateSource: GeoState["rateSource"] = "usd";

    if (currency !== "USD") {
      const live = await fetchRate(currency);
      if (live && live > 0) {
        rate = live;
        rateSource = "live";
      } else {
        rate = FALLBACK_RATES[currency] ?? 1;
        rateSource = "fallback";
      }
    }

    const state: GeoState = {
      country, currency,
      symbol: SYMBOLS[currency] ?? currency + " ",
      rate, rateSource, fetchedAt: Date.now(),
    };
    writeCache(state);
    inflight = null;
    return state;
  })();

  return inflight;
}

export function useGeo() {
  const [geo, setGeo] = useState<GeoState>(() =>
    readCache() ?? {
      country: "US", currency: "USD", symbol: "$",
      rate: 1, rateSource: "usd", fetchedAt: 0,
    },
  );
  useEffect(() => { detectGeo().then(setGeo).catch(() => {}); }, []);
  return geo;
}

export function formatLocal(usd: number, geo: GeoState) {
  const local = usd * geo.rate;
  // Currencies with no minor unit (or where decimals look weird) → round to whole.
  const noDecimals = ["NGN", "XOF", "KES", "GHS"].includes(geo.currency);
  const value = noDecimals
    ? Math.round(local)
    : Math.round(local * 100) / 100;
  return `${geo.symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2,
  })}`;
}

export function formatUSD(usd: number) {
  return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
