
import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AiVisageService {
    private get apiKey(): string {
        return localStorage.getItem('gemini_key') || environment.geminiApiKey || '';
    }

    private get ai() {
        return new GoogleGenAI({ apiKey: this.apiKey });
    }

    async generateLook(
        stylePrompt: string,
        userBase64?: string
    ): Promise<{ imageUrl: string, analysisTime: number }> {
        const startTime = Date.now();

        try {
            if (!this.apiKey) {
                throw new Error('Chýba API kľúč pre Gemini AI.');
            }

            let identityMatrix = "a person with balanced facial features";

            if (userBase64) {
                const base64Data = userBase64.split(',')[1];
                const analysisResponse = await this.ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: {
                        parts: [
                            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                            {
                                text: `IDENTITY ANCHOR: Act as a master anatomical consultant. 
                Deconstruct this person's facial DNA focusing on: exact eye shape/color, philtrum length, nose bridge structure, and jawline sharpness. 
                Ignore hair. Output a 60-word technical anatomical blueprint.`
                            }
                        ]
                    },
                    config: { thinkingConfig: { thinkingBudget: 150 } }
                });
                identityMatrix = analysisResponse.text || identityMatrix;
            }

            const response = await this.ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `A masterpiece high-end fashion portrait. 
          SUBJECT: 1:1 identical facial reconstruction of: [${identityMatrix}]. 
          TRANSFORMATION: This person MUST feature this exact hairstyle: ${stylePrompt}. 
          VISUALS: Soft studio lighting, sharp focus on eyes, 8k texture, luxury salon aesthetic. 
          The identity of the face must remain unchanged from the analysis.`,
                config: {
                    numberOfImages: 1,
                    aspectRatio: '3:4',
                    outputMimeType: 'image/jpeg'
                }
            });

            const generatedImage = response.generatedImages?.[0];
            if (!generatedImage || !generatedImage.image || !generatedImage.image.imageBytes) {
                throw new Error('Nepodarilo sa vygenerovať obraz.');
            }
            const base64ImageBytes = generatedImage.image.imageBytes;
            return {
                imageUrl: `data:image/jpeg;base64,${base64ImageBytes}`,
                analysisTime: (Date.now() - startTime) / 1000
            };
        } catch (error) {
            console.error('PAPI Service Critical Error:', error);
            throw error;
        }
    }
}
