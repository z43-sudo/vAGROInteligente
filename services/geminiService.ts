import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFarmInsight = async (contextData: any): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Você é um agrônomo especialista assistente virtual da plataforma "Agro Inteligente".
      Analise os seguintes dados da fazenda e forneça um insight curto, prático e motivador (máximo 2 frases) para o gestor João Silva.
      Foque em otimização ou alertas importantes.

      Dados Atuais:
      ${JSON.stringify(contextData)}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Não foi possível gerar um insight no momento.";
  } catch (error) {
    console.error("Erro ao gerar insight:", error);
    return "O sistema de IA está temporariamente indisponível. Verifique sua conexão.";
  }
};