/**
 * Groq AI Client for Smart Tourism Recommendation System
 * Uses Groq LPU Ultra-Low Latency Inference
 * Works out-of-the-box with native Node.js fetch (zero external npm dependencies).
 */

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'qwen/qwen3.8-27b';
const FALLBACK_MODELS = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'];

/**
 * Clean potential markdown wrappers around JSON
 */
function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Generate AI insights, personalized reasons, and a mini-itinerary for recommended places
 * @param {Object} params
 * @param {Object} params.answers - { interest, budget, groupType, duration, vibe }
 * @param {Array} params.places - Array of destination place objects from MongoDB
 * @returns {Promise<Object|null>} AI insights or null if API key is not configured/fails
 */
async function generateAiRecommendationInsights({ answers, places }) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim().length === 0 || apiKey.startsWith('paste_') || apiKey === 'your_groq_api_key_here') {
    return null;
  }

  if (!places || places.length === 0) {
    return null;
  }

  const placesContext = places.slice(0, 6).map((p, idx) => ({
    id: p._id.toString(),
    index: idx + 1,
    name: p.name,
    city: p.city,
    country: p.country,
    category: p.category,
    budgetLevel: p.budgetLevel,
    rating: p.rating,
  }));

  const systemPrompt = `You are an expert AI Travel Concierge for an intelligent smart tourism application.
Analyze the user's preferences and the curated destinations provided.
Return your response STRICTLY as a valid JSON object without markdown formatting, code fences, or surrounding text.
The JSON must follow this exact schema:
{
  "headline": "A catchy, personalized headline for their trip",
  "summary": "2 sentences explaining why this curated selection matches their budget, group dynamic, and interest",
  "suggestedItinerary": [
    { "day": "Day 1", "title": "Theme for Day 1", "activities": ["Activity 1", "Activity 2"] },
    { "day": "Day 2", "title": "Theme for Day 2", "activities": ["Activity 1", "Activity 2"] }
  ],
  "placeReasons": {
    "<place_id>": "1 concise sentence explaining specifically why this destination fits their trip"
  }
}`;

  const userPrompt = `Traveler Profile:
- Primary Interest: ${answers.interest || 'exploration'}
- Budget: ${answers.budget || 'moderate'}
- Travel Group: ${answers.groupType || 'solo'}
${answers.vibe ? `- Specific Vibe / Note: "${answers.vibe}"` : ''}

Curated Places:
${JSON.stringify(placesContext, null, 2)}

Provide the JSON response tailored to these specific places and traveler profile. Include a placeReason for each place_id.`;

  const modelsToTry = [DEFAULT_MODEL, ...FALLBACK_MODELS];

  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(GROQ_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.6,
          max_tokens: 2500,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Groq AI] Model ${model} returned HTTP ${response.status}: ${errorText.slice(0, 150)}`);
        continue;
      }

      const json = await response.json();
      const rawContent = json.choices?.[0]?.message?.content;
      if (!rawContent) continue;

      const cleaned = cleanJsonString(rawContent);
      const parsed = JSON.parse(cleaned);
      return {
        model,
        headline: parsed.headline || 'Curated Recommendations For You',
        summary: parsed.summary || '',
        suggestedItinerary: parsed.suggestedItinerary || [],
        placeReasons: parsed.placeReasons || {},
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[Groq AI] Error with model ${model}: ${err.message}`);
    }
  }

  return null;
}

module.exports = {
  generateAiRecommendationInsights,
};
