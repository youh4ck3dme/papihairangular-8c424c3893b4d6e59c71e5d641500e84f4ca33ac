
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface GeminiAnalysisResponse {
    candidates?: {
        content?: {
            parts?: {
                text?: string;
            }[];
        };
    }[];
}

interface OpenAIImageResponse {
    predictions?: {
        bytesBase64Encoded?: string;
    }[];
}

@Injectable({
    providedIn: 'root'
})
@Injectable({
    providedIn: 'root'
})
export class AiVisageService {
    private http = inject(HttpClient);
    private proxyUrl = '/proxy/ai-proxy.php';

    async generateLook(
        stylePrompt: string,
        userBase64?: string
    ): Promise<{ imageUrl: string, analysisTime: number, analysis?: FaceAnalysis }> {
        const startTime = Date.now();

        try {
            let analysis: FaceAnalysis | undefined;
            let identityMatrix = "a person with balanced facial features";

            if (userBase64) {
                const base64Data = userBase64.split(',')[1];

                // STEP 1: DEEP FEATURE ANALYSIS (Gemini Vision)
                const analysisResponse = await firstValueFrom(
                    this.http.post<GeminiAnalysisResponse>(this.proxyUrl, {
                        action: 'analyze',
                        model: 'gemini-2.0-flash',
                        imageData: base64Data,
                        prompt: `IDENTITY_ANCHOR_V4: Act as a world-class dermatological anatomist and high-fashion portrait photographer. 
                        Analyze this person's facial architecture with microscopic precision.
                        Focus on unique imperfections that define reality: skin texture, asymmetry, pores, vellus hair, and distinctive bone structure.
                        Output ONLY valid JSON following this strict schema:
                        {
                            "faceShape": "Precise morphological classification",
                            "skinTone": "Dermatological description (e.g., 'Fitzpatrick Type III, Olive with cool undertones')",
                            "hexColor": "Representative skin color [hex_color]",
                            "undertone": "Cool/Warm/Neutral/Olive",
                            "eyeColor": "detailed iris description including limbal ring",
                            "features": ["specific biometric landmarks", "e.g., deeply set medial canthus", "slight asymmetry in philtrum", "texture: visible pores on cheeks", "faint nasolabial folds"],
                            "hairTexture": "Straight/Wavy/Curly/Coily/Thin/Thick",
                            "season": "Color analysis season"
                        }`
                    })
                );

                const rawText = analysisResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText) {
                    try {
                        // Extract JSON from potential markdown code blocks
                        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            analysis = JSON.parse(jsonMatch[0]);

                            // Construct the "Identity Matrix" string for the image generator
                            identityMatrix = `
                                A person with an ${analysis?.faceShape} face. 
                                Skin: ${analysis?.skinTone} (${analysis?.hexColor}). 
                                Texture: Natural skin porosity, faint imperfections.
                                Eyes: ${analysis?.eyeColor}. 
                                Biometric Anchors: ${analysis?.features.join(', ')}. 
                            `.trim().replace(/\s+/g, ' ');
                        } else {
                            identityMatrix = rawText.substring(0, 500); // Fallback to raw text if no JSON
                        }
                    } catch (e) {
                        console.warn('Failed to parse facial analysis JSON:', e);
                        identityMatrix = rawText.substring(0, 200);
                    }
                }
            }

            // STEP 2: DYNAMIC PROMPT ENGINEERING (Imagine/OpenAI)
            const prompt = `HIGHEST-END FASHION EDITORIAL PORTRAIT. 8k Resolution.
            SUBJECT: A hyper-realistic photograph of a specific person.
            IDENTITY DATA: [${identityMatrix}].
            
            TRANSFORMATION: The subject is wearing a new hairstyle: ${stylePrompt}.
            
            CRITICAL REALISM INSTRUCTIONS:
            - SKIN TEXTURE: Must be imperfect. Visible pores, fine lines, vellus hair (peach fuzz), natural subsurface scattering.
            - LIGHTING: Cinematic "Rembrandt" or "Butterfly" lighting. Soft shadows, catchlights in eyes.
            - CAMERA: Phase One XF IQ4, 150MP. 85mm Prime Lens at f/1.8. Shallow depth of field.
            - FAIL CASES (AVOID): Plastic skin, airbrushed look, symmetrical CGI face, oversaturated colors, dead eyes, cartoonish hair.
            
            ATMOSPHERE: Luxury Milan Fashion Week backstage or High-end Salon Studio.`;

            const response = await firstValueFrom(
                this.http.post<OpenAIImageResponse>(this.proxyUrl, {
                    action: 'generate_image',
                    prompt: prompt,
                    image: userBase64 ? userBase64.split(',')[1] : undefined // Send base64 image if available
                })
            );

            const generatedImage = response?.predictions?.[0]?.bytesBase64Encoded;
            if (!generatedImage) {
                throw new Error('Nepodarilo sa vygenerovať obraz.');
            }

            let finalImageUrl = generatedImage;
            if (!generatedImage.startsWith('data:image')) {
                finalImageUrl = `data:image/jpeg;base64,${generatedImage}`;
            }

            return {
                imageUrl: finalImageUrl,
                analysisTime: (Date.now() - startTime) / 1000,
                analysis: analysis
            };
        } catch (error) {
            console.error('PAPI Service Critical Error:', error);
            throw error;
        }
    }
}

export interface FaceAnalysis {
    faceShape: string;
    skinTone: string;
    hexColor: string; // New field for color anchoring
    undertone: string;
    eyeColor: string;
    features: string[];
    hairTexture: string;
    season: string;
}
