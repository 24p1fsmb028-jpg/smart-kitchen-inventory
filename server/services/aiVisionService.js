/**
 * Server-Side AI Vision Service for Shopping List Image / Screenshot Scanning (Mode B)
 *
 * Securely processes image buffers using Google Gemini Vision or OpenAI Vision APIs.
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
      'AI Vision key is not configured on the server. Please add AI_API_KEY or GEMINI_API_KEY to your server environment variables, or upload the original interactive PDF.'
    );
  }

  const base64Data = imageBuffer.toString('base64');

  // Build candidate items context to prevent hallucination
  let contextItemsText = '';
  if (candidateLists.length > 0) {
    contextItemsText = candidateLists.map(l => {
      const itemStrs = (l.items || []).map(i => `  - "${i.item_name}" (Target Qty: ${i.quantity} ${i.unit})`).join('\n');
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

  // Determine provider: Gemini vs OpenAI
  const isGemini = apiKey.startsWith('AIza') || process.env.GEMINI_API_KEY || !process.env.OPENAI_API_KEY;

  if (isGemini) {
    return await callGeminiVision({ apiKey, base64Data, mimeType, systemPrompt, userPrompt });
  } else {
    return await callOpenAIVision({ apiKey, base64Data, mimeType, systemPrompt, userPrompt });
  }
}

/**
 * Call Google Gemini Vision REST API (zero extra dependencies)
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
