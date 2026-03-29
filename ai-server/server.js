import express from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 🔥 Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 🔥 OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ==========================
// 🧠 AI HINT ENDPOINT
// ==========================
app.post("/api/hint", async (req, res) => {
  try {
    const { imageUrl, topic, subtopic, questionNumber } = req.body || {};

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl" });
    }

    console.log("🔍 Generating hint for:", imageUrl);

    const response = await client.responses.create({
      model: "gpt-5.4-mini",

      instructions:
        "You are a Sri Lankan A/L Physics tutor.\n" +
        "Your job is to give ONLY a helpful hint.\n\n" +
        "STRICT RULES:\n" +
        "- DO NOT give the final answer\n" +
        "- DO NOT mention option numbers (1,2,3,4,5)\n" +
        "- DO NOT fully solve the question\n" +
        "- Keep student thinking\n\n" +
        "Format your answer EXACTLY like:\n" +
        "Topic:\n" +
        "Relevant formula or law:\n" +
        "What to focus on:\n" +
        "First step:\n" +
        "Common mistake:\n\n" +
        "Keep it under 80 words.",

      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `Topic: ${topic || "Unknown"}\n` +
                `Subtopic: ${subtopic || "Unknown"}\n` +
                `Question: ${questionNumber || "Unknown"}\n\n` +
                "Read the question image and give a hint."
            },
            {
              type: "input_image",
              image_url: imageUrl
            }
          ]
        }
      ]
    });

    const hint =
      response.output_text?.trim() ||
      "Topic: Physics\nRelevant formula or law: Identify the main relation.\nWhat to focus on: Key values.\nFirst step: Write known quantities.\nCommon mistake: Jumping too fast.";

    res.json({ hint });

  } catch (error) {
    console.error("❌ AI ERROR:", error);

    res.status(500).json({
      hint:
        "Topic: Physics\nRelevant formula or law: Check core formula.\nWhat to focus on: Key values in question.\nFirst step: Identify known quantities.\nCommon mistake: Skipping concept step."
    });
  }
});

// ==========================
// 🚀 SERVER START
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 AI Hint Server running on http://localhost:${PORT}`);
});
