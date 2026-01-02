export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!HF_API_KEY) {
    return res.status(500).json({
      error: "Missing HUGGINGFACE_API_KEY in environment"
    });
  }

  const HF_MODEL = "meta-llama/Llama-2-7b-chat-hf";

  try {
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

    const text = await response.text();

    // try decoding JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "Non-JSON response from HuggingFace: " + text
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || JSON.stringify(data)
      });
    }

    return res.status(200).json({
      text: data.choices?.[0]?.message?.content || "No output."
    });

  } catch (err) {
    return res.status(500).json({
      error: "Network fetch failed",
      details: err.message
    });
  }
}
