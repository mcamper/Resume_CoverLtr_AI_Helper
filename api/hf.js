// api/hf.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
  const HF_MODEL = process.env.HF_MODEL_NAME; // e.g., google/gemma-2-2b-it

  if (!HF_API_KEY) return res.status(500).json({ error: "Hugging Face API key missing" });
  if (!HF_MODEL) return res.status(500).json({ error: "Hugging Face model name missing" });

  try {
    const response = await fetch(`https://api.router.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const textResponse = await response.text();

    try {
      const data = JSON.parse(textResponse);
      const text = data[0]?.generated_text || "✅ AI response received!";
      return res.status(200).json({ text });
    } catch {
      // If JSON parsing fails, return the raw text as error
      return res.status(500).json({ error: `Hugging Face returned non-JSON response: ${textResponse}` });
    }

  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}
