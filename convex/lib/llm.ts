/**
 * LLM Helper — Google Gemini integration
 *
 * Uses Google's Generative AI SDK to call Gemini models.
 * Model preference order (free tier):
 *   1. gemini-1.5-flash      — generous free tier, good reasoning
 *   2. gemini-1.5-flash-8b   — lightest, fastest fallback
 *
 * Note: gemini-2.0-flash has much stricter free-tier quotas.
 *       We default to 1.5-flash for reliability.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const getClient = () => {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "GOOGLE_GEMINI_API_KEY not set. Add it via: npx convex env set GOOGLE_GEMINI_API_KEY <key>"
        );
    }
    return new GoogleGenerativeAI(apiKey);
};

/** Models tried in order when quota is exceeded */
const MODEL_FALLBACK_CHAIN = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
];

function isQuotaError(error: unknown): boolean {
    const msg = String(error);
    return msg.includes("429") ||
        msg.includes("Too Many Requests") ||
        msg.includes("quota") ||
        msg.includes("RESOURCE_EXHAUSTED");
}

/**
 * Sleep for `ms` milliseconds.
 */
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call a Gemini model with automatic fallback to cheaper models on quota errors.
 * Tries each model in MODEL_FALLBACK_CHAIN with a short delay between attempts.
 */
async function callWithFallback(
    systemPrompt: string,
    userPrompt: string,
    options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }
): Promise<string> {
    const client = getClient();

    // If a specific model was requested, just try that one
    if (options?.model) {
        const model = client.getGenerativeModel({
            model: options.model,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens ?? 4096,
            },
            systemInstruction: systemPrompt,
        });
        const result = await model.generateContent(userPrompt);
        return result.response.text();
    }

    // Otherwise try the fallback chain
    let lastError: unknown;
    for (let i = 0; i < MODEL_FALLBACK_CHAIN.length; i++) {
        const modelName = MODEL_FALLBACK_CHAIN[i];
        try {
            if (i > 0) {
                // Brief pause before retry to respect rate limits
                await sleep(2000);
            }
            const model = client.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    temperature: options?.temperature ?? 0.7,
                    maxOutputTokens: options?.maxTokens ?? 4096,
                },
                systemInstruction: systemPrompt,
            });
            const result = await model.generateContent(userPrompt);
            return result.response.text();
        } catch (err) {
            lastError = err;
            if (isQuotaError(err) && i < MODEL_FALLBACK_CHAIN.length - 1) {
                console.warn(
                    `[LLM] Model ${modelName} quota exceeded, falling back to ${MODEL_FALLBACK_CHAIN[i + 1]}`
                );
                continue;
            }
            // Non-quota error or last model in chain — rethrow
            break;
        }
    }

    // All models exhausted — throw a clean user-facing error
    if (isQuotaError(lastError)) {
        throw new Error(
            "The AI API quota has been exceeded for all available models. " +
            "This is a free-tier limit. Please wait a few minutes and try again, " +
            "or upgrade your Google AI API plan at https://ai.google.dev"
        );
    }
    throw lastError;
}

/**
 * Generate text using Gemini.
 */
export async function generateText(
    systemPrompt: string,
    userPrompt: string,
    options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }
): Promise<string> {
    return callWithFallback(systemPrompt, userPrompt, options);
}

/**
 * Generate structured JSON using Gemini.
 * Wraps the text output in JSON parsing with error handling.
 */
export async function generateJSON<T = unknown>(
    systemPrompt: string,
    userPrompt: string,
    options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }
): Promise<T> {
    const jsonPrompt = `${systemPrompt}\n\nIMPORTANT: You must respond with valid JSON only. No markdown code fences, no explanation text. Only the JSON object.`;

    const text = await callWithFallback(jsonPrompt, userPrompt, options);

    // Strip markdown code fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    try {
        return JSON.parse(cleaned) as T;
    } catch (e) {
        throw new Error(`Failed to parse LLM JSON response: ${cleaned.slice(0, 200)}...`);
    }
}
