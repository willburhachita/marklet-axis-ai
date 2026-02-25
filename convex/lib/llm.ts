/**
 * LLM Helper — Google Gemini integration
 *
 * Uses Google's Generative AI SDK to call Gemini models.
 * All AI generation flows go through this module.
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
    const client = getClient();
    const model = client.getGenerativeModel({
        model: options?.model ?? "gemini-2.0-flash",
        generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens ?? 4096,
        },
        systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    return response.text();
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

    const text = await generateText(jsonPrompt, userPrompt, options);

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
