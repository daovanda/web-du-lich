// app/api/chats/ai/route.ts
import { TransformStream } from "stream/web";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

const WORKER_URL    = process.env.CLOUDFLARE_WORKER_URL!;
const WORKER_SECRET = process.env.WORKER_SECRET!;

const DEFAULT_SYSTEM_PROMPT = `Bạn là trợ lý AI hỗ trợ khách hàng. Hãy trả lời thân thiện, ngắn gọn và chính xác bằng tiếng Việt.
Nếu không biết câu trả lời, hãy nói thẳng và gợi ý người dùng liên hệ với đội ngũ hỗ trợ.
Không bịa đặt thông tin.`;

// ── GET /api/chats/ai — lấy hoặc tạo ai_bot room cho user hiện tại ──
export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy hoặc tạo ai_bot room
    let { data: room } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("type", "ai_bot")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!room) {
      const { data: created, error } = await supabase
        .from("chat_rooms")
        .insert({ type: "ai_bot", user_id: user.id })
        .select("id")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      room = created;
    }

    return NextResponse.json({ data: { roomId: room!.id } });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// ── POST /api/chats/ai — gửi message, stream response về client ──
export async function POST(req: Request) {
  try {
    const { message, roomId, history, guest } = (await req.json()) as {
      message: string;
      roomId: string | null;
      history: Array<{ role: "user" | "assistant"; content: string }>;
      guest?: boolean;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // ── Chế độ Guest: không cần auth, không lưu DB ──
    if (guest) {
      const workerRes = await fetch(`${WORKER_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${WORKER_SECRET}`,
        },
        body: JSON.stringify({
          message: message.trim(),
          history: history ?? [],
          roomId: null,
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
        }),
      });

      if (!workerRes.ok || !workerRes.body) {
        const errText = await workerRes.text();
        console.error("Worker error (guest):", errText);
        return NextResponse.json({ error: "AI service error" }, { status: 502 });
      }

      // Forward stream trực tiếp về client, không lưu gì vào DB
      return new Response(workerRes.body as any, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    // ── Chế độ đã đăng nhập: yêu cầu auth + lưu DB ──
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    // Kiểm tra quyền truy cập room
    const { data: room } = await supabase
      .from("chat_rooms")
      .select("id, type, user_id")
      .eq("id", roomId)
      .maybeSingle();

    if (!room || room.type !== "ai_bot" || room.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Lưu message của user vào Supabase trước
    const { data: userMsg } = await supabase
      .from("chat_messages")
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content: message.trim(),
        from_admin: false,
        metadata: { role: "user", source: "human" },
      })
      .select("id, created_at")
      .single();

    // Gọi Cloudflare Worker — forward stream
    const workerRes = await fetch(`${WORKER_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${WORKER_SECRET}`,
      },
      body: JSON.stringify({
        message: message.trim(),
        history: history ?? [],
        roomId,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
      }),
    });

    if (!workerRes.ok || !workerRes.body) {
      const errText = await workerRes.text();
      console.error("Worker error:", errText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const isRag = workerRes.headers.get("x-is-rag") === "1";

    // Pipe stream + đồng thời thu thập toàn bộ text để lưu vào DB
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();

    // Background: đọc stream, forward tới client và thu thập text
    (async () => {
      const reader  = workerRes.body!.getReader();
      const decoder = new TextDecoder();
      let fullText  = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Forward chunk tới client
          await writer.write(value);

          // Thu thập text từ SSE chunks
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") continue;
            try {
              const parsed = JSON.parse(raw) as { response?: string };
              if (parsed.response) fullText += parsed.response;
            } catch {
              // ignore malformed SSE line
            }
          }
        }

        // Lưu response của bot vào Supabase sau khi stream xong
        if (fullText.trim()) {
          await supabase.from("chat_messages").insert({
            room_id: roomId,
            sender_id: null,
            content: fullText.trim(),
            from_admin: false,
            metadata: {
              role: "assistant",
              source: "ai_bot",
              is_rag: isRag,
              user_message_id: userMsg?.id ?? null,
            },
          });
        }
      } catch (err) {
        console.error("Stream processing error:", err);
      } finally {
        await writer.close().catch(() => {});
      }
    })();

    return new Response(readable as any, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-User-Message-Id": userMsg?.id ?? "",
        "X-Is-Rag": isRag ? "1" : "0",
      },
    });
  } catch (err) {
    console.error("AI route error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}