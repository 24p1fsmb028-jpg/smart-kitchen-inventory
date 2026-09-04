/**
 * Server-Side AI Vision Service for Shopping List Image / Screenshot Scanning (Mode B)
 *
 * Supports three AI providers — auto-detected from your AI_API_KEY prefix:
 *   - Clarifai  → key starts with "AQ."    (your current key)
 *   - Gemini    → key starts with "AIza"   (Google AI Studio — free)
 *   - OpenAI    → key starts with "sk-"    (OpenAI platform)
 *
 * Never exposes API keys to client-side code.
 */

export async function scanShoppingListImageWithAI({
  imageBuffer,
  mimeType = 'image/jpeg',
  candidateLists = []
}) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'AI Vision key is not configured on the server. ' +
      'Please add AI_API_KEY to your server/.env file, then restart the server.'
    );
  }

  const base64Data = imageBuffer.toString('base64');

  // Build candidate items context to prevent hallucination
  let contextItemsText = '';
  if (candidateLists.length > 0) {
    contextItemsText = candidateLists.map(l => {
      const itemStrs = (l.items || []).map(i =>
        `  - "${i.item_name}" (Target Qty: ${i.quantity} ${i.unit})`
      ).join('\n');
      return `Shopping List ID: "${l.id}":\n${itemStrs}`;
    }).join('\n\n');
  }

  const systemPrompt = `You are a high-accuracy document scanner and OCR system analyzing a kitchen shopping list image or photo.
Your job is to identify which items have their checkbox marked, ticked (✓), crossed (X), or filled.

STRICT RULES:
1. ONLY identify products visible in the image.
2. If provided with a candidate shopping list, match items against that list. Do not invent products.
3. Determine whether each product's checkbox appears checked (ticked, crossed, or filled).
4. If a checkbox is blank, unchecked, or unclear, set purchased: false and give confidence < 0.6.
5. Never assume that an unchecked or unclear item was purchased.
6. Extract the shopping list ID if visible anywhere in the document (e.g. "SHOPPING LIST ID: sl-...").
7. RETURN STRICT JSON ONLY. No markdown wrappers, no backticks, no explanations.

JSON SCHEMA:
{
  "shopping_list_id": string or null,
  "items": [
    {
      "item_name": string,
      "purchased": boolean,
      "quantity": number,
      "unit": string,
      "confidence": number
    }
  ]
}`;

  const userPrompt = `Analyze this shopping list image and return the checked items in strict JSON format.
${contextItemsText ? `\nKNOWN RECENT SHOPPING LISTS FOR REFERENCE:\n${contextItemsText}\n` : ''}`;

  // Auto-detect provider from API key prefix
  if (apiKey.startsWith('AQ.')) {
    // Clarifai Personal Access Token
    return await callClarifaiVision({ apiKey, base64Data, mimeType, systemPrompt, userPrompt });
  } else if (apiKey.startsWith('AIza') || process.env.GEMINI_API_KEY) {
    // Google Gemini
    return await callGeminiVision({ apiKey, base64Data, mimeType, systemPrompt, userPrompt });
  } else if (apiKey.startsWith('sk-') || process.env.OPENAI_API_KEY) {
    // OpenAI
    return await callOpenAIVision({ apiKey, base64Data, mimeType, systemPrompt, userPrompt });
  } else {
    throw new Error(
      'Unrecognized AI API key format. Supported: Clarifai (AQ.), Gemini (AIza), OpenAI (sk-).'
    );
  }
}

/**
 * Call Clarifai Vision API (supports AQ. Personal Access Tokens)
 * Uses GPT-4o multimodal model hosted on Clarifai platform.
 */
async function callClarifaiVision({ apiKey, base64Data, mimeType, systemPrompt, userPrompt }) {
  // Clarifai hosts GPT-4o — supports image + text in one request
  const url = 'https://api.clarifai.com/v2/users/openai/apps/chat-completion/models/gpt-4o/outputs';

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const requestBody = {
    inputs: [
      {
        data: {
          text: {
            raw: fullPrompt
          },
          image: {
            base64: base64Data
          }
        }
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Clarifai API error:', res.status, errorText);
    throw new Error(
      `AI Vision service error (${res.status}): Couldn't scan the image. ` +
      'Please check your Clarifai API key or try uploading the original PDF.'
    );
  }

  const data = await res.json();

  // Clarifai returns output inside outputs[0].data.text.raw
  const textOutput = data?.outputs?.[0]?.data?.text?.raw;

  if (!textOutput) {
    console.error('Clarifai unexpected response shape:', JSON.stringify(data));
    throw new Error("Couldn't scan the image. Please try a clearer photo.");
  }

  try {
    const cleanJson = textOutput
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(cleanJson);
  } catch (parseErr) {
    console.error('Failed to parse Clarifai output as JSON:', textOutput, parseErr);
    throw new Error('AI Vision returned an unexpected format. Please try a clearer photo or upload the PDF.');
  }
}

/**
 * Call Google Gemini Vision REST API (zero extra dependencies)
 * Key format: AIzaSy...
 */
async function callGeminiVision({ apiKey, base64Data, mimeType, systemPrompt, userPrompt }) {
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\n${userPrompt}` },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: 'application/json'
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Gemini API error:', res.status, errorText);
    throw new Error(`AI Vision service error (${res.status}): We couldn't scan the image. Please try a clearer photo.`);
  }

  const data = await res.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error("We couldn't scan the image. Please try a clearer photo.");
  }

  try {
    const cleanJson = textOutput.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleanJson);
  } catch (parseErr) {
    console.error('Failed to parse Gemini output as JSON:', textOutput, parseErr);
    throw new Error('AI Vision returned an unexpected format. Please try a clearer photo or upload the PDF.');
  }
}

/**
 * Call OpenAI Vision REST API (fallback if OPENAI_API_KEY is used)
 * Key format: sk-...
 */
async function callOpenAIVision({ apiKey, base64Data, mimeType, systemPrompt, userPrompt }) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const requestBody = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`
            }
          }
        ]
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('OpenAI API error:', res.status, errorText);
    throw new Error(`AI Vision service error (${res.status}): We couldn't scan the image. Please try a clearer photo.`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("We couldn't scan the image. Please try a clearer photo.");
  }

  try {
    return JSON.parse(content);
  } catch (parseErr) {
    console.error('Failed to parse OpenAI output as JSON:', content, parseErr);
    throw new Error('AI Vision returned an unexpected format. Please try a clearer photo or upload the PDF.');
  }
}
