export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_KEY) {
      return res.status(500).json({ error: "Missing Hugging Face API Key" });
    }

    // choose a model that supports text generation
    const HF_MODEL = "meta-llama/Llama-2-7b-chat-hf";

    const response = await fetch(
      "https://router.huggingface.co/inference",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: HF_MODEL,
          input: prompt
        })
      }
    );

    // Router returns JSON always
    const result = await response.json();

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    // unified output parsing
    const generated =
      result.generated_text ??
      result.output?.[0]?.generated_text ??
      JSON.stringify(result);

    return res.status(200).json({ text: generated });

  } catch (err) {
    return res.status(500).json({
      error: "Server crashed: " + err.message
    });
  }
}
