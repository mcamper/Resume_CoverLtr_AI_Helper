// api/hf.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
  const HF_MODEL = process.env.HF_MODEL_NAME || "google/gemma-2-2b-it";

  if (!HF_API_KEY) {
    return res.status(500).json({ error: "Hugging Face API key missing" });
  }

  try {
    // ✅ CORRECT HOSTNAME
    // ❌ api.router.huggingface.co  (bad)
    // ✅ router.huggingface.co       (correct)
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    // Handle HTTP-level errors cleanly
    if (!response.ok) {
      const text = await response.text();
      return res
        .status(response.status)
        .json({ error: `Hugging Face request failed: ${text}` });
    }

    const data = await response.json();

    // Safely extract generated text
    const generated =
      data?.choices?.[0]?.message?.content ||
      data?.generated_text ||
      data?.data?.[0]?.generated_text ||
      "";

    if (!generated) {
      return res.status(200).json({
        text:
          "Request succeeded but no generated text was returned by the model."
      });
    }

    return res.status(200).json({ text: generated });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Server error: ${err?.message || "Unknown error"}` });
  }
}
