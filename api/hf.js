// api/hf.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    const HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large";
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();

    // Hugging Face sometimes returns an array of outputs
    // Check if data[0].generated_text exists
    const text = data[0]?.generated_text || "✅ AI response received!";

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
