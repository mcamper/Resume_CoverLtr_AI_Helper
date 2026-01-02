// netlify/functions/hf.js
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is required." })
      };
    }

    const HF_API_URL = "https://api-inference.huggingface.co/models/YOUR_MODEL_NAME";
    const HF_API_KEY = process.env.HF_API_KEY; // Set this in Netlify environment variables

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
