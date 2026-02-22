import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { getAllTags } from "@/lib/supabase/queries";
import { TagCategory } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type ParsedResult = {
  sentence: string;
  translation: string;
  suggestedTags: { name: string; category: TagCategory; isExisting: boolean }[];
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const supabase = await createClient();
    const existingTags = await getAllTags(supabase);

    const tagList = existingTags
      .map((t) => `${t.name} (${t.category})`)
      .join(", ");

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/png";

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a Spanish language learning assistant. Analyze this screenshot which contains Spanish text (likely from a textbook, app, or conversation).

Extract ONE Spanish example sentence that is most useful for language learning. If there are multiple sentences, pick the most interesting or grammatically rich one.

Existing tags in the user's database: [${tagList}]

Tag categories and what they mean:
- "tense": verb tenses like presente, pretérito, imperfecto, pluscuamperfecto, subjuntivo, futuro, condicional
- "grammar": grammar concepts like "ser vs estar", "por vs para", "pronombres"
- "verb": specific verbs like llegar, hacer, tener
- "phrase": multi-word expressions like "antes de que", "a pesar de", "en cuanto"

Instructions:
1. Extract the Spanish sentence exactly as written
2. Provide an accurate English translation
3. Suggest relevant tags — PRIORITIZE matching existing tags from the list above. Only suggest new tags if nothing existing fits.
4. For each tag, specify the category.

Respond with ONLY valid JSON in this exact format, no markdown:
{
  "sentence": "the Spanish sentence",
  "translation": "the English translation",
  "suggestedTags": [
    { "name": "tag name", "category": "tense|grammar|verb|phrase", "isExisting": true }
  ]
}`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ]);

    const responseText = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonStr = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed: ParsedResult = JSON.parse(jsonStr);

    // Validate and reconcile isExisting flags against actual DB tags
    parsed.suggestedTags = parsed.suggestedTags.map((st) => {
      const match = existingTags.find(
        (t) =>
          t.name.toLowerCase() === st.name.toLowerCase() &&
          t.category === st.category
      );
      return {
        name: match ? match.name : st.name.toLowerCase(),
        category: st.category,
        isExisting: !!match,
      };
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("POST /api/parse-image error:", error);
    return NextResponse.json(
      { error: "Failed to parse image" },
      { status: 500 }
    );
  }
}
