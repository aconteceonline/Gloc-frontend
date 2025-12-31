import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({ providedIn: 'root' })
export class IaService {

  private genAI = new GoogleGenerativeAI('AIzaSyBr2A2w9322zbAOnohF4RVdKtElhU8ddjA');

  private model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  constructor(private http: HttpClient) {}

  async gerarPropaganda(textoOriginal: string): Promise<string> {
    const prompt = `Reescreva esta mensagem de WhatsApp para ser uma propaganda persuasiva.
                    Mantenha as tags [NOME] e [RENDA]: ${textoOriginal}`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
