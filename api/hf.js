export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405 }
      );
    }

    const body = await req.json();

    if (!body?.messages) {
      return new Response(
        JSON.stringify({ error: "Missing messages in request body" }),
        { status: 400 }
      );
    }

    const apiKey = process.env.HF_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "HF_API_KEY is not set in environment" }),
        { status: 500 }
      );
    }

    // Call Hugging Face chat completions endpoint
    const hfResponse = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: body.messages,
          temperature: 0.4,
          max_tokens: 2048,
        }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("HF API Error:", errorText);

      return new Response(
        JSON.stringify({
          error: "Hugging Face API returned an error",
          details: errorText,
        }),
        { status: 500 }
      );
    }

    const data = await hfResponse.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
