import type { NextRequest } from "next/server";
export const runtime = "edge";

// GET para healthcheck
export async function GET() {
  return Response.json({
    ok: true,
    info: "POST /api/chat con { history, model, lang }",
  });
}

export async function POST(req: NextRequest) {
  try {
    const { history, model, lang } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    const toMessages = (arr: any[] = []) =>
      arr.map((m) => ({
        role: m.role === "assistant" || m.role === "user" ? m.role : "system",
        content: m.content,
      }));

    const systemPrompt =
      lang === "en"
        ? "You are NeoScience Bot, an assistant specialized in NEOs, asteroids, and planetary defense. Be concise and clear."
        : "Sos NeoScience Bot, un asistente experto en asteroides, NEOs y defensa planetaria. Respondé con claridad y precisión.";

    // Si no hay API Key o modo demo activado
    if (!apiKey) {
      const lastUser =
        [...(history || [])].reverse().find((m: any) => m.role === "user")
          ?.content ?? "mensaje vacío";
      const reply =
        lang === "en"
          ? `You said: "${lastUser}". (Demo mode – no API key configured)`
          : `Dijiste: “${lastUser}”. (Modo demo – sin conexión a OpenAI)`;
      return Response.json({ reply, mode: "mock_no_key" });
    }

    // Configuración OpenAI
    const payload = {
      model:
        model === "astro-lite" || model === "neoscience-sim"
          ? "gpt-4o-mini"
          : "gpt-4o-mini",
      temperature: 0.5,
      messages: [{ role: "system", content: systemPrompt }, ...toMessages(history)],
    };

    // Llamada real
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Fallback automático si falla OpenAI
    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("❌ OpenAI Error:", errText);

      const lastUser =
        [...(history || [])].reverse().find((m: any) => m.role === "user")
          ?.content ?? "mensaje vacío";

      const fallback =
        lang === "en"
          ? `I'm still thinking about "${lastUser}". (Fallback mode: connection or quota error)`
          : `Aún estoy procesando tu mensaje: “${lastUser}”. (Modo demo automático por error de conexión o cuota).`;

      return Response.json({ reply: fallback, mode: "fallback" });
    }

    // Respuesta real
    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content ?? "";
    return Response.json({ reply, mode: "openai" });
  } catch (err: any) {
    console.error("💥 Error general en /api/chat:", err);
    return Response.json(
      {
        reply:
          "⚠️ Error interno del asistente. Intentá de nuevo o verificá tu conexión.",
        mode: "error",
      },
      { status: 200 }
    );
  }
}
