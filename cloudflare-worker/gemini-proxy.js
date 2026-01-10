/**
 * Cloudflare Worker for Papi Hair Design AI Studio
 * Securely proxies requests to Google Gemini 2.0 Flash API
 */

export default {
  async fetch(request, env, ctx) {
    // 1. CORS & Preflight Handling
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // In production, replace * with 'https://papihairdesign.sk'
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      // 2. Secret Validation
      const API_KEY = env.GEMINI_KEY;
      if (!API_KEY) {
        throw new Error('Server misconfiguration: Missing GEMINI_KEY secret');
      }

      // 3. Request Parsing
      const body = await request.json();
      const { prompt, image, model = 'gemini-2.0-flash-exp' } = body;

      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Missing prompt' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 4. Construct Gemini API Request
      // We accept 'image' as base64 string (plain or data URI)
      let contentsParts = [];
      
      if (image) {
        let cleanBase64 = image;
        // Strip data URI scheme if present
        if (cleanBase64.startsWith('data:')) {
            cleanBase64 = cleanBase64.split(',')[1];
        }
        
        contentsParts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64
          }
        });
      }
      
      contentsParts.push({ text: prompt });

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
      
      const geminiPayload = {
        contents: [{ parts: contentsParts }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        }
      };

      // 5. Call Gemini API
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      });

      const geminiData = await geminiResponse.json();

      if (!geminiResponse.ok) {
        const errorMsg = geminiData.error?.message || geminiResponse.statusText;
        throw new Error(`Gemini API Error: ${errorMsg}`);
      }

      // 6. Return Response
      return new Response(JSON.stringify(geminiData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error', 
        details: err.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
