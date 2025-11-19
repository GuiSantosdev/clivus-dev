
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface GeoLocationData {
  city: string;
  state: string;
  country: string;
  countryCode: string;
}

/**
 * API de Geolocalização por IP
 * 
 * Detecta a cidade e estado do visitante usando seu endereço IP.
 * Usa o serviço público ip-api.com (gratuito, até 45 req/min).
 * 
 * @returns JSON com cidade, estado e país do visitante
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extrai o IP real do visitante (considerando proxies/cloudflare)
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    
    // Debug: Log all headers
    console.log("🔍 [Geolocation API] Headers:", {
      "x-forwarded-for": forwarded,
      "x-real-ip": realIp,
      "cf-connecting-ip": cfConnectingIp
    });
    
    // Prioridade: CF > X-Real-IP > X-Forwarded-For > IP direto
    let clientIp = cfConnectingIp || realIp || forwarded?.split(",")[0] || "unknown";
    
    // Remove espaços em branco
    clientIp = clientIp.trim();

    console.log("🌍 [Geolocation API] IP final detectado:", clientIp);

    // 2. Se for IP local (desenvolvimento), usa IP público de teste
    if (
      clientIp === "unknown" ||
      clientIp === "::1" ||
      clientIp === "127.0.0.1" ||
      clientIp.startsWith("192.168.") ||
      clientIp.startsWith("10.") ||
      clientIp.startsWith("172.")
    ) {
      console.log("⚠️  [Geolocation API] IP local detectado, usando fallback para São Paulo");
      
      // Retorna dados de São Paulo como fallback para ambiente local
      return NextResponse.json({
        city: "São Paulo",
        state: "SP",
        country: "Brazil",
        countryCode: "BR",
        source: "fallback-local",
      });
    }

    // 3. Consulta a API de geolocalização (ip-api.com - gratuita)
    const geoApiUrl = `http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,region,regionName,city`;
    
    console.log("🔍 [Geolocation API] Consultando:", geoApiUrl);

    const geoResponse = await fetch(geoApiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000),
    });

    if (!geoResponse.ok) {
      throw new Error(`Erro na API de geolocalização: ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();

    console.log("✅ [Geolocation API] Resposta:", geoData);

    // 4. Verifica se a requisição foi bem-sucedida
    if (geoData.status !== "success") {
      throw new Error(geoData.message || "Falha ao obter geolocalização");
    }

    // 5. Mapeia nomes de estados brasileiros (sigla)
    const stateAbbreviations: { [key: string]: string } = {
      "Acre": "AC",
      "Alagoas": "AL",
      "Amapá": "AP",
      "Amazonas": "AM",
      "Bahia": "BA",
      "Ceará": "CE",
      "Distrito Federal": "DF",
      "Espírito Santo": "ES",
      "Goiás": "GO",
      "Maranhão": "MA",
      "Mato Grosso": "MT",
      "Mato Grosso do Sul": "MS",
      "Minas Gerais": "MG",
      "Pará": "PA",
      "Paraíba": "PB",
      "Paraná": "PR",
      "Pernambuco": "PE",
      "Piauí": "PI",
      "Rio de Janeiro": "RJ",
      "Rio Grande do Norte": "RN",
      "Rio Grande do Sul": "RS",
      "Rondônia": "RO",
      "Roraima": "RR",
      "Santa Catarina": "SC",
      "São Paulo": "SP",
      "Sergipe": "SE",
      "Tocantins": "TO",
    };

    // 6. Formata a resposta
    const locationData: GeoLocationData = {
      city: geoData.city || "São Paulo",
      state: stateAbbreviations[geoData.regionName] || geoData.region || "SP",
      country: geoData.country || "Brazil",
      countryCode: geoData.countryCode || "BR",
    };

    console.log("📍 [Geolocation API] Localização final:", locationData);

    // 7. Retorna os dados
    return NextResponse.json({
      ...locationData,
      source: "ip-api",
      ip: clientIp,
    });

  } catch (error) {
    console.error("❌ [Geolocation API] Erro:", error);

    // Fallback: retorna São Paulo em caso de erro
    return NextResponse.json({
      city: "São Paulo",
      state: "SP",
      country: "Brazil",
      countryCode: "BR",
      source: "fallback-error",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
