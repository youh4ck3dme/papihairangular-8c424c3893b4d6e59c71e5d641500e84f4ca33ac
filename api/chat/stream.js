/**
 * Vercel Serverless Function: Chat Stream Endpoint
 * Replaces: /proxy/chat_stream.php
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [], max_tokens = 200 } = req.body || {};
  const trimmedMessage = (message || '').trim();

  if (!trimmedMessage) {
    return res.status(200).send('Napíš mi otázku 🙂');
  }

  // System prompt (same as chat.js)
  const systemPrompt = `Si AI asistent PAPI HAIR DESIGN kaderníctva v Košiciach. Odpovedaj VÝLUČNE po slovensky, priateľsky a profesionálne.

ZÁKLADNÉ INFO:
- Adresa: Trieda SNP 61, Košice | Tel: +421 949 459 624 | Email: papihairdesign@gmail.com
- Otváracie: Po-Pi 8:00-17:00, So podľa objednávok, Ne zatvorené
- Rezervácie: https://services.bookio.com/papi-hair-design/widget?lang=sk

SLUŽBY A CENY:
- Pánsky strih: od 19€ | Dámsky strih: od 30€ | Farbenie: od 70€ | Balayage: od 150€
- Špecializácia: BARBERING, balayage, ombré, keratínové kúry, regenerácia vlasov
- Produkty: GOLD Haircare Professional | E-shop: http://www.goldhaircare.sk/affiliate/2208

O SALÓNE:
- Založený 2017, Róbert Papcun (kaderník od 2009), Ambasádor GOLD Haircare SK
- AI Hair Changer: Bezplatné vyskúšanie účesu na /virtual-salon

INŠTRUKCIE:
1. Odpovedaj stručne a užitočne (1-3 vety)
2. Pre ceny uveď orientačné a odporuč konzultáciu
3. Pre rezervácie vždy poskytni link alebo telefón
4. Spomeň AI Hair Changer pri relevantných otázkach`;

  // Build messages
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({
      role: msg.role || 'user',
      content: msg.content || ''
    })),
    { role: 'user', content: trimmedMessage }
  ];

  // OpenAI API call with streaming
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return res.status(500).send('Chyba: OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: max_tokens,
        temperature: 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return res.status(response.status).send('\n[stream_error]');
    }

    // Stream response
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const json = line.slice(6);
          if (json === '[DONE]') {
            return res.end();
          }
          try {
            const data = JSON.parse(json);
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              res.write(content);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    return res.end();
  } catch (error) {
    console.error('Stream handler error:', error);
    return res.status(500).send('\n[stream_error]');
  }
}

