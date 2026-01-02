export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // environment variable MUST be named exactly this in Vercel dashboard
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_KEY) {
      return res.status(500).json({ error: "Missing Hugging Face API Key" });
    }

    // pick a working free model
    const HF_MODEL = "gpt2";

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const result = await response.json();

    // HF sometimes returns errors inside JSON
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    const text =
      result[0]?.generated_text ||
      result.generated_text ||
      "No text generated.";

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({
      error: "Server crashed: " + err.message
    });
  }
}
