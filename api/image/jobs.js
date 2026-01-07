/**
 * Vercel Serverless Function: Image Job Queue
 * Replaces: /proxy/image-job.php
 * 
 * GET /api/image/jobs?jobId=xxx → returns {status, url?, error?}
 * POST /api/image/jobs → creates job, returns {jobId}
 */

// Simple in-memory job store (for production use Redis/Vercel KV)
const jobs = new Map();

// Clean old jobs (> 1 hour)
setInterval(() => {
  const now = Date.now();
  for (const [jobId, job] of jobs.entries()) {
    if (job.createdAt && (now - job.createdAt) > 3600000) {
      jobs.delete(jobId);
    }
  }
}, 60000); // Clean every minute

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Check job status
  if (req.method === 'GET') {
    const { jobId } = req.query;
    
    if (!jobId) {
      return res.status(400).json({ error: 'jobId required' });
    }

    const job = jobs.get(jobId);
    if (!job) {
      return res.status(404).json({ status: 'error', error: 'Job not found' });
    }

    return res.status(200).json(job);
  }

  // POST: Create new job
  if (req.method === 'POST') {
    const { image, prompt, model = 'gpt-image-1', size = '1024x1024' } = req.body || {};
    
    if (!image || !prompt?.trim()) {
      return res.status(400).json({ error: 'Missing image or prompt' });
    }

    // Generate job ID
    const jobId = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);

    // Create job entry
    jobs.set(jobId, {
      status: 'queued',
      createdAt: Date.now(),
      prompt: prompt.trim(),
      model,
      size
    });

    // Process job asynchronously (non-blocking)
    processImageJob(jobId, image, prompt.trim(), model, size).catch(err => {
      console.error(`[ImageJob ${jobId}] Error:`, err);
      const job = jobs.get(jobId);
      if (job) {
        job.status = 'error';
        job.error = err.message || 'Image generation failed';
      }
    });

    // Return job ID immediately
    return res.status(200).json({ jobId });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function processImageJob(jobId, imageBase64, prompt, model, size) {
  const job = jobs.get(jobId);
  if (!job) return;

  // Update status to running
  job.status = 'running';
  jobs.set(jobId, job);

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Decode base64 image
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;
    
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Create FormData for multipart/form-data
    // Node.js 18+ has native FormData support
    const formData = new FormData();
    
    // Create File-like object from Buffer
    const imageFile = new File([imageBuffer], 'image.png', { type: 'image/png' });
    formData.append('image', imageFile);
    formData.append('prompt', prompt);
    formData.append('model', model);
    formData.append('n', '1');
    formData.append('size', size);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
        // Don't set Content-Type - FormData sets it with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const url = data.data?.[0]?.url;

    if (!url) {
      throw new Error('No URL in response');
    }

    // Update job status
    job.status = 'done';
    job.url = url;
    jobs.set(jobId, job);
  } catch (error) {
    console.error(`[ImageJob ${jobId}] Error:`, error);
    job.status = 'error';
    job.error = error.message || 'Image generation failed';
    jobs.set(jobId, job);
  }
}

