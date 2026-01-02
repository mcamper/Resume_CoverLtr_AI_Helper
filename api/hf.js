// api/hf.js
import fetch from "node-fetch";

export const config = {
  runtime: "nodejs" // ensures Node runtime instead of Edge
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const HF_MODEL = "YOUR_MODEL_NAME"; // replace with your Hugging Face model name
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_KEY) {
      return res.status(500).json({
        error: "Hugging Face API key missing. Set HUGGINGFACE_API_KEY in Vercel Environment Variables."
      });
    }

    const endpoint = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `Hugging Face API error: ${text || response.statusText}`
      });
    }

    const data = await response.json();

    // Some models return [{ generated_text: "..." }] others may differ
    let text = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      text = data[0].generated_text;
    } else if (typeof data === "object" && data.generated_text) {
      text = data.generated_text;
    } else {
      text = "✅ AI response received!";
    }

    return res.status(200).json({ text });

  } catch (err) {
    console.error("Fetch failed:", err);
    return res.status(500).json({
      error: "Network fetch failed",
      details: err.message
    });
  }
}
