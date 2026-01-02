// api/hf.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const HF_MODEL = "YOUR_MODEL_NAME"; // replace with your Hugging Face model
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!HF_API_KEY) return res.status(500).json({ error: "Hugging Face API key missing" });

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Hugging Face API error: ${text}` });
    }

    const data = await response.json();
    const text = data[0]?.generated_text || "✅ AI response received!";
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}

