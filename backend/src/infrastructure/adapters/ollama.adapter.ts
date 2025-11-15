import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ParsedInstallRequest {
  environmentType: string;
  environmentAreaM2: number;
  locationCity: string;
  locationState: string;
  voltagePreference: string;
  productTypePreference: string;
  brandPreference: string;
  maxBudget?: number;
  deadlineDays?: number;
  description: string;
  confidence: number;
}

@Injectable()
export class OllamaAdapter {
  private readonly logger = new Logger(OllamaAdapter.name);
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('OLLAMA_API_URL', 'http://localhost:11434');
  }

  async parseInstallRequest(messages: string[]): Promise<ParsedInstallRequest> {
    const prompt = this.buildExtractionPrompt(messages);

    try {
      const response = await axios.post(`${this.apiUrl}/api/generate`, {
        model: 'llama2',
        prompt,
        stream: false,
        format: 'json',
      });

      const parsed = JSON.parse(response.data.response);
      this.logger.log('LLM parsed install request successfully');
      return parsed;
    } catch (error) {
      this.logger.error('Error calling Ollama API, using fallback parser', error.message);
      return this.fallbackParser(messages);
    }
  }

  async generateProposalMessage(quotationData: any): Promise<string> {
    const prompt = this.buildProposalPrompt(quotationData);

    try {
      const response = await axios.post(`${this.apiUrl}/api/generate`, {
        model: 'llama2',
        prompt,
        stream: false,
      });

      return response.data.response;
    } catch (error) {
      this.logger.error('Error generating proposal, using template', error.message);
      return this.fallbackProposalTemplate(quotationData);
    }
  }

  async generateFollowUpQuestion(context: string, extractedData: Partial<ParsedInstallRequest>): Promise<string> {
    const missingFields = this.identifyMissingFields(extractedData);

    if (missingFields.length === 0) {
      return 'Perfeito! Recebi todas as informações. Vou processar sua cotação agora.';
    }

    const prompt = `Você é um assistente prestativo que está coletando informações para uma cotação de ar-condicionado.

Contexto da conversa: ${context}

Dados já coletados: ${JSON.stringify(extractedData)}

Campos que ainda precisam ser preenchidos: ${missingFields.join(', ')}

Gere UMA pergunta natural e amigável para coletar o próximo dado importante. Seja breve e direto.

Pergunta:`;

    try {
      const response = await axios.post(`${this.apiUrl}/api/generate`, {
        model: 'llama2',
        prompt,
        stream: false,
      });

      return response.data.response.trim();
    } catch (error) {
      this.logger.error('Error generating follow-up question', error.message);
      return this.fallbackFollowUpQuestion(missingFields[0]);
    }
  }

  private buildExtractionPrompt(messages: string[]): string {
    const conversation = messages.join('\n');

    return `Você é um assistente especializado em extrair informações estruturadas de conversas sobre ar-condicionado.

Conversa:
${conversation}

Extraia as seguintes informações e retorne APENAS um JSON válido no formato abaixo:
{
  "environmentType": "residencial|comercial|industrial",
  "environmentAreaM2": número,
  "locationCity": "cidade",
  "locationState": "estado (sigla)",
  "voltagePreference": "110V|220V|220V Trifásico",
  "productTypePreference": "split|janela|cassete|piso-teto",
  "brandPreference": "marca preferida ou null",
  "maxBudget": número ou null,
  "deadlineDays": número de dias ou null,
  "description": "resumo da necessidade",
  "confidence": número entre 0 e 1
}

JSON:`;
  }

  private buildProposalPrompt(quotationData: any): string {
    return `Você é um vendedor profissional de ar-condicionado. Crie uma mensagem de proposta amigável e profissional.

Dados da cotação:
- Produto: ${quotationData.productName}
- Capacidade: ${quotationData.btu} BTU
- Preço final: R$ ${quotationData.price}
- Prazo de entrega: ${quotationData.leadTime} dias úteis
- Garantia: ${quotationData.warranty} meses

Crie uma mensagem WhatsApp persuasiva mas não exagerada, destacando o valor da oferta.

Mensagem:`;
  }

  private fallbackParser(messages: string[]): ParsedInstallRequest {
    const text = messages.join(' ').toLowerCase();

    const areaMatch = text.match(/(\d+)\s*m[²2]/);
    const budgetMatch = text.match(/r?\$?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/);

    return {
      environmentType: text.includes('comercial') ? 'comercial' : 'residencial',
      environmentAreaM2: areaMatch ? parseInt(areaMatch[1]) : 30,
      locationCity: 'São Paulo',
      locationState: 'SP',
      voltagePreference: text.includes('110') ? '110V' : '220V',
      productTypePreference: text.includes('janela') ? 'janela' : 'split',
      brandPreference: '',
      maxBudget: budgetMatch ? parseFloat(budgetMatch[1].replace('.', '').replace(',', '.')) : undefined,
      deadlineDays: 15,
      description: messages[messages.length - 1],
      confidence: 0.5,
    };
  }

  private fallbackProposalTemplate(data: any): string {
    return `Olá! 👋

Tenho uma ótima proposta para você:

🔹 *${data.productName}*
🔹 Capacidade: *${data.btu} BTU*
🔹 Preço: *R$ ${data.price.toFixed(2)}*
🔹 Entrega em: *${data.leadTime} dias úteis*
🔹 Garantia: *${data.warranty} meses*

Esta é uma excelente opção que atende suas necessidades!

Gostaria de prosseguir com esta proposta?`;
  }

  private identifyMissingFields(data: Partial<ParsedInstallRequest>): string[] {
    const missing: string[] = [];

    if (!data.environmentAreaM2 || data.environmentAreaM2 === 0) missing.push('área do ambiente');
    if (!data.locationCity) missing.push('cidade');
    if (!data.voltagePreference) missing.push('voltagem');

    return missing;
  }

  private fallbackFollowUpQuestion(field: string): string {
    const questions = {
      'área do ambiente': 'Qual o tamanho aproximado do ambiente em metros quadrados (m²)?',
      'cidade': 'Em qual cidade você está localizado?',
      'voltagem': 'Qual a voltagem da instalação? (110V ou 220V)',
      'tipo de produto': 'Você prefere ar-condicionado split ou de janela?',
    };

    return questions[field] || 'Pode me informar mais detalhes sobre sua necessidade?';
  }
}
