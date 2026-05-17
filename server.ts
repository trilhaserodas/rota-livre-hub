import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/chat", async (req, res) => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY");
      return res.status(500).json({ error: "Chave API Gemini não encontrada no ambiente do servidor." });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const maxRetries = 3;
    let retryCount = 0;

    const executeChat = async (): Promise<any> => {
      try {
        console.log(`Iniciando tentativa ${retryCount + 1} para Gemini...`);
        
        // Prepare contents
        const contents: any[] = [];
        if (history && Array.isArray(history)) {
          contents.push(...history);
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: contents,
          config: {
            systemInstruction: `Você é o "RADAR IA", o assistente tático do Rota Livre Hub. 
Sua missão é auxiliar cicloviajantes e aventureiros na América Latina com informações precisas e atualizadas.

DIRETRIZES DE PESQUISA (PROTOCOLO REDDIT/COMUNIDADE/GOOGLE):
1. Sempre que precisar de relatos reais de ciclistas, dicas de equipamentos específicos ou condições de trilhas "em tempo real", utilize a ferramenta de pesquisa para buscar no REDDIT e em fóruns especializados (ex: "site:reddit.com bicycletouring [termo de busca]").
2. Foque em subreddits como r/bicycletouring, r/cycling, r/bikepacking e comunidades latinas.
3. Além do Reddit, use a pesquisa do Google para buscar por blogs de viagem, notícias locais e alertas oficiais.

ÁREAS DE ATUAÇÃO:
1. Logística de cicloviagem (rotas, equipamentos, acampamento).
2. Protocolos de sobrevivência e segurança em climas extremos (frio, calor, altitude).
3. Conversão de moedas e fusos horários na América Latina.
4. Manutenção básica de bicicletas em campo.

Seu tom é: Técnico, direto, prestativo e "High-Tech". Use uma linguagem que remeta a painéis de controle e protocolos.

Seja conciso mas detalhado no que importa. Sempre priorize a segurança do ciclista.
Responda sempre em Português do Brasil.`,
            tools: [{ googleSearch: {} }],
            temperature: 0.7,
          }
        });

        return response;
      } catch (error: any) {
        // Handle Rate Limit (429) or Overloaded (503)
        const isRetryable = (error.status === 429 || error.status === 503 || error.message?.includes('429') || error.message?.includes('quota'));
        
        if (isRetryable && retryCount < maxRetries) {
          retryCount++;
          const waitTime = retryCount * 3000; // Exponential-ish backoff
          console.log(`Radar IA em espera. Retentando em ${waitTime}ms (Tentativa ${retryCount}/${maxRetries})...`);
          await delay(waitTime);
          return executeChat();
        }
        throw error;
      }
    };

    try {
      const response = await executeChat();
      const text = response.text;
      
      if (!text) {
        throw new Error("O modelo Gemini retornou uma resposta sem texto.");
      }

      console.log("Resposta da IA recebida com sucesso.");
      res.json({ 
        text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
      });
    } catch (error: any) {
      console.error("Chat Server Error:", error);
      res.status(error.status || 500).json({ 
        error: "Erro no processamento da IA",
        details: error.message || String(error)
      });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      hasKey: !!process.env.GEMINI_API_KEY,
      hasWeatherKey: !!process.env.WEATHER_API_KEY,
      node: process.version
    });
  });

  app.get("/api/weather", async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    console.log(`[WeatherAPI] Received proxy request: lat=${lat}, lon=${lon}`);

    if (lat === undefined || lon === undefined || lat === "" || lon === "") {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    try {
      // 1. Try OpenWeatherMap if API Key exists
      if (apiKey) {
        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
          console.log(`[WeatherAPI] Try OWM: ${url.split('appid=')[0]}`);
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`[WeatherAPI] OWM Success`);
            return res.json(data);
          }
          console.warn(`[WeatherAPI] OWM Failed (${response.status}), falling back to Open-Meteo`);
        } catch (owmErr) {
          console.error(`[WeatherAPI] OWM Fetch Exception, falling back:`, owmErr);
        }
      } else {
        console.warn(`[WeatherAPI] Missing API Key, using Open-Meteo as primary source`);
      }

      // 2. Fallback to Open-Meteo (Free, No Key)
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      console.log(`[WeatherAPI] Fetching Open-Meteo: ${openMeteoUrl}`);
      const omResponse = await fetch(openMeteoUrl);
      
      if (!omResponse.ok) {
        throw new Error(`Open-Meteo failed with status ${omResponse.status}`);
      }

      const omData = await omResponse.json();
      
      // Adapt Open-Meteo structure to match what the frontend expects from OWM
      const adaptedData = {
        main: {
          temp: omData.current_weather.temperature,
          feels_like: omData.current_weather.temperature,
          humidity: 65 // Fallback humidity
        },
        weather: [
          {
            description: getWmoDescription(omData.current_weather.weathercode),
            icon: getWmoIcon(omData.current_weather.weathercode)
          }
        ],
        wind: {
          speed: omData.current_weather.windspeed / 3.6 
        }
      };

      console.log(`[WeatherAPI] Open-Meteo Success (Adapted)`);
      res.json(adaptedData);

    } catch (error: any) {
      console.error("[WeatherAPI] Final Exception:", error);
      res.status(500).json({ error: "Erro na conexão com serviço meteorológico", details: error?.message });
    }
  });

  // Helper functions for Open-Meteo adaptation
  function getWmoDescription(code: number): string {
    const codes: Record<number, string> = {
      0: 'Céu Limpo', 1: 'Predom. Limpo', 2: 'Parcial. Nublado', 3: 'Nublado',
      45: 'Nevoeiro', 48: 'Nevoeiro Escarchante', 51: 'Chuvisco Leve',
      61: 'Chuva Leve', 63: 'Chuva Moderada', 65: 'Chuva Forte',
      71: 'Neve Leve', 95: 'Trovoada'
    };
    return codes[code] || 'Condições Variáveis';
  }

  function getWmoIcon(code: number): string {
    if (code === 0) return '01d';
    if (code <= 3) return '02d';
    if (code <= 48) return '50d';
    if (code <= 67) return '10d';
    if (code <= 77) return '13d';
    return '11d';
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
