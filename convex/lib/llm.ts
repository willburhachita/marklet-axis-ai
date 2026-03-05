/**
 * LLM Helper — DigitalOcean Serverless Inference
 *
 * Uses DigitalOcean's Gradient AI Platform Serverless Inference API
 * which provides an OpenAI-compatible /v1/chat/completions endpoint.
 *
 * Model preference order:
 *   1. llama3.3-70b-instruct  — best quality, Meta Llama 3.3
 *   2. llama3-8b-instruct     — faster/lighter fallback
 *
 * API docs: https://docs.digitalocean.com/products/gradient-ai-platform/how-to/use-serverless-inference/
 */

const INFERENCE_BASE_URL = "https://inference.do-ai.run";

function getApiKey(): string {
    const apiKey = process.env.DO_INFERENCE_API_KEY;
    if (!apiKey) {
        throw new Error(
            "DO_INFERENCE_API_KEY not set. Add it via: npx convex env set DO_INFERENCE_API_KEY <key>\n" +
            "Get your Model Access Key from the DigitalOcean Gradient AI Platform dashboard."
        );
    }
    return apiKey;
}

/** Models tried in order when quota/rate-limit is hit */
const MODEL_FALLBACK_CHAIN = [
    "llama3.3-70b-instruct",
    "llama3-8b-instruct",
];

function isQuotaOrRateError(error: unknown): boolean {
    const msg = String(error);
    return (
        msg.includes("429") ||
        msg.includes("Too Many Requests") ||
        msg.includes("quota") ||
        msg.includes("rate") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("capacity")
    );
}

/**
 * Sleep for `ms` milliseconds.
 */
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call a single model on DO Serverless Inference.
 */
async function callModel(
    modelId: string,
    systemPrompt: string,
    userPrompt: string,
    options?: {
        temperature?: number;
        maxTokens?: number;
    }
): Promise<string> {
    const apiKey = getApiKey();

    const body = {
        model: modelId,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: options?.temperature ?? 0.7,
        max_completion_tokens: options?.maxTokens ?? 4096,
    };

    const response = await fetch(`${INFERENCE_BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `DO Inference API error (${response.status}): ${errorText}`
        );
    }

    const data = (await response.json()) as {
        choices: Array<{
            message: { content: string };
            finish_reason: string;
        }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("DO Inference API returned empty response");
    }

    return content;
}

/**
 * Call with automatic fallback to lighter models on rate-limit errors.
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
    // If a specific model was requested, just try that one
    if (options?.model) {
        return callModel(options.model, systemPrompt, userPrompt, options);
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
            return await callModel(modelName, systemPrompt, userPrompt, options);
        } catch (err) {
            lastError = err;
            if (isQuotaOrRateError(err) && i < MODEL_FALLBACK_CHAIN.length - 1) {
                console.warn(
                    `[LLM] Model ${modelName} rate-limited, falling back to ${MODEL_FALLBACK_CHAIN[i + 1]}`
                );
                continue;
            }
            // Non-rate error or last model in chain — break
            break;
        }
    }

    // All models exhausted
    if (isQuotaOrRateError(lastError)) {
        throw new Error(
            "The AI API rate limit has been exceeded for all available models. " +
            "Please wait a few minutes and try again."
        );
    }
    throw lastError;
}

/**
 * Generate text using DigitalOcean Serverless Inference.
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
 * Generate structured JSON using DigitalOcean Serverless Inference.
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
        throw new Error(
            `Failed to parse LLM JSON response: ${cleaned.slice(0, 200)}...`
        );
    }
}

/**
 * Generate an image using DigitalOcean Gradient AI via the fal async-invoke endpoint.
 * Uses fal-ai/flux/schnell — available on standard DO subscription tiers.
 * Polls until the job completes (COMPLETED status) then returns the image URL.
 */
export async function generateImage(
    prompt: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: { size?: string }
): Promise<string> {
    const apiKey = getApiKey();

    // Step 1: Submit the async job
    const submitResponse = await fetch(`${INFERENCE_BASE_URL}/v1/async-invoke`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model_id: "fal-ai/flux/schnell",
            input: {
                prompt,
                num_inference_steps: 4,
                num_images: 1,
                enable_safety_checker: true,
            },
        }),
    });

    if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        throw new Error(
            `DO Image Generation API error (${submitResponse.status}): ${errorText}`
        );
    }

    const submitData = (await submitResponse.json()) as { request_id: string };
    const requestId = submitData.request_id;
    if (!requestId) {
        throw new Error("DO Image Generation API returned no request_id");
    }

    // Step 2: Poll for completion (max 60 seconds, poll every 3s)
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i++) {
        await sleep(3000);

        const statusResponse = await fetch(
            `${INFERENCE_BASE_URL}/v1/async-invoke/${requestId}/status`,
            {
                headers: { Authorization: `Bearer ${apiKey}` },
            }
        );

        if (!statusResponse.ok) {
            continue; // transient error, keep polling
        }

        const statusData = (await statusResponse.json()) as {
            status: string;
            error?: string;
        };

        if (statusData.status === "FAILED" || statusData.error) {
            throw new Error(`Image generation failed: ${statusData.error ?? "unknown error"}`);
        }

        if (statusData.status === "COMPLETED") {
            // Step 3: Fetch the result
            const resultResponse = await fetch(
                `${INFERENCE_BASE_URL}/v1/async-invoke/${requestId}`,
                {
                    headers: { Authorization: `Bearer ${apiKey}` },
                }
            );

            if (!resultResponse.ok) {
                throw new Error(`Failed to fetch image result: ${resultResponse.status}`);
            }

            const resultData = (await resultResponse.json()) as {
                output?: { images?: Array<{ url: string }> };
            };

            const imageUrl = resultData.output?.images?.[0]?.url;
            if (!imageUrl) {
                throw new Error("Image generation completed but no image URL returned");
            }

            return imageUrl;
        }
        // else QUEUED or IN_PROGRESS — keep polling
    }

    throw new Error("Image generation timed out after 60 seconds");
}
