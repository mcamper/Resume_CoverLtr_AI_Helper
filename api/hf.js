// api/hf.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const HF_MODEL = process.env.HF_MODEL_NAME;           // Model name: google/gemma-2-2b-it
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;   // Your Hugging Face key

    if (!HF_MODEL) return res.status(500).json({ error: "HF_MODEL_NAME environment variable missing" });
    if (!HF_API_KEY) return res.status(500).json({ error: "HUGGINGFACE_API_KEY environment variable missing" });

    // Hugging Face Router URL
    const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    // If response is not ok, get text and return error
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Hugging Face API error: ${text}` });
    }

    // Parse response safely
    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      return res.status(500).json({ error: `Invalid JSON returned from Hugging Face: ${parseErr.message}` });
    }

    // Some models return an array with generated_text
    let text;
    if (Array.isArray(data) && data[0]?.generated_text) {
      text = data[0].generated_text;
    } else if (typeof data === "string") {
      text = data;
    } else {
      text = "✅ AI response received!";
    }

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}
