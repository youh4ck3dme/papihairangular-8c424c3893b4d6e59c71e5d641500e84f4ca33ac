
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AiVisageService {
    private http = inject(HttpClient);
    private proxyUrl = '/proxy/ai-proxy.php';

    async generateLook(
        stylePrompt: string,
        userBase64?: string
    ): Promise<{ imageUrl: string, analysisTime: number }> {
        const startTime = Date.now();

        try {
            let identityMatrix = "a person with balanced facial features";

            if (userBase64) {
                const base64Data = userBase64.split(',')[1];

                const analysisResponse = await firstValueFrom(
                    this.http.post<any>(this.proxyUrl, {
                        action: 'analyze',
                        model: 'gemini-2.0-flash',
                        imageData: base64Data,
                        prompt: `IDENTITY ANCHOR: Act as a master anatomical consultant. 
                Deconstruct this person's facial DNA focusing on: exact eye shape/color, philtrum length, nose bridge structure, and jawline sharpness. 
                Ignore hair. Output a 60-word technical anatomical blueprint.`
                    })
                );

                identityMatrix = analysisResponse?.candidates?.[0]?.content?.parts?.[0]?.text || identityMatrix;
            }

            const response = await firstValueFrom(
                this.http.post<any>(this.proxyUrl, {
                    action: 'generate_image',
                    prompt: `A masterpiece high-end fashion portrait. 
          SUBJECT: 1:1 identical facial reconstruction of: [${identityMatrix}]. 
          TRANSFORMATION: This person MUST feature this exact hairstyle: ${stylePrompt}. 
          VISUALS: Soft studio lighting, sharp focus on eyes, 8k texture, luxury salon aesthetic. 
          The identity of the face must remain unchanged from the analysis.`
                })
            );

            const generatedImage = response?.predictions?.[0]?.bytesBase64Encoded;
            if (!generatedImage) {
                throw new Error('Nepodarilo sa vygenerovať obraz.');
            }

            return {
                imageUrl: `data:image/jpeg;base64,${generatedImage}`,
                analysisTime: (Date.now() - startTime) / 1000
            };
        } catch (error) {
            console.error('PAPI Service Critical Error:', error);
            throw error;
        }
    }
}
