type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type GeminiErrorResponse = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

type GeminiModelInfo = {
  name?: string;
  supportedGenerationMethods?: string[];
};

type GeminiListModelsResponse = {
  models?: GeminiModelInfo[];
};

export type GameDifficulty = "easy" | "medium" | "hard" | "mixed";

const PREFERRED_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
] as const;

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function extractJsonBlock(rawText: string): string {
  const trimmed = rawText.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return match?.[1]?.trim() ?? trimmed;
}

function extractBalancedJsonSubstring(rawText: string): string | null {
  const text = rawText.trim();
  const objectIndex = text.indexOf("{");
  const arrayIndex = text.indexOf("[");
  const startIndex =
    objectIndex < 0 ? arrayIndex : arrayIndex < 0 ? objectIndex : Math.min(objectIndex, arrayIndex);

  if (startIndex < 0) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  let startChar = "";

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      if (depth === 0) {
        startChar = char;
      }

      depth += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      depth -= 1;

      if (depth === 0 && startChar) {
        return text.slice(startIndex, index + 1).trim();
      }
    }
  }

  return null;
}

const normalizeModelName = (name: string) => name.replace(/^models\//, "");

async function getAvailableGenerateModels(apiKey: string): Promise<string[]> {
  const response = await fetch(`${GEMINI_API_BASE}?key=${encodeURIComponent(apiKey)}`);
  if (!response.ok) {
    return [...PREFERRED_MODELS];
  }

  try {
    const data = (await response.json()) as GeminiListModelsResponse;
    const available = (data.models ?? [])
      .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
      .map((model) => normalizeModelName(String(model.name ?? "").trim()))
      .filter(Boolean);

    if (available.length === 0) {
      return [...PREFERRED_MODELS];
    }

    const preferredFirst = PREFERRED_MODELS.filter((name) => available.includes(name));
    const others = available.filter((name) => !preferredFirst.includes(name as (typeof PREFERRED_MODELS)[number]));
    return [...preferredFirst, ...others];
  } catch {
    return [...PREFERRED_MODELS];
  }
}

export async function generateGeminiJson(prompt: string): Promise<unknown> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY topilmadi. .env faylni tekshiring.");
  }

  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      responseMimeType: "application/json",
    },
  });

  let lastError = "Gemini API xatolik berdi.";
  let data: GeminiGenerateResponse | null = null;
  const modelsToTry = await getAvailableGenerateModels(apiKey);

  for (const model of modelsToTry) {
    const response = await fetch(
      `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      },
    );

    if (response.ok) {
      data = (await response.json()) as GeminiGenerateResponse;
      break;
    }

    let detail = "";
    try {
      const err = (await response.json()) as GeminiErrorResponse;
      detail = err.error?.message?.trim() ?? "";
    } catch {
      try {
        detail = (await response.text()).trim();
      } catch {
        detail = "";
      }
    }

    lastError = detail
      ? `Gemini API xatolik: ${detail} (status ${response.status}).`
      : `Gemini API xatolik: status ${response.status}. API key, quota, referrer va modelni tekshiring.`;
  }

  if (!data) {
    throw new Error(lastError);
  }

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) {
    throw new Error("AI'dan javob kelmadi.");
  }

  const jsonText = extractJsonBlock(text);
  try {
    return JSON.parse(jsonText);
  } catch {
    const fallbackJson = extractBalancedJsonSubstring(text);

    if (fallbackJson) {
      try {
        return JSON.parse(fallbackJson);
      } catch {
        // fall through to the user-facing error below
      }
    }

    throw new Error("AI javobi JSON emas. Qayta urinib ko'ring.");
  }
}
