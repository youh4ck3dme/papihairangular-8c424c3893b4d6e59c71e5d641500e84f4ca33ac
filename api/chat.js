/**
 * Vercel Serverless Function: Chat JSON Endpoint
 * Replaces: /proxy/chat.php
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [], max_tokens = 200 } = req.body || {};
  const trimmedMessage = (message || '').trim();

  if (!trimmedMessage) {
    return res.status(200).json({ reply: 'Napíš mi otázku 🙂' });
  }

  // Rate limiting (simple in-memory, for production use Redis)
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const rateLimitKey = `chat_${ip}`;
  const rateLimit = global.rateLimitCache || {};
  const now = Date.now();
  
  if (!rateLimit[rateLimitKey] || (now - rateLimit[rateLimitKey].resetAt) > 60000) {
    rateLimit[rateLimitKey] = { count: 0, resetAt: now + 60000 };
  }
  
  rateLimit[rateLimitKey].count++;
  global.rateLimitCache = rateLimit;

  if (rateLimit[rateLimitKey].count > 10) {
    return res.status(429).json({ 
      error: 'rate_limited', 
      message: 'Príliš veľa požiadaviek. Skúste to znova o chvíľu.' 
    });
  }

  // Server-side cache (simple in-memory, for production use Redis)
  const cacheKey = `chat_${Buffer.from(trimmedMessage.toLowerCase()).toString('base64')}`;
  const cache = global.chatCache || {};
  
  if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < 3600000) {
    return res.status(200).json({ reply: cache[cacheKey].reply });
  }

  // System prompt (on server, not sent from client)
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

  // OpenAI API call
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
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
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({ error: 'API error', details: error });
    }

    const data = await response.json();
    const reply = (data.choices?.[0]?.message?.content || '').trim();

    if (!reply) {
      return res.status(200).json({ 
        reply: 'Prepáčte, nepodarilo sa mi vygenerovať odpoveď. Skúste to prosím znova.' 
      });
    }

    // Cache response
    cache[cacheKey] = { reply, timestamp: now };
    global.chatCache = cache;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

