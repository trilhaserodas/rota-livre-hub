export interface RouteAnalysisInput {
  region: string;
  vehicle: string;
  weather: string;
  expeditionType: string;
}

export interface RouteAnalysisResult {
  difficulty: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  riskLevel: number; // 0-100
  operationalConditions: string;
  equipment: string[];
  alerts: string[];
  summary: string;
  radarStats: {
    terrain: number;
    isolation: number;
    weather: number;
    tech: number;
  };
}

export async function analyzeRouteIntelligence(input: RouteAnalysisInput): Promise<RouteAnalysisResult> {
  try {
    const res = await fetch('/api/route-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.difficulty) {
        return data;
      }
    }
  } catch (error) {
    console.warn("Backend AI route intelligence fetch failed, using tactical model:", error);
  }

  // Fallback tactical analysis if network or backend fails
  const isExtreme = input.expeditionType.includes("CRITICAL") || input.region.includes("156") || input.region.includes("Austral");
  return {
    difficulty: isExtreme ? "HIGH" : "MODERATE",
    riskLevel: isExtreme ? 72 : 45,
    operationalConditions: isExtreme 
      ? "SINAL_OFFLINE // TERRENO SEVERO COM ÁREAS DE ISOLAMENTO" 
      : "SINAL_ESTÁVEL // TERRENO_MISTO COM PONTOS DE APOIO",
    equipment: ["KIT_PRIMEIROS_SOCORROS", "GPS_OFFLINE", "RESERVA_COMBUSTÍVEL", "CABOS_E_POWERBANK"],
    alerts: ["VERIFICAR_CONDIÇÕES_LOCAIS", "COMUNICAÇÃO_RÁDIO_OU_OFFLINE_RECOMENDADA"],
    summary: `Análise tática para ${input.region || "rota ativa"}: Mantenha autonomia de água e revise os waypoints salvos.`,
    radarStats: { terrain: isExtreme ? 75 : 50, isolation: isExtreme ? 80 : 40, weather: 35, tech: 60 }
  };
}
