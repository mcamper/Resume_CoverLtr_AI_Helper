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
      return res.status(500).json({ error: "Hugging Face API key missing" });
    }

    // any chat-capable model works
    const HF_MODEL = "meta-llama/Llama-2-7b-chat-hf";

    const response = await fetch(
      "https://router.huggingface.cloud/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      }
    );

    // sometimes Hugging Face returns text not JSON on error → handle both
    const raw = await response.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Server returned non-JSON response: " + raw
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || JSON.stringify(data)
      });
    }

    const generated =
      data.choices?.[0]?.message?.content ||
      "No text generated.";

    return res.status(200).json({ text: generated });

  } catch (err) {
    return res.status(500).json({
      error: "Server crashed: " + err.message
    });
  }
}
