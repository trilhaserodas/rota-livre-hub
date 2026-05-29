import type { IncomingMessage, ServerResponse } from "http";

interface AlertItem {
  id: string;
  title: string;
  link: string;
  date: string;
  timestamp: number;
  resumo: string;
  fonte: string;
  category: "BLOQUEIO" | "FRONTEIRA" | "CLIMA" | "CRÍTICO" | "GERAL";
  priority: "CRITICAL" | "ATTENTION" | "MODERATE" | "LOW";
  country: "Brasil" | "Argentina" | "Chile" | "Uruguai" | "América Latina";
}

// Map HTML Entities
function decodeHTMLEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // CDATA Extract
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .trim();
}

// Calculate relative time or beautiful layout
function formatRelativeTime(pubDateStr: string): { relative: string; timestamp: number } {
  try {
    const pubDate = new Date(pubDateStr);
    const timestamp = pubDate.getTime();
    if (isNaN(timestamp)) {
      return { relative: pubDateStr || "Recentemente", timestamp: Date.now() };
    }

    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 60) {
      return { 
        relative: diffMins <= 5 ? "Agora mesmo" : `Há ${diffMins} minutos`, 
        timestamp 
      };
    } else if (diffHours < 24) {
      return { 
        relative: `Há ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`, 
        timestamp 
      };
    } else if (diffDays === 1) {
      return { relative: "Ontem", timestamp };
    } else {
      return { relative: `Há ${diffDays} dias`, timestamp };
    }
  } catch (e) {
    return { relative: "Recentemente", timestamp: Date.now() };
  }
}

// Determine tactical category, priority and country based on alert content context
function classifyAlert(title: string, resume: string): { 
  category: AlertItem["category"]; 
  priority: AlertItem["priority"];
  country: AlertItem["country"];
} {
  const combined = `${title} ${resume}`.toLowerCase();
  
  let category: AlertItem["category"] = "GERAL";
  let priority: AlertItem["priority"] = "LOW";
  let country: AlertItem["country"] = "América Latina";

  // Category & Priority mapping
  if (
    combined.includes("bloqueio") || 
    combined.includes("bloqueado") || 
    combined.includes("bloqueada") || 
    combined.includes("interdição") || 
    combined.includes("interditado") ||
    combined.includes("ruta cerrada") ||
    combined.includes("bloqueo") ||
    combined.includes("paso cerrado") ||
    combined.includes("fechada") ||
    combined.includes("cortada") ||
    combined.includes("cerrada")
  ) {
    category = "BLOQUEIO";
    priority = "CRITICAL";
  } else if (
    combined.includes("fronteira") || 
    combined.includes("aduana") || 
    combined.includes("migraciones") || 
    combined.includes("passo de jama") || 
    combined.includes("paso de jama") || 
    combined.includes("fronterizo") ||
    combined.includes("cristo redentor")
  ) {
    category = "FRONTEIRA";
    priority = "ATTENTION";
  } else if (
    combined.includes("clima") || 
    combined.includes("tempestade") || 
    combined.includes("ventania") || 
    combined.includes("neve") || 
    combined.includes("nevada") || 
    combined.includes("tormenta") || 
    combined.includes("viento") || 
    combined.includes("chuva") || 
    combined.includes("granizo") || 
    combined.includes("frio") || 
    combined.includes("geada") || 
    combined.includes("gelo") || 
    combined.includes("congelamento") || 
    combined.includes("hielo") ||
    combined.includes("deslizamento") ||
    combined.includes("deslizamiento") ||
    combined.includes("derrubada")
  ) {
    category = "CLIMA";
    priority = combined.includes("extremo") || combined.includes("severo") || combined.includes("alerta") ? "CRITICAL" : "ATTENTION";
  } else if (
    combined.includes("alerta") || 
    combined.includes("perigo") || 
    combined.includes("urgente") || 
    combined.includes("crítico") || 
    combined.includes("trânsito parado") ||
    combined.includes("peligro")
  ) {
    category = "CRÍTICO";
    priority = "CRITICAL";
  } else {
    category = "GERAL";
    priority = "MODERATE";
  }

  // Country detection
  if (combined.includes("argentina") || combined.includes("mendoza") || combined.includes("jama") || combined.includes("los libertadores")) {
    country = "Argentina";
  } else if (combined.includes("chile") || combined.includes("santiago") || combined.includes("atacama") || combined.includes("patagonia")) {
    country = "Chile";
  } else if (combined.includes("uruguai") || combined.includes("uruguay") || combined.includes("montevideo")) {
    country = "Uruguai";
  } else if (
    combined.includes("brasil") || 
    combined.includes("br-") || 
    combined.includes("rs-") || 
    combined.includes("sc-") || 
    combined.includes("pr-") || 
    combined.includes("sp-") || 
    combined.includes("rio de janeiro") || 
    combined.includes("rodovia") || 
    combined.includes("autopista")
  ) {
    country = "Brasil";
  }

  return { category, priority, country };
}

// Main parser function converting Google News XML RSS to refined JSON objects
function parseGoogleNewsRSS(xmlText: string): AlertItem[] {
  const alerts: AlertItem[] = [];
  const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descriptionMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
    const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);

    const rawTitle = titleMatch ? decodeHTMLEntities(titleMatch[1]) : "";
    let title = rawTitle;
    let fonte = sourceMatch ? decodeHTMLEntities(sourceMatch[1]) : "";

    // Parse out source from Title standard "TitleText - SourceName"
    const hyphenIndex = rawTitle.lastIndexOf(" - ");
    if (hyphenIndex !== -1) {
      title = rawTitle.substring(0, hyphenIndex).trim();
      if (!fonte) {
        fonte = rawTitle.substring(hyphenIndex + 3).trim();
      }
    }
    if (!fonte) {
      fonte = "Google News";
    }

    const descriptionHtml = descriptionMatch ? descriptionMatch[1] : "";
    // Strip HTML and clean
    const rawResume = decodeHTMLEntities(descriptionHtml);
    // Shorten if necessary and tidy
    let resumo = rawResume.length > 220 ? rawResume.substring(0, 217) + "..." : rawResume;
    if (!resumo || resumo === title) {
      resumo = `Informações e reportes operacionais em andamento sobre a situação reportada. Acompanhe a fonte original para comunicados oficiais.`;
    }

    const link = linkMatch ? linkMatch[1].trim() : "";
    const rawDate = pubDateMatch ? pubDateMatch[1] : "";
    const { relative, timestamp } = formatRelativeTime(rawDate);
    const { category, priority, country } = classifyAlert(title, resumo);

    // Create a deterministic short ID
    let crypto;
    const idSeed = link || title;
    let simpleHash = 0;
    for (let i = 0; i < idSeed.length; i++) {
      simpleHash = (simpleHash << 5) - simpleHash + idSeed.charCodeAt(i);
      simpleHash |= 0; // Convert to 32bit integer
    }
    const id = `RADAR-${Math.abs(simpleHash).toString(36).toUpperCase()}`;

    alerts.push({
      id,
      title,
      link,
      date: relative,
      timestamp,
      resumo,
      fonte,
      category,
      priority,
      country
    });
  }

  return alerts;
}

// In-Memory API Cache to avoid rate-limiting and accelerate response (TTL: 3 minutes)
interface ApiCache {
  data: AlertItem[];
  timestamp: number;
}
let rssCache: ApiCache | null = null;
const RSS_CACHE_TTL = 3 * 60 * 1000; // 3 minutos

export async function fetchAlertsFromRSS(): Promise<AlertItem[]> {
  const now = Date.now();
  if (rssCache && (now - rssCache.timestamp < RSS_CACHE_TTL)) {
    console.log(`[RadarAPI] Cache HIT. Restando ${Math.round((RSS_CACHE_TTL - (now - rssCache.timestamp)) / 1000)}s.`);
    return rssCache.data;
  }

  console.log(`[RadarAPI] Cache MISS. Buscando feeds RSS ao vivo.`);

  // Feeds RSS: Portuguese and Spanish
  const queries = [
    // PT query (LogISTICS and roads)
    "bloqueio rodovia OR deslizamento estrada OR fronteira fechada OR " + encodeURIComponent('"clima extremo"') + " OR " + encodeURIComponent('"alerta viagem"'),
    // ES query (RUTAS and general travel)
    "bloqueo ruta OR deslizamiento carretera OR frontera cerrada OR " + encodeURIComponent('"clima extremo"') + " OR " + encodeURIComponent('"alerta viaje"')
  ];

  const urls = [
    `https://news.google.com/rss/search?q=${queries[0]}&hl=pt-BR&gl=BR&ceid=BR:pt-419`,
    `https://news.google.com/rss/search?q=${queries[1]}&hl=es-419&gl=AR&ceid=AR:es-419`
  ];

  let rawAlerts: AlertItem[] = [];

  try {
    const fetchPromises = urls.map(async (url) => {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/xml, text/xml, */*"
          }
        });
        if (!res.ok) throw new Error(`Google News RSS HTTP error ${res.status}`);
        const xmlText = await res.text();
        return parseGoogleNewsRSS(xmlText);
      } catch (err: any) {
        console.error(`[RadarAPI] Erro ao buscar feed (${url}):`, err.message);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    rawAlerts = results.flat();

    // Deduplicate alerts by Title (using a normalized helper index)
    const seenTitles = new Set<string>();
    const uniqueAlerts: AlertItem[] = [];

    // Sort by timestamp descending so duplicates will prefer newer entries
    rawAlerts.sort((a, b) => b.timestamp - a.timestamp);

    for (const alert of rawAlerts) {
      const normalizedTitle = alert.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueAlerts.push(alert);
      }
    }

    // Sort and slice top 16 items
    const finalAlerts = uniqueAlerts.slice(0, 16);

    // Populate in-memory cache
    rssCache = {
      data: finalAlerts,
      timestamp: now
    };

    return finalAlerts;
  } catch (err: any) {
    console.error("[RadarAPI] Falha crítica nas buscas RSS:", err.message);
    return rssCache ? rssCache.data : []; // Fallback inside cache if it fails
  }
}

// Vercel Serverless Default Handler
export default async function handler(req: any, res: any) {
  // CORS configuration if needed
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const data = await fetchAlertsFromRSS();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ 
      error: "Falha ao processar monitor operacional de contingência", 
      details: err?.message 
    });
  }
}
