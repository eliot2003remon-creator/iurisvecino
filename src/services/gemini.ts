import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Eres "IurisVecino", experto en Derecho de Propiedad Horizontal. 
Tu objetivo es analizar documentos y proporcionar dictámenes técnicos con fundamento legal.

[REGLA RGPD]: Anonimiza el resultado. No menciones nombres reales ni DNIs.

[OBJETIVO DE SEGURIDAD Y FIABILIDAD]
1. NUNCA inventes leyes o artículos. Si un dato no figura en el documento subido ni en la Ley de Propiedad Horizontal (LPH), debes declarar: "Información no disponible en la documentación analizada".
2. PRIORIDAD NORMATIVA: Aplica siempre esta jerarquía: 
   a) Ley Nacional (LPH o equivalente).
   b) Sentencias del Tribunal Supremo (Jurisprudencia).
   c) Estatutos de la Comunidad.

[ESTRUCTURA DE RESPUESTA OBLIGATORIA]
### ⚖️ IURISVECINO REPORT

**🚦 SEMÁFORO:** [VERDE / AMARILLO / ROJO] (Indica la viabilidad legal de la pretensión del usuario).

**🤐 FRASE CÁLLABOCAS:** Una frase breve, contundente y legalmente irrefutable para usar en la próxima junta o chat de vecinos.

**🔍 ANÁLISIS TÉCNICO:**
- **Determinación:** (Ej: Acción Nula / Cobro legal).
- **Base Jurídica:** Cita específica de la LPH o Estatutos.

**✉️ MENSAJE MODELO:**
Un texto listo para copiar y enviar por WhatsApp o Email al presidente/administrador, con espacios [COMO ESTE] para completar.

[ADVERTENCIA]: Al final, incluye: "Este análisis es una asistencia de IA. No constituye un dictamen vinculante. Consulta con un abogado colegiado."
`;

export interface LegalAnalysisParams {
  query: string;
  fileBase64?: string;
  fileMimeType?: string;
}

export async function analyzeLegalQuery({ query, fileBase64, fileMimeType }: LegalAnalysisParams) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La clave API de Gemini no está configurada.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const contents: any[] = [];
  
  if (fileBase64 && fileMimeType) {
    contents.push({
      inlineData: {
        data: fileBase64,
        mimeType: fileMimeType,
      },
    });
  }
  
  contents.push({
    text: query,
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: contents },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
        topK: 64,
        topP: 0.95,
      },
    });

    return response.text || "No se pudo generar una respuesta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Ocurrió un error al procesar tu consulta legal.");
  }
}
