import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ExtractedReceipt = {
  merchant: string;
  date: string; // YYYY-MM-DD
  total: number;
  currency: string;
  category: string;
  items: { name: string; price: number }[];
};

const CATEGORY_NAMES = DEFAULT_CATEGORIES.map((c) => c.name);

/** Reads a receipt photo and returns structured spending data. Throws if Claude's reply isn't valid JSON. */
export async function extractReceipt(imageBase64: string, mediaType: string): Promise<ExtractedReceipt> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType as any, data: imageBase64 } },
          {
            type: "text",
            text: `Read this receipt and reply with ONLY a JSON object, no markdown fences, matching:
{"merchant": string, "date": "YYYY-MM-DD", "total": number, "currency": "USD"|"EUR"|..., "category": one of ${JSON.stringify(
              CATEGORY_NAMES
            )}, "items": [{"name": string, "price": number}]}
If the date is missing, use today's date. If items aren't legible, return an empty array.`,
          },
        ],
      },
    ],
  });

  const text = message.content.find((b) => b.type === "text")?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Claude did not return JSON for this receipt");
  return JSON.parse(match[0]);
}
