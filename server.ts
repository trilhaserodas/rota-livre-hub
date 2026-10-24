import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Cache para a previsão do tempo de Serra do Rio do Rastro (Tempo de vida: 15 minutos)
  interface SerraWeatherCache {
    data: any;
    timestamp: number;
  }
  let serraWeatherCache: SerraWeatherCache | null = null;
  const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      hasKey: !!process.env.GEMINI_API_KEY,
      hasWeatherKey: !!process.env.WEATHER_API_KEY,
      node: process.version
    });
  });

  // Intel Contingency Radar Live RSS Parser and Cache
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

  let localRssCache: { data: AlertItem[]; timestamp: number } | null = null;
  const LOCAL_RSS_TTL = 3 * 60 * 1000; // 3 minutos

  app.get("/api/alerts", async (req, res) => {
    const now = Date.now();
    if (localRssCache && (now - localRssCache.timestamp < LOCAL_RSS_TTL)) {
      console.log(`[ExpressRadar] Serving alerts from cache.`);
      return res.json(localRssCache.data);
    }

    console.log(`[ExpressRadar] Fetching new RSS data.`);

    function decodeHTMLEntities(text: string): string {
      if (!text) return "";
      return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/<[^>]*>/g, "")
        .trim();
    }

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
          return { relative: diffMins <= 5 ? "Agora mesmo" : `Há ${diffMins} minutos`, timestamp };
        } else if (diffHours < 24) {
          return { relative: `Há ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`, timestamp };
        } else if (diffDays === 1) {
          return { relative: "Ontem", timestamp };
        } else {
          return { relative: `Há ${diffDays} dias`, timestamp };
        }
      } catch (e) {
        return { relative: "Recentemente", timestamp: Date.now() };
      }
    }

    function classifyAlert(title: string, resume: string): { 
      category: AlertItem["category"]; 
      priority: AlertItem["priority"];
      country: AlertItem["country"];
    } {
      const combined = `${title} ${resume}`.toLowerCase();
      let category: AlertItem["category"] = "GERAL";
      let priority: AlertItem["priority"] = "LOW";
      let country: AlertItem["country"] = "América Latina";

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

    try {
      const queries = [
        "bloqueio rodovia OR deslizamento estrada OR fronteira fechada OR " + encodeURIComponent('"clima extremo"') + " OR " + encodeURIComponent('"alerta viagem"'),
        "bloqueo ruta OR deslizamiento carretera OR frontera cerrada OR " + encodeURIComponent('"clima extremo"') + " OR " + encodeURIComponent('"alerta viaje"')
      ];
      const urls = [
        `https://news.google.com/rss/search?q=${queries[0]}&hl=pt-BR&gl=BR&ceid=BR:pt-419`,
        `https://news.google.com/rss/search?q=${queries[1]}&hl=es-419&gl=AR&ceid=AR:es-419`
      ];

      const fetchPromises = urls.map(async (url) => {
        try {
          const res = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Accept": "application/xml, text/xml, */*"
            }
          });
          if (!res.ok) return [];
          const xmlText = await res.text();
          const pAlerts: AlertItem[] = [];
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

            const hyphenIndex = rawTitle.lastIndexOf(" - ");
            if (hyphenIndex !== -1) {
              title = rawTitle.substring(0, hyphenIndex).trim();
              if (!fonte) {
                fonte = rawTitle.substring(hyphenIndex + 3).trim();
              }
            }
            if (!fonte) fonte = "Google News";

            const descriptionHtml = descriptionMatch ? descriptionMatch[1] : "";
            const rawResume = decodeHTMLEntities(descriptionHtml);
            let resumo = rawResume.length > 220 ? rawResume.substring(0, 217) + "..." : rawResume;
            if (!resumo || resumo === title) {
              resumo = `Análise e reportagem em tempo real sobre a ocorrência operativa. Consulte a fonte oficial para dados complementares de tráfego.`;
            }

            const link = linkMatch ? linkMatch[1].trim() : "";
            const rawDate = pubDateMatch ? pubDateMatch[1] : "";
            const { relative, timestamp } = formatRelativeTime(rawDate);
            const { category, priority, country } = classifyAlert(title, resumo);

            let simpleHash = 0;
            const idSeed = link || title;
            for (let i = 0; i < idSeed.length; i++) {
              simpleHash = (simpleHash << 5) - simpleHash + idSeed.charCodeAt(i);
              simpleHash |= 0;
            }
            const id = `RADAR-${Math.abs(simpleHash).toString(36).toUpperCase()}`;

            pAlerts.push({
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
          return pAlerts;
        } catch (err) {
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      const rawAlerts = results.flat();

      const seenTitles = new Set<string>();
      const uniqueAlerts: AlertItem[] = [];

      rawAlerts.sort((a, b) => b.timestamp - a.timestamp);

      for (const alert of rawAlerts) {
        const normalizedTitle = alert.title.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!seenTitles.has(normalizedTitle)) {
          seenTitles.add(normalizedTitle);
          uniqueAlerts.push(alert);
        }
      }

      const finalAlerts = uniqueAlerts.slice(0, 16);
      localRssCache = {
        data: finalAlerts,
        timestamp: now
      };

      return res.json(finalAlerts);
    } catch (err: any) {
      return res.status(500).json({ error: "Erro ao carregar monitor RSS", details: err?.message });
    }
  });

  // Dedicated weather engine for Serra do Rio do Rastro SC
  app.get("/api/weather/serra-rio-do-rastro", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const lat = -28.39;
    const lon = -49.55;

    console.log(`[WeatherAPI] Serra do Rio do Rastro custom analysis requested.`);

    const now = Date.now();
    if (serraWeatherCache && (now - serraWeatherCache.timestamp < CACHE_TTL_MS)) {
      console.log(`[WeatherAPI] Serra do Rio do Rastro cache HIT. Restando ${Math.round((CACHE_TTL_MS - (now - serraWeatherCache.timestamp)) / 1000)}s.`);
      return res.json(serraWeatherCache.data);
    }
    console.log(`[WeatherAPI] Serra do Rio do Rastro cache MISS. Buscando dados novos.`);

    try {
      let current: any;
      
      try {
        // 1. Fetch live coordinates from Open-Meteo
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,visibility&timezone=auto`;
        
        console.log(`[WeatherAPI] Fetching Serra do Rio do Rastro weather from Open-Meteo`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        
        const omResponse = await fetch(openMeteoUrl, { 
          signal: controller.signal,
          headers: { 'User-Agent': 'RotaLivre-WeatherProxy/1.0' }
        });
        clearTimeout(timeout);
        
        if (!omResponse.ok) {
          throw new Error(`Open-Meteo falhou com status ${omResponse.status}`);
        }

        const omData = await omResponse.json();
        
        if (!omData.current) {
          throw new Error("Open-Meteo não retornou dados atuais para a Serra");
        }

        current = omData.current;
      } catch (omError: any) {
        console.warn(`[WeatherAPI] Open-Meteo falhou para Serra (${omError.message}). Tentando wttr.in.`);
        
        const wttrRes = await fetch(`https://wttr.in/${lat},${lon}?format=j1`);
        if (!wttrRes.ok) throw new Error(`wttr.in falhou com status ${wttrRes.status}`);
        const wttrData = await wttrRes.json();
        const cur = wttrData.current_condition[0];
        
        const temp = Math.round(parseFloat(cur.temp_C) || 0);
        const apparentTemp = Math.round(parseFloat(cur.FeelsLikeC) || temp);
        const sWind = Math.round(parseFloat(cur.windspeedKmph) || 0);
        const precipVal = parseFloat(cur.precipMM) || 0;
        const visVal = parseFloat(cur.visibility) || 10;
        
        const wwoCode = parseInt(cur.weatherCode) || 113;
        let wmoCode = 0;
        if (wwoCode === 113) wmoCode = 0;
        else if (wwoCode === 116) wmoCode = 2;
        else if (wwoCode === 119 || wwoCode === 122) wmoCode = 3;
        else if (wwoCode === 143 || wwoCode === 248) wmoCode = 45;
        else if (wwoCode === 266 || wwoCode === 293 || wwoCode === 296) wmoCode = 51;
        else if (wwoCode >= 353 && wwoCode <= 359) wmoCode = 80;
        else if (wwoCode === 386 || wwoCode === 389) wmoCode = 95;
        else wmoCode = 1;

        current = {
          temperature_2m: temp,
          apparent_temperature: apparentTemp,
          wind_speed_10m: sWind,
          wind_gusts_10m: Math.round(sWind * 1.3),
          precipitation: precipVal,
          visibility: visVal * 1000,
          weather_code: wmoCode,
          relative_humidity_2m: parseInt(cur.humidity) || 0,
          wind_direction_10m: parseInt(cur.winddirDegree) || 0
        };
      }

      const wind = current.wind_speed_10m || 0;
      const windGusts = current.wind_gusts_10m || 0;
      const temp = current.temperature_2m || 0;
      const apparentTemp = current.apparent_temperature || temp;

      // Determine visibility in km
      let visibilityRaw = current.visibility;
      let visibility_km = 10; // Default to 10km
      if (typeof visibilityRaw === 'number') {
        visibility_km = visibilityRaw / 1000;
      } else {
        // Safe estimation fallback based on WMO weather code if visibility is not returned
        const code = current.weather_code || 0;
        if (code === 45 || code === 48) {
          visibility_km = 0.3; // thick fog
        } else if (code >= 95) {
          visibility_km = 1.2; // severe thunderstorm
        } else if (code >= 61 && code <= 65) {
          visibility_km = 2.5; // rain
        } else if (code <= 3) {
          visibility_km = 10.0; // clear/partly cloudy
        } else {
          visibility_km = 6.0; // other cloudy or drizzle
        }
      }

      // 2. Classify status based on limits:
      // - VERDE (SAFE): Visibilidade > 5km E Ventos < 30km/h. Condição ideal.
      // - AMARELO (ATTENTION): Visibilidade entre 1km e 5km OU Ventos entre 30km/h e 50km/h. Exige cautela, neblina ou vento lateral.
      // - VERMELHO (DANGER): Visibilidade < 1km OU Ventos > 50km/h. Risco extremo. Rota desaconselhada ou interditada.
      let statusColor: "SAFE" | "ATTENTION" | "DANGER" = "SAFE";
      if (visibility_km < 1 || wind > 50) {
        statusColor = "DANGER";
      } else if ((visibility_km >= 1 && visibility_km <= 5) || (wind >= 30 && wind <= 50)) {
        statusColor = "ATTENTION";
      } else {
        statusColor = "SAFE";
      }

      // Base metric object to return alongside AI response values or fallback values
      const metrics = {
        temp,
        apparentTemp,
        wind,
        windGusts,
        visibility_km,
        weatherCode: current.weather_code || 0,
        weatherDesc: getWmoDescription(current.weather_code || 0),
        precipitation: current.precipitation || 0
      };

      // Default response structure aligned precisely with requested format
      const fallbackResponse = {
        statusColor,
        visibility_km: visibility_km.toFixed(1),
        alertTitle: statusColor === 'SAFE' 
          ? "PISTA LIMPA: VALORES DENTRO DO PROGRAMADO" 
          : statusColor === 'ATTENTION' 
            ? "ATENÇÃO: NEBLINA OU VENTOS MODERADOS/LATERAIS" 
            : "ALERTA CRÍTICO: CONDIÇÕES IMPRÓPRIAS",
        alertMessage: statusColor === 'SAFE'
          ? "Visibilidade favorável e ventos sob controle. Subida segura para praticantes de cicloturismo de aventura."
          : statusColor === 'ATTENTION'
            ? "Trechos com neblina na altitude ou rajadas de vento lateral. Mantenha os faróis ativos e velocidade reduzida."
            : "Condições de alto risco com ventos severos ou névoa densa. Rota instável e extremamente desaconselhada."
      };

      // 3. Make Gemini API run if available
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          const prompt = `
Você é o motor de análise meteorológica para cicloturistas e mochileiros na Serra do Rio do Rastro - SC (ambiente de montanha extrema).
Com base nos seguintes dados reais atuais:
- Temperatura atual: ${temp}°C (Sensação: ${apparentTemp}°C)
- Velocidade do vento: ${wind} km/h (Rajadas: ${windGusts} km/h)
- Visibilidade calculada: ${visibility_km.toFixed(1)} km
- Estado do tempo: ${getWmoDescription(current.weather_code || 0)}

Com base nos limites definidos, o status de segurança é calculado como: ${statusColor} (SAFE para boas condições, ATTENTION para atenção moderada, DANGER para perigo extremo).

Seus limites de status de segurança para referência:
- VERDE (SAFE): Visibilidade > 5km E Ventos < 30km/h. Condição ideal.
- AMARELO (ATTENTION): Visibilidade entre 1km e 5km OU Ventos entre 30km/h e 50km/h. Exige cautela, neblina ou vento lateral.
- VERMELHO (DANGER): Visibilidade < 1km OU Ventos > 50km/h. Risco extremo. Rota desaconselhada ou interditada.

Responda ÚNICA E EXCLUSIVAMENTE com um objeto JSON válido, sem bloco markdown (ou seja, NÃO use \`\`\`json ou qualquer formatação markdown, apenas o conteúdo bruto do JSON), contendo os seguintes campos exatamente:
{
  "statusColor": "${statusColor}",
  "visibility_km": "${visibility_km.toFixed(1)}",
  "alertTitle": "Título curto e chamativo para o status (máximo 5 palavras)",
  "alertMessage": "Mensagem técnica direta sobre a condição da serra e dicas de segurança para ciclistas e motos (no máximo 2 linhas)."
}
`;

          console.log(`[WeatherAPI] Querying Gemini 3.5-flash for Serra do Rio do Rastro analysis`);
          const aiResponse = await ai.models.generateContent({
             model: "gemini-3.5-flash",
             contents: prompt,
             config: {
                temperature: 0.4
             }
          });

          const responseText = aiResponse.text;
          if (responseText) {
             const cleanJsonText = responseText.replace(/```json|```/gi, "").trim();
             const aiJson = JSON.parse(cleanJsonText);
             console.log(`[WeatherAPI] Gemini Analysis succeeded:`, aiJson);
             const finalResponse = {
                ...aiJson,
                metrics
             };
             // Salvar no cache do servidor
             serraWeatherCache = {
                data: finalResponse,
                timestamp: Date.now()
             };
             return res.json(finalResponse);
          }
        } catch (aiErr: any) {
          console.error(`[WeatherAPI] Gemini AI call failed or JSON parse error. Using tactical fallback.`, aiErr.message);
        }
      }

      // If no API key or AI failed, return the high-quality fallback aligning precisely with status metrics
      console.log(`[WeatherAPI] Returning calculated fallback weather object`);
      const fallbackResult = {
        ...fallbackResponse,
        metrics
      };
      // Salvar no cache do servidor
      serraWeatherCache = {
         data: fallbackResult,
         timestamp: Date.now()
      };
      return res.json(fallbackResult);

    } catch (err: any) {
      console.error("[WeatherAPI] Serra analysis ultimate exception:", err.message);
      res.status(500).json({ 
        error: "Falha na análise meteorológica da Serra do Rio do Rastro", 
        details: err?.message 
      });
    }
  });

  // High-reliability route proxy (OSRM with OSM-DE fallback and server-side cache)
  const routeCache = new Map<string, { data: any; timestamp: number }>();
  app.get("/api/route", async (req, res) => {
    const { coords, mode = "driving" } = req.query;
    if (!coords || typeof coords !== "string") {
      return res.status(400).json({ error: "Parâmetro coords é obrigatório (lon1,lat1;lon2,lat2)" });
    }

    const cacheKey = `${mode}:${coords}`;
    const cached = routeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600 * 1000) {
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.json(cached.data);
    }

    const urls = [
      `https://router.project-osrm.org/route/v1/${mode}/${coords}?overview=full&geometries=geojson`,
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coords}?overview=full&geometries=geojson`
    ];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);
        const resp = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "RotaLivreHub/1.0 (contact@rotalivrehub.com)"
          }
        });
        clearTimeout(timeout);
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.routes && data.routes.length > 0) {
            routeCache.set(cacheKey, { data, timestamp: Date.now() });
            res.setHeader("Cache-Control", "public, max-age=86400");
            return res.json(data);
          }
        }
      } catch (err: any) {
        console.warn(`[RouteProxy] Mirror ${url.split("/route")[0]} failed:`, err.message);
      }
    }

    return res.status(502).json({ error: "Routing services currently unavailable", routes: [] });
  });

  // AI Route Intelligence proxy via modern @google/genai SDK
  app.post("/api/route-intelligence", async (req, res) => {
    const { region, vehicle, weather, expeditionType } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: { "User-Agent": "aistudio-build" }
          }
        });

        const prompt = `
Você é o motor de inteligência e segurança tática para expedições terrestres na América Latina (cicloturismo, motociclismo, 4x4 e motorhome).
Analise a seguinte rota e condições operacionais:
- Região/Destino: ${region || "Geral América Latina"}
- Meio de Transporte: ${vehicle || "bike"}
- Clima/Meteorologia: ${weather || "Normal"}
- Perfil da Expedição: ${expeditionType || "Aventura"}

Retorne ÚNICA E EXCLUSIVAMENTE um objeto JSON válido (sem tags markdown ou crases) com a seguinte estrutura:
{
  "difficulty": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "riskLevel": 45,
  "operationalConditions": "Descrição tática sucinta em português das condições do terreno e segurança",
  "equipment": ["item 1", "item 2", "item 3", "item 4"],
  "alerts": ["Alerta operacional 1", "Alerta operacional 2"],
  "summary": "Resumo executivo de 1 a 2 frases para o painel de bordo HUD.",
  "radarStats": {
    "terrain": 50,
    "isolation": 40,
    "weather": 30,
    "tech": 60
  }
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: {
            temperature: 0.3
          }
        });

        const text = response.text || "";
        const cleanJson = text.replace(/```json|```/gi, "").trim();
        const parsed = JSON.parse(cleanJson);
        return res.json(parsed);
      } catch (aiErr: any) {
        console.warn("[RouteIntelligence] Gemini call failed, returning tactical fallback:", aiErr.message);
      }
    }

    // High quality tactical deterministic model
    const isExtreme = String(expeditionType).includes("CRITICAL") || String(region).includes("156") || String(region).includes("Austral");
    return res.json({
      difficulty: isExtreme ? "HIGH" : "MODERATE",
      riskLevel: isExtreme ? 72 : 38,
      operationalConditions: isExtreme 
        ? "TRECHO CRÍTICO // ISOLAMENTO TÁTICO E POUCOS PONTOS DE APOIO // MONITORE O COMBUSTÍVEL E ÁGUA"
        : "SINAL OPERACIONAL REGULAR // PISTAS ASFALTADAS E MISTAS COM PONTOS DE PARADA PERIÓDICOS",
      equipment: [
        "GPS Offline com mapas em cache",
        "Kit reparo rápido de pneus e câmara",
        "Reserva de água potável (mínimo 3L)",
        "Powerbank e cabos reforçados",
        "Kit primeiros socorros de emergência"
      ],
      alerts: [
        "Verifique pontos cegos sem cobertura celular",
        "Consulte condições climáticas antes de trechos de serra"
      ],
      summary: `Análise tática para ${region || "rota selecionada"}: Mantenha velocidade constante e paradas planejadas nos POIs cadastrados.`,
      radarStats: {
        terrain: isExtreme ? 75 : 45,
        isolation: isExtreme ? 80 : 35,
        weather: isExtreme ? 65 : 40,
        tech: 70
      }
    });
  });

  app.get("/api/weather", async (req, res) => {
    const { lat, lon, lng } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    // Support both lon and lng
    const latitude = parseFloat(String(lat));
    const longitude = parseFloat(String(lon !== undefined ? lon : lng));

    console.log(`[WeatherAPI] Received proxy request: lat=${latitude}, lon=${longitude}`);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: "Latitude e longitude válidas são obrigatórias" });
    }

    try {
      // 1. Try OpenWeatherMap if API Key exists and looks valid
      if (apiKey && apiKey.length > 5) {
        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`;
          console.log(`[WeatherAPI] Try OWM: ${url.split('appid=')[0]}`);
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          
          const response = await fetch(url, { 
            signal: controller.signal,
            headers: { 'User-Agent': 'RotaLivre-WeatherProxy/1.0' }
          });
          clearTimeout(timeout);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`[WeatherAPI] OWM Success`);
            res.setHeader('Cache-Control', 'public, max-age=600');
            const rainVal = data.rain ? (data.rain['1h'] ?? data.rain['3h'] ?? 0) : (data.snow ? (data.snow['1h'] ?? data.snow['3h'] ?? 0) : 0);
            
            const wmoCode = mapOwmIdToWmoCode(data.weather?.[0]?.id ?? 800);
            const windSpeedKmH = Math.round((data.wind?.speed || 0) * 3.6);
            const windGustsKmH = Math.round((data.wind?.gust || data.wind?.speed || 0) * 3.6);

            return res.json({
              ...data,
              precipitation: rainVal,
              unified: {
                temp: Math.round(data.main?.temp ?? 0),
                feelsLike: Math.round(data.main?.feels_like ?? data.main?.temp ?? 0),
                humidity: data.main?.humidity ?? 0,
                windSpeedKmH,
                windGustsKmH,
                windDirection: data.wind?.deg ?? 0,
                weatherCode: wmoCode,
                precipitation: rainVal,
                precipProbability: rainVal > 0 ? 80 : 0,
                description: data.weather?.[0]?.description ? (data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)) : 'Condições Variáveis'
              },
              debug: {
                source: 'openweathermap',
                hasKey: true,
                latitude,
                longitude,
                env: process.env.NODE_ENV
              }
            });
          }
          console.warn(`[WeatherAPI] OWM Failed (${response.status}), falling back to Open-Meteo`);
        } catch (owmErr: any) {
          console.error(`[WeatherAPI] OWM Fetch Exception:`, owmErr.message);
        }
      }

      // 2. Fallback to Open-Meteo (Modern API)
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
      
      console.log(`[WeatherAPI] Fetching Open-Meteo: ${openMeteoUrl}`);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const omResponse = await fetch(openMeteoUrl, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'RotaLivre-WeatherProxy/1.0' }
      });
      clearTimeout(timeout);
      
      if (!omResponse.ok) {
        throw new Error(`Open-Meteo falhou com status ${omResponse.status}`);
      }

      const omData = await omResponse.json();
      
      if (!omData.current) {
        throw new Error("Open-Meteo não retornou dados atuais (current)");
      }

      const current = omData.current;
      
      // Adapt Open-Meteo structure to match what the frontend expects from OWM
      const adaptedData = {
        main: {
          temp: current.temperature_2m,
          feels_like: current.apparent_temperature ?? current.temperature_2m,
          humidity: current.relative_humidity_2m ?? 0
        },
        weather: [
          {
            description: getWmoDescription(current.weather_code),
            icon: getWmoIcon(current.weather_code, current.is_day)
          }
        ],
        wind: {
          speed: (current.wind_speed_10m || 0) / 3.6 
        },
        precipitation: current.precipitation ?? 0
      };

      console.log(`[WeatherAPI] Open-Meteo Success (Adapted)`);
      res.setHeader('Cache-Control', 'public, max-age=600');
      res.json({
        ...adaptedData,
        unified: {
          temp: Math.round(current.temperature_2m ?? 0),
          feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0),
          humidity: current.relative_humidity_2m ?? 0,
          windSpeedKmH: Math.round(current.wind_speed_10m ?? 0),
          windGustsKmH: Math.round(current.wind_gusts_10m ?? current.wind_speed_10m ?? 0),
          windDirection: current.wind_direction_10m ?? 0,
          weatherCode: current.weather_code ?? 0,
          precipitation: current.precipitation ?? 0,
          precipProbability: (current.precipitation ?? 0) > 0 ? 80 : 0,
          description: getWmoDescription(current.weather_code)
        },
        debug: {
          source: 'open-meteo',
          hasKey: true,
          latitude,
          longitude,
          env: process.env.NODE_ENV
        }
      });

    } catch (error: any) {
      console.warn(`[WeatherAPI] Open-Meteo falhou (${error.message}). Tentando wttr.in como canal de backup de emergência.`);
      try {
        const wttrRes = await fetch(`https://wttr.in/${latitude},${longitude}?format=j1`);
        if (!wttrRes.ok) throw new Error(`wttr.in falhou com status ${wttrRes.status}`);
        const wttrData = await wttrRes.json();
        const cur = wttrData.current_condition[0];
        
        const temp = Math.round(parseFloat(cur.temp_C) || 0);
        const apparentTemp = Math.round(parseFloat(cur.FeelsLikeC) || temp);
        const sWind = Math.round(parseFloat(cur.windspeedKmph) || 0);
        const precipVal = parseFloat(cur.precipMM) || 0;
        
        const wwoCode = parseInt(cur.weatherCode) || 113;
        let wmoCode = 0;
        if (wwoCode === 113) wmoCode = 0;
        else if (wwoCode === 116) wmoCode = 2;
        else if (wwoCode === 119 || wwoCode === 122) wmoCode = 3;
        else if (wwoCode === 143 || wwoCode === 248) wmoCode = 45;
        else if (wwoCode === 266 || wwoCode === 293 || wwoCode === 296) wmoCode = 51;
        else if (wwoCode >= 353 && wwoCode <= 359) wmoCode = 80;
        else if (wwoCode === 386 || wwoCode === 389) wmoCode = 95;
        else wmoCode = 1;

        const adaptedData = {
          main: {
            temp: temp,
            feels_like: apparentTemp,
            humidity: parseInt(cur.humidity) || 0
          },
          weather: [
            {
              description: cur.weatherDesc?.[0]?.value || getWmoDescription(wmoCode),
              icon: getWmoIcon(wmoCode, true)
            }
          ],
          wind: {
            speed: sWind / 3.6
          },
          precipitation: precipVal
        };

        res.setHeader('Cache-Control', 'public, max-age=600');
        res.json({
          ...adaptedData,
          unified: {
            temp: temp,
            feelsLike: apparentTemp,
            humidity: parseInt(cur.humidity) || 0,
            windSpeedKmH: sWind,
            windGustsKmH: Math.round(sWind * 1.3),
            windDirection: parseInt(cur.winddirDegree) || 0,
            weatherCode: wmoCode,
            precipitation: precipVal,
            precipProbability: precipVal > 0 ? 80 : 0,
            description: cur.weatherDesc?.[0]?.value || getWmoDescription(wmoCode)
          },
          debug: {
            source: 'wttr-fallback',
            hasKey: !!apiKey,
            latitude,
            longitude,
            env: process.env.NODE_ENV
          }
        });

      } catch (backupErr: any) {
        console.error("[WeatherAPI] Final Exception (Ambas APIs falharam):", backupErr.message);
        res.status(500).json({ 
          error: "Falha ao obter dados climáticos de todas as fontes disponíveis", 
          details: backupErr.message,
          source: "backend_proxy_complete_failure",
          debug: {
            source: 'error',
            hasKey: !!apiKey,
            latitude,
            longitude,
            env: process.env.NODE_ENV
          }
        });
      }
    }
  });

  // Universal Geocoding Security Proxy (Google Maps with seamless OpenStreetMap/Nominatim fallback)
  app.get(["/api/geocode", "/api/google-geocode"], async (req, res) => {
    const { q } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: "Query de busca (q) é obrigatória" });
    }

    console.log(`[GeocodeProxy] Request for query: "${q}"`);

    // 1. If Google Maps API key is configured, try Google Geocoding first
    if (apiKey && apiKey.trim() !== "") {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`;
        const response = await fetch(googleUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "OK" && data.results && data.results.length > 0) {
            const mappedResults = data.results.map((item: any) => ({
              lat: String(item.geometry.location.lat),
              lon: String(item.geometry.location.lng),
              display_name: item.formatted_address,
              source: 'google'
            }));
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.json({ status: "OK", results: mappedResults });
          }
        }
      } catch (err: any) {
        console.warn("[GeocodeProxy] Google Geocode failed, falling back to OSM Nominatim:", err.message);
      }
    }

    // 2. High-reliability OpenStreetMap / Nominatim with compliant User-Agent
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'RotaLivreHub/1.0 (trilhaserodas@gmail.com; contact@rotalivrehub.com)',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim responded with status ${response.status}`);
      }

      const data = await response.json();
      const mappedResults = Array.isArray(data) ? data.map((item: any) => ({
        lat: String(item.lat),
        lon: String(item.lon),
        display_name: item.display_name,
        source: 'nominatim'
      })) : [];

      if (mappedResults.length > 0) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.json({ status: "OK", results: mappedResults });
      }
    } catch (err: any) {
      console.warn("[GeocodeProxy] Nominatim fetch failed:", err.message);
    }

    // 3. Fallback dictionary for expedition hubs and major South American locations
    const KNOWN_PLACES: Record<string, { lat: string; lon: string; display_name: string }> = {
      "curitiba": { lat: "-25.4296", lon: "-49.2713", display_name: "Curitiba, Paraná, Brasil" },
      "sao paulo": { lat: "-23.5505", lon: "-46.6333", display_name: "São Paulo, SP, Brasil" },
      "rio de janeiro": { lat: "-22.9068", lon: "-43.1729", display_name: "Rio de Janeiro, RJ, Brasil" },
      "florianopolis": { lat: "-27.5954", lon: "-48.5480", display_name: "Florianópolis, Santa Catarina, Brasil" },
      "porto alegre": { lat: "-30.0346", lon: "-51.2177", display_name: "Porto Alegre, RS, Brasil" },
      "ushuaia": { lat: "-54.8019", lon: "-68.3030", display_name: "Ushuaia, Tierra del Fuego, Argentina" },
      "el chalten": { lat: "-49.3315", lon: "-72.8864", display_name: "El Chaltén, Santa Cruz, Argentina" },
      "bariloche": { lat: "-41.1335", lon: "-71.3103", display_name: "San Carlos de Bariloche, Río Negro, Argentina" },
      "buenos aires": { lat: "-34.6037", lon: "-58.3816", display_name: "Buenos Aires, Argentina" },
      "mendoza": { lat: "-32.8895", lon: "-68.8458", display_name: "Mendoza, Argentina" },
      "santiago": { lat: "-33.4489", lon: "-70.6693", display_name: "Santiago, Región Metropolitana, Chile" },
      "atacama": { lat: "-22.9087", lon: "-68.1997", display_name: "San Pedro de Atacama, Antofagasta, Chile" },
      "san pedro de atacama": { lat: "-22.9087", lon: "-68.1997", display_name: "San Pedro de Atacama, Antofagasta, Chile" },
      "puerto montt": { lat: "-41.4689", lon: "-72.9411", display_name: "Puerto Montt, Los Lagos, Chile" },
      "coyhaique": { lat: "-45.5689", lon: "-72.0664", display_name: "Coyhaique, Aysén, Chile" },
      "punta arenas": { lat: "-53.1638", lon: "-70.9171", display_name: "Punta Arenas, Magallanes, Chile" },
      "macapa": { lat: "0.033", lon: "-51.066", display_name: "Macapá, Amapá, Brasil" },
      "oiapoque": { lat: "3.840", lon: "-51.830", display_name: "Oiapoque, Amapá, Brasil" },
      "serra do rio do rastro": { lat: "-28.3900", lon: "-49.5500", display_name: "Serra do Rio do Rastro, Lauro Müller - SC, Brasil" },
      "bom jardim da serra": { lat: "-28.3375", lon: "-49.6300", display_name: "Bom Jardim da Serra, Santa Catarina, Brasil" },
      "urubici": { lat: "-28.0150", lon: "-49.5910", display_name: "Urubici, Santa Catarina, Brasil" },
      "estrada real": { lat: "-20.3856", lon: "-43.5035", display_name: "Estrada Real, Ouro Preto, Minas Gerais, Brasil" },
      "ouro preto": { lat: "-20.3856", lon: "-43.5035", display_name: "Ouro Preto, Minas Gerais, Brasil" },
      "tiradentes": { lat: "-21.1106", lon: "-44.1755", display_name: "Tiradentes, Minas Gerais, Brasil" },
      "paraty": { lat: "-23.2178", lon: "-44.7131", display_name: "Paraty, Rio de Janeiro, Brasil" },
      "cusco": { lat: "-13.5319", lon: "-71.9675", display_name: "Cusco, Peru" },
      "lima": { lat: "-12.0464", lon: "-77.0428", display_name: "Lima, Peru" },
      "la paz": { lat: "-16.4897", lon: "-68.1193", display_name: "La Paz, Bolívia" },
      "montevideo": { lat: "-34.9011", lon: "-56.1645", display_name: "Montevideo, Uruguai" }
    };

    const cleanQ = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    for (const [key, val] of Object.entries(KNOWN_PLACES)) {
      const cleanKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (cleanQ.includes(cleanKey) || cleanKey.includes(cleanQ)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.json({
          status: "OK",
          results: [{ ...val, source: 'offline-cache' }]
        });
      }
    }

    return res.json({ status: "OK", results: [] });
  });

  // Helper functions for Open-Meteo adaptation
  function getWmoDescription(code: number): string {
    const codes: Record<number, string> = {
      0: 'Céu Limpo', 
      1: 'Predominantemente Limpo', 
      2: 'Parcialmente Nublado', 
      3: 'Nublado',
      45: 'Nevoeiro', 
      48: 'Nevoeiro Escarchante', 
      51: 'Chuvisco Leve',
      53: 'Chuvisco Moderado',
      55: 'Chuvisco Denso',
      61: 'Chuva Leve', 
      63: 'Chuva Moderada', 
      65: 'Chuva Forte',
      71: 'Neve Leve', 
      73: 'Neve Moderada',
      75: 'Neve Forte',
      80: 'Pancadas de Chuva Leves',
      81: 'Pancadas de Chuva Moderadas',
      82: 'Pancadas de Chuva Violentas',
      95: 'Trovoada Leve/Moderada',
      96: 'Trovoada com Granizo Leve',
      99: 'Trovoada com Granizo Forte'
    };
    return codes[code] || 'Condições Variáveis';
  }

  function getWmoIcon(code: number, isDay: number | boolean = 1): string {
    const suffix = isDay === 1 || isDay === true ? 'd' : 'n';
    if (code === 0) return `01${suffix}`;
    if (code <= 3) return `02${suffix}`;
    if (code <= 48) return `50${suffix}`;
    if (code <= 67) return `10${suffix}`;
    if (code <= 77) return `13${suffix}`;
    return `11${suffix}`;
  }

  function mapOwmIdToWmoCode(id: number): number {
    if (id === 800) return 0;
    if (id > 800 && id <= 804) return id - 800; // 1, 2, 3
    if (id >= 700 && id < 800) return 45; // Fog
    if (id >= 300 && id < 400) return 51; // Drizzle
    if (id >= 500 && id < 504) return 61; // Light/mod rain
    if (id === 511) return 71; // Snow
    if (id >= 520 && id < 600) return 80; // Shower rain
    if (id >= 600 && id < 700) return 71; // Snow
    if (id >= 200 && id < 300) return 95; // Thunderstorm
    return 0;
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
