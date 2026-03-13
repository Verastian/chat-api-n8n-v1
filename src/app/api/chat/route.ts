import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "N8N_WEBHOOK_URL no configurado en .env.local" },
      { status: 500 }
    );
  }

  let body: { message: string; sessionId?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  try {
    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: body.message,
        sessionId: body.sessionId ?? "widget",
      }),
    });

    if (!n8nRes.ok) {
      const text = await n8nRes.text();
      console.error("[chat/route] N8N error:", n8nRes.status, text);
      return NextResponse.json(
        { error: `N8N respondió con ${n8nRes.status}` },
        { status: 502 }
      );
    }

    const text = await n8nRes.text();

    if (!text || text.trim() === "") {
      console.warn("[chat/route] N8N respondió con body vacío.");
      return NextResponse.json(
        { error: "El asistente no pudo procesar tu mensaje. Verifica que el flujo esté activo." },
        { status: 502 }
      );
    }

    let data: { output?: string; error?: boolean };
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[chat/route] N8N devolvió texto no-JSON:", text.slice(0, 200));
      return NextResponse.json({ output: text });
    }

    // Detectar error 429 de Gemini en el output del agente
    if (typeof data.output === "string" && data.output.includes("429")) {
      return NextResponse.json(
        { error: "El asistente está temporalmente ocupado (límite de solicitudes). Espera unos segundos e intenta de nuevo." },
        { status: 429 }
      );
    }

    return NextResponse.json({ output: data.output ?? text });

  } catch (err) {
    console.error("[chat/route] Fetch a N8N falló:", err);
    return NextResponse.json(
      { error: "No se pudo conectar con N8N" },
      { status: 503 }
    );
  }
}
