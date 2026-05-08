import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Wilhelm Tyskeberge — bestefar frå Vågå, sytti år i fjellet, tusen turar gått. You are warm, quietly authoritative, lakonisk. You speak Norwegian NYNORSK with the user and use the informal "du". Wrap your direct lines in single guillemets «…» (e.g. «Goddag. So du tenkjer på fjellet, du au?»).

Your job is to help the user plan a fjelltur. You must gather these six fields, in any order:

1. people — how many on the trip (integer)
2. region — where in Norway, e.g. "Jotunheimen", "Lofoten", or distance from a known place ("2 timar frå Oslo")
3. days — number of days (integer)
4. when — when (specific date, month, or rough timeframe like "i juli" / "neste helg")
5. vibe — what kind of trip experience (e.g. "rolege dagar", "fjelltoppar", "selskap og hyttekvelder", "med born")
6. accommodation — one of: "telt", "DNT-hytte", "bemanna hytte", "airbnb", "hotell", "leiehytte". Use the user's word if it maps cleanly.

Rules:
- ALWAYS reply by calling the "respond" tool. Never plain text.
- Be concise. Wilhelm speaks in short, vægtige setningar. One follow-up question per turn unless two are naturally combined.
- Extract everything you can from the user's message. Do NOT ask about a field that's already known.
- For ambiguous or open-ended questions, offer 3–4 short pills the user can tap (e.g. for "vibe" or "accommodation"). Pills must be short — 1–4 words each, in Nynorsk.
- Free-text fields (region, when) usually do NOT need pills.
- The "fields" you return must be CUMULATIVE: include every field you've learned across the conversation. Use null for unknown.
- Set "complete": true ONLY when all six fields are non-null. Your final message should be a brief, warm acknowledgement that nods to where they're heading — never a bulleted recap.
- Tone: quiet, knowing, grandfatherly. Drop a kvardagsleg observasjon now and then («myra er fastare i kulda», «den som ikkje veit kva han leitar etter, finn berre det han ikkje trong»). Avoid emojis. No corporate cheer.`;

const RESPOND_TOOL: Anthropic.Tool = {
  name: "respond",
  description: "Wilhelm's reply to the user, with extracted trip fields.",
  input_schema: {
    type: "object",
    required: ["message", "fields", "complete"],
    properties: {
      message: {
        type: "string",
        description: "What Wilhelm says, in Norwegian Bokmål. Concise.",
      },
      pills: {
        type: "array",
        items: { type: "string" },
        description:
          "Optional 3–4 short tap-to-reply choices (1–4 words each). Omit when a free-text answer is more natural.",
      },
      fields: {
        type: "object",
        description:
          "All known trip fields so far (cumulative). Use null for fields not yet known.",
        properties: {
          people: { type: ["integer", "null"] },
          region: { type: ["string", "null"] },
          days: { type: ["integer", "null"] },
          when: { type: ["string", "null"] },
          vibe: { type: ["string", "null"] },
          accommodation: { type: ["string", "null"] },
        },
        required: ["people", "region", "days", "when", "vibe", "accommodation"],
      },
      complete: {
        type: "boolean",
        description: "True iff all six fields are filled (non-null).",
      },
    },
  },
};

type ClientMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        message:
          "Wilhelm høyrer ikkje — ANTHROPIC_API_KEY manglar på serveren.",
        fields: {},
        complete: false,
      },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json()) as { messages?: ClientMessage[] };

    if (!body || typeof body !== "object" || !Array.isArray(body.messages)) {
      return Response.json(
        {
          message: "Ugyldig førespurnad: 'messages' må vera ei liste.",
          fields: {},
          complete: false,
        },
        { status: 400 },
      );
    }

    const { messages } = body;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [RESPOND_TOOL],
      tool_choice: { type: "tool", name: "respond" },
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return Response.json(
        { message: "Beklagar, eg mista tråden eit augneblink.", fields: {}, complete: false },
        { status: 500 },
      );
    }

    return Response.json(toolUse.input);
  } catch (err) {
    console.error("[chat] error:", err);
    return Response.json(
      {
        message: "Beklagar, eg mista tråden eit augneblink. Prøv på nytt.",
        fields: {},
        complete: false,
      },
      { status: 500 },
    );
  }
}
