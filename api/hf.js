// api/hf.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const HF_MODEL = process.env.HF_MODEL_NAME || "google/gemma-2-2b-it";
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!HF_API_KEY) {
    return res.status(500).json({ error: "Hugging Face API key missing" });
  }

  try {
    const response = await fetch(`https://api.router.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    // If the server returned non-200, grab text and return as error
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Hugging Face request failed: ${text}` });
    }

    // Parse JSON response
    const data = await response.json();

    // Router API text generation usually returns an array of objects with 'generated_text'
    // Check for that structure
    let generatedText = "";

    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text;
    } else if (typeof data === "string") {
      generatedText = data; // fallback if API returns plain string
    } else {
      generatedText = "✅ Request successful, but no generated text returned.";
    }

    return res.status(200).json({ text: generatedText });

  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}
