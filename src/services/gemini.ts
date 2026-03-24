import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

export async function analyzeSkinImage(
  base64Image: string, 
  language: string = 'English',
  symptoms?: { question: string, answer: string }[]
) {
  if (!API_KEY) {
    throw new Error("Gemini API key is missing. Please add it to your secrets.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const symptomContext = symptoms ? `
    The user also reported the following symptoms:
    ${symptoms.map(s => `- ${s.question}: ${s.answer}`).join('\n')}
  ` : '';

  const prompt = `
    You are a professional dermatological AI assistant. 
    Analyze the provided image of a skin condition. 
    ${symptomContext}
    
    IMPORTANT: Provide your entire response in ${language}.
    
    CRITICAL: The VERY FIRST line of your response MUST be the Primary Condition in this exact format:
    **Primary Condition**: [Name of the condition only, e.g., Eczema]

    If the image is of a skin condition, continue with:
    2. **Potential Identification**: Detailed description of what the condition might be.
    3. **Characteristics**: Describe what you see (color, texture, borders).
    4. **Urgency Level**: (Low, Medium, High).
    5. **Recommended Actions**: Immediate steps the user can take.
    6. **Medical Disclaimer**: A strong statement that this is not a definitive diagnosis and they MUST see a doctor.

    If the image is of a product ingredient list, the first line should still be:
    **Primary Condition**: [Ingredient Analysis]
    
    Then continue with:
    2. **Analysis**: List any potential irritants found (like alcohols, fragrances, sulfates).
    3. **Suitability**: Tell the user if this is safe for sensitive or dry skin.
    4. **Verdict**: (Safe, Use with Caution, Avoid).
    
    Be concise, professional, and empathetic. Use Markdown for formatting.

    CRITICAL: At the very end of your response, provide a JSON block with quantifiable metrics if applicable (0-100 scale for intensity, estimated size in mm if possible). If not applicable, use null.
    Format:
    [METRICS]
    {
      "redness": number | null,
      "intensity": number | null,
      "estimatedSizeMm": number | null
    }
    [/METRICS]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1],
              },
            },
          ],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function getDetailedMedicalInfo(condition: string, language: string = 'English') {
  if (!API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Provide a detailed medical overview of the skin condition: "${condition}".
    
    IMPORTANT: Provide your entire response in ${language}.
    
    Include:
    - **Overview**: What is it?
    - **Common Symptoms**: What does it feel/look like?
    - **Causes**: What triggers or causes it?
    - **Standard Treatments**: Common medical approaches.
    - **Prevention**: How to avoid flare-ups or occurrence.
    - **When to see a specialist**: Specific red flags.
    
    Use professional medical terminology but keep it accessible. 
    Format with clear Markdown headers.
    Include a disclaimer that this is for educational purposes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ text: prompt }],
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Detailed Info Error:", error);
    throw error;
  }
}

export async function getProductRecommendations(
  skinType: string,
  scanResult: string,
  concerns: string,
  language: string = 'English'
) {
  if (!API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Based on the following user profile:
    - Skin Type: ${skinType}
    - Recent Scan Result: ${scanResult}
    - Stated Concerns: ${concerns}
    
    Recommend 3-5 real, high-quality skincare products or over-the-counter medicines (like specific creams, ointments, or cleansers). 
    For each recommendation, provide:
    1. **Product Name**: Real brand and product name (e.g., "La Roche-Posay Effaclar Duo", "CeraVe Moisturizing Cream").
    2. **Category**: (e.g., Cleanser, Moisturizer, Targeted Treatment, OTC Medicine).
    3. **Why it's suitable**: Explain specifically how it addresses the user's skin type, scan results, and stated concerns.
    4. **Key Ingredients**: Mention 1-2 active ingredients (e.g., Salicylic Acid, Niacinamide, Benzoyl Peroxide).
    5. **How to use**: Brief application instructions (e.g., "Apply a thin layer to affected areas at night").
    
    IMPORTANT: Provide your entire response in ${language}.
    Format the response as a JSON array of objects.
    
    Example JSON structure:
    [
      {
        "name": "Product Name",
        "category": "Category",
        "suitability": "Explanation",
        "ingredients": ["Ingredient 1", "Ingredient 2"],
        "usage": "Instructions"
      }
    ]
    
    Return ONLY the JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Product Recommendations Error:", error);
    throw error;
  }
}

export async function generateSkincareRoutine(
  skinType: string,
  latestScan: string,
  concerns: string,
  language: string = 'English'
) {
  if (!API_KEY) throw new Error("Gemini API key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Create a personalized morning and evening skincare routine for the following user:
    - Skin Type: ${skinType}
    - Primary Concern: ${concerns}
    - Latest Scan Condition: ${latestScan}

    Provide a structured routine with:
    1. **Morning Routine**: Step-by-step (Cleanser, Toner, Serum, Moisturizer, SPF).
    2. **Evening Routine**: Step-by-step (Double Cleanse, Treatment, Moisturizer).
    3. **Weekly Extras**: (Exfoliation, Masks).
    4. **AI Tip**: A specific tip based on their latest scan.

    IMPORTANT: Provide your entire response in ${language}.
    Format as a JSON object:
    {
      "morning": [string],
      "evening": [string],
      "weekly": [string],
      "aiTip": string
    }
    Return ONLY the JSON object.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ text: prompt }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
}

export async function analyzeIngredients(
  imageOrText: string,
  skinType: string,
  concerns: string,
  language: string = 'English'
) {
  if (!API_KEY) throw new Error("Gemini API key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const isImage = imageOrText.startsWith('data:image');

  const prompt = `
    Analyze the following skincare product ingredients for a user with:
    - Skin Type: ${skinType}
    - Sensitivity/Concerns: ${concerns}

    Identify potential irritants, allergens, or beneficial ingredients.
    Provide:
    1. **Safety Score**: (0-10).
    2. **Key Irritants**: List any found.
    3. **Key Benefits**: List any found.
    4. **Suitability**: Is it good for this specific user?
    5. **Verdict**: (Safe, Caution, Avoid).

    IMPORTANT: Provide your entire response in ${language}.
    Format as a JSON object:
    {
      "safetyScore": number,
      "irritants": [string],
      "benefits": [string],
      "suitability": string,
      "verdict": string
    }
    Return ONLY the JSON object.
  `;

  const contents: any = isImage ? [
    {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: imageOrText.split(",")[1] } }
      ]
    }
  ] : [{ text: `${prompt}\n\nIngredients List:\n${imageOrText}` }];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
}

export async function compareScans(
  scan1: { image: string, analysis: string, metrics?: any },
  scan2: { image: string, analysis: string, metrics?: any },
  language: string = 'English'
) {
  if (!API_KEY) throw new Error("Gemini API key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Compare these two skin scans taken at different times to track progress.
    
    Scan 1 (Earlier): ${scan1.analysis}
    Scan 1 Metrics: ${JSON.stringify(scan1.metrics)}
    
    Scan 2 (Later): ${scan2.analysis}
    Scan 2 Metrics: ${JSON.stringify(scan2.metrics)}

    Analyze the changes in:
    - Redness/Inflammation
    - Size of the affected area
    - Texture and overall appearance
    
    Provide:
    1. **Healing Score**: A percentage (0-100%) representing the improvement. 100% means fully healed, 0% means no change or worsened.
    2. **Progress Summary**: A 2-3 sentence summary of the changes.
    3. **Key Improvements**: List 2-3 specific positive changes.
    4. **Concerns**: List any areas that have not improved or have worsened.
    5. **Next Steps**: Advice for the user based on this progress.

    IMPORTANT: Provide your entire response in ${language}.
    Format as a JSON object:
    {
      "healingScore": number,
      "summary": string,
      "improvements": [string],
      "concerns": [string],
      "nextSteps": string
    }
    Return ONLY the JSON object.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: scan1.image.split(",")[1] } },
          { inlineData: { mimeType: "image/jpeg", data: scan2.image.split(",")[1] } }
        ]
      }
    ],
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text);
}

export async function findClinicalTrials(
  condition: string,
  location: string = "Global",
  language: string = 'English'
) {
  if (!API_KEY) throw new Error("Gemini API key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Find 3-4 real or highly realistic ongoing clinical trials for the skin condition: "${condition}" near "${location}".
    
    For each trial, provide:
    1. **Trial Name**: Official title or descriptive name.
    2. **Phase**: (e.g., Phase I, Phase II, Phase III).
    3. **Eligibility**: Brief criteria (e.g., "Adults 18-65 with moderate to severe plaque psoriasis").
    4. **Location**: City/Region.
    5. **Description**: What the study is testing.
    6. **Contact**: A placeholder or real contact info if known.

    IMPORTANT: Provide your entire response in ${language}.
    Format as a JSON array of objects:
    [
      {
        "name": "Trial Name",
        "phase": "Phase X",
        "eligibility": "Criteria",
        "location": "City",
        "description": "Summary",
        "contact": "Contact Info"
      }
    ]
    Return ONLY the JSON array.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ text: prompt }],
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text);
}

export async function getLifestyleDietAdvice(
  condition: string,
  language: string = 'English'
) {
  if (!API_KEY) throw new Error("Gemini API key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Provide personalized lifestyle and diet advice for someone dealing with "${condition}".
    
    Include:
    1. **Dietary Recommendations**: Foods to eat and foods to avoid.
    2. **Lifestyle Adjustments**: Habits to change (e.g., sleep, stress management, shower temperature).
    3. **Environmental Tips**: (e.g., laundry detergents, fabrics, sun protection).
    4. **Holistic Approach**: A 1-sentence summary of the mind-body connection for this condition.

    IMPORTANT: Provide your entire response in ${language}.
    Format as a JSON object:
    {
      "diet": { "eat": [string], "avoid": [string] },
      "lifestyle": [string],
      "environmental": [string],
      "summary": string
    }
    Return ONLY the JSON object.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ text: prompt }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
}

export async function getSkinHealthScore(
  history: any[],
  language: string = 'English'
) {
  if (!API_KEY) throw new Error("Gemini API key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Analyze the user's skin health history and provide an overall health score (0-100).
    
    History: ${JSON.stringify(history.map(h => ({ date: h.date, condition: h.condition, confidence: h.confidence, metrics: h.metrics })))}

    Consider:
    - Frequency of issues.
    - Severity (intensity/redness).
    - Improvement trends over time.

    Provide:
    1. **Score**: (0-100).
    2. **Status**: (Excellent, Good, Fair, Poor).
    3. **Key Factor**: The main reason for this score.
    4. **Improvement Tip**: One specific thing they can do to raise their score.

    IMPORTANT: Provide your entire response in ${language}.
    Format as a JSON object:
    {
      "score": number,
      "status": string,
      "keyFactor": string,
      "improvementTip": string
    }
    Return ONLY the JSON object.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ text: prompt }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
}

export async function correlateEnvironmentalData(
  history: any[],
  envData: any[],
  language: string = 'English'
) {
  if (!API_KEY) throw new Error("Gemini API key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Correlate the user's skin scan history with environmental data (AQI, humidity, pollen).
    
    Scan History: ${JSON.stringify(history.map(h => ({ date: h.date, condition: h.condition, metrics: h.metrics })))}
    Environmental Data: ${JSON.stringify(envData)}

    Identify patterns:
    - Does high AQI correlate with more redness?
    - Does low humidity correlate with more dryness or irritation?
    - Are there specific triggers?

    Provide:
    1. **Insights**: List 2-3 specific correlations found.
    2. **Advice**: Actionable advice to mitigate environmental triggers.
    3. **Confidence**: (Low, Medium, High).

    IMPORTANT: Provide your entire response in ${language}.
    Format as a JSON object:
    {
      "insights": [string],
      "advice": string,
      "confidence": string
    }
    Return ONLY the JSON object.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ text: prompt }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
}
